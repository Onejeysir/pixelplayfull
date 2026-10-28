import { describe, expect, it } from 'vitest'
import { checkPhone } from './phone'
import { isDeviceCategory, parsePrice, validateSellForm } from './validation'

const seller = { fullName: 'Marie Ngo', phone: '697692598', location: 'Douala', brand: 'Sony', model: 'PS5', condition: 'Bon état' }
const ps5 = { ...seller, generation: 'PlayStation 5', edition: 'Standard', discDrive: 'Fonctionne bien', controllersCount: '1' }

describe('validateSellForm', () => {
  it('refuse une soumission vide : il faut choisir une catégorie', () => {
    const r = validateSellForm('', {}, false)
    expect(r.valid).toBe(false)
    expect(r.errors.category).toBeTruthy()
  })

  it('refuse un formulaire vide pour une catégorie choisie et signale chaque champ obligatoire', () => {
    const r = validateSellForm('ordinateur', {}, false)
    expect(r.valid).toBe(false)
    for (const key of ['fullName', 'phone', 'location', 'brand', 'model', 'condition', 'computerType', 'cpu', 'ram', 'storageSize', 'storageType', 'consent']) {
      expect(r.errors[key], key).toBeTruthy()
    }
  })

  it('accepte un formulaire console complet avec consentement', () => {
    expect(validateSellForm('console', ps5, true)).toEqual({ valid: true, errors: {} })
  })

  it('exige le consentement d’envoi', () => {
    const r = validateSellForm('console', ps5, false)
    expect(r.valid).toBe(false)
    expect(Object.keys(r.errors)).toEqual(['consent'])
  })

  it('le numéro de série n’est jamais obligatoire', () => {
    expect(validateSellForm('console', ps5, true).errors.serial).toBeUndefined()
    expect(validateSellForm('telephone', { ...seller, storage: '64 Go', screenCondition: 'Parfait' }, true).valid).toBe(true)
  })

  it('le prix souhaité est facultatif mais doit être un montant valide s’il est saisi', () => {
    expect(validateSellForm('console', { ...ps5, desiredPrice: '' }, true).valid).toBe(true)
    expect(validateSellForm('console', { ...ps5, desiredPrice: '150 000' }, true).valid).toBe(true)
    expect(validateSellForm('console', { ...ps5, desiredPrice: 'abc' }, true).errors.desiredPrice).toBeTruthy()
    expect(validateSellForm('console', { ...ps5, desiredPrice: '0' }, true).errors.desiredPrice).toBeTruthy()
    expect(validateSellForm('console', { ...ps5, desiredPrice: '-5' }, true).errors.desiredPrice).toBeTruthy()
  })

  it('ignore les champs masqués : batterie (bureau), lecteur (Digital), état des manettes (0 manette)', () => {
    const desktop = { ...seller, computerType: 'Ordinateur de bureau', cpu: 'Ryzen 5', ram: '16 Go', storageSize: '512 Go', storageType: 'SSD' }
    expect(validateSellForm('ordinateur', desktop, true).valid).toBe(true)

    const digital = { ...ps5, edition: 'Digital (sans lecteur)', discDrive: '' }
    expect(validateSellForm('console', digital, true).valid).toBe(true)
    expect(validateSellForm('console', { ...ps5, discDrive: '' }, true).errors.discDrive).toBeTruthy()

    expect(validateSellForm('console', { ...ps5, controllersCount: '0', controllersCondition: '' }, true).valid).toBe(true)
  })

  it('refuse une valeur de liste qui n’existe pas', () => {
    expect(validateSellForm('console', { ...ps5, edition: 'Édition inventée' }, true).errors.edition).toBeTruthy()
  })

  it('refuse un nom vide, trop court ou sans lettre', () => {
    expect(validateSellForm('console', { ...ps5, fullName: ' ' }, true).errors.fullName).toBeTruthy()
    expect(validateSellForm('console', { ...ps5, fullName: 'A' }, true).errors.fullName).toBeTruthy()
    expect(validateSellForm('console', { ...ps5, fullName: '1234' }, true).errors.fullName).toBeTruthy()
  })

  it('refuse un champ trop long', () => {
    expect(validateSellForm('console', { ...ps5, brand: 'x'.repeat(41) }, true).errors.brand).toBeTruthy()
  })

  it('considère une saisie d’espaces comme vide', () => {
    expect(validateSellForm('console', { ...ps5, model: '   ' }, true).errors.model).toBeTruthy()
  })
})

describe('checkPhone', () => {
  it.each([
    ['697692598', '+237697692598'],
    ['6 97 69 25 98', '+237697692598'],
    ['+237 697 69 25 98', '+237697692598'],
    ['237697692598', '+237697692598'],
    ['00237697692598', '+237697692598'],
    ['(+237) 697-692-598', '+237697692598'],
    ['233123456', '+237233123456'], // fixe camerounais
  ])('accepte %s', (input, e164) => {
    const r = checkPhone(input)
    expect(r.valid).toBe(true)
    expect(r.e164).toBe(e164)
  })

  it('met en forme un numéro camerounais', () => {
    expect(checkPhone('697692598').display).toBe('+237 6 97 69 25 98')
  })

  it('accepte un numéro international valide', () => {
    expect(checkPhone('+33 6 12 34 56 78').valid).toBe(true)
    expect(checkPhone('+2348012345678').e164).toBe('+2348012345678')
  })

  it.each(['', '   ', 'abc', '12345', '797692598', '69769259', '6976925989', '+237 12345', '+0123456789', '69-76-92-5a-98'])(
    'refuse « %s »',
    (input) => {
      expect(checkPhone(input).valid).toBe(false)
    },
  )
})

describe('parsePrice', () => {
  it('lit les montants entiers avec ou sans séparateurs', () => {
    expect(parsePrice('150000')).toBe(150000)
    expect(parsePrice('150 000')).toBe(150000)
    expect(parsePrice('150 000')).toBe(150000)
  })
  it('refuse le reste', () => {
    for (const bad of ['', '0', '-1', '12,5', '1e5', 'abc', '999999999999']) expect(parsePrice(bad)).toBeUndefined()
  })
})

describe('isDeviceCategory', () => {
  it('ne reconnaît que les trois catégories prévues', () => {
    expect(isDeviceCategory('ordinateur')).toBe(true)
    expect(isDeviceCategory('telephone')).toBe(true)
    expect(isDeviceCategory('console')).toBe(true)
    expect(isDeviceCategory('voiture')).toBe(false)
    expect(isDeviceCategory('')).toBe(false)
  })
})
