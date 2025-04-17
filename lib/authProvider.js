import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseAuth, db } from "@/lib/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // ✅ JST で現在時刻を取得する関数
  const getJapanTime = () => {
    return new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  };

  useEffect(() => {
    console.log("🚀 [DEBUG] Firebase Auth チェック開始");

    // 🔥 永続的なログイン状態を設定 → 完了後に onAuthStateChanged を登録
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("✅ [DEBUG] Firebase Auth 永続化成功");

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("📢 [DEBUG] onAuthStateChanged 実行", firebaseUser);

          if (firebaseUser) {
            console.log("✅ [DEBUG] ユーザーがログイン中:", firebaseUser.uid);

            try {
              console.log("🔍 [DEBUG] Firestore からユーザーデータ取得開始");
              const userDocRef = doc(db, "users", firebaseUser.uid);
              const userDoc = await getDoc(userDocRef);

              if (userDoc.exists()) {
                console.log("📄 [DEBUG] Firestore ユーザーデータ:", userDoc.data());

                // 🔥 Firestore に `lastLogin` を JST で記録
                await updateDoc(userDocRef, { lastLogin: getJapanTime() });

                setUser({ uid: firebaseUser.uid, ...userDoc.data() });
              } else {
                console.log("⚠️ [DEBUG] Firestore にユーザーデータが存在しません");
                setUser(null);
              }
            } catch (error) {
              console.error("🔥 [DEBUG] Firestore の読み取りエラー:", error);
              setUser(null);
            }
          } else {
            console.log("⚠️ [DEBUG] ユーザーがログアウト状態です");
            setUser(null);
          }

          setLoading(false);
        });

        // ✅ クリーンアップ関数を return で返す
        return () => unsubscribe();
      })
      .catch((error) =>
        console.error("🔥 [DEBUG] Firebase Auth 永続化エラー:", error)
      );
  }, [auth]);

  const logout = async () => {
    console.log("🔥 [DEBUG] logout 関数が実行された");

    try {
      await signOut(auth);
      console.log("✅ Firebase Auth からサインアウト成功");

      // 🔄 少し遅らせて Auth 状態が反映された後にクリア
      setTimeout(() => {
        setUser(null);
        console.log("🧹 setUser(null) 実行（遅延後）");
      }, 300);
    } catch (error) {
      console.error("❌ logout 中にエラー:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
