import { firebaseAuth } from "@/lib/firebase";  // 🔥 修正
import { db } from "@/lib/firebase";  // 🔥 追加
import { doc, setDoc, updateDoc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

/** 
 * 🔥 クライアント登録（手動 & 紹介）
 */
export const registerClient = async (clientData) => {
  try {
    const clientRef = doc(collection(db, "clients"));
    await setDoc(clientRef, {
      ...clientData,
      status: "pending",
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("🔥 クライアント登録エラー:", error);
    return { success: false, message: "登録に失敗しました" };
  }
};

/**
 * 🔥 クライアント情報を取得
 */
export const getClientById = async (clientId) => {
  try {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    return clientSnap.exists() ? clientSnap.data() : null;
  } catch (error) {
    console.error("🔥 クライアント取得エラー:", error);
    return null;
  }
};

/**
 * 🔥 クライアント情報を更新
 */
export const updateClient = async (clientId, updateData) => {
  try {
    const clientRef = doc(db, "clients", clientId);
    await updateDoc(clientRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("🔥 クライアント更新エラー:", error);
    return { success: false, message: "更新に失敗しました" };
  }
};

/**
 * 🔥 紹介コードで登録されたクライアント一覧を取得
 * `clients` に登録がないユーザーも `users` から情報を取得し統合
 */
export const getClientsByUser = async (userId) => {
  try {
    // 🔥 クライアント情報を取得
    const clientsQuery = query(collection(db, "clients"), where("referredBy", "==", userId));
    const clientsSnapshot = await getDocs(clientsQuery);
    let clientsData = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 🔥 ユーザー情報を取得（role が "client" のみ）
    const usersQuery = query(collection(db, "users"), where("role", "==", "client"));
    const usersSnapshot = await getDocs(usersQuery);
    let usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 🔥 `clients` のデータがある場合はマージ、ない場合は `users` の情報のみ使用
    let mergedData = usersData.map(user => {
      let client = clientsData.find(client => client.id === user.id);
      return {
        id: user.id,  // Firestore ドキュメント ID（UID）
        email: user.email || "-",
        createdAt: user.createdAt || null,
        company: client?.company || "-",  // クライアントの会社名があれば使用
        status: client?.status || "未登録",  // クライアントが登録されていなければ "未登録"
      };
    });

    return mergedData;
  } catch (error) {
    console.error("🔥 クライアント & ユーザー情報取得エラー:", error);
    return [];
  }
};

/**
 * 🔥 ユーザーの紹介コードを更新
 */
export const updateUserInviteUrl = async (userId, inviteUrl) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { clientInviteUrl: inviteUrl });
    return { success: true };
  } catch (error) {
    console.error("🔥 紹介コード更新エラー:", error);
    return { success: false, message: "紹介コードの更新に失敗しました" };
  }
};
