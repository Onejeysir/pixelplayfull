import { useState } from 'react'
import type { Product } from '../types/catalog'
import { Illustration, type IllustrationKind } from './Illustration'

export function illustrationFor(product: Product): IllustrationKind {
  switch (product.kind) {
    case 'console':
      return product.generation === 'PS5' ? 'console-tall' : 'console-flat'
    case 'game-physical':
      return 'disc'
    case 'game-digital':
      return 'digital'
    case 'device':
      if (product.deviceType === 'ordinateur') return 'laptop'
      if (product.deviceType === 'telephone') return 'phone'
      return 'console-flat'
  }
}

interface Props {
  product: Product
  /** Image au-dessus de la ligne de flottaison : chargée immédiatement. */
  priority?: boolean
  /** Affiche la mention « visuel provisoire » quand aucune photo n'est disponible. */
  showPlaceholderNote?: boolean
}

/**
 * Photo du produit si elle existe et se charge, sinon illustration provisoire propre.
 * Une image absente ou cassée ne produit jamais d'icône d'erreur du navigateur.
 */
export function ProductImage({ product, priority = false, showPlaceholderNote = false }: Props) {
  const [failed, setFailed] = useState(false)
  const hasPhoto = Boolean(product.image) && !failed

  return (
    <div className={`product-image${hasPhoto ? '' : ' product-image--placeholder'}`} data-kind={product.kind}>
      {hasPhoto ? (
        <img
          src={product.image}
          alt={product.imageAlt ?? product.name}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width={640}
          height={480}
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          <Illustration kind={illustrationFor(product)} label={`${product.name} (visuel provisoire)`} />
          {showPlaceholderNote && <span className="product-image__note">Photo à venir</span>}
        </>
      )}
    </div>
  )
}
