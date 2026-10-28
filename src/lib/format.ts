import { SITE } from '../config/site'
import type { Availability, Condition, DeviceType, Product } from '../types/catalog'

/** 445000 -> « 445 000 FCFA » (espace simple : sûr dans un message WhatsApp). */
export function formatPrice(amount: number): string {
  const rounded = Math.round(amount)
  const grouped = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${rounded < 0 ? '-' : ''}${grouped} ${SITE.currency}`
}

export const CONDITION_LABEL: Record<Condition, string> = {
  neuf: 'Neuf',
  occasion: 'Occasion',
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  in_stock: 'En stock',
  on_request: 'Sur commande',
  out_of_stock: 'Épuisé',
}

export const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  ordinateur: 'Ordinateur',
  telephone: 'Téléphone',
  console: 'Console',
}

export function productKindLabel(product: Product): string {
  switch (product.kind) {
    case 'console':
      return 'Console'
    case 'game-physical':
      return 'Jeu sur disque'
    case 'game-digital':
      return product.digitalType === 'compte' ? 'Compte de jeux' : 'Jeu numérique (code)'
    case 'device':
      return DEVICE_TYPE_LABEL[product.deviceType]
  }
}

/** Retire les accents et la casse : « Édition » et « edition » se valent dans la recherche. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
