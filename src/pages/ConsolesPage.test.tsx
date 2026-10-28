import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { ConsolesPage } from './ConsolesPage'

function Where() {
  const { search } = useLocation()
  return <output data-testid="search">{search}</output>
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <ConsolesPage />
      <Where />
    </MemoryRouter>,
  )
}

const search = () => screen.getByTestId('search').textContent ?? ''
const titles = () => screen.queryAllByTestId('product-card').map((c) => c.querySelector('.card__title')?.textContent)

afterEach(cleanup)

describe('ConsolesPage : filtres', () => {
  it('affiche les sections PS5 puis PS4', () => {
    renderAt('/consoles')
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['PlayStation 5', 'PlayStation 4'])
  })

  it('changer de génération applique le filtre ET réinitialise la variante (une seule mise à jour d’URL)', () => {
    // Régression : deux appels consécutifs à setSearchParams(prev => …) s'écrasaient et la génération était perdue.
    renderAt('/consoles?variante=Pro')
    fireEvent.change(screen.getByLabelText('Génération', { selector: 'select' }), { target: { value: 'PS4' } })
    expect(search()).toContain('gen=PS4')
    expect(search()).not.toContain('variante=')
    expect(screen.queryByRole('heading', { level: 2, name: 'PlayStation 5' })).toBeNull()
    expect(titles().every((t) => t?.startsWith('PlayStation 4'))).toBe(true)
  })

  it('la liste des variantes suit la génération choisie', () => {
    renderAt('/consoles?gen=PS5')
    const select = screen.getByLabelText('Variante', { selector: 'select' }) as HTMLSelectElement
    const options = Array.from(select.options).map((o) => o.textContent)
    expect(options.some((o) => o?.includes('Digital'))).toBe(true)
    expect(options).not.toContain('Pro')
  })

  it('une variante qui n’existe pas pour la génération est ignorée (aucun résultat vide trompeur)', () => {
    renderAt('/consoles?gen=PS5&variante=Pro')
    expect(titles().length).toBeGreaterThan(0)
  })

  it('affiche l’état vide puis revient à tout avec « Réinitialiser les filtres »', () => {
    renderAt('/consoles?gen=PS4&etat=neuf')
    expect(screen.getByText('Aucune console ne correspond à votre recherche.')).toBeTruthy()
    fireEvent.click(screen.getAllByRole('button', { name: 'Réinitialiser les filtres' })[0])
    expect(search()).toBe('')
    expect(titles()).toHaveLength(7)
  })
})
