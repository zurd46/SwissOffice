import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { db } from './client'
import path from 'path'

export function runMigrations() {
  const migrationsFolder = path.resolve(import.meta.dir, '../../drizzle')
  try {
    migrate(db, { migrationsFolder })
    console.log('Datenbank-Migrationen erfolgreich ausgefuehrt')
  } catch (error) {
    console.error('Fehler bei Datenbank-Migration:', error)
    throw error
  }
}
