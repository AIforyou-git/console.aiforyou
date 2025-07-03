"use client";

type Subscription = {
  id: string;
  stripe_subscription_id: string;
  plan_type: string;
  canceled_at: string | null;
  cancel_scheduled: boolean;
};

type Props = {
  subscription: Subscription | null; // ← 修正: null許容に変更
  isAdmin?: boolean;
  onComplete: () => void;
};

export default function CancelSubscriptionButton({
  subscription,
  isAdmin = false,
  onComplete,
}: Props) {
  const handleScheduleCancel = async () => {
    const confirmed = confirm("このユーザーの期間満了解約を予約しますか？");
    if (!confirmed || !subscription) return; // ← nullチェック追加

    try {
      const res = await fetch("/api/stripe_v3/subscription/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: subscription.stripe_subscription_id }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("予約解約APIエラー:", result.error);
        alert("予約に失敗しました。");
        return;
      }

      onComplete();
    } catch (error) {
      console.error("API通信エラー:", error);
      alert("通信エラーが発生しました。");
    }
  };

  if (!subscription) {
    return <span className="text-red-500">契約情報が見つかりません</span>; // ← fallback
  }

  if (subscription.canceled_at) {
    return <span className="text-gray-500">解約済</span>;
  }

  if (subscription.cancel_scheduled) {
    return <span className="text-yellow-600">予約済</span>;
  }

  return (
    <div className="space-x-2">
      {(subscription.plan_type === "12months" || subscription.plan_type === "monthly") && (
        <button
          onClick={handleScheduleCancel}
          className={`text-yellow-600 hover:underline ${isAdmin ? "" : "text-sm"}`}
        >
          解約予約
        </button>
      )}
    </div>
  );
}
