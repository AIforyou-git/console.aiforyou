import { NextResponse } from 'next/server';

import { runNewClientMatch } from '@/lib/matching/logic-new';
import { saveMatchesToNewsNewTable } from '@/lib/matching/access_new';

export async function POST() {
  // 🔒 処理禁止時間帯（JST 12:55:00〜12:59:59）をブロック
  const now = new Date();
  const jstNow = new Date(now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
  if (jstNow.getHours() === 12 && jstNow.getMinutes() >= 55) {
    return NextResponse.json(
      { error: '12:55〜12:59の間は処理を受け付けていません（送信準備中）' },
      { status: 403 }
    );
  }

  try {
    console.log('🟡 [news-new] マッチング処理 開始');

    const matches = await runNewClientMatch();
    console.log('✅ [news-new] マッチ件数:', matches.length);

    if (matches.length > 0) {
      console.log('🧾 最初の1件:', JSON.stringify(matches[0], null, 2));
    }

    await saveMatchesToNewsNewTable(matches);
    console.log('💾 [news-new] Supabase 保存完了');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ [news-new] マッチ生成エラー:', err);
    return NextResponse.json({ error: 'match failed' }, { status: 500 });
  }
}
