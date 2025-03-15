"use client";

import { doc, getDoc, collection, query, orderBy, limit, getDocs, updateDoc } from "firebase/firestore";

import { useEffect, useState } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import "./client-dashboard.css"; // ✅ スタイル適用

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [news, setNews] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStatus(userData.status);

        if (userData.status === "pending") {
          await updateDoc(userDocRef, { status: "active", lastLogin: new Date().toISOString() });
          setStatus("active");
        } else {
          await updateDoc(userDocRef, { lastLogin: new Date().toISOString() });
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchNews = async () => {
      const dummyNews = [
        {
          id: "1",
          title: "中小企業向けIT導入補助金",
          summary: "中小企業がITツールを導入する際に利用できる補助金。最大200万円まで補助される制度であり...",
        },
        {
          id: "2",
          title: "新規事業開拓支援補助金",
          summary: "新規事業の立ち上げを支援する補助金。対象はスタートアップ企業や中小企業で、事業計画の提出が必要...",
        },
        {
          id: "3",
          title: "環境対策補助金",
          summary: "CO2削減に貢献する設備投資を行う企業向けの補助金。最大500万円まで補助され、エコ製品の導入に...",
        },
        {
          id: "4",
          title: "DX推進補助金",
          summary: "企業のデジタル化を支援する補助金。ERP、CRMなどの導入費用の一部を補助し、競争力向上を目指す...",
        },
        {
          id: "5",
          title: "雇用促進助成金",
          summary: "雇用促進を目的とした助成金制度。正社員登用を行う企業に対し、一人当たり最大50万円の助成金が支給...",
        },
      ];
      setNews(dummyNews);
    };

    fetchNews();
  }, []);

  return (
    <div className="dashboard-container">
      {/* 🔹 クライアント情報を極小表示 */}
      <div className="client-info">
        <span>ログイン中: {user?.email}</span> | <span>アカウント: {status}</span>
      </div>

      <h1 className="dashboard-title">あなたの新着情報</h1>

      {/* 🔥 新着情報リスト */}
      <div className="news-list">
        {news.map((item) => (
          <div key={item.id} className="news-item">
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <div className="news-buttons">
            <Link href="/preparing">
  <button>詳細確認</button>
</Link>
<Link href="/preparing">
  <button>申請サポート</button>
</Link>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 画面下部の固定メニュー */}
<div className="fixed-bottom-menu">
  <a 
    href="https://script.google.com/macros/s/AKfycbyAb-HRdZ8YdluDDWBqZ_pBelhlqSTXENOlFMFINIsR2T9sbnx45CVsTTP-4S1p634/exec"
    target="_blank"
    rel="noopener noreferrer"
  >
    <button className="menu-btn">🤖 AI相談</button>
  </a>

  <Link href="/preparing">
    <button className="menu-btn">📨 友達に紹介</button>
  </Link>
</div>
    </div>
  );
}
