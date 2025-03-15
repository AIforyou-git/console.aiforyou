"use client";

import Link from "next/link";
import "@/styles/pages/settings.css";

export default function Settings() {
  return (
    <div className="settings-wrapper">
      {/* タイトルを中央揃え */}
      <div className="settings-title">
        <h1>設定</h1>
      </div>

      {/* 設定項目 */}
      <div className="settings-container">
        <Link href="/preparing" className="settings-card">
          <i className="fas fa-envelope"></i>
          <h3>メール設定</h3>
          <p>メールテンプレート編集・自動送信設定</p>
        </Link>

        <Link href="/preparing" className="settings-card">
          <i className="fas fa-credit-card"></i>
          <h3>支払い設定</h3>
          <p>プラン変更・支払い履歴</p>
        </Link>

        <Link href="/preparing" className="settings-card">
          <i className="fas fa-database"></i>
          <h3>データ設定</h3>
          <p>バックアップ・データエクスポート</p>
        </Link>

        <Link href="/preparing" className="settings-card">
          <i className="fas fa-bell"></i>
          <h3>通知設定</h3>
          <p>メール通知・重要なお知らせ</p>
        </Link>

        <Link href="/preparing" className="settings-card">
          <i className="fas fa-user"></i>
          <h3>アカウント設定</h3>
          <p>プロフィール・パスワード変更</p>
        </Link>

        <Link href="/preparing" className="settings-card">
          <i className="fas fa-link"></i>
          <h3>連携設定</h3>
          <p>Googleカレンダー・Slack連携</p>
        </Link>

        <Link href="/preparing" className="settings-card">
          <i className="fas fa-users-cog"></i>
          <h3>ユーザー設定</h3>
          <p>メンバー管理・権限変更</p>
        </Link>

        <Link href="/preparing" className="settings-card">
          <i className="fas fa-building"></i>
          <h3>代理店設定</h3>
          <p>代理店向け機能（将来的に追加）</p>
        </Link>
      </div>
    </div>
  );
}