# Build APK Android - Game Arcade Hub

Dokumen ini berisi cara mengubah project web **Game Arcade Hub** menjadi **APK Android
release** hanya dengan **klik satu file**.

---

## 1. Yang terjadi saat kamu klik `BUILD-APK.bat`

Semua otomatis, berurutan:

| Step | Yang dilakukan | Output |
|------|-----------------|--------|
| 1 | Cek Node.js & npm | - |
| 2 | `npm install` (hanya kalau dependensi belum ada) | `node_modules/` |
| 3 | `vite build` - compile React + assets jadi web statis | `dist/` |
| 4 | `npx cap sync android` - salin `dist/` ke project Android | `android/app/src/main/assets/public/` |
| 5 | Cari Java (JDK), Android SDK, buat/deteksi signing key | `android/local.properties`, `android/keystore.properties` |
| 6 | `gradlew assembleRelease` - build APK & tanda tangani | `android/app/build/outputs/apk/release/app-release.apk` |

Hasil akhir disalin ke:

```
release/GameArcadeHub-v1.0.0-release.apk
```

Kalau HP sudah tersambung USB, script menawarkan **install langsung ke HP**.
Kalau Android Studio terinstall, script menawarkan **membuka project di Android Studio**.

---

## 2. Yang perlu disiapkan (sekali saja)

1. **Node.js LTS** - https://nodejs.org (pilih versi LTS, install, restart PC)
2. **Android Studio** - https://developer.android.com/studio
   Android Studio sudah membawa JDK 21 + Android SDK Manager.
3. **Android SDK** (buka Android Studio -> menu `Tools` -> `SDK Manager`, centang):
   - `Android SDK Platform 36`
   - `Android SDK Build-Tools 36`
   - `Android SDK Platform-Tools`
   - Klik **Apply** lalu **OK** dan setuju lisensinya.
4. **Internet** - hanya untuk build pertama (download Gradle 8.14 + library Android).
   Setelah itu bisa offline.

> Kalau `Android Studio` sudah terinstall, langkah 1 & 3 biasanya sudah beres.

---

## 3. Cara pakai

```
Klik 2x  BUILD-APK.bat        ->  APK release (untuk install & upload Play Store)
Klik 2x  build.bat            ->  sama saja (alias)
Klik 2x  build.bat debug      ->  APK debug (cepet, buat testing)
```

Command line:

```bat
BUILD-APK.bat release
BUILD-APK.bat debug
```

---

## 4. Output & installing ke HP

```
release/GameArcadeHub-v1.0.0-release.apk
```

**Cara install manual**
1. Copy file APK ke HP (kabel USB / WhatsApp / Google Drive).
2. Buka file APK di HP -> izinkan "Install unknown apps" -> Install.

**Cara install dari PC (adb)**
```bat
adb install -r release\GameArcadeHub-v1.0.0-release.apk
```

> Installer_release_from_play_store menandai "untrusted source"? Tidak masalah - file
> tetap bisa dipasang, hanya Play Protect yang bisa nanya "install unknown apps?".

---

## 5. Signing key (penting!)

Saat build release pertama, script otomatis membuat **keystore** di:

```
android/game-arcade-hub-release.keystore
android/keystore.properties      <- berisi password
```

`keystore.properties` dibaca oleh `android/app/build.gradle` untuk menandatangani APK.

**WAJIB backup dua file ini** (simpan di tempat aman / cloud):
- `android/game-arcade-hub-release.keystore`
- `android/keystore.properties`

Kalau hilang, kamu **tidak bisa** upload update baru ke Google Play dengan akun yang sama
(hanya bisa reset app di Play Console). Script otomatis membuat key baru kalau file
keystore hilang, tapi key itu **beda** dari yang lama.

Kalau punya keystore sendiri, ganti isi `android/keystore.properties`:

```properties
storeFile=nama-file-keystore.jks
storePassword=password-keystore
keyAlias=alias-keystore
keyPassword=password-key
```

> Password `storePassword` & `keyPassword` bisa sama. Alias = `gamearcadehub` untuk key
> bawaan script.

---

## 6. Upload ke Google Play

Google Play butuh file **`.aab`** (Android App Bundle), bukan APK. Untuk itu:

```bat
cd android
gradlew.bat bundleRelease
```

Hasilnya: `android/app/build/outputs/bundle/release/app-release.aab`

Upload di https://play.google.com/console -> `Create app` -> `Release` -> `Production` ->
upload `.aab`.

Checklist sebelum upload:

- [ ] `android/app/build.gradle` -> `versionCode` naik (1 -> 2, 3, ...) setiap rilis
- [ ] `versionName` naik (1.0.0 -> 1.0.1, 1.1.0, ...)
- [ ] Ikon & splash sudah sesuai (`assets/app-icon.png` -> `tools/make-android-assets.sh`)
- [ ] `android/app/src/main/res/values/strings.xml` -> `app_name` = "Game Arcade Hub"
- [ ] Package name `com.gamearcade.hub` sudah final (nanti tidak bisa diganti)

---

## 7. Struktur folder

```
.
├── BUILD-APK.bat            <-- KLIK INI untuk build APK
├── build.bat                <-- alias
├── OPEN-ANDROID-STUDIO.bat  <-- buka project di Android Studio
├── CLEAN-BUILD.bat          <-- bersihkan hasil build
├── BUILD-APK.md             <-- dokumen ini
├── capacitor.config.ts      <-- konfigurasi Capacitor (appId, nama, webDir)
├── assets/app-icon.png      <-- sumber ikon launcher (1024x1024)
├── tools/make-android-assets.sh  <-- regenerate ikon & splash dari app-icon.png
├── src/                     <-- source code web game (React + Vite)
├── public/                  <-- assets statis (gambar bos, dll)
├── release/                 <-- HASIL APK (dibuat otomatis)
└── android/                 <-- project Android Studio (Capacitor)
    ├── app/build.gradle     <-- signing config + versionCode/versionName
    ├── keystore.properties  <-- (otomatis dibuat, jangan di-commit)
    └── gradlew.bat          <-- wrapper Gradle
```

---

## 8. Update aplikasi (rilis berikutnya)

1. Ubah kode game di `src/`.
2. (Opsional) naikkan `versionCode` & `versionName` di `android/app/build.gradle`.
3. Klik lagi `BUILD-APK.bat`.
4. APK baru ada di `release/`, signature sama -> bisa install di atas APK lama.

Untuk development di browser tanpa build APK:

```bat
npm install
npm run dev        ->  http://localhost:3000
```

---

## 9. Troubleshooting

| Error | Penyebab & solusi |
|-------|------------------|
| `Node.js belum terinstall` | Install Node.js LTS, restart PC, klik ulang |
| `npm install gagal` | Cek internet / proxy |
| `Java (JDK 17+) tidak ditemukan` | Install Android Studio (JDK bawaan) atau set `JAVA_HOME` |
| `Android SDK tidak ditemukan` | Buka SDK Manager di Android Studio, install Platform 36 + Build-Tools 36 |
| `SDK location not found` | Buka SDK Manager -> accept license, atau set `ANDROID_HOME` |
| `Failed to install the following SDK components` | Gradle butuh internet untuk download SDK 36, jalankan ulang dengan internet |
| `OutOfMemoryError` / build kehabisan memori | Tutup aplikasi lain, atau naikkan `org.gradle.jvmargs` di `android/gradle.properties` |
| `Execution failed for task ':app:processReleaseResources'` | обычно `compileSdk` kurang tinggi -> update Android Studio ke versi terbaru |
| Build sukses tapi app crash saat dibuka | Check `adb logcat` |

Semua error di atas ditampilkan lengkap di jendela build, termasuk pesan aslinya dari
Gradle. Jalankan ulang `BUILD-APK.bat` setelah masalahnya diperbaiki.

---

## 10. Regenerate ikon & splash screen

Kalau mau ganti ikon aplikasi:

1. Ganti `assets/app-icon.png` (1024x1024, PNG, background polos).
2. Jalankan (butuh ImageMagick, atauInstall `magick` di Windows):

```bash
bash tools/make-android-assets.sh assets/app-icon.png android/app/src/main/res
```

3. Klik ulang `BUILD-APK.bat`.
