import { DEFAULT_CATALOG } from '../data/catalog'
import type { CatalogPhone } from '../data/catalog'

const STORAGE_KEY = 'rap_catalog'

export function loadCatalog(): CatalogPhone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CatalogPhone[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Failed to load catalog from localStorage:', err)
    // fall through to defaults
  }
  return DEFAULT_CATALOG
}

export function saveCatalog(catalog: CatalogPhone[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog))
}

export function resetCatalog(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getCatalogPhone(id: number): CatalogPhone | undefined {
  return loadCatalog().find((p) => p.id === id)
}
