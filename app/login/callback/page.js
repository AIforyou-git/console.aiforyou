"use client";

import { useEffect, useState } from "react";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LoginRedirect() {
  const auth = getAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleEmailLinkLogin = async () => {
      if (isProcessing) return;
      setIsProcessing(true);

      const cleanUrl = window.location.href.split("#")[0];

      // ✅ `oobCode` が URL に含まれていない場合はログイン処理を実行しない
      if (!cleanUrl.includes("oobCode=")) {
        console.log("⏭️ URL に oobCode が含まれていないため、ログイン処理をスキップ");
        return;
      }

      console.log("🔍 現在のURL:", cleanUrl);
      if (!isSignInWithEmailLink(auth, cleanUrl)) {
        console.error("❌ 有効なメールリンクではありません");
        return;
      }

      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = prompt("登録したメールアドレスを入力してください:");
        if (!email) {
          console.error("❌ メールアドレスが入力されていません");
          return;
        }
      }

      try {
        const result = await signInWithEmailLink(auth, email, cleanUrl);
        window.localStorage.removeItem("emailForSignIn");

        console.log("✅ ログイン成功！", result.user);

        // ✅ Firestore から `clients` の `invitedBy` を取得
        const clientRef = doc(db, "clients", result.user.uid);
        const clientSnap = await getDoc(clientRef);
        const invitedBy = clientSnap.exists() ? clientSnap.data().invitedBy || "" : "";

        // ✅ Firestore の `users` コレクションに `email` と `invitedBy` を保存
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(userRef, { email, invitedBy }, { merge: true });

        // ✅ 500ms 待機してから `oobCode` を削除し、確実に URL をリセット
        setTimeout(() => {
          window.history.replaceState({}, document.title, "/");

          if (invitedBy) {
            console.log("✅ クライアントとしてログイン → /client-dashboard へ");
            window.location.href = "/client-dashboard";
          } else {
            console.log("✅ 一般ユーザーとしてログイン → /dashboard へ");
            window.location.href = "/dashboard";
          }
        }, 500);
      } catch (error) {
        console.error("❌ メールリンクログイン失敗:", error);
      }
    };

    // ✅ `oobCode`（認証コード）が URL に含まれている場合のみログイン処理を実行
    if (window.location.href.includes("oobCode=")) {
      handleEmailLinkLogin();
    } else {
      console.log("⏭️ oobCode がないため、ログイン処理はスキップ");
    }
  }, [auth]);

  return <p>ログイン処理中...</p>;
}
