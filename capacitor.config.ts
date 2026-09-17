import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.coreforge.app',
  appName: 'CoreForge 研核',
  webDir: 'dist',
  server: {
    // 手机端连线电脑端 API 时，允许 HTTP 局域网访问与跨域
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0a0c14',
  },
}

export default config
