import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select('id, title, subject, from_address')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('テンプレート一覧取得エラー:', error.message);
    return NextResponse.json({ templates: [] }, { status: 500 });
  }

  return NextResponse.json({ templates: data });
}
