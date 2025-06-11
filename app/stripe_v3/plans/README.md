4. この画面でプラン選択 → /api/stripe_v3/create-checkout-session にPOST
   ↓
5. Stripe Checkoutにリダイレクト → 決済完了後 /thanks ページへ
   ↓
6. Webhookで Supabase の users.plan / subscriptions などを更新