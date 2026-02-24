export interface AuthUser {
  userId: string
  email: string
  displayName: string
}

export interface TokenPayload {
  sub: string
  email: string
  displayName: string
}
