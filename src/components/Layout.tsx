import { useEffect } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { WhatsAppFloat } from './WhatsAppFloat'

/** Positions de défilement mémorisées par entrée d'historique : le bouton Retour retrouve sa place. */
const scrollPositions = new Map<string, number>()

function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    const key = location.key
    const onScroll = () => scrollPositions.set(key, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.key])

  useEffect(() => {
    if (navigationType === 'POP') {
      const saved = scrollPositions.get(location.key)
      window.scrollTo({ top: saved ?? 0, left: 0, behavior: 'auto' })
      return
    }

    // Ancre dans la page (ex. /appareils#acheter) : le navigateur gère le défilement.
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1))
      if (target) {
        target.scrollIntoView()
        return
      }
    }

    // Les filtres modifient seulement la query string : on ne remonte pas en haut dans ce cas.
    if (navigationType === 'REPLACE') return

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    // Le focus revient au contenu : les lecteurs d'écran annoncent la nouvelle page.
    document.getElementById('contenu')?.focus({ preventScroll: true })
  }, [location.key, location.hash, navigationType])

  return null
}

export function Layout() {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <ScrollManager />
    </>
  )
}
