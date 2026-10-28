import { Link } from 'react-router-dom'
import { productPath } from '../data/products'
import { AVAILABILITY_LABEL, CONDITION_LABEL, formatPrice, productKindLabel } from '../lib/format'
import type { Availability, Product } from '../types/catalog'
import { OrderButton } from './OrderButton'
import { ProductImage } from './ProductImage'

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  return (
    <span className={`badge badge--${availability}`}>
      <span className="badge__mark" aria-hidden="true" />
      {AVAILABILITY_LABEL[availability]}
    </span>
  )
}

/** Plateforme / génération du produit, si elle existe. */
export function platformOf(product: Product): string | undefined {
  if (product.kind === 'console') return product.generation
  if (product.kind === 'game-physical' || product.kind === 'game-digital') return product.platform
  return undefined
}

export function conditionOf(product: Product): string | undefined {
  return 'condition' in product ? CONDITION_LABEL[product.condition] : undefined
}

function metaLine(product: Product): string {
  switch (product.kind) {
    case 'console':
      return [product.variant, product.storage].filter(Boolean).join(' · ')
    case 'game-physical':
      return 'Jeu sur disque'
    case 'game-digital':
      return product.digitalType === 'compte' ? 'Compte de jeux — conditions sur la fiche' : 'Code numérique à activer'
    case 'device':
      return product.specs
        .slice(0, 2)
        .map((s) => s.value)
        .join(' · ')
  }
}

interface Props {
  product: Product
  headingLevel?: 2 | 3
  priorityImage?: boolean
}

export function ProductCard({ product, headingLevel = 3, priorityImage = false }: Props) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3'
  const platform = platformOf(product)
  const condition = conditionOf(product)
  const to = productPath(product)

  return (
    <article className="card" data-kind={product.kind} data-testid="product-card" data-product-id={product.id}>
      <Link to={to} className="card__media" tabIndex={-1} aria-hidden="true">
        <ProductImage product={product} priority={priorityImage} />
      </Link>
      <div className="card__body">
        <div className="card__chips">
          {platform && <span className="chip chip--platform">{platform}</span>}
          {condition && <span className="chip">{condition}</span>}
          {!platform && !condition && <span className="chip">{productKindLabel(product)}</span>}
          <AvailabilityBadge availability={product.availability} />
        </div>
        <Heading className="card__title">
          <Link to={to}>{product.name}</Link>
        </Heading>
        <p className="card__meta">{metaLine(product)}</p>
        <p className="card__price">
          <span className="nowrap">{formatPrice(product.price)}</span>
        </p>
        <OrderButton product={product} />
      </div>
    </article>
  )
}
