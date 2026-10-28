import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE } from '../config/site'
import { buildContactMessage, buildWhatsAppUrl } from '../lib/whatsapp'
import { WhatsAppIcon } from './Icons'

/** Zone (px) occupée par le bouton flottant dans le coin bas-droit, marges comprises. */
const FLOAT_ZONE = 88

/**
 * Bouton WhatsApp flottant, présent sur toutes les pages (bas à droite, zones de sécurité respectées).
 *
 * Pour ne jamais masquer une action importante, il s'efface uniquement quand un élément portant
 * l'attribut `data-hide-wa` (boutons d'envoi, de commande, de contact, récapitulatif du formulaire)
 * passe réellement SOUS le bouton : l'observateur ne surveille que le coin bas-droit de l'écran.
 */
export function WhatsAppFloat() {
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHidden(false)
    if (typeof IntersectionObserver === 'undefined') return

    let observer: IntersectionObserver | undefined
    let raf = 0

    const start = () => {
      observer?.disconnect()
      const visible = new Set<Element>()
      // rootMargin négatif : la « fenêtre » observée se réduit au coin bas-droit (là où se trouve le bouton).
      const top = Math.max(0, window.innerHeight - FLOAT_ZONE)
      const left = Math.max(0, window.innerWidth - FLOAT_ZONE)
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target)
            else visible.delete(entry.target)
          }
          setHidden(visible.size > 0)
        },
        { rootMargin: `-${top}px 0px 0px -${left}px` },
      )
      document.querySelectorAll('[data-hide-wa]').forEach((el) => observer?.observe(el))
    }

    // La route vient d'être rendue : on observe à l'image suivante.
    raf = requestAnimationFrame(start)

    // Les zones créées après coup (récapitulatif du formulaire, erreurs…) sont prises en compte.
    const mutation = new MutationObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(start)
    })
    mutation.observe(document.getElementById('contenu') ?? document.body, { childList: true, subtree: true })

    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(start, 150)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      observer?.disconnect()
      mutation.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [pathname])

  return (
    // Repère « complémentaire » : le bouton fait partie d'une région de la page (navigation par repères).
    <aside aria-label="Contact WhatsApp">
      <a
        className={`wa-float${hidden ? ' wa-float--hidden' : ''}`}
        href={buildWhatsAppUrl(buildContactMessage())}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Écrire à ${SITE.name} sur WhatsApp (s’ouvre dans un nouvel onglet)`}
        tabIndex={hidden ? -1 : undefined}
        aria-hidden={hidden ? true : undefined}
        data-testid="wa-float"
      >
        <WhatsAppIcon size={30} />
      </a>
    </aside>
  )
}
