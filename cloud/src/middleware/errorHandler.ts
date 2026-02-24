import type { ErrorHandler } from 'hono'
import { AppError } from '../types/api'
import { ZodError } from 'zod'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[${new Date().toISOString()}] Error:`, err)

  if (err instanceof AppError) {
    return c.json(
      { ok: false, error: { code: err.code, message: err.message } },
      { status: err.statusCode },
    )
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Ungueltige Eingabedaten',
          details: err.flatten(),
        },
      },
      { status: 400 },
    )
  }

  return c.json(
    { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Interner Serverfehler' } },
    { status: 500 },
  )
}
