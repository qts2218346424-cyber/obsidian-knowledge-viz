# CoreForge 研核 · 局域网防火墙端口一键放行脚本 (TCP 3001)
# 允许手机、平板在同一局域网（同一 Wi-Fi）内直接访问本机部署的研学系统

$RuleName = "CoreForge 研核 局域网移动端访问端口 (TCP 3001)"
$Port = 3001

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CoreForge 研核 · 局域网移动端互联端口放行工具" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前是否具备管理员权限
$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "正在请求 Windows 管理员权限以配置防火墙规则..." -ForegroundColor Yellow
    try {
        Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
        exit
    } catch {
        Write-Host "❌ 提升管理员权限被拒绝。请右键以管理员身份运行此脚本！" -ForegroundColor Red
        pause
        exit 1
    }
}

try {
    # 检查是否已存在同名规则
    $Existing = Get-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue

    if ($Existing) {
        Write-Host "发现已存在防火墙规则，正在刷新并确保处于激活允许状态..." -ForegroundColor Yellow
        Set-NetFirewallRule -DisplayName $RuleName -Enabled True -Action Allow -Direction Inbound -Profile Any
    } else {
        Write-Host "正在向 Windows Defender 防火墙添加 TCP 3001 入站允许规则..." -ForegroundColor Yellow
        New-NetFirewallRule -DisplayName $RuleName `
            -Direction Inbound `
            -Action Allow `
            -Protocol TCP `
            -LocalPort $Port `
            -Profile Any `
            -Description "允许手机或平板在局域网内通过 Wi-Fi 访问本机 CoreForge 研核研学系统" | Out-Null
    }

    Write-Host ""
    Write-Host "✅ 成功！Windows 防火墙已放行 TCP 3001 端口！" -ForegroundColor Green
    Write-Host "📱 手机现在与电脑连接同一 Wi-Fi 后，即可直接扫码访问学习！" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ 配置防火墙失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
