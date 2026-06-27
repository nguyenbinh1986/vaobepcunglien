# 🔔 Hướng dẫn bật THÔNG BÁO TELEGRAM khi có thanh toán

Khi bật xong: mỗi lần có khách chuyển khoản, Telegram báo ngay
"💰 CÓ ĐƠN MỚI! +25.000đ — Nội dung: CT PHOBO ...".

---

## Bước 1 — Tạo bot Telegram
1. Mở Telegram, tìm **@BotFather** → bấm Start.
2. Gửi lệnh: `/newbot`
3. Đặt **tên bot** (vd: Bếp Của Liên Báo Đơn) → đặt **username** kết thúc bằng `bot` (vd: bepcualien_bot).
4. BotFather đưa lại **Token** dạng `7712345678:AAH....` → **copy & lưu lại**.

## Bước 2 — Lấy Chat ID (để bot biết gửi cho ai)
1. Quan trọng: tìm **bot vừa tạo** (gõ username) → bấm **Start** / gửi 1 tin "hi" (để bot được phép nhắn lại bạn).
2. Tìm **@userinfobot** → bấm Start → nó hiện **Id: 1234567890** → đó là **Chat ID** của bạn. Copy lại.
   - (Muốn báo vào 1 NHÓM: thêm bot vào nhóm, rồi hỏi Bình lấy chat id nhóm.)

## Bước 3 — Thêm 2 biến trên Vercel
Vercel → Settings → Environments → Production → Environment Variables → Add:
| Name | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Token ở Bước 1 |
| `TELEGRAM_CHAT_ID` | Chat ID ở Bước 2 |

Bật **Sensitive**, chọn **Production** → **Save** → vào **Deployments → Redeploy**.

---

## ✅ Kiểm tra
Chuyển khoản thử 1 món (hoặc nhờ Bình giả lập) → Telegram của bạn nhận tin "💰 CÓ ĐƠN MỚI!".

> Lưu ý: thông báo báo MỌI khoản tiền VÀO tài khoản đã nối SePay (không chỉ đơn công thức).
> Nếu bot không nhắn được: kiểm tra đã bấm Start với bot chưa (Bước 2.1), token & chat id đúng chưa, đã Redeploy chưa.
