// Token-Manager: Sichere Token-Speicherung
//
// SICHERHEIT:
// - Access-Token: NUR im Memory (nie localStorage) — verhindert XSS-Zugriff
// - Refresh-Token: localStorage mit Token-Rotation — bei jedem Refresh neues Token
// - Bei Page-Reload: Refresh-Token aus localStorage → neues Access-Token holen
// - Automatischer Refresh 60s vor Ablauf

const STORAGE_KEY_REFRESH = 'impuls-rt'

// Access-Token nur im Memory — geht bei Page-Reload verloren (by design)
let accessToken: string | null = null
let refreshTimer: ReturnType<typeof setTimeout> | null = null

function getFromStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setInStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage nicht verfügbar
  }
}

function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // localStorage nicht verfügbar
  }
}

export function getAccessToken(): string | null {
  return accessToken
}

export function getRefreshToken(): string | null {
  return getFromStorage(STORAGE_KEY_REFRESH)
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access
  setInStorage(STORAGE_KEY_REFRESH, refresh)
}

export function clearTokens(): void {
  accessToken = null
  removeFromStorage(STORAGE_KEY_REFRESH)
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

// Prüft ob ein gespeicherter Refresh-Token existiert (für Init-Check)
export function hasStoredRefreshToken(): boolean {
  return !!getFromStorage(STORAGE_KEY_REFRESH)
}

// JWT Payload dekodieren (ohne Verifikation — nur Client-seitige Expiry-Prüfung)
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Base64url → Base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    const payload = atob(padded)
    return JSON.parse(payload)
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return true
  // 30 Sekunden Puffer — lieber zu früh refreshen als zu spät
  return Date.now() >= (payload.exp * 1000 - 30000)
}

export function getTokenExpiryMs(token: string): number {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return 0
  return payload.exp * 1000 - Date.now()
}

// Timer für automatischen Token-Refresh (60s vor Ablauf)
export function scheduleTokenRefresh(refreshFn: () => Promise<void>): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }

  const token = getAccessToken()
  if (!token) return

  const expiryMs = getTokenExpiryMs(token)
  // 60 Sekunden vor Ablauf refreshen, mindestens 5s warten
  const refreshIn = Math.max(expiryMs - 60000, 5000)

  refreshTimer = setTimeout(async () => {
    try {
      await refreshFn()
    } catch {
      // Refresh fehlgeschlagen — wird beim nächsten API-Call behandelt
    }
  }, refreshIn)
}
