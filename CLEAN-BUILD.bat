@echo off
rem ==============================================================
rem  CLEAN-BUILD.bat - bersihkan hasil build (web + android)
rem  Dipakai kalau build bermasalah / mau mulai dari nol.
rem  CATATAN: signing key TIDAK dihapus, jadi APK tetap bisa update.
rem ==============================================================
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo.
echo  Membersihkan hasil build ...
if exist "dist" rd /s /q "dist" && echo   - dist/
if exist "android\app\build" rd /s /q "android\app\build" && echo   - android\app\build
if exist "android\build" rd /s /q "android\build" && echo   - android\build
if exist "android\.gradle" rd /s /q "android\.gradle" && echo   - android\.gradle
if exist "android\app\src\main\assets\public" rd /s /q "android\app\src\main\assets\public" && echo   - web assets di android
echo.
echo  Selesai. Tekan tombol apa saja untuk menutup jendela ini.
pause >nul
endlocal
exit /b 0
