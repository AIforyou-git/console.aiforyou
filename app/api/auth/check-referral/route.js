import { db } from "@/lib/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ valid: false, error: "No referral code provided" }, { status: 400 });
  }

  try {
    console.log(`🔍 Checking referral code: ${ref}`);

    // Firestore の referral コレクションを検索
    const referralRef = collection(db, "referral");
    const q = query(referralRef, where("referralCode", "==", ref));
    const referralSnapshot = await getDocs(q);

    if (referralSnapshot.empty) {
      return NextResponse.json({ valid: false, error: "Invalid referral code" }, { status: 400 });
    }

    const referralData = referralSnapshot.docs[0].data();
    
    // 紹介者の状態を `referral.referrerStatus` でチェック
    if (referralData.referrerStatus !== "active") {
      return NextResponse.json({ valid: false, error: "Referrer is not active" }, { status: 400 });
    }

    return NextResponse.json({ valid: true, referrerId: referralData.referrerId }, { status: 200 });

  } catch (error) {
    console.error("🔥 Firestore error:", error);
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
