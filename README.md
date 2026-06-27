# 🍲 Bếp Của Vợ — Web bán công thức nấu ăn (có khóa nội dung)

Trang web tĩnh: khách xem được danh sách món + giới thiệu, nhưng **công thức chi tiết
và video bị MÃ HÓA**. Khách chuyển khoản → nhận **mã mở khóa** → nhập mã → giải mã xem được.
Không cần server, hosting miễn phí trên Vercel.

## Các file
| File | Vai trò |
|------|---------|
| `index.html` | Trang khách xem & mua |
| `admin.html` | Trang quản trị (vợ thêm/sửa món, đặt giá, tạo mã) — **mật khẩu mặc định: `bep2026`** |
| `content.json` | Dữ liệu công khai (món + nội dung đã mã hóa). KHÔNG chứa mã mở khóa |
| `assets/crypto.js` | Mã hóa/giải mã AES-256 |
| `tools/gen-content.cjs` | Script tạo dữ liệu mẫu (đã chạy, có thể bỏ qua) |
| `api/sepay.js` | (Tự động) Hàm Vercel nhận tiền về từ SePay |
| `supabase-setup.sql` | (Tự động) SQL tạo cơ sở dữ liệu Supabase |
| `HUONG-DAN-TU-DONG.md` | (Tự động) Hướng dẫn bật tự động mở khóa qua SePay |

> **2 chế độ mở khóa:**
> - **Thủ công (mặc định):** khách CK → nhắn Zalo → vợ gửi mã → khách nhập mã. Miễn phí, chạy ngay.
> - **Tự động (tuỳ chọn):** khách CK là tự mở khóa, không cần gửi mã. Xem `HUONG-DAN-TU-DONG.md`.

## Bảo mật khóa nội dung hoạt động thế nào
- Công thức + video được **mã hóa AES-256-GCM** bằng "mã mở khóa", lưu dạng chữ vô nghĩa trong `content.json`.
- **Mã mở khóa KHÔNG nằm trong bất kỳ file nào** → ai xem mã nguồn cũng không đọc được nội dung.
- Nhập sai mã = giải mã thất bại. Nhập đúng = hiện công thức, và lưu vào trình duyệt để lần sau không phải nhập lại.
- ⚠️ Lưu ý: sau khi khách đã mở khóa, họ có thể chép lại nội dung/đường link video. Nên dùng **video YouTube "Không công khai" (Unlisted)** — không ai tìm thấy nếu không có link.

## Quy trình bán hàng
1. Khách chọn món → bấm **Mở khóa công thức**.
2. Quét **QR VietQR** (tự sinh đúng số tiền + nội dung CK) hoặc chuyển khoản thủ công.
3. Khách nhắn Zalo (kèm ảnh chuyển khoản) → vợ kiểm tra tiền về.
4. Vợ gửi **mã mở khóa** của món đó (xem trong file `BANG-MA-MO-KHOA.txt`).
5. Khách nhập mã → xem công thức + video.

## Cách thêm/sửa món (cho vợ)
1. Mở `admin.html`, đăng nhập (mật khẩu `bep2026` — **nên đổi** trong dòng `ADMIN_PW` ở cuối file `admin.html`).
2. Điền thông tin trang & thanh toán (1 lần): ngân hàng, số TK, chủ TK, Zalo.
3. Bấm **+ Thêm món** → nhập tên, giá, ảnh, giới thiệu, video, nguyên liệu, các bước, và **MÃ MỞ KHÓA**.
4. Bấm **💾 Tải content.json** và **🔑 Tải bảng mã**.
5. Kéo file `content.json` mới lên Vercel để cập nhật trang. Giữ riêng file bảng mã.

> Admin lưu bản nháp (gồm mã) ngay trong trình duyệt máy vợ — luôn sửa món trên cùng 1 máy/1 trình duyệt.

## Chạy thử trên máy
Mở bằng **localhost** (không mở trực tiếp file:// vì mã hóa cần môi trường an toàn):
```
python -m http.server 8765 --directory .
```
Rồi vào http://localhost:8765

## Đưa lên mạng (Vercel)
1. Vào https://vercel.com/new
2. Kéo-thả cả thư mục `BepCuaVo` vào → có link `...vercel.app` trong ~30 giây.
3. Mỗi lần đổi `content.json`, kéo-thả lại để cập nhật.

## Dữ liệu mẫu (mã demo để thử)
| Món | Mã |
|-----|-----|
| Phở Bò Hà Nội | `PHOBO2026` |
| Bò Lúc Lắc Khoai Tây | `BOLL2026` |
| Chè Khúc Bạch | `CHEKB2026` |
