import { describe, expect, it } from 'vitest'
import { allGames, allProducts, consoles, devices, digitalGames, physicalGames } from '../data/products'
import {
  consoleVariants,
  countActiveFilters,
  EMPTY_FILTERS,
  filterConsoles,
  filterDevices,
  filterGames,
  matchesQuery,
  parseAmount,
  parseSort,
  readCommonFilters,
  searchProducts,
  sortProducts,
  withParam,
} from './catalog'
import { formatPrice, normalizeText } from './format'

describe('données du catalogue', () => {
  it('chaque produit a un identifiant unique et stable (sans espace)', () => {
    const ids = allProducts.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/)
  })

  it('les prix sont des entiers positifs et les dates valides', () => {
    for (const p of allProducts) {
      expect(Number.isInteger(p.price) && p.price > 0, p.id).toBe(true)
      expect(p.addedAt, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('les comptes de jeux ont des conditions de vente renseignées', () => {
    for (const g of digitalGames) expect(g.conditions.length, g.id).toBeGreaterThan(0)
  })

  it('les consoles couvrent PS4 et PS5', () => {
    expect(new Set(consoles.map((c) => c.generation))).toEqual(new Set(['PS4', 'PS5']))
  })
})

describe('formatPrice', () => {
  it('groupe les milliers avec une espace simple et ajoute FCFA', () => {
    expect(formatPrice(445000)).toBe('445 000 FCFA')
    expect(formatPrice(9000)).toBe('9 000 FCFA')
    expect(formatPrice(950)).toBe('950 FCFA')
    expect(formatPrice(1234567)).toBe('1 234 567 FCFA')
  })
})

describe('recherche', () => {
  it('ignore la casse et les accents', () => {
    expect(normalizeText('Édition SPÉCIALE')).toBe('edition speciale')
    expect(searchProducts(allProducts, 'spider-man').length).toBeGreaterThan(0)
    expect(searchProducts(allProducts, 'MARVELS')).toHaveLength(0) // apostrophe : « Marvel’s » ≠ « marvels »
    expect(searchProducts(allProducts, 'marvel’s spider').length).toBeGreaterThan(0)
  })

  it('exige tous les mots saisis, dans n’importe quel ordre', () => {
    const r = searchProducts(allProducts, 'ps5 digital')
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((p) => matchesQuery(p, 'digital') && matchesQuery(p, 'ps5'))).toBe(true)
    expect(searchProducts(allProducts, 'ps5 zzzzzz')).toHaveLength(0)
  })

  it('une requête vide renvoie tout', () => {
    expect(searchProducts(allProducts, '   ')).toHaveLength(allProducts.length)
  })

  it('retrouve un appareil par sa marque', () => {
    expect(searchProducts(devices, 'samsung').map((d) => d.name)).toEqual(['Samsung Galaxy A54'])
  })
})

describe('tri', () => {
  it('prix croissant et décroissant', () => {
    const asc = sortProducts(consoles, 'price-asc').map((c) => c.price)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    const desc = sortProducts(consoles, 'price-desc').map((c) => c.price)
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })

  it('nouveautés : le plus récent d’abord', () => {
    const dates = sortProducts(allProducts, 'recent').map((p) => p.addedAt)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('ne modifie pas le tableau d’origine', () => {
    const before = consoles.map((c) => c.id)
    sortProducts(consoles, 'price-asc')
    expect(consoles.map((c) => c.id)).toEqual(before)
  })
})

describe('filtres de jeux', () => {
  it('filtre par plateforme', () => {
    const ps5 = filterGames(allGames, { ...EMPTY_FILTERS, platform: 'PS5' })
    expect(ps5.length).toBeGreaterThan(0)
    expect(ps5.every((g) => g.platform === 'PS5')).toBe(true)
  })

  it('filtre neuf / occasion sur les jeux sur disque', () => {
    const neufs = filterGames(physicalGames, { ...EMPTY_FILTERS, condition: 'neuf' })
    expect(neufs.length).toBeGreaterThan(0)
    expect(neufs.every((g) => g.kind === 'game-physical' && g.condition === 'neuf')).toBe(true)
    const occ = filterGames(physicalGames, { ...EMPTY_FILTERS, condition: 'occasion' })
    expect(occ.every((g) => g.kind === 'game-physical' && g.condition === 'occasion')).toBe(true)
    expect(neufs.length + occ.length).toBe(physicalGames.length)
  })

  it('les jeux numériques (sans état) disparaissent quand on filtre par état', () => {
    const r = filterGames(allGames, { ...EMPTY_FILTERS, condition: 'neuf' })
    expect(r.some((g) => g.kind === 'game-digital')).toBe(false)
  })

  it('fourchette de prix : bornes incluses', () => {
    const r = filterGames(allGames, { ...EMPTY_FILTERS, minPrice: 10000, maxPrice: 24000 })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((g) => g.price >= 10000 && g.price <= 24000)).toBe(true)
    const exact = filterGames(allGames, { ...EMPTY_FILTERS, minPrice: 9000, maxPrice: 9000 })
    expect(exact.map((g) => g.id)).toContain('jeu-gta-v-ps4-occasion')
  })

  it('disponibilité : « immédiatement » exclut sur commande et épuisé', () => {
    const r = filterGames(allGames, { ...EMPTY_FILTERS, inStockOnly: true })
    expect(r.every((g) => g.availability === 'in_stock')).toBe(true)
    expect(r.length).toBeLessThan(allGames.length)
  })

  it('combine plusieurs filtres et renvoie une liste vide quand rien ne correspond', () => {
    expect(filterGames(allGames, { ...EMPTY_FILTERS, platform: 'PS4', condition: 'neuf', query: 'spider-man' })).toEqual([])
  })

  it('sans filtre : tous les jeux', () => {
    expect(filterGames(allGames, EMPTY_FILTERS)).toHaveLength(allGames.length)
  })
})

describe('filtres de consoles', () => {
  it('par génération et par variante', () => {
    const ps4 = filterConsoles(consoles, { ...EMPTY_FILTERS, generation: 'PS4' })
    expect(ps4.every((c) => c.generation === 'PS4')).toBe(true)
    const slim = filterConsoles(consoles, { ...EMPTY_FILTERS, variant: 'Slim' })
    expect(slim.map((c) => c.id)).toEqual(['console-ps4-slim-occasion'])
  })

  it('les variantes proposées dépendent de la génération', () => {
    const ps4 = consoleVariants(consoles, 'PS4')
    const ps5 = consoleVariants(consoles, 'PS5')
    expect(ps4).toContain('Pro')
    expect(ps5).not.toContain('Pro')
    expect(consoleVariants(consoles).length).toBe(new Set([...ps4, ...ps5]).size)
  })

  it('budget : plafond de prix', () => {
    const r = filterConsoles(consoles, { ...EMPTY_FILTERS, maxPrice: 150000 })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((c) => c.price <= 150000)).toBe(true)
  })

  it('état neuf / occasion', () => {
    expect(filterConsoles(consoles, { ...EMPTY_FILTERS, condition: 'neuf' }).every((c) => c.condition === 'neuf')).toBe(true)
  })
})

describe('filtres d’appareils', () => {
  it('par type d’appareil', () => {
    const phones = filterDevices(devices, { ...EMPTY_FILTERS, deviceType: 'telephone' })
    expect(phones.length).toBeGreaterThan(0)
    expect(phones.every((d) => d.deviceType === 'telephone')).toBe(true)
  })
})

describe('paramètres d’URL', () => {
  it('lit des filtres valides et ignore les valeurs invalides', () => {
    const f = readCommonFilters(new URLSearchParams('q=ps5&etat=neuf&min=10%20000&max=abc&dispo=1&tri=price-asc'))
    expect(f).toEqual({ query: 'ps5', condition: 'neuf', minPrice: 10000, maxPrice: undefined, inStockOnly: true, sort: 'price-asc' })
    const bad = readCommonFilters(new URLSearchParams('etat=cassé&tri=nimportequoi&min=-5'))
    expect(bad.condition).toBeUndefined()
    expect(bad.sort).toBe('recent')
    expect(bad.minPrice).toBeUndefined()
  })

  it('parseAmount et parseSort sont tolérants', () => {
    expect(parseAmount('  ')).toBeUndefined()
    expect(parseAmount(null)).toBeUndefined()
    expect(parseAmount('12 500')).toBe(12500)
    expect(parseSort(null)).toBe('recent')
  })

  it('withParam ajoute, remplace et retire sans modifier l’original', () => {
    const base = new URLSearchParams('q=ps5&etat=neuf')
    expect(withParam(base, 'etat', 'occasion').toString()).toBe('q=ps5&etat=occasion')
    expect(withParam(base, 'etat', '').toString()).toBe('q=ps5')
    expect(withParam(base, 'tri', 'name').get('tri')).toBe('name')
    expect(base.toString()).toBe('q=ps5&etat=neuf')
  })

  it('compte les filtres actifs pour le bouton « Réinitialiser »', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0)
    expect(countActiveFilters({ ...EMPTY_FILTERS, query: 'ps5', condition: 'neuf', inStockOnly: true }, ['PS5'])).toBe(4)
  })
})
