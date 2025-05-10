import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET: テンプレート取得
export async function GET(req, { params }) {
  const { id } = params;

  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select('*')
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
  const { title, content, logo_url } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'タイトルと本文は必須です' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('email_templates')
    .update({ title, content, logo_url })
    .eq('id', id);

  if (error) {
    console.error('テンプレート更新エラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
