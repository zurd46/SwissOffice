import { z } from 'zod'

export const createVersionSchema = z.object({
  label: z.string().max(200).optional(),
})

export const listVersionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
})
