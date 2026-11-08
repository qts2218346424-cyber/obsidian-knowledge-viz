#!/bin/bash
# ==============================================================================
# CoreForge 研核 · 云端服务器一键同步与构建脚本
# ==============================================================================
set -e

echo "🚀 [1/4] 开始从 GitHub 拉取最新主分支代码..."
git pull origin main

echo "📦 [2/4] 检查并更新项目运行依赖..."
npm install --prefer-offline --no-audit || npm install

echo "🔨 [3/4] 执行全量生产构建 (前端 Vite 产物 + 后端 ESBuild 产物)..."
npm run build:all

echo "🔄 [4/4] 平滑重启服务端进程..."
if command -v pm2 &> /dev/null; then
  if pm2 describe coreforge &> /dev/null; then
    pm2 restart coreforge
    echo "✅ PM2 (coreforge) 服务重启成功！"
  elif pm2 describe server &> /dev/null; then
    pm2 restart server
    echo "✅ PM2 (server) 服务重启成功！"
  elif pm2 list | grep -q 'online'; then
    pm2 reload all
    echo "✅ PM2 正在运行的实例已重新加载！"
  else
    echo "ℹ️ PM2 暂未运行对应服务，你可以执行：pm2 start dist-server/server.mjs --name coreforge"
  fi
elif systemctl is-active --quiet coreforge 2>/dev/null; then
  sudo systemctl restart coreforge
  echo "✅ systemd (coreforge) 服务重启成功！"
else
  echo "💡 提示：未检测到 PM2 或 systemd 托管，若使用后台进程请重启 node dist-server/server.mjs"
fi

echo "=============================================================================="
echo "🎉 云端同步完成！手机或浏览器访问即可查看最新的伴学工作台与课件体验。"
echo "=============================================================================="
