"use client"; 

import { useState } from "react";
import "@/styles/pages/customer.css";

export default function CustomerCreate() {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [name, setName] = useState("");
  const [regionPrefecture, setRegionPrefecture] = useState("");
  const [regionCity, setRegionCity] = useState("");
  const [industry, setIndustry] = useState("IT業");
  const [email, setEmail] = useState("");
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState("");

  const registerClient = () => {
    setMessage("顧客登録が完了しました！");
    setCompany("");
    setPosition("");
    setName("");
    setRegionPrefecture("");
    setRegionCity("");
    setIndustry("IT業");
    setEmail("");
    setMemo("");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>顧客登録</h2>
        {message && <p className="success-message">{message}</p>}
        <form>
          <div className="form-group">
            <label>会社名:</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>役職:</label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>

          <div className="form-group">
            <label>名前:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>都道府県:</label>
            <select value={regionPrefecture} onChange={(e) => setRegionPrefecture(e.target.value)} required>
              <option value="" disabled>選択してください</option>
              <option value="北海道">北海道</option>
              <option value="青森県">青森県</option>
              {/* 他の都道府県を追加 */}
            </select>
          </div>

          <div className="form-group">
            <label>市区町村:</label>
            <input type="text" value={regionCity} onChange={(e) => setRegionCity(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>業種:</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="IT業">IT業</option>
              <option value="金融業">金融業</option>
              <option value="製造業">製造業</option>
            </select>
          </div>

          <div className="form-group">
            <label>メールアドレス:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>メモ（最大500文字）:</label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={500}></textarea>
          </div>

          <button type="button" className="btn" onClick={registerClient}>登録</button>
        </form>
      </div>
    </div>
  );
}
