-- =====================================================================
--  BẾP CỦA VỢ — Nâng cấp v2: web đọc dữ liệu THẲNG từ database
--  => Admin sửa là web đổi ngay, không cần deploy lại.
--  Cách dùng: Supabase → SQL Editor → New query → dán hết → Run.
--  (An toàn chạy lại nhiều lần.)
-- =====================================================================

-- 1) recipes — thông tin CÔNG KHAI để hiển thị (khách đọc được)
create table if not exists public.recipes (
  id          text primary key,
  title       text,
  category    text,
  emoji       text,
  image       text,
  price       numeric default 0,
  time        text,
  difficulty  text,
  servings    text,
  teaser      text,
  sort        int default 0,
  created_at  timestamptz default now()
);

-- 2) recipe_secrets — NỘI DUNG KHÓA + mã (khách KHÔNG đọc được)
create table if not exists public.recipe_secrets (
  recipe_id   text primary key references public.recipes(id) on delete cascade,
  content     jsonb,        -- {video, ingredients[], steps[], tips}
  unlock_code text
);

-- 3) site_config — 1 dòng cấu hình trang + thanh toán (khách đọc được)
create table if not exists public.site_config (
  id    int primary key default 1,
  data  jsonb,
  constraint one_row check (id = 1)
);

-- 4) RLS: khách (anon) CHỈ đọc được recipes + site_config; KHÔNG đọc recipe_secrets
alter table public.recipes        enable row level security;
alter table public.recipe_secrets enable row level security;
alter table public.site_config    enable row level security;

drop policy if exists recipes_read on public.recipes;
create policy recipes_read on public.recipes for select to anon using (true);

drop policy if exists config_read on public.site_config;
create policy config_read on public.site_config for select to anon using (true);
-- recipe_secrets: KHÔNG có policy cho anon => bị chặn hoàn toàn.

-- 5) Hàm mở khóa: trả NỘI DUNG nếu (đã trả tiền) HOẶC (đúng mã thủ công)
create or replace function public.claim_recipe(p_recipe text, p_order text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_content jsonb;
  v_code    text;
  v_price   numeric;
begin
  select rs.content, rs.unlock_code, r.price
    into v_content, v_code, v_price
  from recipe_secrets rs
  join recipes r on r.id = rs.recipe_id
  where rs.recipe_id = p_recipe;

  if v_content is null then
    return null;
  end if;

  -- (a) đúng mã thủ công (vợ gửi tay)
  if coalesce(p_code,'') <> '' and upper(p_code) = upper(coalesce(v_code,'')) then
    return v_content;
  end if;

  -- (b) đã trả tiền: có giao dịch khớp nội dung CK + đủ số tiền
  if coalesce(p_order,'') <> '' and exists (
    select 1 from sepay_transactions
    where upper(replace(coalesce(content,''),' ','')) like '%'||upper(replace(p_order,' ',''))||'%'
      and amount >= v_price
      and coalesce(transfer_type,'in') = 'in'
  ) then
    return v_content;
  end if;

  return null;  -- chưa đủ điều kiện
end;
$$;
grant execute on function public.claim_recipe(text, text, text) to anon;

-- Xong! (Bảng cũ recipe_codes / hàm get_unlock_code không còn dùng, để lại cũng không sao.)
