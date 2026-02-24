import type { DocumentVersion } from './types/version'
import { generateVersionId } from './types/version'

const STORAGE_KEY = 'impuls-versions'
const MAX_VERSIONS = 50

function getStoredVersions(): DocumentVersion[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveVersions(versions: DocumentVersion[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions))
  } catch {
    // storage full
  }
}

export function createVersion(content: unknown, documentName: string, label?: string): DocumentVersion {
  const version: DocumentVersion = {
    id: generateVersionId(),
    timestamp: Date.now(),
    label: label || `Version vom ${new Date().toLocaleString('de-CH')}`,
    content,
    documentName,
  }

  const versions = getStoredVersions()
  versions.unshift(version)

  // Keep only last MAX_VERSIONS
  if (versions.length > MAX_VERSIONS) {
    versions.splice(MAX_VERSIONS)
  }

  saveVersions(versions)
  return version
}

export function getVersions(documentName?: string): DocumentVersion[] {
  const versions = getStoredVersions()
  if (documentName) {
    return versions.filter(v => v.documentName === documentName)
  }
  return versions
}

export function getVersion(id: string): DocumentVersion | undefined {
  return getStoredVersions().find(v => v.id === id)
}

export function deleteVersion(id: string): void {
  const versions = getStoredVersions().filter(v => v.id !== id)
  saveVersions(versions)
}

export function clearVersions(documentName?: string): void {
  if (documentName) {
    const versions = getStoredVersions().filter(v => v.documentName !== documentName)
    saveVersions(versions)
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}
