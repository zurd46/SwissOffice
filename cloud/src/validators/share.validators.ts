import { z } from 'zod'

export const createShareSchema = z.object({
  email: z.string().email('Ungueltige E-Mail-Adresse'),
  permission: z.enum(['read', 'write']),
})

export const updateShareSchema = z.object({
  permission: z.enum(['read', 'write']),
})
