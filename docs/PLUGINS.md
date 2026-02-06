# 🧩 Panduan Membuat Plugin

Linger Base mendukung dua jenis sistem plugin: **CommonJS (CJS)** dan **ES Modules (ESM)**. Penggunaan plugin sangat disarankan agar kode Anda tetap rapi dan mudah dikelola (Modular).

## 1. Plugin ES Modules (ESM) - Direkomendasikan
Plugin ESM menggunakan ekstensi `.mjs` dan disimpan di `src/plugins/esm/`. Sistem ini lebih modern dan mendukung fitur pengecekan izin otomatis.

### Struktur Dasar
```javascript
const handler = async (m, { Linger, text, args, reply, isOwn, isPrem, isGroup }) => {
    // Logika fitur Anda di sini
    await reply("Halo dari ESM Plugin!");
}

handler.command = ["test", "ping"]; // Daftar command (Array atau Regex)
handler.owner = false;   // Set true jika hanya untuk owner
handler.group = false;   // Set true jika hanya untuk di grup
handler.premium = false; // Set true jika hanya untuk user premium
handler.private = false; // Set true jika hanya untuk chat pribadi

export default handler;
```

---

## 2. Plugin CommonJS (CJS)
Plugin CJS menggunakan ekstensi `.js` dan disimpan di `src/plugins/cjs/`.

### Struktur Dasar
```javascript
const handler = async (m, { Linger, text, args, reply, isOwn, isPrem }) => {
    // Logika fitur Anda di sini
    await reply("Halo dari CJS Plugin!");
}

handler.command = ["testcjs"]; // Harus berupa array
module.exports = handler;
```

---

## 🛠️ Objek yang Tersedia dalam Handler

Setiap plugin menerima dua argumen utama:
1. `m`: Objek pesan yang sudah diserialisasi.
2. `Obj`: Objek bantuan yang berisi:
   - `Linger`: Koneksi utama Baileys (Socket).
   - `text`: Teks setelah command.
   - `args`: Array kata setelah command (split by space).
   - `isOwn`: Apakah pengirim adalah owner.
   - `isPrem`: Apakah pengirim adalah user premium.
   - `reply`: Fungsi pembantu untuk membalas pesan secara cepat.
   - `command`: Nama command yang sedang dijalankan.

---

## 💡 Tips
- Gunakan folder `src/plugins/esm/` untuk fitur baru karena loader-nya sudah dilengkapi pengecekan permission (`owner`, `group`, dll) secara otomatis.
- Perubahan pada file plugin akan langsung terdeteksi (Auto-Reload) tanpa harus merestart bot.
