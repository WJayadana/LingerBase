# 🛠️ Sistem Dynamic Case

Salah satu fitur unik dari Linger Base adalah kemampuan untuk memodifikasi kode handler secara langsung melalui WhatsApp menggunakan sistem **Case**. Fitur ini sangat populer di komunitas bot WhatsApp Indonesia untuk kemudahan modifikasi cepat.

## Apa itu Case?
Case adalah potongan kode dalam pernyataan `switch-case` yang berada di dalam file `Linger.js`. Linger Base memiliki "marker" khusus yaitu `// [START CASES]` dan `// [END CASES]` sebagai tempat sistem ini bekerja.

## Cara Mengelola Case via WhatsApp

### 1. Menambah Case baru (`.addcase`)
Kirimkan potongan kode case yang lengkap. Pastikan memiliki struktur yang benar dengan kurung kurawal `{ }` dan `break;`.

**Contoh:**
```text
.addcase case "halo": {
  reply("Hai! Apa kabar?")
}
break;
```

### 2. Menghapus Case (`.delcase`)
Hapus case yang sudah ada hanya dengan menyebutkan namanya.

**Contoh:**
`.delcase halo`

### 3. Melihat Daftar Case (`.listcase`)
Melihat semua daftar command yang saat ini terdaftar di dalam sistem case `Linger.js`.

**Contoh:**
`.listcase`

### 4. Mengambil Kode Case (`.getcase`)
Melihat isi kode mentah dari suatu case tertentu. Sangat berguna jika Anda ingin menyalin atau mengedit ulang kode tersebut.

**Contoh:**
`.getcase halo`

---

## 🔄 Konversi Fitur
Linger Base juga menyediakan alat bantu untuk migrasi kode:
- **Case to Plugin**: Balas pesan kode case Anda dengan `.case2plugin` untuk mengubahnya menjadi struktur plugin CJS.
- **CJS to ESM**: Gunakan `.cjs2esm` untuk mengubah sintaks CommonJS menjadi ES Modules.
- **ESM to CJS**: Gunakan `.esm2cjs` untuk sebaliknya.

---

## ⚠️ Peringatan Penting
Sistem ini memodifikasi file `Linger.js` secara langsung secara terprogram.
1. **Sintaks Harus Benar**: Jika ada kesalahan pengetikan (misal lupa tanda `}`), bot mungkin akan crash atau gagal restart.
2. **Backup**: Selalu disarankan memiliki backup atau menggunakan sistem plugin untuk fitur yang lebih kompleks dan besar.
