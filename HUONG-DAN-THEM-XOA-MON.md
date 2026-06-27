# 📝 Hướng dẫn THÊM / XÓA / SỬA món (cho vợ)

Trang quản trị: **https://vaobepcunglien.vercel.app/admin.html** — mật khẩu: `bep2026`

> Mỗi thay đổi sẽ tải về tối đa 3 file. Hiểu nhanh 3 file để làm cho đúng:
> | File | Đưa đi đâu | Để làm gì |
> |---|---|---|
> | `content.json` | Lên **GitHub** | Cập nhật món hiển thị trên web |
> | `recipe_codes.sql` | Vào **Supabase** | Cập nhật mã + giá để tự mở khóa |
> | `BANG-MA-MO-KHOA.txt` | **Giữ riêng trong máy** | Mã dự phòng gửi tay khi cần |

Khi mở admin, nó **tự nạp sẵn các món đang có trên web** — cứ sửa thoải mái, không sợ mất món cũ.

---

## ➕ THÊM MÓN MỚI
1. Mở admin → đăng nhập → bấm **+ Thêm món**.
2. Điền: tên, nhóm, **giá**, ảnh (nếu có), giới thiệu ngắn, **link video**, nguyên liệu, các bước, mẹo.
3. Ở ô **🔑 MÃ MỞ KHÓA**: bấm **🎲 Tạo mã** (hoặc tự đặt). Bấm **Lưu món**.
4. Lên đầu trang bấm 3 nút: **💾 Tải content.json**, **🗄️ Tải recipe_codes.sql**, **🔑 Tải bảng mã**.
5. **Đưa lên web** (xem mục "CÁCH ĐƯA FILE LÊN" bên dưới).

## 🗑️ XÓA MÓN
1. Mở admin → bấm **🗑** ở món muốn xóa → xác nhận.
2. Bấm **💾 Tải content.json**.
3. Đưa `content.json` lên GitHub. (Xong — khách không thấy món đó nữa. Mã cũ trong Supabase để lại cũng không sao.)

## ✏️ SỬA GIÁ / TÊN / ẢNH (không đổi công thức)
1. Mở admin → bấm **✏️ Sửa** ở món → đổi giá/tên… → **để TRỐNG phần khóa** (video/nguyên liệu/bước/mã) → **Lưu món**.
2. Bấm **💾 Tải content.json** và **🗄️ Tải recipe_codes.sql**.
3. Đưa `content.json` lên GitHub **và** chạy `recipe_codes.sql` trong Supabase.
   > ⚠️ Đổi GIÁ thì BẮT BUỘC làm cả 2, nếu không tiền khách trả sẽ không khớp giá mới.

## 🔁 SỬA CÔNG THỨC / VIDEO của món cũ
1. **✏️ Sửa** → nhập lại nội dung mới + **đặt MÃ MỞ KHÓA mới** → Lưu.
2. Tải đủ 3 file → đưa lên web như mục dưới.

---

## 🚀 CÁCH ĐƯA FILE LÊN

### A) Đưa `content.json` lên GitHub (web tự cập nhật sau ~30 giây)
1. Vào https://github.com/nguyenbinh1986/vaobepcunglien
2. Bấm **Add file → Upload files**.
3. Kéo file `content.json` vừa tải vào (tên y hệt → sẽ ghi đè).
4. Bấm **Commit changes**. Xong — Vercel tự deploy lại.

### B) Chạy `recipe_codes.sql` trong Supabase (chỉ khi có file này)
1. Vào https://supabase.com → mở project → **SQL Editor → New query**.
2. Mở file `recipe_codes.sql`, copy hết, dán vào, bấm **Run**. Thấy "Success" là xong.

---

## ✅ Kiểm tra sau khi xong
- Mở web, thấy món mới/đổi đúng chưa.
- Chuyển khoản thử đúng số tiền + nội dung trên QR → tự mở khóa là OK.

> 💡 Mỗi lần làm chỉ nên ngồi **1 máy / 1 trình duyệt** quen thuộc để admin nhớ đúng dữ liệu.
> Bí chỗ nào cứ nhắn Bình (người dựng web) làm giúp.
