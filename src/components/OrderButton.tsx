import type { Product } from '../types/catalog'
import { buildProductOrderMessage, buildWhatsAppUrl } from '../lib/whatsapp'
import { WhatsAppIcon } from './Icons'

interface Props {
  product: Product
  /** Bouton pleine largeur, plus haut : fiche produit. */
  large?: boolean
  className?: string
}

/**
 * Bouton violet « Commander sur WhatsApp » avec symbole WhatsApp.
 * Le lien est calculé à partir des données du produit : il fonctionne aussi
 * avec le clic droit / « copier le lien » et sans JavaScript supplémentaire.
 */
export function OrderButton({ product, large = false, className = '' }: Props) {
  const soldOut = product.availability === 'out_of_stock'
  const href = buildWhatsAppUrl(buildProductOrderMessage(product))

  return (
    <a
      className={`btn btn--primary btn--block order-btn${large ? ' btn--lg' : ''}${soldOut ? ' order-btn--soldout' : ''} ${className}`.trim()}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="order-button"
      data-product-id={product.id}
    >
      <WhatsAppIcon size={large ? 24 : 20} className="order-btn__icon" />
      <span>{soldOut ? 'Être prévenu sur WhatsApp' : 'Commander sur WhatsApp'}</span>
      <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
    </a>
  )
}
