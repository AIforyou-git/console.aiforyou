import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  const body = await req.json();
  const { title, subject, from_address, content, logo_url } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'タイトルと本文は必須です' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .insert([
      {
        title,
        subject: subject || null,
        from_address: from_address || null,
        content,
        logo_url: logo_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('テンプレート作成エラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
