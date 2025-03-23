"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { firebaseAuth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditClient() {
  const router = useRouter();
  const { id } = useParams(); // URL からクライアント ID を取得
  const [clientData, setClientData] = useState({
    company: "",
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchClient = async () => {
      setLoading(true);
      setError("");
      try {
        const clientRef = doc(db, "clients", id);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          setClientData(clientSnap.data());
        } else {
          setError("クライアント情報が見つかりません");
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setError("");
    setSuccess("");

    if (!clientData.company || !clientData.name || !clientData.email) {
      setError("すべての項目を入力してください。");
      return;
    }

    try {
      const clientRef = doc(db, "clients", id);
      await updateDoc(clientRef, {
        company: clientData.company,
        name: clientData.name,
        email: clientData.email,
      });

      setSuccess("更新が完了しました！");
      setTimeout(() => router.push("/user-dashboard/customers"), 1500);
    } catch (error) {
      console.error("更新エラー:", error);
      setError("更新に失敗しました。");
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">顧客編集</h2>

      {loading && <p className="loading-message">データを読み込み中...</p>}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {!loading && !error && (
        <form>
          <div className="form-group">
            <label>会社名:</label>
            <input type="text" name="company" value={clientData.company} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>名前:</label>
            <input type="text" name="name" value={clientData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>メールアドレス:</label>
            <input type="email" name="email" value={clientData.email} onChange={handleChange} required />
          </div>
          <button type="button" className="btn" onClick={handleUpdate}>更新</button>
        </form>
      )}
    </div>
  );
}
