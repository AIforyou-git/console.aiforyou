// lib/email/sendPaymentSuccessEmail.ts
//import nodemailer from "nodemailer";
import * as nodemailer from "nodemailer";

type SendPaymentSuccessEmailParams = {
  userId: string;
  email?: string;
  amount: number;
  invoiceId: string;
  paidAt: string | null;
};

export async function sendPaymentSuccessEmail({
  userId,
  email,
  amount,
  invoiceId,
  paidAt,
}: SendPaymentSuccessEmailParams) {
  if (!email) throw new Error("メールアドレスが未指定です");

  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const secureMode = smtpPort === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: secureMode,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const formattedAmount = (amount / 100).toLocaleString("ja-JP", {
    style: "currency",
    currency: "JPY",
  });

  const paidDateStr = paidAt
    ? new Date(paidAt).toLocaleString("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "不明";

  const subject = "【AIforyou】お支払い完了のお知らせ";
  const text = `
${email} 様

いつも AIforyou をご利用いただきありがとうございます。

以下の内容でお支払いが完了しましたのでお知らせいたします。

---------------------------------------
💳 お支払い金額: ${formattedAmount}
🧾 請求書ID: ${invoiceId}
📅 支払日時: ${paidDateStr}
ユーザーID: ${userId}
---------------------------------------

引き続き、AIforyou をよろしくお願いいたします。

AIforyou サポートチーム
`;

  const info = await transporter.sendMail({
    from: `"AIforyou" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    text,
  });

  console.log("📧 決済完了メール送信:", info.messageId);
}
