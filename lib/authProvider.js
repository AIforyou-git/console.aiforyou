"use client";
import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { firebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { logLoginEvent } from "@/lib/authUtils";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true; // ✅ コンポーネントのマウント状態を追跡

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
      setLoading(true);
      try {
        if (authUser) {
          const token = await authUser.getIdToken(); // トークン取得
          if (isMounted) {
            setUser({ ...authUser, token });
          }
          await logLoginEvent(authUser); // ✅ Firestore への保存は `setUser` の後に実行
        } else {
          if (isMounted) {
            setUser(null);
          }
          router.push("/login");
        }
      } catch (error) {
        console.error("認証状態の変更時にエラー:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false; // ✅ クリーンアップ時に `isMounted` を false にする
      unsubscribe(); // ✅ `onAuthStateChanged` のリスナーを解除
    };
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// PropTypes を使用して型チェックを追加
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// 認証情報を取得するカスタムフック
export const useAuth = () => useContext(AuthContext);
