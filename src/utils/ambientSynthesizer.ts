// ─── Web Audio API 自然白噪音与环境音实时合成器 ─────────────────────────────────
// 提供 0 网络依赖、高保真无缝循环的专注白噪音（雨声、海浪、冥想低鸣）

class AmbientSynthesizer {
  private ctx: AudioContext | null = null
  private activeNodes: { stop: () => void; gain: GainNode } | null = null
  private currentVolume = 0.7

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  // 1. 合成柔和雨声 (Pink Noise + Lowpass Filter + 微弱随机雨滴声)
  public playRain(volume = 0.7): { stop: () => void; setVolume: (v: number) => void } {
    this.stop()
    const ctx = this.getAudioContext()
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // 生成粉红噪声 (Pink Noise - 能量随频率上升衰减 3dB/octave，最接近真实雨声)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buffer
    noiseSource.loop = true

    // 低通滤波：800Hz，模拟窗外淅淅沥沥的雨声质感
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(850, ctx.currentTime)

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(volume * 0.6, ctx.currentTime)

    noiseSource.connect(filter)
    filter.connect(masterGain)
    masterGain.connect(ctx.destination)
    noiseSource.start()

    const handle = {
      stop: () => {
        try {
          masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
          setTimeout(() => {
            try { noiseSource.stop(); noiseSource.disconnect() } catch {}
          }, 350)
        } catch {
          try { noiseSource.stop() } catch {}
        }
      },
      setVolume: (v: number) => {
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, v)) * 0.6, ctx.currentTime)
      }
    }

    this.activeNodes = { stop: handle.stop, gain: masterGain }
    return handle
  }

  // 2. 合成海浪潮汐 (带通滤波白噪音 + 0.12Hz LFO 增益振荡模拟潮汐起伏)
  public playWaves(volume = 0.7): { stop: () => void; setVolume: (v: number) => void } {
    this.stop()
    const ctx = this.getAudioContext()
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buffer
    noiseSource.loop = true

    // 动态带通滤波 (400Hz)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(450, ctx.currentTime)
    filter.Q.setValueAtTime(1.2, ctx.currentTime)

    // LFO 潮汐振荡器 (周期约 8 秒起伏一次，非常逼真)
    const lfo = ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.125, ctx.currentTime)
    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(0.35, ctx.currentTime)

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(volume * 0.5, ctx.currentTime)

    lfo.connect(lfoGain)
    lfoGain.connect(masterGain.gain)

    noiseSource.connect(filter)
    filter.connect(masterGain)
    masterGain.connect(ctx.destination)

    noiseSource.start()
    lfo.start()

    const handle = {
      stop: () => {
        try {
          masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
          setTimeout(() => {
            try {
              noiseSource.stop()
              lfo.stop()
              noiseSource.disconnect()
              lfo.disconnect()
            } catch {}
          }, 350)
        } catch {
          try { noiseSource.stop(); lfo.stop() } catch {}
        }
      },
      setVolume: (v: number) => {
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, v)) * 0.5, ctx.currentTime)
      }
    }

    this.activeNodes = { stop: handle.stop, gain: masterGain }
    return handle
  }

  public stop() {
    if (this.activeNodes) {
      try { this.activeNodes.stop() } catch {}
      this.activeNodes = null
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = volume
    if (this.activeNodes) {
      try { this.activeNodes.gain.gain.setValueAtTime(volume * 0.5, this.ctx?.currentTime || 0) } catch {}
    }
  }
}

export const ambientSynthesizer = new AmbientSynthesizer()
