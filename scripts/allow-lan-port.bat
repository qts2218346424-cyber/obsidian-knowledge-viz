@echo off
chcp 65001 >nul
title CoreForge 研核 · 局域网防火墙端口一键放行工具

echo ==========================================================
echo    CoreForge 研核 · 局域网移动端互联端口放行工具
echo ==========================================================
echo.
echo 正在检查管理员权限并放行 TCP 3001 端口...

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] 正在申请管理员权限...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

netsh advfirewall firewall add rule name="CoreForge 研核 局域网端口 (3001)" dir=in action=allow protocol=TCP localport=3001 >nul 2>&1

echo.
echo [成功] Windows 防火墙已成功放行 3001 端口！
echo 手机与电脑连接同一 Wi-Fi 后，即可直接扫码访问学习！
echo.
pause
