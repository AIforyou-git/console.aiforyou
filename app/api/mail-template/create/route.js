import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  const body = await req.json();
  const { title, content, logo_url } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'タイトルと本文は必須です' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .insert([
      {
        title,
        content,
        logo_url: logo_url || null,
      },
    ]);

  if (error) {
    console.error('テンプレート作成エラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
