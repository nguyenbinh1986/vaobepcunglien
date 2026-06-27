# ⚡ Hướng dẫn bật TỰ ĐỘNG MỞ KHÓA (SePay) — Bếp Của Vợ

Khi bật xong: khách chuyển khoản là trang **tự mở khóa công thức**, không cần vợ gửi mã tay.
Làm lần lượt 3 phần A → B → C. Khoảng 30–45 phút, **miễn phí**.

> Trong lúc chưa làm xong, web vẫn bán bình thường bằng cách **nhập mã thủ công** (không ảnh hưởng gì).

---

## PHẦN A — Supabase (kho lưu giao dịch)

1. Vào https://supabase.com → đăng ký (đăng nhập bằng Google) → **New project**.
   - Đặt tên tuỳ ý, chọn Region **Singapore**, đặt 1 mật khẩu Database (lưu lại). Chờ ~2 phút.
2. Cột trái chọn **SQL Editor** → **New query** → mở file `supabase-setup.sql` (trong thư mục này),
   copy toàn bộ, dán vào, bấm **Run**. Thấy "Success" là xong.
3. Lấy thông tin kết nối: cột trái **Project Settings (⚙️)** → **API**. Ghi lại 3 thứ:
   - **Project URL** — dạng `https://xxxx.supabase.co`
   - **anon public** key — (dùng cho web, công khai được)
   - **service_role** key — ⚠️ **BÍ MẬT**, chỉ dán vào Vercel ở Phần B, KHÔNG đưa ai.

---

## PHẦN B — Vercel (đưa web + bộ nhận tiền lên mạng)

1. Vào https://vercel.com/new → kéo-thả **cả thư mục `BepCuaVo`** vào (đã có sẵn `api/sepay.js`).
   Chờ ~30 giây có link `https://<tên>.vercel.app`.
2. Vào **Project → Settings → Environment Variables**, thêm 3 biến (bấm Add từng cái):
   | Name (Key) | Value |
   |---|---|
   | `SUPABASE_URL` | Project URL ở Phần A |
   | `SUPABASE_SERVICE_KEY` | **service_role** key ở Phần A |
   | `WEBHOOK_TOKEN` | tự đặt 1 chuỗi bí mật, vd `bcv-92xk-bem` |
3. Vào tab **Deployments** → bấm **Redeploy** (để biến môi trường có hiệu lực).
4. **URL webhook của bạn** sẽ là (nhớ thay tên + token):
   ```
   https://<tên>.vercel.app/api/sepay?token=bcv-92xk-bem
   ```

> Ghi vào trang **Admin** (mục ⚡ Tự động): tick **Bật tự động**, dán **Project URL** + **anon key**.
> Bấm **🗄️ Tải recipe_codes.sql** → mở Supabase → SQL Editor → dán → Run (để nạp mã các món).
> Rồi **💾 Tải content.json** và kéo lại lên Vercel.

---

## PHẦN C — SePay (báo có tiền về)

1. Đăng ký https://sepay.vn → liên kết tài khoản ngân hàng (làm theo hướng dẫn của SePay).
2. Vào mục **Tích hợp → Webhooks → Thêm webhook**:
   - **URL**: dán URL webhook ở Phần B (kèm `?token=...`)
   - **Phương thức**: POST · **Kiểu dữ liệu**: JSON
   - Chọn **chỉ gửi giao dịch tiền vào** (nếu có tuỳ chọn)
3. Lưu lại. SePay thường có nút **Gửi thử** để kiểm tra.

---

## ✅ Kiểm tra hoạt động

1. Mở web (bản trên Vercel), chọn 1 món → màn thanh toán hiện banner xanh "Đang chờ thanh toán…".
2. Chuyển khoản thật **đúng số tiền** và **đúng nội dung** trên QR (vd `CT BOLUCLAC YKM8K`).
3. Sau vài giây trang **tự hiện công thức**. Xong!

### Cách thử mà KHÔNG cần chuyển tiền thật
Vào Supabase → SQL Editor, chạy lệnh giả lập 1 giao dịch (thay nội dung & số tiền cho khớp 1 đơn đang mở):
```sql
insert into public.sepay_transactions (amount, content, transfer_type)
values (25000, 'CT BOLUCLAC YKM8K', 'in');
```
Quay lại trang → vài giây sau tự mở khóa.

---

## 🛟 Nếu không tự mở được, kiểm tra theo thứ tự
1. Đã chạy `recipe_codes.sql` chưa? (Supabase → Table Editor → `recipe_codes` phải có dòng + đúng giá)
2. 3 biến môi trường trên Vercel đúng chưa? Đã **Redeploy** sau khi thêm chưa?
3. Webhook SePay có đúng URL + token không?
4. Sau khi CK, vào Supabase → bảng `sepay_transactions` có dòng mới không?
   - **Có dòng** mà không mở → sai giá/nội dung trong `recipe_codes`.
   - **Không có dòng** → webhook SePay chưa tới (kiểm tra URL/token/redeploy).
5. Cùng lắm: khách vẫn dùng được **ô nhập mã thủ công** như cũ.

> Bảo mật: `anon key` để lộ không sao. `service_role key` và `WEBHOOK_TOKEN` tuyệt đối chỉ nằm trên Vercel.
