"use client";

import { useState, useEffect } from "react";
import { updateClient } from "@/services/firestoreService";
import "@/styles/pages/customer.css";

export default function ClientEditModal({ client, isOpen, onClose }) {
  const [formData, setFormData] = useState(client);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFormData(client);
  }, [client]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await updateClient(client.id, formData);
      setMessage("✅ 顧客情報が更新されました！");
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1500);
    } catch (error) {
      console.error("更新エラー:", error);
      setMessage("❌ 更新に失敗しました。");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>顧客情報を編集</h3>
        {message && <p className="message">{message}</p>}

        <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-control" placeholder="会社名" />
        <input type="text" name="position" value={formData.position} onChange={handleChange} className="form-control" placeholder="役職" />
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="名前" />
        <input type="text" name="regionPrefecture" value={formData.regionPrefecture} onChange={handleChange} className="form-control" placeholder="都道府県" />
        <input type="text" name="regionCity" value={formData.regionCity} onChange={handleChange} className="form-control" placeholder="市区町村" />
        <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="form-control" placeholder="業種" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="メールアドレス" />
        <textarea name="memo" value={formData.memo} onChange={handleChange} className="form-control" placeholder="メモ" rows="3"></textarea>

        <div className="modal-actions">
          <button onClick={handleUpdate} className="btn btn-primary">保存</button>
          <button onClick={onClose} className="btn btn-secondary">閉じる</button>
        </div>
      </div>
    </div>
  );
}
