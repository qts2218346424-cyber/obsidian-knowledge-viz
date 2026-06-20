import type { AudioTrack } from '../hooks/useAudioPlayer'

// ─── Radio Station Categories ──────────────────────────────────────────────────

export type RadioCategory = 'lofi' | 'english' | 'ambient'

export interface RadioStation extends AudioTrack {
  category: RadioCategory
  description: string
  website?: string
}

// ─── Lo-fi / Study Music ───────────────────────────────────────────────────────

export const LOFI_STATIONS: RadioStation[] = [
  {
    id: 'somafm-groovesalad',
    title: 'Groove Salad',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/groovesalad-128-mp3',
    type: 'radio',
    category: 'lofi',
    description: 'Chilled ambient beats and grooves',
    website: 'https://somafm.com/groovesalad',
  },
  {
    id: 'somafm-fluid',
    title: 'Fluid',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/fluid-128-mp3',
    type: 'radio',
    category: 'lofi',
    description: 'Instrumental hiphop & liquid trap',
    website: 'https://somafm.com/fluid',
  },
  {
    id: 'somafm-beatblender',
    title: 'Beat Blender',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/beatblender-128-mp3',
    type: 'radio',
    category: 'lofi',
    description: 'Deep-house & downtempo chill',
    website: 'https://somafm.com/beatblender',
  },
  {
    id: 'lautfm-lofi',
    title: 'Lofi Radio',
    artist: 'laut.fm',
    src: 'https://stream.laut.fm/lofi',
    type: 'radio',
    category: 'lofi',
    description: '24/7 Lo-fi hip hop beats',
    website: 'https://laut.fm/lofi',
  },
  {
    id: 'hirschmilch-chillout',
    title: 'Chillout',
    artist: 'Hirschmilch',
    src: 'https://hirschmilch.de:7501/chillout.mp3',
    type: 'radio',
    category: 'lofi',
    description: 'Electronic chillout & lounge',
    website: 'https://hirschmilch.de',
  },
  {
    id: 'somafm-indiepop',
    title: 'Indie Pop Rocks',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/indiepop-128-mp3',
    type: 'radio',
    category: 'lofi',
    description: 'Indie lo-fi college radio vibes',
    website: 'https://somafm.com/indiepop',
  },
]

// ─── English Talk / Learning Radio ─────────────────────────────────────────────

export const ENGLISH_STATIONS: RadioStation[] = [
  {
    id: 'kexp',
    title: 'KEXP 90.3 FM',
    artist: 'Seattle Public Radio',
    src: 'https://live-mp3-128.kexp.org',
    type: 'radio',
    category: 'english',
    description: 'DJ commentary, interviews & eclectic music',
    website: 'https://kexp.org',
  },
  {
    id: 'radioparadise',
    title: 'Radio Paradise',
    artist: 'Global Mix',
    src: 'https://stream.radioparadise.com/global-128',
    type: 'radio',
    category: 'english',
    description: 'DJ-mixed global music, 100% commercial-free',
    website: 'https://radioparadise.com',
  },
  {
    id: 'somafm-folkfwd',
    title: 'Folk Forward',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/folkfwd-128-mp3',
    type: 'radio',
    category: 'english',
    description: 'Indie folk & alt-folk storytelling',
    website: 'https://somafm.com/folkfwd',
  },
  {
    id: 'somafm-bootliquor',
    title: 'Boot Liquor',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/bootliquor-128-mp3',
    type: 'radio',
    category: 'english',
    description: 'Americana roots & country music',
    website: 'https://somafm.com/bootliquor',
  },
  {
    id: 'somafm-secretagent',
    title: 'Secret Agent',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/secretagent-128-mp3',
    type: 'radio',
    category: 'english',
    description: 'Lounge & spy-movie soundtrack vibes',
    website: 'https://somafm.com/secretagent',
  },
]

// ─── Ambient / Atmosphere Sounds ───────────────────────────────────────────────

export const AMBIENT_STATIONS: RadioStation[] = [
  {
    id: 'somafm-dronezone',
    title: 'Drone Zone',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/dronezone-128-aac',
    type: 'radio',
    category: 'ambient',
    description: 'Atmospheric textures with minimal beats',
    website: 'https://somafm.com/dronezone',
  },
  {
    id: 'somafm-deepspaceone',
    title: 'Deep Space One',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/deepspaceone-128-aac',
    type: 'radio',
    category: 'ambient',
    description: 'Deep ambient space music',
    website: 'https://somafm.com/deepspaceone',
  },
  {
    id: 'sleepscapes-rain',
    title: '雨声',
    artist: 'Sleepscapes',
    src: 'https://stream.willstare.com:8850/',
    type: 'radio',
    category: 'ambient',
    description: 'Continuous rain sounds for focus',
    website: 'https://willstare.com/sleep',
  },
  {
    id: 'sleepscapes-waves',
    title: '海浪',
    artist: 'Sleepscapes',
    src: 'https://stream.willstare.com:8860/',
    type: 'radio',
    category: 'ambient',
    description: 'Ocean wave sounds for relaxation',
    website: 'https://willstare.com/sleep',
  },
  {
    id: 'nightwave-plaza',
    title: 'Nightwave Plaza',
    artist: 'Plaza One',
    src: 'https://radio.plaza.one/mp3',
    type: 'radio',
    category: 'ambient',
    description: 'Vaporwave & ambient electronic',
    website: 'https://plaza.one',
  },
  {
    id: 'somafm-spacestation',
    title: 'Space Station',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/spacestation-128-aac',
    type: 'radio',
    category: 'ambient',
    description: 'Space ambient & electronic music',
    website: 'https://somafm.com/spacestation',
  },
  {
    id: 'somafm-lush',
    title: 'Lush',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/lush-128-aac',
    type: 'radio',
    category: 'ambient',
    description: 'Dreamy atmospheric electronica',
    website: 'https://somafm.com/lush',
  },
  {
    id: 'somafm-illstreet',
    title: 'Illinois Street',
    artist: 'SomaFM',
    src: 'https://ice2.somafm.com/illstreet-128-mp3',
    type: 'radio',
    category: 'ambient',
    description: 'Classic lounge & cafe ambiance',
    website: 'https://somafm.com/illstreet',
  },
  {
    id: 'radiorivendell',
    title: 'Radio Rivendell',
    artist: 'Fantasy Radio',
    src: 'https://play.radiorivendell.com/radio/8000/radio.mp3',
    type: 'radio',
    category: 'ambient',
    description: 'Fantasy music & atmospheric soundtracks',
    website: 'https://www.radiorivendell.com',
  },
]

// All radio stations combined
export const ALL_RADIO_STATIONS: RadioStation[] = [
  ...LOFI_STATIONS,
  ...ENGLISH_STATIONS,
  ...AMBIENT_STATIONS,
]

// Category metadata
export const RADIO_CATEGORIES: {
  key: RadioCategory
  label: string
  emoji: string
  description: string
  stations: RadioStation[]
}[] = [
  {
    key: 'lofi',
    label: 'Lo-fi 学习电台',
    emoji: '🎧',
    description: '轻松的学习伴侣，专注不犯困',
    stations: LOFI_STATIONS,
  },
  {
    key: 'english',
    label: '英语电台',
    emoji: '📻',
    description: '边听边练，沉浸式英语环境',
    stations: ENGLISH_STATIONS,
  },
  {
    key: 'ambient',
    label: '氛围音 & 白噪音',
    emoji: '🌿',
    description: '隔绝噪音，进入心流状态',
    stations: AMBIENT_STATIONS,
  },
]

// Emoji mapping (kept for backward compat)
export const AMBIENT_EMOJIS: Record<string, string> = {
  'somafm-groovesalad': '🥗',
  'somafm-fluid': '🌊',
  'somafm-beatblender': '🎹',
  'lautfm-lofi': '📚',
  'hirschmilch-chillout': '🍵',
  'somafm-indiepop': '🎸',
  'kexp': '🎙️',
  'radioparadise': '🌍',
  'somafm-folkfwd': '🪕',
  'somafm-bootliquor': '🤠',
  'somafm-secretagent': '🕵️',
  'somafm-dronezone': '🚀',
  'somafm-deepspaceone': '🌌',
  'sleepscapes-rain': '🌧️',
  'sleepscapes-waves': '🌊',
  'nightwave-plaza': '🌃',
  'somafm-spacestation': '🛸',
  'somafm-lush': '🌸',
  'somafm-illstreet': '☕',
  'radiorivendell': '🧝',
}
