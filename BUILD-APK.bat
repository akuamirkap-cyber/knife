@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul 2>&1
title BUILD APK - Game Arcade Hub
cd /d "%~dp0"

rem ==============================================================
rem  BUILD-APK.bat - build web app -> sync -> sign -> APK
rem  Pakai:  BUILD-APK.bat            (release, default)
rem         BUILD-APK.bat debug      (apk debug / lebih cepat)
rem         BUILD-APK.bat release    (apk release, default)
rem ==============================================================

set "APPNAME=Game Arcade Hub"
set "BUILD_TYPE=release"
set "PROJECT_DIR=%~dp0"
set "ANDROID_DIR=%~dp0android"
set "RELEASE_DIR=%~dp0release"

if /i "%~1"=="debug" set "BUILD_TYPE=debug"
if /i "%~1"=="release" set "BUILD_TYPE=release"
if "!BUILD_TYPE!"=="debug" (set "GRADLE_TASK=assembleDebug") else (set "GRADLE_TASK=assembleRelease")

echo.
echo  ==============================================================
echo    %APPNAME%   -   BUILD APK %BUILD_TYPE%
echo  ==============================================================
echo.

rem --------------------------------------------------------------
rem  STEP 1 - Node.js
rem --------------------------------------------------------------
echo  [1/6] Mengecek Node.js ...
where node >nul 2>&1
if errorlevel 1 goto :no_node
where npm >nul 2>&1
if errorlevel 1 goto :no_node
for /f "tokens=*" %%v in ('node -v') do set "NODE_VERSION=%%v"
for /f "tokens=*" %%v in ('npm -v') do set "NPM_VERSION=%%v"
echo          Node.js !NODE_VERSION! - npm !NPM_VERSION! - OK
echo.

rem --------------------------------------------------------------
rem  STEP 2 - dependencies
rem --------------------------------------------------------------
echo  [2/6] Memasang dependensi (npm install) ...
set "NEED_INSTALL=0"
if not exist "node_modules\@capacitor\cli\package.json" set "NEED_INSTALL=1"
if not exist "node_modules\@capacitor\android\package.json" set "NEED_INSTALL=1"
if "!NEED_INSTALL!"=="1" (
    call npm install --no-audit --no-fund
    if errorlevel 1 goto :fail_npm
) else (
    echo          Dependensi sudah ada - dilewati.
)
echo.

rem --------------------------------------------------------------
rem  STEP 3 - build web assets
rem --------------------------------------------------------------
echo  [3/6] Build web app (vite build) ...
call npm run build
if errorlevel 1 goto :fail_web
if not exist "dist\index.html" goto :fail_web
echo          Folder dist/ siap.
echo.

rem --------------------------------------------------------------
rem  STEP 4 - sync ke project Android
rem --------------------------------------------------------------
echo  [4/6] Sinkronisasi ke project Android (cap sync) ...
call npx cap sync android
if errorlevel 1 goto :fail_sync
echo.

rem --------------------------------------------------------------
rem  STEP 5 - Java (JDK) + Android SDK + keystore
rem --------------------------------------------------------------
echo  [5/6] Menyiapkan Java, Android SDK, dan signing key ...
call :detect_java
if "!JAVA_OK!"=="0" goto :no_java
call :check_java_version
call :detect_sdk
call :ensure_keystore
echo.

rem --------------------------------------------------------------
rem  STEP 6 - gradle build
rem --------------------------------------------------------------
echo  [6/6] Build APK %BUILD_TYPE% (gradlew %GRADLE_TASK%) ...
echo          Build pertama bisa memakan waktu 5-15 menit (download Gradle + SDK).
pushd "%ANDROID_DIR%"
call gradlew.bat %GRADLE_TASK% --stacktrace
set "GRADLE_EXIT=%ERRORLEVEL%"
popd
if not "!GRADLE_EXIT!"=="0" goto :fail_gradle
echo.

rem --------------------------------------------------------------
rem  Collect APK
rem --------------------------------------------------------------
if "!BUILD_TYPE!"=="debug" (
    set "APK_SRC=%ANDROID_DIR%\app\build\outputs\apk\debug\app-debug.apk"
    set "APK_SUFFIX=debug"
) else (
    set "APK_SRC=%ANDROID_DIR%\app\build\outputs\apk\release\app-release.apk"
    set "APK_SUFFIX=release"
)
if not exist "!APK_SRC!" goto :fail_apk

for /f "tokens=2" %%v in ('findstr /c:"versionName " "%ANDROID_DIR%\app\build.gradle"') do set "APP_VERSION=%%~v"
if not defined APP_VERSION set "APP_VERSION=1.0.0"

if not exist "%RELEASE_DIR%" mkdir "%RELEASE_DIR%" >nul 2>&1
set "APK_OUT=%RELEASE_DIR%\GameArcadeHub-v%APP_VERSION%-%APK_SUFFIX%.apk"
copy /y "!APK_SRC!" "!APK_OUT!" >nul
if errorlevel 1 goto :fail_apk

for %%f in ("!APK_OUT!") do set "APK_SIZE=%%~zf"
set /a APK_MB=!APK_SIZE! / 1048576

echo.
echo  ==============================================================
echo    BUILD SELESAI
echo  ==============================================================
echo.
echo    APK  : "!APK_OUT!"
echo    Size : !APK_MB! MB
echo.
if "!BUILD_TYPE!"=="release" (
    echo    APK ini sudah signed dan bisa langsung di-install ke HP.
    echo    Untuk upload ke Google Play, simpan dulu file keystore
    echo    (android\game-arcade-hub-release.keystore) - jangan dihapus.
) else (
    echo    APK debug - untuk testing di HP.
)
echo.

rem --------------------------------------------------------------
rem  Offer: install to device via adb
rem --------------------------------------------------------------
call :detect_adb
if "!ADB_OK!"=="1" (
    echo  Perangkat USB terdeteksi. Pasang APK ke HP sekarang? [Y/n]
    set /p "ANSWER="
    if /i not "!ANSWER!"=="n" (
        "!ADB_EXE!" install -r "!APK_OUT!"
    )
    echo.
)

rem --------------------------------------------------------------
rem  Offer: open in Android Studio
rem --------------------------------------------------------------
call :detect_studio
if "!STUDIO_OK!"=="1" (
    echo  Buka project ini di Android Studio sekarang? [Y/n]
    set /p "ANSWER="
    if /i not "!ANSWER!"=="n" (
        start "" "!STUDIO_PATH!" "%ANDROID_DIR%"
        echo  Android Studio dibuka.
    )
) else (
    echo  Android Studio tidak terdeteksi di PC ini.
    echo  Project Android tetap bisa dibuka manual dari folder: "%ANDROID_DIR%"
)
echo.

echo  Selesai. Tekan tombol apa saja untuk menutup jendela ini.
pause >nul
endlocal
exit /b 0

rem ==============================================================
rem  Sub routines
rem ==============================================================

:detect_java
set "JAVA_OK=0"
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" (
        set "JAVA_OK=1"
        echo          JAVA_HOME  : %JAVA_HOME%
        goto :eof
    )
    echo          [PERINGATAN] JAVA_HOME tidak valid - diabaikan.
    set "JAVA_HOME="
)
for %%P in (
    "%LOCALAPPDATA%\Programs\Android Studio\jbr"
    "%ProgramFiles%\Android Studio\jbr"
    "%ProgramFiles(x86)%\Android Studio\jbr"
    "%LOCALAPPDATA%\JetBrains\Toolbox\apps\AndroidStudio\ch-0\jbr"
) do (
    if exist "%%~P\bin\java.exe" (
        set "JAVA_HOME=%%~P"
        set "JAVA_OK=1"
        echo          Java dari Android Studio JBR : %%~P
        goto :eof
    )
)
where java >nul 2>&1
if not errorlevel 1 (
    set "JAVA_OK=1"
    echo          Java ditemukan di PATH.
    goto :eof
)
goto :eof

:check_java_version
set "JAVA_VER="
if not defined JAVA_HOME goto :eof
for /f "tokens=3" %%v in ('"%JAVA_HOME%\bin\java.exe" -version 2^>^&1') do (
    if not defined JAVA_VER set "JAVA_VER=%%~v"
)
if not defined JAVA_VER goto :eof
echo          Java version : !JAVA_VER!
echo !JAVA_VER! | findstr /b /c:"1." >nul 2>&1
if not errorlevel 1 (
    echo          [PERINGATAN] Java ini terlalu lama. Butuh JDK 17 atau lebih baru.
    echo          Update Android Studio, atau set JAVA_HOME ke JDK 21.
)
goto :eof

:detect_sdk
set "SDK_DIR="
if defined ANDROID_HOME if exist "%ANDROID_HOME%\platforms" set "SDK_DIR=%ANDROID_HOME%"
if defined ANDROID_SDK_ROOT if exist "%ANDROID_SDK_ROOT%\platforms" set "SDK_DIR=%ANDROID_SDK_ROOT%"
if not defined SDK_DIR if exist "%LOCALAPPDATA%\Android\Sdk\platforms" set "SDK_DIR=%LOCALAPPDATA%\Android\Sdk"
if not defined SDK_DIR if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platforms" set "SDK_DIR=%USERPROFILE%\AppData\Local\Android\Sdk"
if not defined SDK_DIR if exist "%ProgramFiles%\Android\Sdk\platforms" set "SDK_DIR=%ProgramFiles%\Android\Sdk"

if not defined SDK_DIR (
    echo          [PERINGATAN] Android SDK tidak ditemukan.
    echo          Buka Android Studio - Tools - SDK Manager lalu install:
    echo            - Android SDK Platform 36
    echo            - Android SDK Build-Tools 36
    echo            - Android SDK Platform-Tools
    echo          Lihat BUILD-APK.md untuk panduan lengkap.
    goto :eof
)
echo          Android SDK : "!SDK_DIR!"
set "ANDROID_HOME=!SDK_DIR!"
set "ANDROID_SDK_ROOT=!SDK_DIR!"
rem  tulis android\local.properties (butuh escaping untuk path Windows)
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='!SDK_DIR!'; $e=$p.Replace('\','\\').Replace(':','\:'); Set-Content -LiteralPath '%ANDROID_DIR%\local.properties' -Value ('sdk.dir=' + $e) -Encoding ASCII" >nul 2>&1
goto :eof

:ensure_keystore
set "KS_FILE=%ANDROID_DIR%\game-arcade-hub-release.keystore"
set "KS_PROPS=%ANDROID_DIR%\keystore.properties"
if exist "%KS_PROPS%" (
    echo          Signing key : sudah ada, dipakai.
    goto :eof
)
set "KEYTOOL="
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\keytool.exe" set "KEYTOOL=%JAVA_HOME%\bin\keytool.exe"
if not defined KEYTOOL (
    for /f "delims=" %%k in ('where keytool 2^>nul') do (
        if not defined KEYTOOL set "KEYTOOL=%%k"
    )
)
if not defined KEYTOOL (
    echo          [PERINGATAN] keytool tidak ditemukan - APK release memakai debug key.
    goto :eof
)
if exist "%KS_FILE%" del /q "%KS_FILE%" >nul 2>&1
set "GENPASS="
for /f "usebackq delims=" %%p in (`powershell -NoProfile -Command "[guid]::NewGuid().ToString('N').Substring(0,16)"`) do set "GENPASS=%%p"
if not defined GENPASS set "GENPASS=gamearcadehub1234"
echo          Membuat signing key baru (dipakai untuk semua build berikutnya)...
"%KEYTOOL%" -genkeypair -keystore "%KS_FILE%" -alias gamearcadehub -keyalg RSA -keysize 2048 -validity 10950 -storepass !GENPASS! -keypass !GENPASS! -dname "CN=Game Arcade Hub, OU=Mobile, O=Game Arcade Hub, L=Yogyakarta, S=Yogyakarta, C=ID"
if not exist "%KS_FILE%" (
    echo          [PERINGATAN] Gagal membuat keystore - memakai debug key.
    goto :eof
)
(
    echo storeFile=game-arcade-hub-release.keystore
    echo storePassword=!GENPASS!
    echo keyAlias=gamearcadehub
    echo keyPassword=!GENPASS!
) > "%KS_PROPS%"
echo          Signing key dibuat: game-arcade-hub-release.keystore
echo          Password ada di keystore.properties - simpan/backup file ini.
goto :eof

:detect_adb
set "ADB_OK=0"
set "ADB_EXE="
if defined ANDROID_HOME if exist "%ANDROID_HOME%\platform-tools\adb.exe" set "ADB_EXE=%ANDROID_HOME%\platform-tools\adb.exe"
if not defined ADB_EXE (
    for /f "delims=" %%a in ('where adb 2^>nul') do (
        if not defined ADB_EXE set "ADB_EXE=%%a"
    )
)
if not defined ADB_EXE goto :eof
"%ADB_EXE%" devices 2>nul | findstr /b /c:"device" >nul 2>&1
if not errorlevel 1 set "ADB_OK=1"
goto :eof

:detect_studio
set "STUDIO_OK=0"
set "STUDIO_PATH="
for %%P in (
    "%ProgramFiles%\Android Studio\bin\studio64.exe"
    "%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
    "%ProgramFiles(x86)%\Android Studio\bin\studio64.exe"
    "%LOCALAPPDATA%\JetBrains\Toolbox\apps\AndroidStudio\ch-0\bin\studio64.exe"
) do (
    if exist "%%~P" (
        set "STUDIO_PATH=%%~P"
        set "STUDIO_OK=1"
        goto :eof
    )
)
goto :eof

rem ==============================================================
rem  Error handlers
rem ==============================================================

:no_node
echo.
echo  [ERROR] Node.js belum terinstall.
echo          Install Node.js LTS: https://nodejs.org  (lalu restart PC)
echo.
goto :fail_end

:no_java
echo.
echo  [ERROR] Java (JDK 17+) tidak ditemukan.
echo          Install Android Studio (JDK bawaannya sudah termasuk),
echo          atau set JAVA_HOME lalu jalankan ulang.
echo.
goto :fail_end

:fail_npm
echo.
echo  [ERROR] npm install gagal. Cek koneksi internet lalu ulangi.
echo.
goto :fail_end

:fail_web
echo.
echo  [ERROR] Build web app (vite) gagal. Lihat log di atas.
echo.
goto :fail_end

:fail_sync
echo.
echo  [ERROR] Sync ke project Android gagal. Lihat log di atas.
echo.
goto :fail_end

:fail_gradle
echo.
echo  [ERROR] Build Gradle GAGAL. Penyebab yang paling umum:
echo            1. SDK Android 36 / Build-Tools 36 belum terinstall
echo               (buka Android Studio - Tools - SDK Manager)
echo            2. Lisensi SDK belum disetujui (SDK Manager - Accept licenses)
echo            3. Tidak ada koneksi internet untuk download Gradle/dependensi
echo            4. Memori tidak cukup - tutup aplikasi lain lalu ulangi
echo.
echo          Lihat log lengkap di atas untuk pesan error yang persis.
echo.
goto :fail_end

:fail_apk
echo.
echo  [ERROR] File APK tidak ditemukan setelah build. Lihat log di atas.
echo.
goto :fail_end

:fail_end
echo  Tekan tombol apa saja untuk menutup jendela ini.
pause >nul
endlocal
exit /b 1
