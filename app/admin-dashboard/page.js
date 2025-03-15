"use client";

import { useState, useEffect } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, updateEmail, sendPasswordResetEmail, signOut } from "firebase/auth";
import Link from "next/link";

export default function AdminDashboard() {
  const [agencyUrl, setAgencyUrl] = useState("");
  const [userUrl, setUserUrl] = useState("");
  const [clientUrl, setClientUrl] = useState("");
  const [email, setEmail] = useState("");
  const [adminId, setAdminId] = useState(null);
  const auth = getAuth();

  // ✅ JST で現在時刻を取得する関数
  const getJapanTime = () => {
    return new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAdminId(user.uid);
        setEmail(user.email);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // 🔥 `status: active` を含めて Firestore に保存
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            role: "admin",
            status: "active",
            referredBy: null,
            createdAt: getJapanTime(),
            lastLogin: getJapanTime(),
          });
        } else {
          // 🔥 `lastLogin` を JST で更新
          await updateDoc(userRef, { lastLogin: getJapanTime() });
        }
      } else {
        // 🔥 ログアウト時の処理
        setAdminId(null);
        setEmail("");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!adminId) return;
    const docRef = doc(db, "admin", adminId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAgencyUrl(docSnap.data().agencyInviteUrl);
        setUserUrl(docSnap.data().userInviteUrl);
        setClientUrl(docSnap.data().clientInviteUrl);
      }
    });

    return () => unsubscribe();
  }, [adminId]);

  const generateUrls = async () => {
    if (!adminId) return;
    const docRef = doc(db, "admin", adminId);
    const docSnap = await getDoc(docRef);
    const existingData = docSnap.exists() ? docSnap.data() : {};

    const agencyInviteUrl = existingData.agencyInviteUrl || `https://console.aiforyou.jp/signup?ref=HQ-AGENCY`;
    const userInviteUrl = existingData.userInviteUrl || `https://console.aiforyou.jp/signup?ref=HQ-USER`;
    const clientInviteUrl = existingData.clientInviteUrl || `https://console.aiforyou.jp/signup?ref=HQ-CLIENT`;

    await setDoc(docRef, {
      role: "admin",
      agencyInviteUrl,
      userInviteUrl,
      clientInviteUrl
    }, { merge: true });

    setAgencyUrl(agencyInviteUrl);
    setUserUrl(userInviteUrl);
    setClientUrl(clientInviteUrl);
  };

  const handleEmailChange = async () => {
    try {
      await updateEmail(auth.currentUser, email);
      alert("メールアドレスが更新されました！");
    } catch (error) {
      alert("メールアドレスの変更に失敗しました: " + error.message);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("パスワードリセットメールを送信しました！");
    } catch (error) {
      alert("パスワードリセットに失敗しました: " + error.message);
    }
  };

  // ✅ ログアウト処理を追加
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAdminId(null);
      setEmail("");
      alert("ログアウトしました！");
    } catch (error) {
      alert("ログアウトに失敗しました: " + error.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>管理者ダッシュボード</h1>
      
      <Link href="/admin-dashboard/users">
        <button>ユーザー管理</button>
      </Link>
      <button onClick={generateUrls}>紹介URLを生成</button>
      
      <div>
        <h3>アカウント管理</h3>
        <label>メールアドレス:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleEmailChange}>メール変更</button>
        <button onClick={handlePasswordReset}>パスワードリセット</button>
        <button onClick={handleLogout}>ログアウト</button> {/* 🔥 ログアウトボタン追加 */}
      </div>
      
      <div>
        <h3>代理店登録用URL</h3>
        <input type="text" value={agencyUrl} readOnly />
        <button onClick={() => navigator.clipboard.writeText(agencyUrl)}>コピー</button>
      </div>

      <div>
        <h3>ユーザー登録用URL</h3>
        <input type="text" value={userUrl} readOnly />
        <button onClick={() => navigator.clipboard.writeText(userUrl)}>コピー</button>
      </div>

      <div>
        <h3>クライアント登録用URL</h3>
        <input type="text" value={clientUrl} readOnly />
        <button onClick={() => navigator.clipboard.writeText(clientUrl)}>コピー</button>
      </div>
    </div>
  );
}
