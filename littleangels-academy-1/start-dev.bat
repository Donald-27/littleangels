@echo off
set PATH=C:\node-v24.7.0-win-x64;%PATH%
echo Installing packages with npm...
npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo Package installation failed. Trying without legacy-peer-deps...
    npm install
)
echo Starting development server...
npm run dev
