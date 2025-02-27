import { firestore } from "../lib/firebase";
import { collection, addDoc, Timestamp, query, where, orderBy, limit, getDocs, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "../lib/firebase";

/**
 * Firestore にログイン履歴を保存する関数（新規ドキュメント方式）
 */
export const logLoginEvent = async (user) => {
  if (!user) return;

  try {
    const currentTimestamp = Timestamp.now(); // ✅ 現在時刻

    const loginLogRef = await addDoc(collection(firestore, "login_logs"), {
      uid: user.uid,
      email: user.email,
      loginTimestamp: currentTimestamp,
      device: navigator.userAgent,
      logoutTimestamp: null, // ✅ ログアウト時間は最初 null
    });

    console.log("✅ Firestore にログイン履歴を保存しました: ", loginLogRef.id);
  } catch (error) {
    console.error("❌ Firestore へのログイン履歴保存に失敗:", error);
  }
};

/**
 * Firestore にログアウト履歴を保存する関数（直近のログを更新）
 */
export const logLogoutEvent = async (user) => {
  if (!user) return;

  try {
    const currentTimestamp = Timestamp.now();

    console.log("🟡 Firestore にログアウト履歴を保存開始: ", user.email, currentTimestamp.toDate());

    // 🔍 ユーザーの最新のログイン履歴を取得（降順で最初の1件）
    const q = query(
      collection(firestore, "login_logs"),
      where("uid", "==", user.uid),
      orderBy("loginTimestamp", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const lastLoginDoc = querySnapshot.docs[0].ref; // 最新のログの参照を取得
      await updateDoc(lastLoginDoc, {
        logoutTimestamp: currentTimestamp, // ✅ ログアウト時間を更新
      });

      console.log("✅ Firestore にログアウト履歴を保存しました: ", currentTimestamp.toDate());
    } else {
      console.warn("⚠️ ログアウト時のログイン履歴が見つかりませんでした。");
    }
  } catch (error) {
    console.error("❌ Firestore へのログアウト履歴保存に失敗:", error);
  }
};

/**
 * ユーザーをログアウトする関数
 */
export const handleSignOut = async () => {
  try {
    const user = firebaseAuth.currentUser;
    if (user) {
      console.log("🟡 ログアウト処理開始: ", user.email);
      await logLogoutEvent(user); // 🔥 `login_logs` にログアウト時間を保存！
    }

    await signOut(firebaseAuth); // ✅ Firebase からログアウト
    console.log("✅ ユーザーがログアウトしました");
  } catch (error) {
    console.error("❌ ログアウトに失敗:", error);
  }
};
