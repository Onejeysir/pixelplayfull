export interface PhoneCheck {
  valid: boolean
  /** Format international sans espaces, ex. +237697692598. */
  e164?: string
  /** Format lisible, ex. +237 6 97 69 25 98. */
  display?: string
}

const CAMEROON_NATIONAL = /^[26]\d{8}$/

function formatCameroon(national: string): PhoneCheck {
  return {
    valid: true,
    e164: `+237${national}`,
    display: `+237 ${national[0]} ${national.slice(1, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7, 9)}`,
  }
}

/**
 * Vérifie un numéro saisi à la main.
 * - Numéros camerounais : 9 chiffres commençant par 6 ou 2, avec ou sans +237 / 237 / 00237.
 * - Autres pays : saisie internationale (+ ou 00) de 8 à 15 chiffres.
 */
export function checkPhone(input: string): PhoneCheck {
  const cleaned = input.trim().replace(/[\s.\-()]/g, '')
  if (!/^\+?\d+$/.test(cleaned)) return { valid: false }

  let digits = cleaned.replace(/^\+/, '')
  let international = cleaned.startsWith('+')
  if (!international && digits.startsWith('00')) {
    digits = digits.slice(2)
    international = true
  }

  if (international) {
    if (digits.startsWith('237')) {
      const national = digits.slice(3)
      return CAMEROON_NATIONAL.test(national) ? formatCameroon(national) : { valid: false }
    }
    if (digits.length >= 8 && digits.length <= 15 && !digits.startsWith('0')) {
      return { valid: true, e164: `+${digits}`, display: `+${digits}` }
    }
    return { valid: false }
  }

  if (digits.startsWith('237') && digits.length === 12) {
    const national = digits.slice(3)
    return CAMEROON_NATIONAL.test(national) ? formatCameroon(national) : { valid: false }
  }
  if (digits.length === 9 && CAMEROON_NATIONAL.test(digits)) return formatCameroon(digits)

  return { valid: false }
}
