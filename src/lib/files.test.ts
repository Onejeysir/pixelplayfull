import { describe, expect, it } from 'vitest'
import { validateNewPhotos, type PhotoRules } from './files'

const rules: PhotoRules = {
  maxCount: 3,
  maxSizeMB: 1,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedLabel: 'JPEG, PNG ou WebP',
}

const MB = 1024 * 1024
function file(name: string, size: number, type: string, lastModified = 1): File {
  const f = new File(['x'], name, { type, lastModified })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

describe('validateNewPhotos', () => {
  it('accepte JPEG, PNG et WebP dans la limite de taille', () => {
    const r = validateNewPhotos([], [file('a.jpg', 100, 'image/jpeg'), file('b.png', 100, 'image/png'), file('c.webp', 100, 'image/webp')], rules)
    expect(r.accepted).toHaveLength(3)
    expect(r.errors).toEqual([])
  })

  it('refuse les formats non autorisés avec un message clair, sans perdre les fichiers valides', () => {
    const r = validateNewPhotos([], [file('doc.pdf', 100, 'application/pdf'), file('ok.jpg', 100, 'image/jpeg'), file('anim.gif', 100, 'image/gif')], rules)
    expect(r.accepted.map((f) => f.name)).toEqual(['ok.jpg'])
    expect(r.errors).toHaveLength(2)
    expect(r.errors[0]).toContain('doc.pdf')
    expect(r.errors[0]).toContain('JPEG, PNG ou WebP')
  })

  it('se rabat sur l’extension quand le navigateur ne donne pas de type', () => {
    const r = validateNewPhotos([], [file('photo.JPG', 100, ''), file('virus.exe', 100, '')], rules)
    expect(r.accepted.map((f) => f.name)).toEqual(['photo.JPG'])
    expect(r.errors).toHaveLength(1)
  })

  it('refuse un fichier trop lourd en indiquant sa taille et la limite', () => {
    const r = validateNewPhotos([], [file('gros.jpg', 3.5 * MB, 'image/jpeg')], rules)
    expect(r.accepted).toHaveLength(0)
    expect(r.errors[0]).toContain('3,5 Mo')
    expect(r.errors[0]).toContain('1 Mo')
  })

  it('accepte un fichier pile à la limite et refuse un fichier vide', () => {
    expect(validateNewPhotos([], [file('limite.jpg', 1 * MB, 'image/jpeg')], rules).accepted).toHaveLength(1)
    expect(validateNewPhotos([], [file('vide.jpg', 0, 'image/jpeg')], rules).errors).toHaveLength(1)
  })

  it('limite le nombre total de photos en conservant les premières', () => {
    const existing = [file('1.jpg', 10, 'image/jpeg', 1), file('2.jpg', 10, 'image/jpeg', 2)]
    const r = validateNewPhotos(existing, [file('3.jpg', 10, 'image/jpeg', 3), file('4.jpg', 10, 'image/jpeg', 4)], rules)
    expect(r.accepted.map((f) => f.name)).toEqual(['3.jpg'])
    expect(r.errors).toHaveLength(1)
    expect(r.errors[0]).toContain('Maximum 3 photos')
    expect(r.errors[0]).toContain('4.jpg')
  })

  it('ignore une photo déjà sélectionnée', () => {
    const a = file('a.jpg', 10, 'image/jpeg', 5)
    const r = validateNewPhotos([a], [file('a.jpg', 10, 'image/jpeg', 5)], rules)
    expect(r.accepted).toHaveLength(0)
    expect(r.errors[0]).toContain('déjà')
  })
})
