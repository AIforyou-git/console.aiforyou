// /app/api/stripe_v3/webhook/route.ts

export async function POST(req: Request) {
  console.log("⚠️ Stripe webhook is currently disabled");
  return new Response("Webhook disabled", { status: 200 });
}
