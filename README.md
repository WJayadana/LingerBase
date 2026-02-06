# 🌟 Linger Base Multi-Device

[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com/WJayadana/LingerBase)
[![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-red.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Bun](https://img.shields.io/badge/runtime-Bun-black?logo=bun)](https://bun.sh)

**Linger Base** adalah base bot WhatsApp multi-device yang dirancang khusus untuk pemula. Dibuat dengan struktur yang sangat rapi dan kode yang mudah dipahami, base ini sangat cocok bagi Anda yang baru ingin belajar mengembangkan bot WhatsApp sendiri menggunakan [Baileys](https://github.com/WhiskeySockets/Baileys).

<!-- <p align="center">
  <img src="https://raw.githubusercontent.com/WJayadana/WJayadana/refs/heads/main/Thumbnail.png" alt="Linger Base Banner" width="600">
</p> -->

---

## ✨ Fitur Unggulan

- 🚀 **Dual Plugin System**: Mendukung plugin berbasis **CommonJS (CJS)** dan **ES Modules (ESM)** secara bersamaan.
- 🛠️ **Dynamic Case System**: Tambah, hapus, atau lihat command `switch-case` langsung dari chat WhatsApp tanpa perlu edit file manual.
- 📱 **Pairing Code Support**: Koneksi ke WhatsApp tanpa perlu scan QR, cukup gunakan nomor telepon.
- ⚡ **Optimized with Bun**: Menggunakan runtime Bun untuk performa yang lebih cepat dan efisien, meskipun kode tetap kompatibel dengan Node.js.
- 📦 **Simple & Clean Code**: Struktur folder yang tertata memudahkan pemula untuk navigasi dan modifikasi.
- 🎨 **Built-in Utilities**: Berbagai fungsi pembantu untuk media, AI, downloaders, dan banyak lagi.

---

## 📁 Struktur Folder

```text
├── database/           # Penyimpanan data (JSON) seperti data owner & premium
├── src/
│   ├── core/           # Inti logika pesan (serialization) dan logger
│   ├── lib/            # Library pembantu, handler plugin, dan sistem case
│   └── plugins/        # Tempat menyimpan plugin baru (Modular)
│       ├── cjs/        # Plugin berbasis CommonJS (.js)
│       └── esm/        # Plugin berbasis ES Modules (.mjs)
├── config.js           # Konfigurasi utama bot (Owner, prefix, thumbnail, dll)
├── Linger.js           # Handler pesan utama & tempat sistem case berada
├── index.js            # Titik awal aplikasi & logika koneksi ke WhatsApp
└── package.json        # Informasi project, versi, dan dependensi
```

---

## 🚀 Instalasi

Pastikan Anda sudah menginstal [Bun](https://bun.sh) di perangkat Anda untuk performa terbaik.

1. **Clone Repository**
   ```bash
   git clone https://github.com/WJayadana/LingerBase.git
   cd LingerBase
   ```

2. **Instal Dependensi**
   ```bash
   bun install
   ```

3. **Konfigurasi**
   Buka file `config.js` dan sesuaikan pengaturan:
   - `owner`: Isi dengan nomor WhatsApp Anda (contoh: `628xxx`).
   - `name`: Nama bot Anda.
   - `prefa`: Prefix untuk command.

4. **Jalankan Bot**
   ```bash
   bun start
   ```

5. **Hubungkan**
   Masukkan nomor telepon bot (format internasional, contoh: `628xxx`) di terminal saat diminta untuk mendapatkan **Pairing Code**. Masukkan kode tersebut di aplikasi WhatsApp Anda (Perangkat Tertaut > Tautkan Perangkat > Tautkan dengan nomor telepon).

---

## 📖 Dokumentasi Lanjutan

Untuk memahami lebih dalam tentang cara mengembangkan bot ini, silakan baca dokumentasi berikut:

- [🧩 Panduan Membuat Plugin (CJS/ESM)](docs/PLUGINS.md)
- [🛠️ Penjelasan Sistem Dynamic Case](docs/CASES.md)

---

## 🛠️ Cara Menambah Fitur

### 1. Menggunakan Plugins (Direkomendasikan)
Cukup buat file baru di folder `src/plugins/esm/` untuk fitur yang lebih modern.

Contoh Plugin ESM (`src/plugins/esm/hello.mjs`):
```javascript
const handler = async (m, { reply }) => {
    await reply("Halo! Saya adalah Linger Bot.");
}
handler.command = ["hello"]; // Command yang akan merespon
export default handler;
```

### 2. Menggunakan Case
Gunakan command `.addcase` langsung dari chat WhatsApp (Khusus Owner).
Contoh:
```text
.addcase case "info": {
  reply("Base ini dibuat oleh Jayadana");
}
break;
```

---

## 🤝 Kontribusi & Media Sosial

Jika Anda ingin berkontribusi atau memiliki pertanyaan, silakan hubungi:

- **GitHub**: [WJayadana](https://github.com/WJayadana)
- **Instagram**: [@w.jayadana](https://www.instagram.com/w.jayadana)

---

## 📜 Lisensi

Project ini dilisensikan di bawah **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

**Ketentuan:**
- **Atribusi**: Wajib mencantumkan nama pembuat aslinya (**Jayadana**).
- **Non-Komersial**: Tidak diperbolehkan untuk tujuan komersial atau diperjualbelikan tanpa izin.

---

<p align="center">Dibuat dengan ❤️ untuk komunitas bot WhatsApp Indonesia.</p>
