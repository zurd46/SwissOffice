export interface AppSettings {
  language: string
  defaultFontFamily: string
  defaultFontSize: string
  autoSave: boolean
  autoSaveInterval: number // in Sekunden
  spellCheck: boolean
}

export const AVAILABLE_LANGUAGES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
]

export const AVAILABLE_FONTS = [
  'Times New Roman',
  'Arial',
  'Calibri',
  'Helvetica',
  'Georgia',
  'Verdana',
  'Courier New',
  'Garamond',
  'Trebuchet MS',
]

export const AVAILABLE_FONT_SIZES = [
  '8', '9', '10', '10.5', '11', '12', '14', '16', '18', '20', '24', '28', '36', '48', '72',
]

export const DEFAULT_APP_SETTINGS: AppSettings = {
  language: 'de',
  defaultFontFamily: 'Times New Roman',
  defaultFontSize: '12',
  autoSave: false,
  autoSaveInterval: 60,
  spellCheck: true,
}

const STORAGE_KEY = 'impulsoffice-app-settings'

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(stored) }
  } catch {
    /* ignore */
  }
  return DEFAULT_APP_SETTINGS
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
