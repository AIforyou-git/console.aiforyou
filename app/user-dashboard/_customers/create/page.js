"use client";

import { useState, useEffect } from "react";
import { firebaseAuth } from "@/lib/firebase";
import "@/styles/pages/customer.css";

export default function CustomerCreate() {
  const [inviteLink, setInviteLink] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        setInviteLink(`${window.location.origin}/signup-user?ref=HQ-USER-${user.uid}`);
      }
    });
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>クライアント登録のご案内</h2>
        <p>以下の紹介URLを使って、新しいクライアントを登録できます。</p>
      </div>

      {/* 🔥 紹介用URLの発行（モーダル） */}
      <div className="card">
        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
          クライアントの紹介URLを発行
        </button>
        {showInvite && (
          <div className="invite-modal">
            <h3>クライアントの登録用URL</h3>
            <p>このURLをコピーして、クライアントに共有してください。</p>
            <input type="text" value={inviteLink} readOnly className="form-control" />
            <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="btn btn-success">
              URLをコピー
            </button>
            <button className="btn btn-secondary" onClick={() => setShowInvite(false)}>閉じる</button>
          </div>
        )}
      </div>

      {/* 🔽 やさしいフロー説明 */}
      <div className="card">
        <h3>クライアント登録の流れ</h3>
        <p>💡 クライアント登録はとても簡単です！</p>
        <ol>
          <li>「クライアントの紹介URLを発行」ボタンを押します。</li>
          <li>表示されたURLをコピーして、登録したいクライアントに送ります。</li>
          <li>クライアントがURLから登録すると、自動的にあなたの管理リストに追加されます。</li>
          <li>「顧客一覧」からクライアント情報を編集できます。</li>
        </ol>
      </div>
    </div>
  );
}
