// Shared Module — Re-Exports für alle ImpulsOffice Apps

// API
export { createApiClient } from './api/client'
export type { ApiClient } from './api/client'
export type { ApiResponse, ApiError, AuthUser, LoginRequest, RegisterRequest, LoginResponse, RefreshResponse, ProfileResponse, CloudDocument } from './api/types'
export { getAccessToken, getRefreshToken, setTokens, clearTokens, hasStoredRefreshToken, isTokenExpired, scheduleTokenRefresh } from './api/tokenManager'

// WebSocket
export { createWsClient } from './ws/wsClient'
export type { WsClient, WsMessageHandler } from './ws/wsClient'

// Contexts
export { AuthProvider, useAuth } from './contexts/AuthContext'
export { CloudProvider, useCloud } from './contexts/CloudContext'

// Components
export { AuthGuard } from './components/AuthGuard'

// Hooks
export { useCloudStatus } from './hooks/useCloudStatus'
export type { CloudStatus } from './hooks/useCloudStatus'
