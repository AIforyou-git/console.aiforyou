'use client';

import React from 'react';

export default function TokushoPage() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-md rounded-xl">
          <h1 className="text-2xl font-bold text-indigo-600 mb-8 text-center">
            特定商取引法に基づく表記
          </h1>
  
          <dl className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-y-4 gap-x-6 text-sm text-gray-800">
            <dt className="font-semibold">販売事業者</dt>
            <dd>ＡＩｇｉｆｔ株式会社</dd>
  
            <dt className="font-semibold">サービス名</dt>
            <dd>補助金等情報配信サービス　AI for you</dd>
  
            <dt className="font-semibold">運営統括責任者</dt>
            <dd>若園　忠義</dd>
  
            <dt className="font-semibold">所在地</dt>
            <dd>東京都港区南青山二丁目２番１５号ウィン青山９４２</dd>
  
            <dt className="font-semibold">電話番号</dt>
            <dd>03-6833-6874</dd>
  
            <dt className="font-semibold">メールアドレス</dt>
            <dd>info@aigift.info</dd>
  
            <dt className="font-semibold">販売URL</dt>
            <dd>
              <a
                href="https://aigift.info/registration"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://aigift.info/registration
              </a>
            </dd>
  
            <dt className="font-semibold">お支払い方法</dt>
            <dd>クレジットカード決済（サブスクリプション決済）</dd>
  
            <dt className="font-semibold">必要金額</dt>
            <dd className="whitespace-pre-line">
              スタンダードプラン：１カ月 ●２,９８０円
              {"\n"}プレミアムプラン：１カ月 ●３３,０００円
              {"\n"}追加オプション１件につき：１カ月 ●５５０円
            </dd>
  
            <dt className="font-semibold">販売数量</dt>
            <dd>１カ月から</dd>
  
            <dt className="font-semibold">お申込み有効期限</dt>
            <dd>入会時に即時決済、継続は１カ月ごとに自動更新</dd>
  
            <dt className="font-semibold">商品引渡し時期</dt>
            <dd>カード決済完了後、利用開始可能</dd>
  
            <dt className="font-semibold">商品引渡し方法</dt>
            <dd>ユーザアカウントログイン時を引き渡しとする</dd>
  
            <dt className="font-semibold">返品・不良品について</dt>
            <dd>
              利用規約より以下に順ずる
              <br />第8条（利用料金）
              <br />第9条（本サービスの利用）
              <br />第13条（契約者の退会）
            </dd>
  
            <dt className="font-semibold">表現、及び商品に関する注意書き</dt>
            <dd>
              利用規約より以下に順ずる
              <br />第24条（保証の否認及び免責）
            </dd>
          </dl>
  
          <div className="mt-10 text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded hover:bg-indigo-100 transition"
          >
            ← 前のページに戻る
          </button>
        </div>
      </div>
    </div>
  );
}