import { useEffect } from 'react'
import { SITE } from '../config/site'

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/** Titre, description et lien canonique propres à chaque page (SEO + onglets du navigateur). */
export function usePageMeta(title: string, description: string, path?: string) {
  useEffect(() => {
    const fullTitle = title === SITE.name ? title : `${title} — ${SITE.name}`
    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', description)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (SITE.url && path !== undefined) {
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = `${SITE.url}${path}`
    }
  }, [title, description, path])
}
