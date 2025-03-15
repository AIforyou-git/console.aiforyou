"use client";
import Image from "next/image";

export default function PreparingPage() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>🚧 準備中 🚧</h1>
      <p style={{ fontSize: "1.2rem", color: "#555" }}>このページは現在準備中です。</p>
      <p style={{ fontSize: "1.2rem", color: "#555" }}>しばらくお待ちください 🐱</p>

      {/* 🔥 ここに画像を表示 */}
      <Image src="/AIforyou-rogo.003_0.png" alt="logo" width={300} height={300} />

      <p style={{ marginTop: "20px", fontSize: "1rem", color: "#888" }}>
        またのご訪問をお待ちしています！
      </p>
    </div>
  );
}
