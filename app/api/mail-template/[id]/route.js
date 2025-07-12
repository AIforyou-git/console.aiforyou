import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET: テンプレート取得
export async function GET(req, { params }) {
  const { id } = params;

  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select('id, title, subject, from_address, content, logo_url, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    console.error('テンプレート取得エラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ template: data });
}

// PUT: テンプレート更新
export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { title, subject, from_address, content, logo_url } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'タイトルと本文は必須です' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('email_templates')
    .update({
      title,
      subject: subject || null,
      from_address: from_address || null,
      content,
      logo_url: logo_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('テンプレート更新エラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
