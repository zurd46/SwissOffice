import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from '../validators/auth.validators'
import { authMiddleware } from '../middleware/auth'
import * as authService from '../services/auth.service'

export const authRoutes = new Hono()

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')
  const result = await authService.register(body)
  return c.json({ ok: true, data: result }, 201)
})

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json')
  const result = await authService.login(body)
  return c.json({ ok: true, data: result })
})

authRoutes.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const body = c.req.valid('json')
  const result = await authService.refreshUserTokens(body.refreshToken)
  return c.json({ ok: true, data: result })
})

authRoutes.post('/logout', authMiddleware, zValidator('json', logoutSchema), async (c) => {
  const body = c.req.valid('json')
  await authService.logout(body.refreshToken)
  return c.json({ ok: true })
})

authRoutes.get('/me', authMiddleware, async (c) => {
  const user = c.get('user')
  const profile = authService.getProfile(user.userId)
  return c.json({ ok: true, data: profile })
})
