import { SITE } from '../config/site'
import {
  CATEGORY_META,
  deviceSpecs,
  getVisibleFields,
  optionLabel,
  type DeviceCategory,
  type FormValues,
} from '../data/sellFormSpec'
import type { Product } from '../types/catalog'
import { CONDITION_LABEL, DEVICE_TYPE_LABEL, formatPrice } from './format'
import { checkPhone } from './phone'
import { parsePrice } from './validation'

/** URL wa.me avec message encodé : https://wa.me/237697692598?text=… */
export function buildWhatsAppUrl(message: string, phoneDigits: string = SITE.phone.whatsappDigits): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`
}

/** Réduit une saisie libre à une seule ligne : empêche de simuler de fausses lignes dans le message. */
export function oneLine(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const GREETING = 'Bonjour PIXEL PLAY,'

export function buildContactMessage(): string {
  return `${GREETING}\n\nJ’aimerais avoir des informations sur vos produits et services.\n\nMerci.`
}

/** Message d'une commande (ou demande de disponibilité) pour un produit du catalogue. */
export function buildProductOrderMessage(product: Product): string {
  const price = `- Prix affiché : ${formatPrice(product.price)}`
  const ref = `- Référence : ${product.id}`
  const outOfStock = product.availability === 'out_of_stock'

  let intro: string
  let lines: string[]
  let outro: string

  switch (product.kind) {
    case 'console':
      intro = 'Je souhaite commander une console.'
      lines = [
        `- Produit : ${product.name}`,
        `- Variante : ${product.variant}`,
        `- État : ${CONDITION_LABEL[product.condition]}`,
        price,
        ref,
      ]
      outro = 'Merci de me confirmer la disponibilité, le prix actuel et les modalités de retrait ou de livraison.'
      break
    case 'game-physical':
      intro = 'Je souhaite commander un jeu vidéo.'
      lines = [
        `- Jeu : ${product.name}`,
        `- Plateforme : ${product.platform}`,
        '- Catégorie : Physique (disque)',
        `- État : ${CONDITION_LABEL[product.condition]}`,
        price,
        ref,
      ]
      outro = 'Merci de confirmer la disponibilité et les modalités de commande.'
      break
    case 'game-digital':
      intro = 'Je souhaite commander un jeu vidéo.'
      lines = [
        `- Jeu : ${product.name}`,
        `- Plateforme : ${product.platform}`,
        '- Catégorie : Numérique',
        `- Type : ${product.digitalType === 'compte' ? 'Compte de jeux' : 'Code de jeu'}`,
        price,
        ref,
      ]
      outro = 'Merci de confirmer la disponibilité et les modalités de commande.'
      break
    case 'device':
      intro = 'Je souhaite acheter un appareil disponible.'
      lines = [
        `- Appareil : ${product.name}`,
        `- Catégorie : ${DEVICE_TYPE_LABEL[product.deviceType]}`,
        `- État : ${CONDITION_LABEL[product.condition]}`,
        price,
        ref,
      ]
      outro = 'Merci de me confirmer la disponibilité, le prix actuel et les modalités de retrait ou de livraison.'
      break
  }

  if (outOfStock) {
    intro = 'Ce produit est indiqué épuisé sur votre site. Je souhaite être prévenu(e) de son retour en stock.'
    outro = 'Merci de me dire si un nouvel arrivage est prévu.'
  }

  return [GREETING, '', intro, '', ...lines, '', outro].join('\n')
}

export interface SellMessageInput {
  category: DeviceCategory
  values: FormValues
  photoCount: number
}

/** Message de demande d'estimation / rachat, construit à partir des champs réellement remplis. */
export function buildSellMessage({ category, values, photoCount }: SellMessageInput): string {
  const fields = getVisibleFields(category, values)
  const get = (key: string) => oneLine(values[key] ?? '')
  const known = (key: string, fallback: string) => get(key) || fallback

  const specKeys = new Set(deviceSpecs(category).map((f) => f.key))
  const specLines = fields
    .filter((f) => specKeys.has(f.key))
    .map((f) => ({ field: f, value: get(f.key) }))
    .filter(({ value }) => value !== '')
    .map(({ field, value }) => {
      const shown = field.kind === 'select' ? optionLabel(field, value) : value
      const label = field.label.replace(/\s*\((si [^)]*|facultatif)\)\s*$/i, '')
      return `  • ${label} : ${shown}`
    })

  const phone = checkPhone(get('phone'))
  const price = parsePrice(get('desiredPrice'))

  const identifierLine =
    category === 'telephone'
      ? `- Identifiant (IMEI / numéro de série) : ${
          values.identifierOnRequest === 'true' ? 'à fournir en message privé si nécessaire' : 'Non renseigné'
        }`
      : `- Numéro de série : ${known('serial', 'Non renseigné')}`

  const lines = [
    GREETING,
    '',
    'Je souhaite proposer un appareil pour estimation et éventuel rachat.',
    '',
    'INFORMATIONS DU VENDEUR',
    `- Nom : ${get('fullName')}`,
    `- Téléphone : ${phone.display ?? get('phone')}`,
    `- Localisation : ${get('location')}`,
    '',
    "INFORMATIONS DE L'APPAREIL",
    `- Catégorie : ${CATEGORY_META[category].label}`,
    `- Marque : ${get('brand')}`,
    `- Modèle : ${get('model')}`,
    `- État général : ${get('condition')}`,
    specLines.length > 0 ? '- Caractéristiques :' : '- Caractéristiques : Non renseignées',
    ...specLines,
    identifierLine,
    `- Prix souhaité : ${price !== undefined ? formatPrice(price) : 'Non renseigné'}`,
    `- Accessoires : ${known('accessories', 'Non renseigné')}`,
    `- Description : ${known('description', 'Non renseignée')}`,
    '',
    'PHOTOS',
    `- Nombre d'images sélectionnées : ${photoCount}`,
    photoCount > 0
      ? '- Les images seront jointes directement dans cette conversation WhatsApp.'
      : '- Aucune photo sélectionnée pour le moment : je peux en envoyer sur demande.',
    '',
    'Merci d’étudier ma proposition et de me communiquer une estimation.',
  ]
  return lines.join('\n')
}
