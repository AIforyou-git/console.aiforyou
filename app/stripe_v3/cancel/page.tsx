export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">❌ 決済がキャンセルされました</h1>
      <p className="text-gray-700 text-center max-w-md">
        決済プロセスが中断されました。再度プランを選択してお手続きいただくか、
        ご不明点があればサポートまでご連絡ください。
      </p>
    </div>
  );
}
