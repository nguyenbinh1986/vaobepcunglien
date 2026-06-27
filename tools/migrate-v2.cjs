/*
 * Chuyển dữ liệu sang mô hình database (v2): recipes + recipe_secrets + site_config.
 * Chạy SAU khi đã chạy supabase-setup-v2.sql trong Supabase.
 *
 * Đặt biến môi trường khi chạy:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 * Ví dụ (Git Bash):
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=sb_secret_... node tools/migrate-v2.cjs
 */
const fs = require("fs");
const path = require("path");

const URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_KEY || "";
if (!URL || !KEY) { console.error("Thiếu SUPABASE_URL / SUPABASE_SERVICE_KEY"); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

// Lấy site + payment từ content.json hiện tại
const content = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content.json"), "utf8"));

// 3 món demo: [public fields, content, unlock_code]
const recipes = [
  [
    { id:"pho-bo", title:"Phở Bò Hà Nội", category:"Món nước", emoji:"🍜", image:"", price:30000,
      time:"3 giờ", difficulty:"Trung bình", servings:"4 người", sort:1,
      teaser:"Nước dùng trong veo, ngọt từ xương, thơm nồng quế hồi — chuẩn vị phở Bắc gia truyền." },
    { video:"https://youtu.be/2Qw3Kx9w8aE",
      ingredients:["1.5kg xương ống bò","500g thịt bắp bò","1 củ hành tây","1 nhánh gừng","Quế, hồi, thảo quả, đinh hương","Bánh phở, hành lá, rau thơm","Gia vị: muối, nước mắm, đường phèn"],
      steps:["Chần xương qua nước sôi 3 phút rồi rửa sạch.","Nướng hành tây và gừng cho thơm, cạo vỏ cháy.","Rang thơm quế hồi thảo quả, bọc vào túi vải.","Ninh xương với 4 lít nước trong 2.5–3 tiếng, hớt bọt thường xuyên.","Nêm nước mắm, muối, đường phèn cho vừa miệng.","Trụng bánh phở, xếp thịt, chan nước dùng nóng, thêm hành rau."],
      tips:"Đường phèn giúp nước ngọt thanh hơn đường cát. Hớt bọt kỹ để nước trong." },
    "PHOBO2026"
  ],
  [
    { id:"bo-luc-lac", title:"Bò Lúc Lắc Khoai Tây", category:"Món xào", emoji:"🥩", image:"", price:25000,
      time:"30 phút", difficulty:"Dễ", servings:"3 người", sort:2,
      teaser:"Thịt bò mềm mọng, áp chảo lửa lớn giữ trọn nước ngọt, ăn kèm khoai tây vàng giòn." },
    { video:"https://youtu.be/lWA2pjMjpBs",
      ingredients:["400g thăn bò","2 củ khoai tây","1 củ hành tây","Tỏi, ớt chuông","Dầu hào, nước tương, đường, tiêu"],
      steps:["Thái bò quân cờ, ướp dầu hào + nước tương + tỏi 15 phút.","Khoai tây cắt khối, chiên vàng giòn.","Áp chảo bò lửa to mỗi mặt 1 phút, không xào lâu.","Cho hành tây, ớt chuông đảo nhanh, nêm lại.","Trút khoai tây vào, lắc đều, rắc tiêu, tắt bếp."],
      tips:"Chảo phải thật nóng trước khi cho bò để thịt không ra nước, giữ độ mềm." },
    "BOLL2026"
  ],
  [
    { id:"che-khuc-bach", title:"Chè Khúc Bạch", category:"Tráng miệng", emoji:"🍮", image:"", price:20000,
      time:"45 phút", difficulty:"Dễ", servings:"4 người", sort:3,
      teaser:"Khối khúc bạch mềm mịn tan trong miệng, nước đường hạnh nhân thanh mát ngày hè." },
    { video:"https://youtu.be/dQw4w9WgXcQ",
      ingredients:["250ml kem tươi","250ml sữa tươi","15g gelatin","Đường, hạnh nhân lát","Nhãn hoặc vải, hạnh nhân tinh chất"],
      steps:["Ngâm gelatin trong nước lạnh 10 phút.","Đun ấm kem + sữa + đường (không sôi), cho gelatin khuấy tan.","Đổ khuôn, để nguội rồi cho tủ lạnh 4 tiếng.","Nấu nước đường loãng, thêm vài giọt hạnh nhân.","Cắt khúc bạch, thêm nhãn, rắc hạnh nhân rang, chan nước đường đá."],
      tips:"Đừng đun sữa sôi sẽ làm gelatin mất tác dụng đông." },
    "CHEKB2026"
  ]
];

async function up(table, body, conflict) {
  const r = await fetch(`${URL}/rest/v1/${table}?on_conflict=${conflict}`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`${table}: ${r.status} ${await r.text()}`);
}

(async () => {
  for (const [pub, c, code] of recipes) {
    await up("recipes", pub, "id");
    await up("recipe_secrets", { recipe_id: pub.id, content: c, unlock_code: code }, "recipe_id");
    console.log("✓", pub.title);
  }
  await up("site_config", { id: 1, data: { site: content.site, payment: content.payment } }, "id");
  console.log("✓ site_config");
  console.log("\nHoàn tất! Database v2 đã sẵn sàng.");
})().catch(e => { console.error("LỖI:", e.message); process.exit(1); });
