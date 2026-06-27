// =====================================================================
//  /api/admin — Bộ xử lý cho trang quản trị (đọc/ghi database an toàn).
//  Admin gửi mật khẩu + hành động; hàm dùng service key (bí mật, server-side)
//  để thao tác Supabase. Mật khẩu KHÔNG nằm trong admin.html.
//
//  Cần thêm biến môi trường trên Vercel:
//    ADMIN_PASSWORD = mật khẩu quản trị (tự đặt)
//  (đã có sẵn: SUPABASE_URL, SUPABASE_SERVICE_KEY)
// =====================================================================
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password, action, payload } = req.body || {};

  // Kiểm tra biến môi trường đã nạp chưa (không lộ giá trị, chỉ true/false)
  if (action === "envcheck") {
    return res.json({
      has_admin_password: !!process.env.ADMIN_PASSWORD,
      has_supabase_url: !!process.env.SUPABASE_URL,
      has_service_key: !!process.env.SUPABASE_SERVICE_KEY
    });
  }

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Sai mật khẩu" });
  }

  const BASE = process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1";
  const KEY = process.env.SUPABASE_SERVICE_KEY;
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
  const upsertHeaders = (conflict) => ({ ...H, Prefer: "resolution=merge-duplicates,return=minimal" });

  try {
    if (action === "load") {
      const [recipes, secrets, config] = await Promise.all([
        fetch(`${BASE}/recipes?select=*&order=sort.asc,created_at.asc`, { headers: H }).then(r => r.json()),
        fetch(`${BASE}/recipe_secrets?select=*`, { headers: H }).then(r => r.json()),
        fetch(`${BASE}/site_config?id=eq.1&select=data`, { headers: H }).then(r => r.json())
      ]);
      return res.json({ recipes, secrets, config: (config[0] && config[0].data) || null });
    }

    if (action === "save_recipe") {
      const { recipe, secret } = payload;
      let r = await fetch(`${BASE}/recipes?on_conflict=id`, {
        method: "POST", headers: upsertHeaders(), body: JSON.stringify(recipe)
      });
      if (!r.ok) return res.status(500).json({ error: "recipes: " + (await r.text()) });
      r = await fetch(`${BASE}/recipe_secrets?on_conflict=recipe_id`, {
        method: "POST", headers: upsertHeaders(),
        body: JSON.stringify({ recipe_id: recipe.id, content: secret.content, unlock_code: secret.unlock_code })
      });
      if (!r.ok) return res.status(500).json({ error: "secrets: " + (await r.text()) });
      return res.json({ success: true });
    }

    if (action === "delete_recipe") {
      const id = encodeURIComponent(payload.id);
      const r = await fetch(`${BASE}/recipes?id=eq.${id}`, { method: "DELETE", headers: { ...H, Prefer: "return=minimal" } });
      if (!r.ok) return res.status(500).json({ error: await r.text() });
      return res.json({ success: true }); // recipe_secrets tự xóa theo (cascade)
    }

    if (action === "save_config") {
      const r = await fetch(`${BASE}/site_config?on_conflict=id`, {
        method: "POST", headers: upsertHeaders(), body: JSON.stringify({ id: 1, data: payload })
      });
      if (!r.ok) return res.status(500).json({ error: await r.text() });
      return res.json({ success: true });
    }

    return res.status(400).json({ error: "Hành động không hợp lệ" });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
