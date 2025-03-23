const admin = require("firebase-admin");

// 環境変数をログ出力（デバッグ用）
console.log("🚀 Firebase Project ID:", process.env.FIREBASE_PROJECT_ID || "MISSING");
console.log("🚀 Firebase Client Email:", process.env.FIREBASE_CLIENT_EMAIL || "MISSING");
console.log("🚀 Firebase Private Key:", process.env.FIREBASE_PRIVATE_KEY ? "EXISTS" : "MISSING");
console.log("🧪 FIREBASE_PRIVATE_KEY raw:", process.env.FIREBASE_PRIVATE_KEY);
console.log("🧪 FIREBASE_PRIVATE_KEY length:", process.env.FIREBASE_PRIVATE_KEY?.length || 0);

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: firebasePrivateKey,
    }),
  });
}

module.exports = admin;
