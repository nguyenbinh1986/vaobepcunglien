-- =====================================================================
--  BẾP CỦA VỢ — Cài đặt Supabase cho TỰ ĐỘNG MỞ KHÓA qua SePay
--  Cách dùng: mở Supabase → SQL Editor → dán toàn bộ file này → Run.
-- =====================================================================

-- 1) Bảng lưu giao dịch SePay gửi về (qua hàm /api/sepay trên Vercel)
create table if not exists public.sepay_transactions (
  id              bigserial primary key,
  sepay_id        bigint,
  gateway         text,
  transaction_date text,
  account_number  text,
  sub_account     text,
  amount          numeric,
  content         text,
  transfer_type   text,
  reference_code  text,
  raw             jsonb,
  created_at      timestamptz default now()
);

-- 2) Bảng mã mở khóa của từng món (BÍ MẬT — khách KHÔNG đọc được)
create table if not exists public.recipe_codes (
  recipe_id   text primary key,
  unlock_code text not null,
  price       numeric not null default 0
);

-- 3) Bật RLS (Row Level Security) — mặc định chặn hết, không ai đọc trực tiếp
alter table public.sepay_transactions enable row level security;
alter table public.recipe_codes       enable row level security;
-- (Cố tình KHÔNG tạo policy SELECT cho 'anon' => khách không xem được 2 bảng này.
--  Hàm /api/sepay dùng service_role key nên vẫn ghi được, bỏ qua RLS.)

-- 4) Hàm kiểm tra "đã trả tiền chưa?" và trả về mã mở khóa.
--    SECURITY DEFINER => hàm tự đọc 2 bảng bí mật, nhưng chỉ trả 'mã'
--    khi thực sự có giao dịch khớp nội dung + đủ số tiền.
create or replace function public.get_unlock_code(p_recipe text, p_order text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code  text;
  v_price numeric;
begin
  select unlock_code, price into v_code, v_price
  from recipe_codes where recipe_id = p_recipe;

  if v_code is null then
    return null;                       -- chưa khai báo mã cho món này
  end if;

  if exists (
    select 1 from sepay_transactions
    where upper(replace(coalesce(content,''), ' ', ''))
          like '%' || upper(replace(coalesce(p_order,''), ' ', '')) || '%'
      and amount >= v_price
      and coalesce(transfer_type, 'in') = 'in'
  ) then
    return v_code;                     -- ĐÃ trả tiền → trả mã để giải mã
  end if;

  return null;                         -- chưa thấy tiền về
end;
$$;

-- 5) Cho phép khách (anon) GỌI hàm này (nhưng vẫn không đọc được bảng gốc)
grant execute on function public.get_unlock_code(text, text) to anon;

-- Xong! Tiếp theo: nạp mã mở khóa bằng file recipe_codes.sql (xuất từ trang Admin).
