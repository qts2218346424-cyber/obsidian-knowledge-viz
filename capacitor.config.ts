import type { CapacitorConfig } from '@capacitor/cli'

// 云服务器部署模式下，可通过环境变量 CAP_SERVER_URL（例如 https://study.example.com）
// 让生成的 APK 直接连接云端最新前端与 API，后续更新无需重新打包安装 APK
const cloudServerUrl = process.env.CAP_SERVER_URL?.trim()

const config: CapacitorConfig = {
  appId: 'com.coreforge.app',
  appName: 'CoreForge 研核',
  webDir: 'dist',
  server: {
    ...(cloudServerUrl ? { url: cloudServerUrl } : {}),
    // 兼容 HTTP 公网 IP 或局域网直连访问
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0a0c14',
  },
}

export default config
