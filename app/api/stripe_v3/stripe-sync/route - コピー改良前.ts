// app/api/stripe_v3/stripe-sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
//import stripe from '@/lib/stripeClient';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const user_id = req.headers.get('x-user-id'); // ✅ middleware 等で事前付与された認証済みユーザーID

  if (!user_id) {
    return NextResponse.json({ error: 'User ID が必要です' }, { status: 400 });
  }

  // ✅ ユーザー情報取得（stripe_customer_idの存在確認）
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', user_id)
    .maybeSingle();

  if (userError || !user?.stripe_customer_id) {
    return NextResponse.json({ error: 'stripe_customer_id が存在しません' }, { status: 400 });
  }

  const customerId = user.stripe_customer_id;

  try {
    // ✅ Stripe: サブスクリプション情報取得
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
      limit: 10,
    });

    // ✅ Stripe: インボイス情報取得
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    let updatedSubscriptionCount = 0;

    // ✅ Supabase: stripe_subscriptions / subscriptions テーブルへ保存
    for (const sub of subscriptions.data) {
      const now = new Date().toISOString();

      // stripe_subscriptions 保存
      await supabaseAdmin.from('stripe_subscriptions').upsert({
        stripe_subscription_id: sub.id,
        stripe_customer_id: customerId,
        user_id,
        status: sub.status,
        plan_id: sub.items.data[0]?.price.id ?? null,
        current_period_start: sub.current_period_start
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        cancel_at: sub.cancel_at
          ? new Date(sub.cancel_at * 1000).toISOString()
          : null,
        canceled_at: sub.canceled_at
          ? new Date(sub.canceled_at * 1000).toISOString()
          : null,
        cancel_scheduled: sub.cancel_at_period_end ?? false,
        updated_at: now,
      });

      // subscriptions テーブル保存（UI連携用）
      await supabaseAdmin.from('subscriptions').upsert({
        user_id,
        email: user.email,
        plan_id: sub.items.data[0]?.price.id ?? null,
        plan_type: sub.items.data[0]?.price.nickname ?? null,
        stripe_subscription_id: sub.id,
        status: sub.status,
        is_active: ['active', 'trialing'].includes(sub.status),
        cancel_scheduled: sub.cancel_at_period_end ?? false,
        canceled_at: sub.canceled_at
          ? new Date(sub.canceled_at * 1000).toISOString()
          : null,
        current_period_start: sub.current_period_start
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        cancel_at: sub.cancel_at
          ? new Date(sub.cancel_at * 1000).toISOString()
          : null,
        started_at: sub.start_date
          ? new Date(sub.start_date * 1000).toISOString()
          : null,
        updated_at: now,
      });

      updatedSubscriptionCount++;
    }

    // ✅ Supabase: stripe_invoices テーブルへ保存
    for (const inv of invoices.data) {
      await supabaseAdmin.from('stripe_invoices').upsert({
        stripe_invoice_id: inv.id,
        stripe_subscription_id: inv.subscription as string,
        amount_paid: inv.amount_paid,
        status: inv.status,
        paid_at: inv.status_transitions?.paid_at
          ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
          : null,
        created_at: new Date(inv.created * 1000).toISOString(),
        user_id,
      });
    }

    // ✅ 最終同期時刻の更新
    await supabaseAdmin
      .from('users')
      .update({ last_stripe_sync_at: new Date().toISOString() })
      .eq('id', user_id);

    return NextResponse.json({
      status: 'ok',
      subscriptions: updatedSubscriptionCount,
      invoices: invoices.data.length,
    });
  } catch (err: any) {
    console.error('❌ Stripe同期エラー:', err.message);
    return NextResponse.json({ error: 'Stripe同期に失敗しました' }, { status: 500 });
  }
}
