/**
 * Configuration centrale de PIXEL PLAY.
 * Toutes les informations de contact et les paramètres commerciaux sont ici :
 * c'est le seul fichier à modifier si le numéro, l'adresse ou les limites changent.
 */

const env = import.meta.env

function envNumber(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export const SITE = {
  name: 'PIXEL PLAY',
  shortDescription:
    'Jeux vidéo, consoles PlayStation 4 et 5, achat et vente d’appareils électroniques à Douala.',
  /** URL publique (optionnelle), utilisée pour le lien canonique. */
  url: ((env.VITE_SITE_URL as string | undefined) ?? '').replace(/\/$/, ''),

  address: {
    line1: 'Bonamoussadi, face Petit Terrain',
    city: 'Douala',
    country: 'Cameroun',
  },

  phone: {
    /** Affichage lisible. */
    display: '+237 697 69 25 98',
    /** Lien tel: (format international sans espaces). */
    tel: '+237697692598',
    /** Format wa.me : indicatif + numéro, sans « + » ni espaces. */
    whatsappDigits: '237697692598',
  },

  currency: 'FCFA',

  /** Limites du formulaire « Vendre mon appareil » (modifiables via .env). */
  photos: {
    maxCount: envNumber(env.VITE_MAX_PHOTOS as string | undefined, 6),
    maxSizeMB: envNumber(env.VITE_MAX_PHOTO_MB as string | undefined, 5),
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    allowedLabel: 'JPEG, PNG ou WebP',
  },

  /**
   * Tant que les produits, prix et stocks de src/data/ sont des exemples,
   * un bandeau l'indique clairement aux visiteurs. Passez VITE_SHOW_DEMO_NOTICE=false
   * dans .env une fois les vraies données saisies.
   */
  showDemoNotice: (env.VITE_SHOW_DEMO_NOTICE as string | undefined) !== 'false',
} as const

export const ADDRESS_ONE_LINE = `${SITE.address.line1}, ${SITE.address.city}, ${SITE.address.country}`

/** Lien de recherche cartographique : aucune coordonnée GPS inventée. */
export const MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_ONE_LINE)}`

export const PHONE_HREF = `tel:${SITE.phone.tel}`
