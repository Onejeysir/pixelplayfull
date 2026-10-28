import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { consoles, devices, digitalGames, physicalGames } from '../data/products'
import { illustrationFor, ProductImage } from './ProductImage'

afterEach(cleanup)

describe('ProductImage : images manquantes', () => {
  it('sans photo : illustration provisoire propre, pas d’image cassée', () => {
    render(<ProductImage product={consoles[0]} />)
    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: /visuel provisoire/ })).toBeTruthy()
  })

  it('avec une photo : l’image s’affiche avec un texte alternatif et un chargement différé', () => {
    render(<ProductImage product={{ ...consoles[0], image: '/images/produits/ps5.webp' }} />)
    const img = document.querySelector('img')!
    expect(img.getAttribute('src')).toBe('/images/produits/ps5.webp')
    expect(img.getAttribute('alt')).toBe(consoles[0].name)
    expect(img.getAttribute('loading')).toBe('lazy')
  })

  it('image prioritaire (première visible) : chargement immédiat', () => {
    render(<ProductImage priority product={{ ...consoles[0], image: '/x.webp' }} />)
    expect(document.querySelector('img')!.getAttribute('loading')).toBe('eager')
  })

  it('photo introuvable (404) : bascule automatiquement sur l’illustration', () => {
    render(<ProductImage product={{ ...consoles[0], image: '/images/produits/inexistante.webp' }} />)
    fireEvent.error(document.querySelector('img')!)
    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: /visuel provisoire/ })).toBeTruthy()
  })

  it('chaque type de produit a une illustration adaptée', () => {
    expect(illustrationFor(consoles.find((c) => c.generation === 'PS5')!)).toBe('console-tall')
    expect(illustrationFor(consoles.find((c) => c.generation === 'PS4')!)).toBe('console-flat')
    expect(illustrationFor(physicalGames[0])).toBe('disc')
    expect(illustrationFor(digitalGames[0])).toBe('digital')
    expect(illustrationFor(devices.find((d) => d.deviceType === 'ordinateur')!)).toBe('laptop')
    expect(illustrationFor(devices.find((d) => d.deviceType === 'telephone')!)).toBe('phone')
  })
})
