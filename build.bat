@echo off
rem ==============================================================
rem  build.bat - alias untuk BUILD-APK.bat
rem  Pakai: build.bat        (release)   build.bat debug
rem ==============================================================
setlocal
cd /d "%~dp0"
call "%~dp0BUILD-APK.bat" %*
endlocal
exit /b %ERRORLEVEL%
