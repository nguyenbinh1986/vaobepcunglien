// =====================================================================
//  /api/sepay  — Nhận webhook từ SePay, ghi giao dịch vào Supabase.
//  Chạy tự động trên Vercel (Serverless Function), KHÔNG cần server riêng.
//
//  Cần đặt 3 biến môi trường trên Vercel (Project → Settings → Environment Variables):
//    SUPABASE_URL          = https://xxxx.supabase.co
//    SUPABASE_SERVICE_KEY  = service_role key (BÍ MẬT, KHÔNG để lộ)
//    WEBHOOK_TOKEN         = một chuỗi bí mật tự đặt (vd: bcv-92xk-secret)
//
//  Cấu hình webhook bên SePay trỏ tới:
//    https://<tên-web>.vercel.app/api/sepay?token=<WEBHOOK_TOKEN>
// =====================================================================
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  // Xác thực đúng SePay (qua token bí mật)
  if (req.query.token !== process.env.WEBHOOK_TOKEN) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const b = req.body || {};
  const row = {
    sepay_id: b.id ?? null,
    gateway: b.gateway ?? null,
    transaction_date: b.transactionDate ?? null,
    account_number: b.accountNumber ?? null,
    sub_account: b.subAccount ?? null,
    amount: b.transferAmount ?? 0,
    content: b.content || b.description || "",
    transfer_type: b.transferType || "in",
    reference_code: b.referenceCode ?? null,
    raw: b
  };

  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/sepay_transactions`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(row)
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(500).json({ success: false, error: t });
    }

    // Thông báo Telegram (nếu đã cấu hình) — chỉ báo tiền VÀO
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChat = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat && (row.transfer_type || "in") === "in") {
      const amount = Number(row.amount || 0).toLocaleString("vi-VN");
      const text =
        "💰 CÓ ĐƠN MỚI!\n\n" +
        "➕ Số tiền: +" + amount + "đ\n" +
        "📝 Nội dung: " + (row.content || "-") + "\n" +
        "🏦 Ngân hàng: " + (row.gateway || "-") + "\n" +
        "🕒 Thời gian: " + (row.transaction_date || new Date().toLocaleString("vi-VN"));
      try {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChat, text, disable_web_page_preview: true })
        });
      } catch (e) { /* không để lỗi Telegram làm hỏng webhook */ }
    }

    // SePay yêu cầu nhận lại {"success": true}
    return res.status(201).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e) });
  }
}
