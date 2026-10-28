import { useParams } from 'react-router-dom'
import { BackLink, Breadcrumb, DemoNotice, type Crumb } from '../components/Common'
import { AvailabilityBadge, conditionOf, platformOf, ProductCard } from '../components/ProductCard'
import { OrderButton } from '../components/OrderButton'
import { ProductImage } from '../components/ProductImage'
import { allProducts, findProduct } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatPrice, productKindLabel } from '../lib/format'
import type { Product } from '../types/catalog'
import { NotFoundPage } from './NotFoundPage'

function listFor(product: Product): { label: string; to: string } {
  switch (product.kind) {
    case 'console':
      return { label: 'Consoles', to: '/consoles' }
    case 'game-physical':
      return { label: 'Jeux sur disque', to: '/jeux/physiques' }
    case 'game-digital':
      return { label: 'Jeux numériques', to: '/jeux/numeriques' }
    case 'device':
      return { label: 'Achat / Vente', to: '/appareils#acheter' }
  }
}

function specsFor(product: Product): { label: string; value: string }[] {
  switch (product.kind) {
    case 'console':
      return [
        { label: 'Génération', value: product.generation === 'PS5' ? 'PlayStation 5' : 'PlayStation 4' },
        { label: 'Variante', value: product.variant },
        ...(product.storage ? [{ label: 'Stockage', value: product.storage }] : []),
        { label: 'État', value: conditionOf(product) ?? '' },
        ...(product.accessories?.length ? [{ label: 'Accessoires inclus', value: product.accessories.join(', ') }] : []),
        ...(product.warranty ? [{ label: 'Garantie', value: product.warranty }] : []),
      ]
    case 'game-physical':
      return [
        { label: 'Plateforme', value: product.platform },
        { label: 'Support', value: 'Disque' },
        { label: 'État', value: conditionOf(product) ?? '' },
      ]
    case 'game-digital':
      return [
        { label: 'Plateforme', value: product.platform },
        { label: 'Type', value: product.digitalType === 'compte' ? 'Compte de jeux' : 'Code de jeu à activer' },
        { label: 'Support', value: 'Numérique (aucun disque)' },
      ]
    case 'device':
      return [
        { label: 'Catégorie', value: productKindLabel(product) },
        { label: 'Marque', value: product.brand },
        { label: 'Modèle', value: product.model },
        { label: 'État', value: conditionOf(product) ?? '' },
        ...product.specs,
        ...(product.accessories?.length ? [{ label: 'Accessoires inclus', value: product.accessories.join(', ') }] : []),
        ...(product.warranty ? [{ label: 'Garantie', value: product.warranty }] : []),
      ]
  }
}

function related(product: Product): Product[] {
  return allProducts
    .filter((p) => p.id !== product.id && p.kind === product.kind && p.availability !== 'out_of_stock')
    .sort((a, b) => {
      // Même plateforme / génération d'abord, puis le plus récent.
      const samePlatform = Number(platformOf(b) === platformOf(product)) - Number(platformOf(a) === platformOf(product))
      return samePlatform || b.addedAt.localeCompare(a.addedAt)
    })
    .slice(0, 3)
}

export function ProductPage() {
  const { id = '' } = useParams()
  const product = findProduct(id)

  usePageMeta(
    product ? product.name : 'Produit introuvable',
    product
      ? `${product.name} — ${formatPrice(product.price)}. ${product.description} Commande par WhatsApp chez PIXEL PLAY, Douala.`
      : 'Ce produit n’existe pas ou n’est plus au catalogue.',
    product ? `/produit/${product.id}` : undefined,
  )

  if (!product) return <NotFoundPage product />

  const list = listFor(product)
  const crumbs: Crumb[] = [{ label: 'Accueil', to: '/' }, { label: list.label, to: list.to }, { label: product.name }]
  const platform = platformOf(product)
  const specs = specsFor(product).filter((s) => s.value)
  const similar = related(product)
  const isAccount = product.kind === 'game-digital' && product.digitalType === 'compte'

  return (
    <div className="container product-page">
      <Breadcrumb items={crumbs} />

      <div className="product">
        <div className="product__media">
          <ProductImage product={product} priority showPlaceholderNote />
        </div>

        <div className="product__info">
          <div className="card__chips">
            {platform && <span className="chip chip--platform">{platform}</span>}
            {conditionOf(product) && <span className="chip">{conditionOf(product)}</span>}
            <span className="chip">{productKindLabel(product)}</span>
            <AvailabilityBadge availability={product.availability} />
          </div>

          <h1 className="product__title">{product.name}</h1>
          <p className="product__price">
            <span className="nowrap">{formatPrice(product.price)}</span>
          </p>
          <p className="product__note">Prix affiché à titre indicatif : le prix actuel est confirmé sur WhatsApp.</p>
          <p className="product__desc">{product.description}</p>

          <div className="product__order" data-hide-wa>
            <OrderButton product={product} large />
            <p className="product__order-note">
              Aucun paiement en ligne : la commande se poursuit dans WhatsApp, avec votre message déjà rédigé.
            </p>
          </div>

          <DemoNotice />
        </div>
      </div>

      <div className="product__details">
        <section aria-labelledby="specs-title">
          <h2 id="specs-title">Caractéristiques</h2>
          <dl className="spec-list">
            {specs.map((s) => (
              <div key={`${s.label}-${s.value}`} className="spec-list__row">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {product.kind === 'game-digital' && (
          <section aria-labelledby="conditions-title" className={isAccount ? 'conditions conditions--account' : 'conditions'}>
            <h2 id="conditions-title">{isAccount ? 'Conditions de vente du compte de jeux' : 'Conditions de vente'}</h2>
            <ul>
              {product.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {similar.length > 0 && (
        <section className="related" aria-labelledby="related-title">
          <h2 id="related-title">Dans la même catégorie</h2>
          <ul className="grid grid--home">
            {similar.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="product__back">
        <BackLink to={list.to}>Retour : {list.label}</BackLink>
      </p>
    </div>
  )
}
