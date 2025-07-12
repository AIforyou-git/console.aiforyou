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

/**
 * メール送信関数
 * @param {object} user - ユーザー情報（id, email）
 * @param {object[]} articles - 送信対象記事一覧
 * @param {object} client - クライアント情報（cc_email_1, cc_email_2 など）
 * @param {number} templateId - 使用するテンプレートID（デフォルト: 1）
 */
export async function sendMailToUser({ user, articles, client, templateId = 1 }) {
  const { data: template, error: templateError } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError) {
    console.error('📄 テンプレート取得エラー:', templateError.message);
    return { success: false, error: templateError.message };
  }

  // 📦 各記事情報を HTML カード形式で生成
  const cardsHtml = articles.map((a) => `
    <div style="border:1px solid #ccc; border-radius:6px; padding:16px; margin-bottom:16px; background-color:#f9f9f9;">
      <h3 style="margin:0 0 8px; font-size:1.1em; color:#333;">${a.title}</h3>
      <p style="margin:0 0 6px; font-size:0.9em;">📌 <strong>提供機関:</strong> ${a.agency}</p>
      ${a.summary ? `<p style="margin:6px 0; font-size:0.9em;">📝 ${a.summary}</p>` : ''}
      ${a.published_at ? `<p style="margin:6px 0; font-size:0.85em;">📅 公開日: ${a.published_at}</p>` : ''}
      ${a.application_period ? `<p style="margin:6px 0; font-size:0.85em;">⏰ 応募期間: ${a.application_period}</p>` : ''}
      <p style="margin:6px 0;">
        <a href="${a.detail_url}" target="_blank" style="color:#1a73e8; text-decoration:underline;">▶ 詳細を見る</a>
      </p>
      <p style="margin:6px 0;">
        <a href="https://console.aiforyou.jp/client-dashboard/news-control/apply?user_id=${user.id}&article_id=${a.article_id}" 
           style="display:inline-block; padding:8px 16px; background-color:#10b981; color:white; text-decoration:none; border-radius:4px; font-size:0.9em;" 
           target="_blank">
          💼 申請サポートを希望する
        </a>
      </p>
    </div>
  `).join('');

  const fullHtml = `
    <div style="font-family:sans-serif; font-size:14px; line-height:1.6; color:#333;">
      <p>${template.content}</p>
      ${cardsHtml}
      <hr style="margin-top:32px; border:none; border-top:1px solid #ddd;" />
      <p style="font-size:0.8em; color:#999; text-align:center;">
        このメールは system.aiforyou.jp より自動送信されています。<br/>
        ご不明な点は info@mail.system.aiforyou.jp までご連絡ください。
      </p>
    </div>
  `;

  const ccList = [];
  if (client?.cc_email_1) ccList.push(client.cc_email_1);
  if (client?.cc_email_2) ccList.push(client.cc_email_2);

  try {
    await transporter.sendMail({
      from: `"AIforyou 配信システム" <${process.env.SMTP_USER}>`,
      to: user.email,
      cc: ccList.length > 0 ? ccList : undefined,
      subject: template.subject || template.title,
      html: fullHtml,
    });

    console.log(`📧 メール送信成功: ${user.email} | CC: ${ccList.join(', ') || 'なし'}`);
    return { success: true };
  } catch (err) {
    console.error(`❌ メール送信失敗: ${user.email}`, err.message);
    return { success: false, error: err.message };
  }
}
