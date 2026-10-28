import {
  CATEGORY_ORDER,
  getVisibleFields,
  type DeviceCategory,
  type FormValues,
} from '../data/sellFormSpec'
import { checkPhone } from './phone'

export interface ValidationResult {
  valid: boolean
  /** Clé du champ -> message d'erreur. Les clés spéciales : « category » et « consent ». */
  errors: Record<string, string>
}

const MAX_PRICE = 100_000_000

export function isDeviceCategory(value: string): value is DeviceCategory {
  return (CATEGORY_ORDER as string[]).includes(value)
}

/** « 150 000 » ou « 150000 » -> 150000. Renvoie undefined si ce n'est pas un montant entier valide. */
export function parsePrice(raw: string): number | undefined {
  const compact = raw.replace(/[\s  ]/g, '')
  if (!/^\d+$/.test(compact)) return undefined
  const n = Number(compact)
  return n > 0 && n <= MAX_PRICE ? n : undefined
}

/**
 * Valide le formulaire de vente. Seuls les champs visibles pour la catégorie choisie sont contrôlés.
 * Aucune fonction ici ne touche au DOM : tout est testable.
 */
export function validateSellForm(
  category: DeviceCategory | '',
  values: FormValues,
  consent: boolean,
): ValidationResult {
  const errors: Record<string, string> = {}

  if (!category) {
    errors.category = 'Choisissez le type d’appareil que vous souhaitez proposer.'
    return { valid: false, errors }
  }

  for (const field of getVisibleFields(category, values)) {
    const value = (values[field.key] ?? '').trim()

    if (field.kind === 'checkbox') continue

    if (!value) {
      if (field.required) errors[field.key] = 'Ce champ est obligatoire.'
      continue
    }

    if (field.maxLength && value.length > field.maxLength) {
      errors[field.key] = `${field.maxLength} caractères maximum.`
      continue
    }

    if (field.kind === 'select' && !field.options?.some((o) => o.value === value)) {
      errors[field.key] = 'Choisissez une valeur dans la liste.'
      continue
    }

    if (field.key === 'phone' && !checkPhone(value).valid) {
      errors.phone = 'Numéro invalide. Exemples : 6 97 69 25 98 ou +237 697 69 25 98.'
      continue
    }

    if (field.key === 'fullName' && (value.length < 2 || !/\p{L}/u.test(value))) {
      errors.fullName = 'Indiquez votre nom complet.'
      continue
    }

    if (field.key === 'desiredPrice' && parsePrice(value) === undefined) {
      errors.desiredPrice = 'Indiquez un montant en FCFA, en chiffres uniquement (ex. 150000).'
    }
  }

  if (!consent) {
    errors.consent = 'Cochez la case pour autoriser l’envoi de ces informations à PIXEL PLAY.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
