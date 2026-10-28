export interface PhotoRules {
  maxCount: number
  maxSizeMB: number
  allowedTypes: readonly string[]
  allowedLabel: string
}

export interface PhotoCheck {
  accepted: File[]
  errors: string[]
}

const EXTENSION_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

/** Certains navigateurs laissent `file.type` vide : on se rabat alors sur l'extension. */
function detectType(file: File): string {
  if (file.type) return file.type.toLowerCase()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_TYPES[ext] ?? ''
}

const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified

export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

/**
 * Contrôle les nouvelles photos avant de les ajouter à la sélection.
 * Les fichiers valides sont acceptés même si d'autres sont refusés : l'utilisateur ne perd rien.
 */
export function validateNewPhotos(existing: File[], incoming: File[], rules: PhotoRules): PhotoCheck {
  const accepted: File[] = []
  const errors: string[] = []
  const maxBytes = rules.maxSizeMB * 1024 * 1024
  const refusedForCount: string[] = []

  for (const file of incoming) {
    if (!rules.allowedTypes.includes(detectType(file))) {
      errors.push(`« ${file.name} » n’est pas accepté : formats autorisés ${rules.allowedLabel}.`)
      continue
    }
    if (file.size === 0) {
      errors.push(`« ${file.name} » est vide.`)
      continue
    }
    if (file.size > maxBytes) {
      errors.push(
        `« ${file.name} » fait ${formatMegabytes(file.size)} : la limite est de ${rules.maxSizeMB} Mo par photo.`,
      )
      continue
    }
    if ([...existing, ...accepted].some((f) => sameFile(f, file))) {
      errors.push(`« ${file.name} » est déjà dans la sélection.`)
      continue
    }
    if (existing.length + accepted.length >= rules.maxCount) {
      refusedForCount.push(file.name)
      continue
    }
    accepted.push(file)
  }

  if (refusedForCount.length > 0) {
    errors.push(
      `Maximum ${rules.maxCount} photos : ${refusedForCount.map((n) => `« ${n} »`).join(', ')} n’a pas été ajoutée.`,
    )
  }
  return { accepted, errors }
}
