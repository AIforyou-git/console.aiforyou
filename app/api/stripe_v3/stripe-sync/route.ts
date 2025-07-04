import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function lookupUserIdByCustomer(customerId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

export async function GET(req: NextRequest) {
  const user_id = req.headers.get('x-user-id');

  if (!user_id) {
    return NextResponse.json({ error: 'User ID が必要です' }, { status: 400 });
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user_id)
    .maybeSingle();

  if (userError || !user?.stripe_customer_id) {
    return NextResponse.json({ error: 'stripe_customer_id が存在しません' }, { status: 400 });
  }

  const customerId = user.stripe_customer_id;
  const now = new Date().toISOString();

  try {
    // ✅ 顧客情報の取得と保存
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

    //const customer = await stripe.customers.retrieve(customerId);
    const resolvedUserId = await lookupUserIdByCustomer(customerId);

    if (typeof customer === 'object' && customer.id) {
      await supabaseAdmin.from('stripe_customers').upsert({
        stripe_customer_id: customer.id,
        email: customer.email,
        name: typeof customer.name === 'string' ? customer.name : null,
        phone: typeof customer.phone === 'string' ? customer.phone : null,
        metadata: customer.metadata || {},
        user_id: resolvedUserId,
        created_at: now,
      });
    }

    // ✅ サブスクリプションの取得・保存
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
      limit: 10,
    });

    let updatedSubscriptionCount = 0;

    for (const sub of subscriptions.data) {
      await supabaseAdmin.from('stripe_subscriptions').upsert({
        stripe_subscription_id: sub.id,
        stripe_customer_id: customerId,
        user_id: resolvedUserId,
        status: sub.status,
        plan_id: sub.items.data[0]?.price.id ?? null,
        price_id: sub.items.data[0]?.price.id ?? null,
        started_at: sub.start_date
          ? new Date(sub.start_date * 1000).toISOString()
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
        canceled_at: sub.canceled_at
          ? new Date(sub.canceled_at * 1000).toISOString()
          : null,
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
        is_active: ['active', 'trialing'].includes(sub.status),
        updated_at: now,
        updated_from_webhook: false,
        last_synced_at: now,
      });

      updatedSubscriptionCount++;
    }

    // ✅ インボイスの取得・保存
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

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
        user_id: resolvedUserId,
      });
    }

    // ✅ 最終同期時間を更新
    await supabaseAdmin
      .from('users')
      .update({ last_stripe_sync_at: now })
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
