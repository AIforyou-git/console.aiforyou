"use client";

import { useState, useEffect } from "react";
import { firebaseAuth } from "@/lib/firebase";
import { updateUserInviteUrl } from "@/services/firestoreService";
import "@/app/user-dashboard/customers/customer.css";

export default function CustomerCreate() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const inviteUrl = `${window.location.origin}/signup-user?ref=HQ-USER-${user.uid}`;
        setInviteLink(inviteUrl);
        await updateUserInviteUrl(user.uid, inviteUrl);
      }
    });
  }, []);

  const handleSendInvite = async () => {
    setMessage("");

    if (!email) {
      setMessage("メールアドレスを入力してください。");
      return;
    }

    try {
      // 🔥 signup-user の API を利用してメール送信
      const response = await fetch("/api/auth/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, inviteUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "メール送信に失敗しました");
      }

      setMessage("✅ 紹介メールを送信しました！");
    } catch (error) {
      console.error("🔥 メール送信エラー:", error);
      setMessage("❌ メール送信に失敗しました");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>顧客登録</h2>
      </div>

      <div className="card">
        <h3>紹介コードの発行</h3>
        <p>このコードを使ってクライアントを招待できます。</p>
        <input type="text" value={inviteLink} readOnly className="form-control" />
      </div>

      <div className="card">
        <h3>紹介メールを送信</h3>
        <p>クライアントのメールアドレスを入力し、紹介メールを送信してください。</p>
        {message && <p className="message">{message}</p>}
        <input
          type="email"
          placeholder="メールアドレスを入力"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
        <button className="btn btn-primary" onClick={handleSendInvite}>
          紹介メールを送信
        </button>
      </div>

      {/* 💡 新規登録の流れ（コメント） */}
      <div className="card">
        <h3>新規登録の流れ</h3>
        <p>1. 紹介コードを発行し、クライアントにメールを送信</p>
        <p>2. クライアントがメール内のリンクを開く (`signup-user` にアクセス)</p>
        <p>3. Firestore の `users` に `uid` が作成される</p>
        <p>4. `clients` に `uid`, `email`, `createdAt` を記録</p>
        <p>5. 顧客情報は「編集ページ」で追加</p>
      </div>
    </div>
  );
}
