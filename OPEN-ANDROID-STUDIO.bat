@echo off
rem ==============================================================
rem  OPEN-ANDROID-STUDIO.bat - buka project Android di Android Studio
rem  (juga akan sync web build terbaru ke project Android)
rem ==============================================================
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul 2>&1
cd /d "%~dp0"

set "ANDROID_DIR=%~dp0android"
set "STUDIO_PATH="

for %%P in (
    "%ProgramFiles%\Android Studio\bin\studio64.exe"
    "%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
    "%ProgramFiles(x86)%\Android Studio\bin\studio64.exe"
    "%LOCALAPPDATA%\JetBrains\Toolbox\apps\AndroidStudio\ch-0\bin\studio64.exe"
) do (
    if exist "%%~P" (
        set "STUDIO_PATH=%%~P"
        goto :launch
    )
)

echo  Android Studio tidak ditemukan di PC ini.
echo  Install dari: https://developer.android.com/studio
echo.
pause
exit /b 1

:launch
echo  Membuka Android Studio ...
start "" "!STUDIO_PATH!" "%ANDROID_DIR%"
endlocal
exit /b 0
