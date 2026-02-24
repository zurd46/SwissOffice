import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('./data/impulscloud.db'),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
