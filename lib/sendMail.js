import nodemailer from 'nodemailer';
import { supabaseAdmin } from './supabaseAdmin';

// トランスポーター初期化
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMailToUser({ user, articles, templateId = 1 }) {
  // 1. テンプレート取得
  const { data: template, error: templateError } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError) {
    console.error('テンプレート取得エラー:', templateError.message);
    return { success: false, error: templateError.message };
  }

  // 2. 差し込み用HTML生成
  const cardsHtml = articles.map((a) => `
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <h3>${a.title}</h3>
      <p>提供機関: ${a.agency}</p>
      <a href="${a.detail_url}" target="_blank">詳細を見る</a>
    </div>
  `).join('');

  const fullHtml = `
    <div style="font-family:sans-serif;">
      <p>${template.content}</p>
      ${cardsHtml}
      <hr>
      <p style="font-size:0.8em;color:#666;">
        このメールは system.aiforyou.jp から自動送信されています。
        ご不明な点は info@mail.system.aiforyou.jp までご連絡ください。
      </p>
    </div>
  `;

  // 3. メール送信
  try {
    await transporter.sendMail({
      from: `"AIforyou 配信システム" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: template.title,
      html: fullHtml,
    });

    // 4. ログ保存
    const logs = articles.map((a) => ({
      user_id: user.id,
      article_id: a.article_id,
    }));

    const { error: logError } = await supabaseAdmin
      .from('delivery_logs')
      .insert(logs);

    if (logError) {
      console.error('ログ挿入エラー:', logError.message);
    }

    return { success: true };
  } catch (err) {
    console.error('メール送信エラー:', err.message);
    return { success: false, error: err.message };
  }
}
