// app/legal/privacy/page.js
"use client";
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-md rounded-xl">
        <h1 className="text-2xl font-bold text-indigo-600 mb-8 text-center">プライバシーポリシー</h1>

          <div className="space-y-6 text-gray-800 text-sm leading-relaxed">
            <p>AIgift株式会社（以下、「当社」といいます）は、当社が提供するサービス「AI for you」（以下、「本サービス」といいます）において、お客様の個人情報を適切に管理し、以下の通り取り扱うことをお約束します。本ポリシーは、関連する法律および規制に基づいて作成されています。</p>
  
            <h2 className="text-lg font-semibold text-indigo-700">1. 収集する情報</h2>
            <ul className="list-disc pl-6">
              <li>氏名、住所、法人情報、メールアドレス</li>
              <li>サービスの利用状況（例：アクセスログ、操作履歴など）</li>
              <li>Cookieやその他のトラッキング技術を使用して収集される技術情報</li>
            </ul>
  
            <h2 className="text-lg font-semibold text-indigo-700">2. 情報の利用目的</h2>
            <ul className="list-disc pl-6">
              <li>本サービスの提供および改善</li>
              <li>必要な通知やご連絡（例：更新情報、重要な変更のお知らせ）</li>
              <li>サービス改善のための統計データの作成および内部分析</li>
              <li>法令遵守および紛争解決</li>
            </ul>
  
            <h2 className="text-lg font-semibold text-indigo-700">3. 情報の共有および開示</h2>
            <ul className="list-disc pl-6">
              <li>サービス提供のために必要な範囲で代理店等の関係者と共有する場合</li>
              <li>法令に基づき、または政府機関や法執行機関から適法な要求を受けた場合</li>
              <li>ユーザーの同意が明確に得られている場合</li>
            </ul>
  
            <h2 className="text-lg font-semibold text-indigo-700">4. ユーザーの権利</h2>
            <ul className="list-disc pl-6">
              <li><strong>管理画面の操作:</strong> 退会手続きや登録情報の変更、削除が可能です。</li>
              <li><strong>オプトアウト:</strong> 配信メールに記載されるリンクをクリックすることで、通知の配信を停止できます。</li>
            </ul>
  
            <h2 className="text-lg font-semibold text-indigo-700">5. 情報の保管期間</h2>
            <p>当社は、必要最小限の期間に限り個人情報を保持します。具体的には、サブスクリプション退会後2カ月間情報を保持した後、適切な方法で安全に削除します。ただし、法令に基づき一定期間保存が義務付けられる情報はこの限りではありません。</p>
  
            <h2 className="text-lg font-semibold text-indigo-700">6. 情報の保護</h2>
            <ul className="list-disc pl-6">
              <li>SSL/TLSによる通信データの暗号化</li>
              <li>ファイアウォールの導入およびアクセス制御の実施</li>
              <li>従業員へのセキュリティ教育および適切なアクセス権限管理</li>
            </ul>
  
            <h2 className="text-lg font-semibold text-indigo-700">7. 第三者サービスとの連携</h2>
            <p>当社は、本サービスの提供および機能向上のためにGoogle APIなどの外部サービスを利用しています。これらの外部サービスを通じて収集される情報については、各サービス提供者のプライバシーポリシーに従って取り扱われます。</p>
  
            <h2 className="text-lg font-semibold text-indigo-700">8. 問い合わせ窓口</h2>
            <p>個人情報の取り扱いに関するご質問、ご意見、またはお客様の権利の行使に関するご依頼は、以下の窓口までお問い合わせください。</p>
            <p>サポート窓口 メールアドレス: <a href="mailto:info@aiaigift.com" className="text-blue-600 hover:underline">info@aiaigift.com</a></p>
  
            <h2 className="text-lg font-semibold text-indigo-700">9. ポリシーの変更</h2>
            <p>当社は、本プライバシーポリシーを必要に応じて変更する場合があります。変更が行われた場合には、本サービス内または公式ウェブサイトにおいてお知らせします。</p>
          </div>
  
          <div className="mt-10 text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded hover:bg-indigo-100 transition"
          >
            ← 前のページに戻る
          </button>
        </div>
      </div>
    </div>
  );
}