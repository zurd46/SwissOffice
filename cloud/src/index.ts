import { app } from './app'
import { env } from './config/env'
import { runMigrations } from './db/migrate'

await runMigrations()

console.log(`ImpulsCloud Server laeuft auf ${env.HOST}:${env.PORT}`)

export default {
  port: env.PORT,
  hostname: env.HOST,
  fetch: app.fetch,
}
