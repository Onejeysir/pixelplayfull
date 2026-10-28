import { Link, useLocation } from 'react-router-dom'
import { DemoNotice, EmptyState, PageHeader } from '../components/Common'
import {
  AmountField,
  CheckField,
  CONDITION_FILTER_OPTIONS,
  FilterShell,
  pluralResults,
  SelectField,
  SORT_OPTIONS,
} from '../components/FilterControls'
import { InfoIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { allGames, digitalGames, physicalGames } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'
import { useUrlParams } from '../hooks/useUrlParams'
import { countActiveFilters, filterGames, parsePlatform, readCommonFilters, type GameFilters } from '../lib/catalog'

export type GamesKind = 'all' | 'digital' | 'physical'

const COPY: Record<GamesKind, { title: string; intro: string; meta: string; path: string }> = {
  all: {
    title: 'Jeux vidéo',
    intro: 'Jeux PS4 et PS5 sur disque ou en version numérique. Choisissez, puis commandez sur WhatsApp.',
    meta: 'Jeux vidéo PS4 et PS5 à Douala : jeux sur disque neufs et d’occasion, jeux numériques. Commande par WhatsApp.',
    path: '/jeux',
  },
  digital: {
    title: 'Jeux numériques',
    intro: 'Codes de jeux et comptes de jeux pour PS4 et PS5, sans disque ni boîte.',
    meta: 'Jeux numériques PS4 et PS5 : codes et comptes de jeux, conditions de vente détaillées. Commande par WhatsApp.',
    path: '/jeux/numeriques',
  },
  physical: {
    title: 'Jeux sur disque',
    intro: 'CD et disques Blu-ray compatibles PS4 et PS5, neufs ou d’occasion.',
    meta: 'Jeux sur disque PS4 et PS5, neufs et d’occasion, à Douala. Commande par WhatsApp.',
    path: '/jeux/physiques',
  },
}

const PLATFORM_OPTIONS = [
  { value: '', label: 'PS4 et PS5' },
  { value: 'PS5', label: 'PS5' },
  { value: 'PS4', label: 'PS4' },
]

export function GamesPage({ kind }: { kind: GamesKind }) {
  const copy = COPY[kind]
  usePageMeta(copy.title, copy.meta, copy.path)

  const location = useLocation()
  const { params, set, reset } = useUrlParams()

  const base = kind === 'digital' ? digitalGames : kind === 'physical' ? physicalGames : allGames
  const showCondition = kind !== 'digital'
  const common = readCommonFilters(params)
  const platform = parsePlatform(params.get('plateforme'))
  const filters: GameFilters = {
    ...common,
    condition: showCondition ? common.condition : undefined,
    platform,
  }
  const results = filterGames(base, filters)
  const activeCount = countActiveFilters(filters, [platform])

  const tabs: { label: string; to: string; count: number; kind: GamesKind }[] = [
    { label: 'Tous les jeux', to: '/jeux', count: allGames.length, kind: 'all' },
    { label: 'Numériques', to: '/jeux/numeriques', count: digitalGames.length, kind: 'digital' },
    { label: 'Sur disque', to: '/jeux/physiques', count: physicalGames.length, kind: 'physical' },
  ]

  return (
    <>
      <PageHeader title={copy.title} intro={copy.intro} crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Jeux vidéo', to: kind === 'all' ? undefined : '/jeux' }, ...(kind === 'all' ? [] : [{ label: copy.title }])]} />

      <div className="container catalog">
        <DemoNotice />

        <nav className="tabs" aria-label="Catégories de jeux">
          <ul>
            {tabs.map((tab) => (
              <li key={tab.to}>
                <Link
                  to={{ pathname: tab.to, search: location.search }}
                  className={tab.kind === kind ? 'is-active' : undefined}
                  aria-current={tab.kind === kind ? 'page' : undefined}
                >
                  {tab.label} <span className="tabs__count">{tab.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {kind !== 'physical' && (
          <aside className="info-box" aria-label="Conditions des jeux numériques">
            <InfoIcon size={22} />
            <div>
              <p className="info-box__title">Jeux numériques : codes et comptes de jeux</p>
              <p>
                Ce sont des produits sans disque. Pour un compte de jeux, les restrictions, modalités d’accès et
                conditions de transfert autorisées sont précisées par PIXEL PLAY avant tout paiement, et la vente reste
                soumise aux règles de la plateforme concernée. Ne communiquez jamais le mot de passe de votre propre
                compte.
              </p>
            </div>
          </aside>
        )}

        <FilterShell
          query={common.query}
          onQuery={(v) => set('q', v)}
          searchLabel="Rechercher un jeu"
          searchPlaceholder="Rechercher un jeu…"
          activeCount={activeCount}
          resultsText={pluralResults(results.length)}
          onReset={() => reset()}
        >
          <SelectField
            label="Plateforme"
            value={platform ?? ''}
            onChange={(v) => set('plateforme', v)}
            options={PLATFORM_OPTIONS}
          />
          {showCondition && (
            <SelectField
              label="État"
              value={common.condition ?? ''}
              onChange={(v) => set('etat', v)}
              options={CONDITION_FILTER_OPTIONS}
              hint={
                kind === 'all' && common.condition
                  ? 'Les jeux numériques n’ont pas d’état neuf ou occasion : ils sont masqués.'
                  : undefined
              }
            />
          )}
          <AmountField label="Prix minimum" value={params.get('min') ?? ''} onChange={(v) => set('min', v.trim())} placeholder="0" />
          <AmountField label="Prix maximum" value={params.get('max') ?? ''} onChange={(v) => set('max', v.trim())} placeholder="Sans limite" />
          <SelectField label="Trier par" value={common.sort} onChange={(v) => set('tri', v === 'recent' ? '' : v)} options={SORT_OPTIONS} />
          <CheckField label="Disponibles immédiatement" checked={common.inStockOnly} onChange={(c) => set('dispo', c ? '1' : '')} />
        </FilterShell>

        {results.length > 0 ? (
          <ul className="grid grid--games" aria-label="Résultats">
            {results.map((game, i) => (
              <li key={game.id}>
                <ProductCard product={game} headingLevel={2} priorityImage={i < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Aucun jeu ne correspond à votre recherche." onReset={() => reset()}>
            Essayez un autre nom, élargissez la fourchette de prix ou retirez un filtre.
          </EmptyState>
        )}
      </div>
    </>
  )
}
