import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "@/lib/firebase";
import { getDoc, doc, updateDoc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore から `role` と `status` を取得
    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      return new Response(JSON.stringify({ error: "ユーザー情報が見つかりません" }), { status: 400 });
    }

    const userInfo = userData.data();

    // ✅ 初回ログイン時のみ `status` を "active" に変更
    if (userInfo.status === "pending") {
      await updateDoc(userRef, {
        status: "active",
        lastLogin: new Date(),
      });
    } else {
      // それ以降のログインでは `lastLogin` のみ更新
      await updateDoc(userRef, { lastLogin: new Date() });
    }

    // ✅ clients コレクションの存在チェック・なければ初期データ登録（user を汚さない）
    try {
      const clientRef = doc(db, "clients", user.uid);
      const clientSnap = await getDoc(clientRef);

      if (!clientSnap.exists()) {
        await setDoc(clientRef, {
          uid: user.uid,
          email: user.email,
          profileCompleted: false,
          createdAt: new Date(),
        });
        console.log("✅ clients コレクションに初期プロフィールを作成しました");
      }
    } catch (clientError) {
      console.warn("⚠️ clients 登録中にエラー:", clientError.message);
      // clients 登録失敗はログイン自体には影響しない
    }

    return new Response(JSON.stringify({ success: true, role: userInfo.role }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
