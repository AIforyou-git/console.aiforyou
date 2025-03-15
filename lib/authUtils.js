import { firebaseAuth, db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

/**
 * ログインイベントを Firestore に記録
 */
export async function logLoginEvent(user) {
  if (!user || !user.uid) {
    console.error("❌ 無効なユーザー情報:", user);
    return;
  }

  try {
    await addDoc(collection(db, "loginLogs"), {
      userId: user.uid,
      email: user.email || "未登録",
      timestamp: Timestamp.now(),
      type: "login"
    });
    console.log("✅ ログイン履歴を記録しました:", user.uid);
  } catch (error) {
    console.error("❌ ログイン履歴の記録に失敗しました:", error);
  }
}

/**
 * ログアウトイベントを Firestore に記録
 */
export async function logLogoutEvent(user) {
  if (!user || !user.uid) {
    console.error("❌ 無効なユーザー情報:", user);
    return;
  }

  try {
    await addDoc(collection(db, "loginLogs"), {
      userId: user.uid,
      email: user.email || "未登録",
      timestamp: Timestamp.now(),
      type: "logout"
    });
    console.log("✅ ログアウト履歴を記録しました:", user.uid);
  } catch (error) {
    console.error("❌ ログアウト履歴の記録に失敗しました:", error);
  }
}
