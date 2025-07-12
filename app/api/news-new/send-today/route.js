import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMailToUser } from '@/lib/sendMail';

export async function POST() {
  const results = [];

  try {
    // 1. 最新のマッチ対象日取得
    const { data: latest, error: latestErr } = await supabaseAdmin
      .from('client_news_new_matches')
      .select('target_date')
      .order('target_date', { ascending: false })
      .limit(1)
      .single();

    if (latestErr || !latest) {
      throw new Error('最新のマッチ日が取得できません');
    }

    const latestDate = latest.target_date;

    // 2. マッチデータ取得
    const { data: matches, error: matchErr } = await supabaseAdmin
      .from('client_news_new_matches')
      .select('user_id, matched_articles')
      .eq('target_date', latestDate);

    if (matchErr) throw new Error('マッチデータ取得失敗: ' + matchErr.message);

    // 3. ユーザー情報取得
    const { data: users, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, email, status')
      .eq('status', 'active');

    if (userErr) throw new Error('ユーザー情報取得失敗: ' + userErr.message);

    // 4. 送信ループ
    for (const match of matches) {
      const user = users.find((u) => u.id === match.user_id);
      if (!user) {
        results.push({ user: match.user_id, status: 'スキップ（ユーザー情報なし）' });
        continue;
      }

      const matchedArticleIds = match.matched_articles || [];
      if (matchedArticleIds.length === 0) {
        results.push({ user: user.email, status: 'スキップ（マッチなし）' });
        continue;
      }

const unsentIds = matchedArticleIds; // 送信済み判定はしない
      if (unsentIds.length === 0) {
        results.push({ user: user.email, status: 'スキップ（全て既送信）' });
        continue;
      }

      // 6. 記事詳細取得
      const { data: articles, error: articleErr } = await supabaseAdmin
        .from('jnet_articles_public')
        .select('*')
        .in('article_id', unsentIds);

      if (articleErr || !articles || articles.length === 0) {
        results.push({ user: user.email, status: 'スキップ（記事取得失敗）' });
        continue;
      }

      // 7. メール送信
      const sendResult = await sendMailToUser({ user, articles });
      results.push({
        user: user.email,
        article_ids: unsentIds,
        status: sendResult.success ? '送信成功' : `送信失敗: ${sendResult.error}`,
      });
    }

    // 8. 送信ログ保存（delivery_summaries）
    const summaryInsert = await supabaseAdmin
      .from('delivery_summaries')
      .insert([
        {
          date: latestDate,
          data: results,
        },
      ]);

    if (summaryInsert.error) {
      console.error('📄 サマリー保存エラー:', summaryInsert.error.message);
    }

    // 9. マッチデータ削除
    const { error: deleteError } = await supabaseAdmin
      .from('client_news_new_matches')
      .delete()
      .eq('target_date', latestDate);

    if (deleteError) {
      console.error('🧹 マッチ削除エラー:', deleteError.message);
    } else {
      console.log(`🧹 マッチリスト初期化完了: target_date = ${latestDate}`);
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('❌ 送信処理エラー:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
