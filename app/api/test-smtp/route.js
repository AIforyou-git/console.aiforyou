// /app/api/test-smtp/route.js
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const smtpPort = parseInt(process.env.SMTP_PORT, 10);
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

    // ✅ SMTP接続テスト
    await transporter.verify();
    return new Response(JSON.stringify({ success: true, message: "SMTP 接続に成功しました。" }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
