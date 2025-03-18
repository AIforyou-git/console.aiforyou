import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    console.log("🚀 [SEND-EMAIL] API 呼び出し開始");

    const { email, tempPassword } = await req.json();
    console.log("📩 受信データ:", { email, tempPassword });

    if (!email || !tempPassword) {
      console.error("❌ 必要な情報が不足しています");
      return new Response(JSON.stringify({ error: "必要な情報がありません" }), { status: 400 });
    }

    console.log("📡 SMTP 設定:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
    });

    console.log("📨 メール送信開始:", email);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT == "465", // 465ならsecure、それ以外はfalse
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const loginUrl = "https://console.aiforyou.jp/";

    const mailContent = `
      ${email} 様

      Aiforyou へのご登録ありがとうございます。

      以下の情報でログインし、アカウントの設定を行ってください。

      -------------------------------------
      メールアドレス: ${email}
      仮パスワード: ${tempPassword}
      ログインURL: ${loginUrl}
      -------------------------------------

      ※ログイン後、パスワードを変更することをおすすめします。

      今後とも Aiforyou をよろしくお願いいたします。

      Aiforyou サポートチーム
      開発用：http://localhost:3000/
    `;

    console.log("✉️ メール本文:", mailContent);

    const info = await transporter.sendMail({
      from: `"Aiforyou" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "【Aiforyou】アカウント登録完了 - 初回ログインのご案内",
      text: mailContent,
    });

    console.log(`✅ メール送信成功: メールID ${info.messageId} / 宛先: ${email}`);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("❌ メール送信エラー:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
