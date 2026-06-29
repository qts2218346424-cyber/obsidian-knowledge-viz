@echo off
chcp 65001 >nul 2>&1
title Knowledge Viz - 构建桌面安装包
cd /d "%~dp0"

echo.
echo   ╔══════════════════════════════════════╗
echo   ║   构建 Knowledge Viz 桌面安装包      ║
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
    echo  [1/4] 安装依赖...
    call npm install --silent
    echo.
) else (
    echo  [1/4] 依赖已安装，跳过
)

:: Build frontend
echo.
echo  [2/4] 构建前端...
call npm run build
if %errorlevel% neq 0 (
    echo  [错误] 前端构建失败
    pause
    exit /b 1
)

:: Build server
echo.
echo  [3/4] 构建服务端...
call npm run build:server
if %errorlevel% neq 0 (
    echo  [错误] 服务端构建失败
    pause
    exit /b 1
)

:: Package with electron-builder
echo.
echo  [4/4] 打包桌面应用...
call npx electron-builder --win
if %errorlevel% neq 0 (
    echo  [错误] 打包失败
    pause
    exit /b 1
)

echo.
echo   ╭──────────────────────────────────────╮
echo   │  构建完成！                          │
echo   │  安装包位于: release\ 目录           │
echo   ╰──────────────────────────────────────╯
echo.

:: Open the release directory
start "" "release"

pause
