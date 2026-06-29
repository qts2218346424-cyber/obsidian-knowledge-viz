@echo off
chcp 65001 >nul 2>&1
title Knowledge Viz - 知识库助手
cd /d "%~dp0"

echo.
echo   ╔══════════════════════════════════════╗
echo   ║   Knowledge Viz - 知识库助手         ║
echo   ╚══════════════════════════════════════╝
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [错误] 未找到 Node.js
    echo  请先安装: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo  [1/3] 安装依赖...
    call npm install --silent
    echo  [1/3] 完成
    echo.
)

:: Build frontend if needed
if not exist "dist\index.html" (
    echo  [2/3] 构建前端...
    call npm run build
    echo  [2/3] 完成
    echo.
) else (
    echo  [2/3] 前端已构建，跳过
)

:: Build server if needed
if not exist "dist-server\server.mjs" (
    echo  [3/3] 构建服务端...
    call npm run build:server
    echo  [3/3] 完成
    echo.
) else (
    echo  [3/3] 服务端已构建，跳过
)

echo.
echo  正在启动服务...
:: Start the server in background
start /B "" cmd /c "npx tsx server/index.ts >nul 2>&1"

:: Wait for server to respond
set RETRY=0
:wait_server
if %RETRY% geq 20 (
    echo.
    echo  [错误] 服务启动超时，请检查端口 3001 是否被占用
    pause
    exit /b 1
)
timeout /t 1 /nobreak >nul
curl -s http://localhost:3001/api/vault/stats >nul 2>&1
if %errorlevel% neq 0 (
    set /a RETRY+=1
    goto wait_server
)

echo.
echo  ╭──────────────────────────────────────╮
echo  │  启动成功！正在打开浏览器...          │
echo  │  http://localhost:3001               │
echo  ╰──────────────────────────────────────╯
echo.
start http://localhost:3001

echo  提示: 关闭此窗口将停止服务
echo        按 Ctrl+C 也可停止服务
echo  ──────────────────────────────────────
echo.

:: Keep window alive — when user closes or Ctrl+C, cleanup
pause >nul

:: Cleanup: kill the background tsx/node process
echo.
echo  正在关闭服务...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Knowledge Viz*" >nul 2>&1
echo  已停止
timeout /t 1 >nul
