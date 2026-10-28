import { Link } from 'react-router-dom'
import { EmptyState, PageHeader } from '../components/Common'
import { pluralResults } from '../components/FilterControls'
import { ProductCard } from '../components/ProductCard'
import { allProducts } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'
import { useUrlParams } from '../hooks/useUrlParams'
import { searchProducts, sortProducts } from '../lib/catalog'
import { buildWhatsAppUrl } from '../lib/whatsapp'

export function SearchPage() {
  const { params } = useUrlParams()
  const query = (params.get('q') ?? '').slice(0, 80).trim()

  usePageMeta(query ? `Recherche : ${query}` : 'Recherche', 'Recherchez un jeu, une console ou un appareil chez PIXEL PLAY.', '/recherche')

  const results = query ? sortProducts(searchProducts(allProducts, query), 'recent') : []

  return (
    <>
      <PageHeader
        title={query ? `Résultats pour « ${query} »` : 'Recherche'}
        intro={query ? undefined : 'Saisissez un nom de jeu, de console ou d’appareil dans la barre de recherche.'}
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Recherche' }]}
      />
      <div className="container catalog">
        {query && (
          <p className="search-count" role="status" aria-live="polite">
            {pluralResults(results.length)}
          </p>
        )}

        {results.length > 0 ? (
          <ul className="grid grid--games" aria-label="Résultats de recherche">
            {results.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} headingLevel={2} />
              </li>
            ))}
          </ul>
        ) : query ? (
          <EmptyState title={`Aucun produit ne correspond à « ${query} ».`}>
            Vérifiez l’orthographe ou essayez un mot plus court. Vous ne trouvez pas ce que vous cherchez ?{' '}
            <a
              href={buildWhatsAppUrl(`Bonjour PIXEL PLAY,\n\nJe cherche : ${query.replace(/\s+/g, ' ')}\n\nPouvez-vous me dire si c’est disponible ?`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Demandez-le sur WhatsApp
              <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
            </a>
            .
          </EmptyState>
        ) : (
          <EmptyState title="Que cherchez-vous ?">
            Parcourez plutôt <Link to="/jeux">les jeux</Link>, <Link to="/consoles">les consoles</Link> ou{' '}
            <Link to="/appareils">les appareils</Link>.
          </EmptyState>
        )}
      </div>
    </>
  )
}
