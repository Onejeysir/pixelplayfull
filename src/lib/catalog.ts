import type {
  Condition,
  ConsoleProduct,
  DeviceProduct,
  DeviceType,
  GameProduct,
  Platform,
  Product,
  SortKey,
} from '../types/catalog'
import { normalizeText, productKindLabel } from './format'

/* ---------- Recherche ---------- */

function haystack(product: Product): string {
  const parts: (string | undefined)[] = [product.name, product.description, productKindLabel(product)]
  switch (product.kind) {
    case 'console':
      parts.push(product.generation, product.variant, product.storage)
      break
    case 'game-physical':
    case 'game-digital':
      parts.push(product.platform)
      break
    case 'device':
      parts.push(product.brand, product.model, product.deviceType)
      break
  }
  return normalizeText(parts.filter(Boolean).join(' '))
}

/** Tous les mots saisis doivent se retrouver (sans tenir compte des accents ni de la casse). */
export function matchesQuery(product: Product, query: string): boolean {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true
  const text = haystack(product)
  return tokens.every((t) => text.includes(t))
}

export function searchProducts(products: Product[], query: string): Product[] {
  return products.filter((p) => matchesQuery(p, query))
}

/* ---------- Tri ---------- */

export function sortProducts<T extends Product>(products: T[], sort: SortKey): T[] {
  const copy = [...products]
  const byName = (a: T, b: T) => a.name.localeCompare(b.name, 'fr')
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price || byName(a, b))
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price || byName(a, b))
    case 'name':
      return copy.sort(byName)
    case 'recent':
    default:
      return copy.sort((a, b) => b.addedAt.localeCompare(a.addedAt) || byName(a, b))
  }
}

/* ---------- Filtres ---------- */

export interface CommonFilters {
  query: string
  condition?: Condition
  minPrice?: number
  maxPrice?: number
  /** Ne garde que les produits immédiatement disponibles. */
  inStockOnly: boolean
  sort: SortKey
}

export interface GameFilters extends CommonFilters {
  platform?: Platform
}

export interface ConsoleFilters extends CommonFilters {
  generation?: Platform
  variant?: string
}

export interface DeviceFilters extends CommonFilters {
  deviceType?: DeviceType
}

export const EMPTY_FILTERS: CommonFilters = { query: '', inStockOnly: false, sort: 'recent' }

function commonPredicate(f: CommonFilters) {
  return (p: Product): boolean => {
    if (!matchesQuery(p, f.query)) return false
    if (f.minPrice !== undefined && p.price < f.minPrice) return false
    if (f.maxPrice !== undefined && p.price > f.maxPrice) return false
    if (f.inStockOnly && p.availability !== 'in_stock') return false
    if (f.condition && 'condition' in p && p.condition !== f.condition) return false
    // Un compte ou un code numérique n'a pas d'état neuf / occasion : il disparaît si on filtre par état.
    if (f.condition && p.kind === 'game-digital') return false
    return true
  }
}

export function filterGames(games: GameProduct[], f: GameFilters): GameProduct[] {
  const common = commonPredicate(f)
  return sortProducts(
    games.filter((g) => common(g) && (!f.platform || g.platform === f.platform)),
    f.sort,
  )
}

export function filterConsoles(consoles: ConsoleProduct[], f: ConsoleFilters): ConsoleProduct[] {
  const common = commonPredicate(f)
  return sortProducts(
    consoles.filter(
      (c) =>
        common(c) && (!f.generation || c.generation === f.generation) && (!f.variant || c.variant === f.variant),
    ),
    f.sort,
  )
}

export function filterDevices(devices: DeviceProduct[], f: DeviceFilters): DeviceProduct[] {
  const common = commonPredicate(f)
  return sortProducts(
    devices.filter((d) => common(d) && (!f.deviceType || d.deviceType === f.deviceType)),
    f.sort,
  )
}

/** Variantes distinctes disponibles dans le catalogue, éventuellement pour une seule génération. */
export function consoleVariants(consoles: ConsoleProduct[], generation?: Platform): string[] {
  const set = new Set(consoles.filter((c) => !generation || c.generation === generation).map((c) => c.variant))
  return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
}

/* ---------- Lecture des paramètres d'URL ---------- */

const SORT_KEYS: SortKey[] = ['recent', 'price-asc', 'price-desc', 'name']

export function parseSort(value: string | null): SortKey {
  return SORT_KEYS.includes(value as SortKey) ? (value as SortKey) : 'recent'
}

export function parsePlatform(value: string | null): Platform | undefined {
  return value === 'PS4' || value === 'PS5' ? value : undefined
}

export function parseCondition(value: string | null): Condition | undefined {
  return value === 'neuf' || value === 'occasion' ? value : undefined
}

export function parseDeviceType(value: string | null): DeviceType | undefined {
  return value === 'ordinateur' || value === 'telephone' || value === 'console' ? value : undefined
}

/** Entier positif ou undefined (« 150 000 », « abc » et valeurs négatives sont ignorés proprement). */
export function parseAmount(value: string | null): number | undefined {
  if (!value) return undefined
  const compact = value.replace(/[\s  ]/g, '')
  if (!/^\d{1,9}$/.test(compact)) return undefined
  return Number(compact)
}

export function readCommonFilters(params: URLSearchParams): CommonFilters {
  return {
    query: (params.get('q') ?? '').slice(0, 80),
    condition: parseCondition(params.get('etat')),
    minPrice: parseAmount(params.get('min')),
    maxPrice: parseAmount(params.get('max')),
    inStockOnly: params.get('dispo') === '1',
    sort: parseSort(params.get('tri')),
  }
}

/** Copie des paramètres avec une clé ajoutée, modifiée ou retirée (valeur vide = retrait). */
export function withParam(params: URLSearchParams, key: string, value: string | undefined): URLSearchParams {
  const next = new URLSearchParams(params)
  if (value === undefined || value === '') next.delete(key)
  else next.set(key, value)
  return next
}

export function countActiveFilters(f: CommonFilters, extra: unknown[] = []): number {
  const base = [f.query, f.condition, f.minPrice, f.maxPrice, f.inStockOnly || undefined]
  return [...base, ...extra].filter((v) => v !== undefined && v !== '').length
}
