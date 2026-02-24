import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('./data/impulscloud.db'),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Microsoft Graph OAuth2
  MS_GRAPH_CLIENT_ID: z.string().default(''),
  MS_GRAPH_CLIENT_SECRET: z.string().default(''),
  MS_GRAPH_REDIRECT_URI: z.string().default('http://localhost:4000/api/v1/email/oauth/microsoft/callback'),
  MS_GRAPH_TENANT_ID: z.string().default('common'),

  // Credential-Verschluesselung (64-char hex = 32 Bytes AES-256)
  CREDENTIAL_ENCRYPTION_KEY: z.string().min(64).default('0'.repeat(64)),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
