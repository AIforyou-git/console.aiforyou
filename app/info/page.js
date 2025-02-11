"use client";

import Link from "next/link";
import "@/styles/pages/info.css"; 

export default function Info() {
  return (
    <div className="info-container">
      <h1>情報</h1>

      <div className="info-boxes">
        {/* 補助金情報 */}
        <Link href="/info/grants" className="info-box">
          <i className="fas fa-file-invoice-dollar"></i>
          <h3>補助金情報</h3>
          <p>管理クライアントに該当する補助金一覧をまとめて確認</p>
        </Link>

        {/* メール管理 */}
        <Link href="/info/emails" className="info-box">
          <i className="fas fa-envelope-open-text"></i>
          <h3>メール管理</h3>
          <p>クライアントへ送信したメールの履歴を一括管理</p>
        </Link>
      </div>
    </div>
  );
}
