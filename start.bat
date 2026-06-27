@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   BEP CUA VO - dang khoi dong server...
echo   Mo trinh duyet vao: http://localhost:8765
echo   (De TAT server: dong cua so den nay)
echo ============================================
start "" http://localhost:8765
"C:\Program Files\Python313\python.exe" -m http.server 8765
pause
