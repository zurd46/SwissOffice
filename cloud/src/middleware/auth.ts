import { createMiddleware } from 'hono/factory'
import { jwtVerify } from 'jose'
import { env } from '../config/env'
import type { AuthUser } from '../types/auth'

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Token fehlt' } },
      { status: 401 },
    )
  }

  const token = header.slice(7)
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    c.set('user', {
      userId: payload.sub as string,
      email: payload.email as string,
      displayName: payload.displayName as string,
    })
    await next()
  } catch {
    return c.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Ungueltiger Token' } },
      { status: 401 },
    )
  }
})
