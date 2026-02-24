// Shared API-Client mit automatischer Auth-Token-Injection und Refresh-Logik

import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from './tokenManager'
import type { ApiResponse, RefreshResponse } from './types'

export interface ApiClient {
  get: <T>(path: string) => Promise<ApiResponse<T>>
  post: <T>(path: string, body?: unknown) => Promise<ApiResponse<T>>
  put: <T>(path: string, body?: unknown) => Promise<ApiResponse<T>>
  delete: <T>(path: string) => Promise<ApiResponse<T>>
  upload: <T>(path: string, formData: FormData) => Promise<ApiResponse<T>>
  baseUrl: string
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function attemptRefresh(baseUrl: string): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    const token = getRefreshToken()
    if (!token) {
      clearTokens()
      return false
    }

    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
      })

      if (!res.ok) {
        clearTokens()
        return false
      }

      const json = await res.json() as ApiResponse<RefreshResponse>
      if (json.ok && json.data) {
        setTokens(json.data.accessToken, json.data.refreshToken)
        return true
      }

      clearTokens()
      return false
    } catch {
      clearTokens()
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function makeRequest<T>(
  baseUrl: string,
  method: string,
  path: string,
  body?: unknown,
  isFormData?: boolean,
): Promise<ApiResponse<T>> {
  let token = getAccessToken()

  // Proaktiv refreshen wenn Token bald abläuft
  if (token && isTokenExpired(token)) {
    const refreshed = await attemptRefresh(baseUrl)
    if (refreshed) {
      token = getAccessToken()
    } else {
      return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Sitzung abgelaufen' } }
    }
  }

  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    })

    // Bei 401: Token refreshen und Retry
    if (res.status === 401 && token) {
      const refreshed = await attemptRefresh(baseUrl)
      if (refreshed) {
        const newToken = getAccessToken()
        const retryHeaders: Record<string, string> = {}
        if (newToken) retryHeaders['Authorization'] = `Bearer ${newToken}`
        if (!isFormData) retryHeaders['Content-Type'] = 'application/json'

        const retryRes = await fetch(`${baseUrl}${path}`, {
          method,
          headers: retryHeaders,
          body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
        })
        return await retryRes.json() as ApiResponse<T>
      }
      return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Sitzung abgelaufen' } }
    }

    return await res.json() as ApiResponse<T>
  } catch {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: 'Netzwerkfehler — Server nicht erreichbar' } }
  }
}

export function createApiClient(baseUrl: string): ApiClient {
  return {
    get: <T>(path: string) => makeRequest<T>(baseUrl, 'GET', path),
    post: <T>(path: string, body?: unknown) => makeRequest<T>(baseUrl, 'POST', path, body),
    put: <T>(path: string, body?: unknown) => makeRequest<T>(baseUrl, 'PUT', path, body),
    delete: <T>(path: string) => makeRequest<T>(baseUrl, 'DELETE', path),
    upload: <T>(path: string, formData: FormData) => makeRequest<T>(baseUrl, 'POST', path, formData, true),
    baseUrl,
  }
}
