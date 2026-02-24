import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { db } from './client'
import path from 'path'
import fs from 'fs'

export function runMigrations() {
  const migrationsFolder = path.resolve(import.meta.dir, '../../drizzle')
  const journalPath = path.join(migrationsFolder, 'meta', '_journal.json')

  if (!fs.existsSync(journalPath)) {
    console.log('Keine Migrations-Dateien gefunden — nutze "bun run db:push" fuer Entwicklung')
    return
  }

  try {
    migrate(db, { migrationsFolder })
    console.log('Datenbank-Migrationen erfolgreich ausgefuehrt')
  } catch (error) {
    console.error('Fehler bei Datenbank-Migration:', error)
    throw error
  }
}
