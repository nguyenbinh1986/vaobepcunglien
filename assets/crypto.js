/*
 * RecipeCrypto — mã hóa / giải mã nội dung công thức bằng AES-GCM 256-bit.
 * Khóa được dẫn xuất từ "mã mở khóa" qua PBKDF2 (SHA-256, 100.000 vòng).
 * => Mã mở khóa KHÔNG bao giờ được lưu trong file. Sai mã = giải mã thất bại.
 *
 * Dùng được trên cả trình duyệt (window.crypto) lẫn Node (webcrypto).
 * LƯU Ý: crypto.subtle cần "secure context" => chạy trên https (Vercel)
 * hoặc http://localhost. Mở trực tiếp file:// có thể không chạy được.
 */
(function (root, factory) {
  const c =
    (typeof window !== "undefined" && window.crypto) ||
    (typeof globalThis !== "undefined" && globalThis.crypto);
  const api = factory(c);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.RecipeCrypto = api;
})(typeof self !== "undefined" ? self : this, function (crypto) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function buf2b64(buf) {
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoaSafe(bin);
  }
  function b642buf(b64) {
    const bin = atobSafe(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  // btoa/atob có sẵn trong trình duyệt; Node 16+ cũng có global btoa/atob.
  function btoaSafe(s) {
    if (typeof btoa === "function") return btoa(s);
    return Buffer.from(s, "binary").toString("base64");
  }
  function atobSafe(s) {
    if (typeof atob === "function") return atob(s);
    return Buffer.from(s, "base64").toString("binary");
  }

  async function deriveKey(code, salt) {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(code),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // Mã hóa 1 object bất kỳ -> { salt, iv, ct } (đều base64)
  async function encrypt(plainObj, code) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(code, salt);
    const data = enc.encode(JSON.stringify(plainObj));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
    return { salt: buf2b64(salt), iv: buf2b64(iv), ct: buf2b64(ct) };
  }

  // Giải mã -> object. Sai mã sẽ ném lỗi (do GCM auth tag).
  async function decrypt(blob, code) {
    const salt = b642buf(blob.salt);
    const iv = b642buf(blob.iv);
    const ct = b642buf(blob.ct);
    const key = await deriveKey(code, salt);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return JSON.parse(dec.decode(pt));
  }

  return { encrypt, decrypt };
});
