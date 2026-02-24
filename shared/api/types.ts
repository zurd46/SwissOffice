// Shared API Types für alle ImpulsOffice Apps

export interface ApiResponse<T> {
  ok: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
}

export interface ApiClient {
  get: <T>(path: string) => Promise<ApiResponse<T>>
  post: <T>(path: string, body?: unknown) => Promise<ApiResponse<T>>
  put: <T>(path: string, body?: unknown) => Promise<ApiResponse<T>>
  delete: <T>(path: string) => Promise<ApiResponse<T>>
  upload: <T>(path: string, formData: FormData) => Promise<ApiResponse<T>>
  baseUrl: string
}

export interface AuthUser {
  id: string
  email: string
  displayName: string
  createdAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface ProfileResponse {
  id: string
  email: string
  displayName: string
  createdAt: string
}

export interface CloudDocument {
  id: string
  title: string
  content: Record<string, unknown>
  folderId: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}
