"use client";

import Link from "next/link";
import "@/styles/pages/dashboard.css";

export default function Dashboard() {
  return (
    <div className="container">
      <h1>ダッシュボード</h1>

      {/* 最新の配信 */}
      <div className="card">
        <h2><i className="fas fa-envelope"></i> 最新の配信</h2>
        <div className="list">
          <div className="list-item">◯月◯日 - クライアント名様</div>
          <div className="list-item">◯月◯日 - クライアント名様</div>
          <div className="list-item">◯月◯日 - クライアント名様</div>
        </div>
        <p className="scroll-note">※スクロール（最大20件まで）</p>
      </div>

      {/* 配信された情報 */}
      <div className="card">
        <h2><i className="fas fa-bullhorn"></i> 配信された情報</h2>
        <div className="list">
          <div className="list-item">
            <span>◯月◯日 - ◯◯に関する補助金</span>
            <Link href="#"><i className="fas fa-external-link-alt"></i></Link>
          </div>
          <div className="list-item">
            <span>◯月◯日 - ◯◯に関する補助金</span>
            <Link href="#"><i className="fas fa-external-link-alt"></i></Link>
          </div>
          <div className="list-item">
            <span>◯月◯日 - ◯◯に関する融資</span>
            <Link href="#"><i className="fas fa-external-link-alt"></i></Link>
          </div>
        </div>
        <p className="scroll-note">※スクロール（直近最大20件まで）</p>
      </div>

      {/* 登録可能人数 */}
      <div className="register-box">
        ギフトプランであと◯人登録可能です
      </div>
    </div>
  );
}
