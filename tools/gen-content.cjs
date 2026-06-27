/*
 * Sinh content.json mẫu với 3 món đã được MÃ HÓA bằng mã mở khóa demo.
 * Chạy:  node tools/gen-content.cjs
 * Mã demo sẽ in ra màn hình để bạn thử mở khóa trên trang.
 */
const fs = require("fs");
const path = require("path");
const RecipeCrypto = require("../assets/crypto.js");

const site = {
  brand: "Bếp Của Vợ",
  logo_emoji: "🍲",
  hero_eyebrow: "👩‍🍳 Công thức chuẩn vị, dễ làm tại nhà",
  hero_title: 'Nấu ăn ngon mỗi ngày với <span class="hl">công thức chuẩn vị</span>',
  hero_subtitle: "Mỗi món một video hướng dẫn chi tiết từng bước — làm là thành công, ngon như nhà hàng.",
  accent_color: "#e8542f",
  email: "bepcuavo@email.com",
  about: "Chia sẻ những công thức nấu ăn ngon, dễ làm cho gia đình Việt."
};

const payment = {
  bank_code: "970436",            // Vietcombank (VietQR BIN)
  bank_name: "Vietcombank",
  account_number: "1234567890",
  account_holder: "NGUYEN VAN A",
  zalo: "0900000000",
  zalo_link: "",
  note: "Sau khi chuyển khoản đúng nội dung, vui lòng nhắn Zalo (kèm ảnh chuyển khoản) để nhận MÃ MỞ KHÓA trong vài phút.",
  qr_image: ""
};

// [recipe-meta, mã-mở-khóa, nội-dung-bị-khóa]
const samples = [
  [
    { id: "pho-bo", title: "Phở Bò Hà Nội", category: "Món nước", emoji: "🍜",
      price: 30000, time: "3 giờ", difficulty: "Trung bình", servings: "4 người",
      teaser: "Nước dùng trong veo, ngọt từ xương, thơm nồng quế hồi — chuẩn vị phở Bắc gia truyền." },
    "PHOBO2026",
    { video: "https://youtu.be/2Qw3Kx9w8aE",
      ingredients: ["1.5kg xương ống bò", "500g thịt bắp bò", "1 củ hành tây", "1 nhánh gừng",
        "Quế, hồi, thảo quả, đinh hương", "Bánh phở, hành lá, rau thơm", "Gia vị: muối, nước mắm, đường phèn"],
      steps: ["Chần xương qua nước sôi 3 phút rồi rửa sạch.",
        "Nướng hành tây và gừng cho thơm, cạo vỏ cháy.",
        "Rang thơm quế hồi thảo quả, bọc vào túi vải.",
        "Ninh xương với 4 lít nước trong 2.5–3 tiếng, hớt bọt thường xuyên.",
        "Nêm nước mắm, muối, đường phèn cho vừa miệng.",
        "Trụng bánh phở, xếp thịt, chan nước dùng nóng, thêm hành rau."],
      tips: "Đường phèn giúp nước ngọt thanh hơn đường cát. Hớt bọt kỹ để nước trong." }
  ],
  [
    { id: "bo-luc-lac", title: "Bò Lúc Lắc Khoai Tây", category: "Món xào", emoji: "🥩",
      price: 25000, time: "30 phút", difficulty: "Dễ", servings: "3 người",
      teaser: "Thịt bò mềm mọng, áp chảo lửa lớn giữ trọn nước ngọt, ăn kèm khoai tây vàng giòn." },
    "BOLL2026",
    { video: "https://youtu.be/lWA2pjMjpBs",
      ingredients: ["400g thăn bò", "2 củ khoai tây", "1 củ hành tây", "Tỏi, ớt chuông",
        "Dầu hào, nước tương, đường, tiêu"],
      steps: ["Thái bò quân cờ, ướp dầu hào + nước tương + tỏi 15 phút.",
        "Khoai tây cắt khối, chiên vàng giòn.",
        "Áp chảo bò lửa to mỗi mặt 1 phút, không xào lâu.",
        "Cho hành tây, ớt chuông đảo nhanh, nêm lại.",
        "Trút khoai tây vào, lắc đều, rắc tiêu, tắt bếp."],
      tips: "Chảo phải thật nóng trước khi cho bò để thịt không ra nước, giữ độ mềm." }
  ],
  [
    { id: "che-khuc-bach", title: "Chè Khúc Bạch", category: "Tráng miệng", emoji: "🍮",
      price: 20000, time: "45 phút", difficulty: "Dễ", servings: "4 người",
      teaser: "Khối khúc bạch mềm mịn tan trong miệng, nước đường hạnh nhân thanh mát ngày hè." },
    "CHEKB2026",
    { video: "https://youtu.be/dQw4w9WgXcQ",
      ingredients: ["250ml kem tươi", "250ml sữa tươi", "15g gelatin", "Đường, hạnh nhân lát",
        "Nhãn hoặc vải, hạnh nhân tinh chất"],
      steps: ["Ngâm gelatin trong nước lạnh 10 phút.",
        "Đun ấm kem + sữa + đường (không sôi), cho gelatin khuấy tan.",
        "Đổ khuôn, để nguội rồi cho tủ lạnh 4 tiếng.",
        "Nấu nước đường loãng, thêm vài giọt hạnh nhân.",
        "Cắt khúc bạch, thêm nhãn, rắc hạnh nhân rang, chan nước đường đá."],
      tips: "Đừng đun sữa sôi sẽ làm gelatin mất tác dụng đông." }
  ]
];

(async () => {
  const recipes = [];
  const codeTable = [];
  for (const [meta, code, plain] of samples) {
    const locked = await RecipeCrypto.encrypt(plain, code);
    recipes.push({ ...meta, locked });
    codeTable.push(`  ${meta.title.padEnd(24)} → mã: ${code}`);
  }
  const auto = {
    enabled: true,
    supabase_url: "https://gozrtreliolqpnallhye.supabase.co",
    supabase_anon_key: "sb_publishable_85YdL8vEQbVyNS13Scb0Jw_dR-AFW7m"
  };
  const out = { site, payment, auto, recipes };
  const file = path.join(__dirname, "..", "content.json");
  fs.writeFileSync(file, JSON.stringify(out, null, 2), "utf8");
  console.log("✓ Đã tạo content.json với", recipes.length, "món.\n");
  console.log("MÃ MỞ KHÓA DEMO (để thử trên trang):");
  console.log(codeTable.join("\n"));
})();
