@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo.
echo  正在创建桌面快捷方式...
echo.

:: Get the absolute path of start.bat
set "START_BAT=%~dp0start.bat"
set "DESKTOP=%USERPROFILE%\Desktop"

:: Create shortcut using PowerShell
powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut('%DESKTOP%\Knowledge Viz.lnk'); " ^
  "$s.TargetPath = '%START_BAT%'; " ^
  "$s.WorkingDirectory = '%~dp0'; " ^
  "$s.IconLocation = '%~dp0public\favicon.svg,0'; " ^
  "$s.Description = 'Knowledge Viz - 知识库助手'; " ^
  "$s.Save()"

if %errorlevel% equ 0 (
    echo  [成功] 桌面快捷方式已创建！
    echo  名称: Knowledge Viz
    echo  位置: %DESKTOP%
    echo.
    echo  现在可以双击桌面上的 "Knowledge Viz" 图标启动应用
) else (
    echo  [错误] 创建快捷方式失败
)

echo.
pause
