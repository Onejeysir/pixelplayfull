import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export function NotFoundPage({ product = false }: { product?: boolean }) {
  usePageMeta(
    product ? 'Produit introuvable' : 'Page introuvable',
    'La page demandée n’existe pas ou n’est plus disponible.',
  )

  return (
    <div className="container not-found">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="page-header__title">{product ? 'Ce produit n’est plus au catalogue' : 'Page introuvable'}</h1>
      <p>
        {product
          ? 'Il a peut-être été vendu ou retiré. Parcourez le catalogue, ou écrivez-nous sur WhatsApp : nous chercherons un produit équivalent.'
          : 'Le lien est peut-être erroné ou la page a été déplacée. Reprenez la navigation depuis l’une de ces pages.'}
      </p>
      <ul className="not-found__links">
        <li><Link className="btn btn--primary" to="/">Accueil</Link></li>
        <li><Link className="btn btn--outline" to="/jeux">Jeux vidéo</Link></li>
        <li><Link className="btn btn--outline" to="/consoles">Consoles</Link></li>
        <li><Link className="btn btn--outline" to="/appareils">Achat / Vente</Link></li>
      </ul>
    </div>
  )
}
