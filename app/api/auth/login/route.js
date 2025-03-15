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

    return new Response(JSON.stringify({ success: true, role: userInfo.role }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
