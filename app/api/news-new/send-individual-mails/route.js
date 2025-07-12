import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMailToUser } from '@/lib/sendMail';

/**
 * 手動テスト送信用API:
 * - フロントから送信対象（メール + 記事情報）を受け取る
 * - メール送信
 * - サマリを delivery_summaries に保存
 */
export async function POST(req) {
  try {
    const { deliveries } = await req.json();

    if (!Array.isArray(deliveries) || deliveries.length === 0) {
      return NextResponse.json({ error: '送信内容が不正です' }, { status: 400 });
    }

    console.log('🟡 リクエスト受信:', deliveries.map(d => d.email));

    const results = [];

    for (const delivery of deliveries) {
      const { email, articles } = delivery;

      if (!email || !Array.isArray(articles) || articles.length === 0) {
        results.push({ user: email, status: 'スキップ（データ不備）' });
        console.log(`⏩ ${email} スキップ（データ不備）`);
        continue;
      }

      // ユーザー取得
      const { data: user, error: userErr } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

      if (userErr || !user) {
        results.push({ user: email, status: 'スキップ（ユーザー不明）' });
        console.log(`⏩ ${email} スキップ（ユーザー不明）`);
        continue;
      }

      // クライアント取得（CCアドレス用）
      const { data: client, error: clientErr } = await supabaseAdmin
        .from('clients')
        .select('cc_email_1, cc_email_2')
        .eq('uid', user.id)
        .single();

      if (clientErr) {
        console.warn(`⚠️ クライアント情報取得失敗: ${email}`);
      }

      // メール送信
      console.log(`📧 メール送信処理: ${email} | 記事数: ${articles.length}`);
      const sendResult = await sendMailToUser({ user, articles, client: client || null });

      results.push({
        user: email,
        article_ids: articles.map(a => a.article_id),
        status: sendResult.success ? '送信成功' : `送信失敗: ${sendResult.error}`,
      });

      console.log(`📤 送信結果: ${email} → ${sendResult.success ? '成功' : '失敗: ' + sendResult.error}`);
    }

    // サマリー保存
    const summaryRes = await supabaseAdmin.from('delivery_summaries').insert([
      {
        date: new Date().toISOString().slice(0, 10),
        data: results,
      },
    ]);

    if (summaryRes.error) {
      console.error('📄 サマリー保存エラー:', summaryRes.error.message);
    } else {
      console.log('✅ サマリー保存完了');
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('❌ 手動送信エラー:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
