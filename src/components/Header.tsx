import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SITE } from '../config/site'
import { buildContactMessage, buildWhatsAppUrl } from '../lib/whatsapp'
import { CloseIcon, MenuIcon, SearchIcon, WhatsAppIcon } from './Icons'
import { Logo } from './Logo'

interface NavItem {
  label: string
  to: string
  isActive: (pathname: string) => boolean
}

const NAV: NavItem[] = [
  { label: 'Accueil', to: '/', isActive: (p) => p === '/' },
  { label: 'Jeux vidéo', to: '/jeux', isActive: (p) => p.startsWith('/jeux') },
  { label: 'Consoles', to: '/consoles', isActive: (p) => p.startsWith('/consoles') },
  {
    label: 'Achat / Vente',
    to: '/appareils',
    isActive: (p) => p.startsWith('/appareils') || p.startsWith('/vendre-mon-appareil'),
  },
  { label: 'Contact', to: '/contact', isActive: (p) => p.startsWith('/contact') },
]

const SEARCH_SUGGESTIONS = ['PS5', 'PS4 Pro', 'EA SPORTS FC', 'Manette', 'Ordinateur portable', 'Téléphone']

export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const headerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Le menu et la recherche se referment à chaque navigation : ils ne restent jamais bloqués ouverts.
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen && !searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setSearchOpen(false)
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setSearchOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menuOpen, searchOpen])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      searchInputRef.current?.focus()
      return
    }
    setSearchOpen(false)
    navigate(`/recherche?q=${encodeURIComponent(q)}`)
  }

  const whatsappHref = buildWhatsAppUrl(buildContactMessage())

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container site-header__bar">
        <Logo />

        <nav className="site-nav" aria-label="Navigation principale">
          <ul>
            {NAV.map((item) => {
              const active = item.isActive(pathname)
              return (
                <li key={item.to}>
                  <Link to={item.to} className={active ? 'is-active' : undefined} aria-current={active ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Rechercher un produit"
            aria-expanded={searchOpen}
            aria-controls="search-panel"
            onClick={() => {
              setSearchOpen((v) => !v)
              setMenuOpen(false)
            }}
          >
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </button>

          <a
            className="btn btn--wa btn--sm header-wa"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Écrire à ${SITE.name} sur WhatsApp (s’ouvre dans un nouvel onglet)`}
          >
            <WhatsAppIcon size={20} />
            <span className="header-wa__label">WhatsApp</span>
          </a>

          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => {
              setMenuOpen((v) => !v)
              setSearchOpen(false)
            }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div id="search-panel" className="header-panel" hidden={!searchOpen}>
        <div className="container">
          <form className="search-form" role="search" onSubmit={submitSearch}>
            <label htmlFor="header-search" className="sr-only">
              Rechercher un jeu, une console ou un appareil
            </label>
            <input
              id="header-search"
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un jeu, une console, un appareil…"
              autoComplete="off"
              enterKeyHint="search"
            />
            <button type="submit" className="btn btn--primary">
              Rechercher
            </button>
          </form>
          <ul className="suggestions" aria-label="Recherches suggérées">
            {SEARCH_SUGGESTIONS.map((s) => (
              <li key={s}>
                <Link to={`/recherche?q=${encodeURIComponent(s)}`} className="chip chip--link">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="mobile-menu" className="header-panel mobile-menu" hidden={!menuOpen}>
        <nav className="container" aria-label="Navigation mobile">
          <ul>
            {NAV.map((item) => {
              const active = item.isActive(pathname)
              return (
                <li key={item.to}>
                  <Link to={item.to} className={active ? 'is-active' : undefined} aria-current={active ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <Link to="/vendre-mon-appareil" className="btn btn--primary btn--block mobile-menu__cta">
            Vendre mon appareil
          </Link>
        </nav>
      </div>
    </header>
  )
}
