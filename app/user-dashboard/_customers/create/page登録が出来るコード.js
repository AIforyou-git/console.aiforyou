"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase";
import { registerClient, updateUserInviteUrl } from "@/services/firestoreService";
import "@/styles/pages/customer.css";

export default function CustomerCreate() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [name, setName] = useState("");
  const [regionPrefecture, setRegionPrefecture] = useState("");
  const [regionCity, setRegionCity] = useState("");
  const [industry, setIndustry] = useState("IT業");
  const [email, setEmail] = useState("");
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const inviteUrl = `${window.location.origin}/signup-user?ref=HQ-USER-${user.uid}`;
        setInviteLink(inviteUrl);
        await updateUserInviteUrl(user.uid, inviteUrl);
      }
    });
  }, []);

  const handleRegisterClient = async () => {
    setMessage("");

    if (!company || !name || !regionPrefecture || !regionCity || !email) {
      setMessage("必須項目をすべて入力してください。");
      return;
    }

    try {
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error("未認証のユーザーです");

      const result = await registerClient({
        company,
        position,
        name,
        regionPrefecture,
        regionCity,
        industry,
        email,
        memo,
        referredBy: user.uid,
      });

      if (result.success) {
        setMessage("顧客登録が完了しました！");
        setTimeout(() => router.push("/user-dashboard/customers"), 1500);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("登録エラー:", error);
      setMessage("登録に失敗しました。");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>顧客登録</h2>
      </div>

      <div className="card">
        <button className="btn btn-secondary" onClick={() => setShowInvite(true)}>
          紹介コードを発行
        </button>
      </div>

      <div className="card">
        <h2>手動登録フォーム</h2>
        <p>必須項目をすべて入力してください。</p>
        
        {message && <p className="message">{message}</p>}

        <div className="form-group">
          <label>会社名:</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="form-control" />
        </div>

        <div className="form-group">
          <label>役職:</label>
          <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="form-control" />
        </div>

        <div className="form-group">
          <label>名前:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control" />
        </div>

        <div className="form-group">
          <label>都道府県:</label>
          <input type="text" value={regionPrefecture} onChange={(e) => setRegionPrefecture(e.target.value)} className="form-control" />
        </div>

        <div className="form-group">
          <label>市区町村:</label>
          <input type="text" value={regionCity} onChange={(e) => setRegionCity(e.target.value)} className="form-control" />
        </div>

        <div className="form-group">
          <label>業種:</label>
          <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="form-control" />
        </div>

        <div className="form-group">
          <label>メールアドレス:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" />
        </div>

        <div className="form-group">
          <label>メモ:</label>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} className="form-control" rows="3"></textarea>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleRegisterClient}>
          登録
        </button>
      </div>
    </div>
  );
}
