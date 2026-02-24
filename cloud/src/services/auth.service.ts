import { eq } from 'drizzle-orm'
import { SignJWT } from 'jose'
import { db } from '../db/client'
import { users, refreshTokens } from '../db/schema'
import { env } from '../config/env'
import { ConflictError, UnauthorizedError, NotFoundError } from '../types/api'

function generateId(): string {
  return crypto.randomUUID()
}

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/)
  if (!match) throw new Error(`Ungueltiges Expiry-Format: ${expiry}`)
  const value = parseInt(match[1])
  const unit = match[2]
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
  return value * multipliers[unit] * 1000
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function generateAccessToken(userId: string, email: string, displayName: string): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET)
  const expiryMs = parseExpiry(env.JWT_ACCESS_EXPIRY)
  return new SignJWT({ email, displayName })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + expiryMs))
    .sign(secret)
}

function generateRefreshToken(): string {
  const bytes = new Uint8Array(64)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function register(input: { email: string; password: string; displayName: string }) {
  const existing = db.select().from(users).where(eq(users.email, input.email)).get()
  if (existing) {
    throw new ConflictError('E-Mail-Adresse wird bereits verwendet')
  }

  const passwordHash = await Bun.password.hash(input.password, { algorithm: 'argon2id' })
  const id = generateId()
  const now = new Date()

  db.insert(users).values({
    id,
    email: input.email,
    displayName: input.displayName,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  }).run()

  return { user: { id, email: input.email, displayName: input.displayName, createdAt: now.toISOString() } }
}

export async function login(input: { email: string; password: string }) {
  const user = db.select().from(users).where(eq(users.email, input.email)).get()
  if (!user) {
    throw new UnauthorizedError('Ungueltige Anmeldedaten')
  }

  const valid = await Bun.password.verify(input.password, user.passwordHash)
  if (!valid) {
    throw new UnauthorizedError('Ungueltige Anmeldedaten')
  }

  const accessToken = await generateAccessToken(user.id, user.email, user.displayName)
  const refreshToken = generateRefreshToken()
  const tokenHash = await hashToken(refreshToken)
  const expiryMs = parseExpiry(env.JWT_REFRESH_EXPIRY)

  db.insert(refreshTokens).values({
    id: generateId(),
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + expiryMs),
    createdAt: new Date(),
  }).run()

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, displayName: user.displayName },
  }
}

export async function refreshUserTokens(token: string) {
  const tokenHash = await hashToken(token)
  const stored = db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)).get()

  if (!stored) {
    throw new UnauthorizedError('Ungueltiger Refresh Token')
  }

  if (stored.expiresAt < new Date()) {
    db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id)).run()
    throw new UnauthorizedError('Refresh Token abgelaufen')
  }

  // Token-Rotation: alten loeschen
  db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id)).run()

  const user = db.select().from(users).where(eq(users.id, stored.userId)).get()
  if (!user) {
    throw new UnauthorizedError('Benutzer nicht gefunden')
  }

  const accessToken = await generateAccessToken(user.id, user.email, user.displayName)
  const newRefreshToken = generateRefreshToken()
  const newTokenHash = await hashToken(newRefreshToken)
  const expiryMs = parseExpiry(env.JWT_REFRESH_EXPIRY)

  db.insert(refreshTokens).values({
    id: generateId(),
    userId: user.id,
    tokenHash: newTokenHash,
    expiresAt: new Date(Date.now() + expiryMs),
    createdAt: new Date(),
  }).run()

  return { accessToken, refreshToken: newRefreshToken }
}

export async function logout(token: string) {
  const tokenHash = await hashToken(token)
  db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)).run()
}

export function getProfile(userId: string) {
  const user = db.select({
    id: users.id,
    email: users.email,
    displayName: users.displayName,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, userId)).get()

  if (!user) {
    throw new NotFoundError('Benutzer nicht gefunden')
  }

  return { ...user, createdAt: user.createdAt.toISOString() }
}
