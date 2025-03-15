import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const referredBy = url.searchParams.get("ref");
    if (!referredBy) throw new Error("紹介コードが指定されていません");

    let role = "client";  // デフォルト
    let referrerId = referredBy || null;

    if (referredBy === "HQ-AGENCY") role = "agency";
    else if (referredBy === "HQ-USER") role = "user";
    else if (referredBy === "HQ-CLIENT") role = "client";
    else {
      const refUser = await getDoc(doc(db, "users", referredBy));
      if (refUser.exists()) {
        const refData = refUser.data();
        if (refData.role === "admin") role = "agency";
        else if (refData.role === "agency") role = "user";
        else if (refData.role === "user") role = "client";
        referrerId = referredBy;
      } else {
        throw new Error("紹介コードが無効です");
      }
    }

    return new Response(JSON.stringify({ role, referrerId }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}
