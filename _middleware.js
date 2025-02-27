import { NextResponse } from "next/server";
const admin = require("@/lib/firebaseAdmin"); // Firebase Admin をインポート

const protectedRoutes = ["/dashboard", "/customers", "/settings"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (!protectedRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken) throw new Error("Invalid Token");
    return NextResponse.next();
  } catch (error) {
    console.error("認証エラー:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// ✅ ここで `runtime: "nodejs"` を指定
export const config = {
  matcher: ["/dashboard/:path*", "/customers/:path*", "/settings/:path*"],
  runtime: "nodejs", // ← 追加
};
