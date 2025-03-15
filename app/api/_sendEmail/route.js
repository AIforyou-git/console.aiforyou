import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    console.log("✅ メール送信APIにリクエスト受信");

    const { email, tempPassword } = await req.json();
    console.log("📩 送信先:", email);
    console.log("🔑 仮パスワード:", tempPassword);

    if (!email || !tempPassword) {
      console.error("❌ 無効なリクエストデータ");
      return new Response(JSON.stringify({ error: "無効なリクエストです。" }), { status: 400 });
    }

    // 🔥 SMTP 設定（新しいホスト名を使用）
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // 465ならtrue、587ならfalse
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("📨 SMTP サーバーに接続中...");

    let mailOptions = {
      from: `"Aiforyou" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "【Aiforyou】仮登録完了 - 仮パスワード発行",
      text: `仮登録が完了しました。\n\n仮パスワード: ${tempPassword}\n\nこのパスワードでログインし、設定を変更してください。\n\nAiforyou サポートチーム`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ メール送信成功");

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("❌ メール送信エラー:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
