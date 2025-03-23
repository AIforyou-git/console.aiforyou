"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth, db } from "@/lib/firebase";
import { doc, setDoc, collection, updateDoc } from "firebase/firestore";
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

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { clientInviteUrl: inviteUrl });

        const referralRef = doc(collection(db, "referral"), `HQ-USER-${user.uid}`);
        await setDoc(referralRef, {
          referralCode: `HQ-USER-${user.uid}`,
          referrerId: user.uid,
          clientInviteUrl: inviteUrl,
          referrerStatus: "active",
          createdAt: new Date(),
        });
      }
    });
  }, []);

  const registerClient = async () => {
    setMessage("");

    if (!company || !name || !regionPrefecture || !regionCity || !email) {
      setMessage("必須項目をすべて入力してください。");
      return;
    }

    // 📧 メールの形式をチェック
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setMessage("正しいメールアドレスを入力してください。");
      return;
    }

    try {
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error("未認証のユーザーです");

      // Firestore にクライアント登録
      await setDoc(doc(collection(db, "clients")), {
        company,
        position,
        name,
        regionPrefecture,
        regionCity,
        industry,
        email,
        memo,
        referredBy: user.uid,  // 🔥 手動登録でも紹介者を設定
        status: "pending",
        createdAt: new Date(),
      });

      setMessage("顧客登録が完了しました！");

      // フォームリセット
      setCompany("");
      setPosition("");
      setName("");
      setRegionPrefecture("");
      setRegionCity("");
      setIndustry("IT業");
      setEmail("");
      setMemo("");

      // ✅ 1.5秒後に「顧客一覧」へリダイレクト
      setTimeout(() => router.push("/user-dashboard/customers"), 1500);
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

      {/* 🔥 紹介コードの発行 */}
      <div className="card">
        <button className="btn btn-secondary" onClick={() => setShowInvite(true)}>
          紹介コードを発行
        </button>
        {showInvite && (
          <div className="invite-modal">
            <h3>クライアント紹介URL</h3>
            <input type="text" value={inviteLink} readOnly />
            <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="copy-btn">
              コピー
            </button>
            <button className="close-btn" onClick={() => setShowInvite(false)}>閉じる</button>
          </div>
        )}
      </div>

      {/* 🔽 手動登録フォーム */}
      <div className="card">
        <h2>手動登録フォーム</h2>
        {message && <p className="message">{message}</p>}
        <form>
          <div className="form-group">
            <label>会社名:</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>役職:</label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>

          <div className="form-group">
            <label>名前:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>都道府県:</label>
            <select value={regionPrefecture} onChange={(e) => setRegionPrefecture(e.target.value)} required>
              <option value="" disabled>選択してください</option>
              <option value="北海道">北海道</option>
              <option value="青森県">青森県</option>
              <option value="東京都">東京都</option>
              <option value="大阪府">大阪府</option>
            </select>
          </div>

          <div className="form-group">
            <label>市区町村:</label>
            <input type="text" value={regionCity} onChange={(e) => setRegionCity(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>業種:</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="IT業">IT業</option>
              <option value="金融業">金融業</option>
              <option value="製造業">製造業</option>
            </select>
          </div>

          <div className="form-group">
            <label>メールアドレス:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>メモ（最大500文字）:</label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={500}></textarea>
          </div>

          <button type="button" className="btn" onClick={registerClient}>登録</button>
        </form>
      </div>
    </div>
  );
}
