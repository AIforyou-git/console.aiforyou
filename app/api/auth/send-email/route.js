import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, tempPassword } = await req.json();
    if (!email || !tempPassword) return new Response(JSON.stringify({ error: "必要な情報がありません" }), { status: 400 });

    console.log(`📧 メール送信開始: ${email} / 仮パスワード: ${tempPassword}`);

    const loginUrl = "https://console.aiforyou.jp/";

    /* 参考用URL: http://localhost:3000/login */
console.log("🔍 参考用URL: http://localhost:3000/login");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

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
    `;

    const info = await transporter.sendMail({
      from: `"Aiforyou" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "【Aiforyou】アカウント登録完了 - 初回ログインのご案内",
      text: mailContent,
    });

    console.log(`✅ メール送信成功: ${info.messageId}`);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error(`❌ メール送信エラー: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
