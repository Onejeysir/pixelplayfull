import { DemoNotice, EmptyState, PageHeader } from '../components/Common'
import {
  CheckField,
  CONDITION_FILTER_OPTIONS,
  FilterShell,
  pluralResults,
  SelectField,
  SORT_OPTIONS,
} from '../components/FilterControls'
import { ProductCard } from '../components/ProductCard'
import { consoles } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'
import { useUrlParams } from '../hooks/useUrlParams'
import {
  consoleVariants,
  countActiveFilters,
  filterConsoles,
  parseAmount,
  parsePlatform,
  readCommonFilters,
  type ConsoleFilters,
} from '../lib/catalog'
import { formatPrice } from '../lib/format'
import type { ConsoleProduct, Platform } from '../types/catalog'

const BUDGETS = [100000, 150000, 250000, 350000, 450000, 600000]

const GENERATIONS: { id: Platform; title: string; anchor: string; intro: string }[] = [
  { id: 'PS5', title: 'PlayStation 5', anchor: 'ps5', intro: 'Standard, Digital Edition, Slim.' },
  { id: 'PS4', title: 'PlayStation 4', anchor: 'ps4', intro: 'Standard, Slim, Pro.' },
]

export function ConsolesPage() {
  usePageMeta(
    'Consoles PlayStation 4 et PlayStation 5',
    'Achetez une console PS4 (Standard, Slim, Pro) ou PS5 (Standard, Digital, Slim) neuve ou d’occasion à Douala. Commande par WhatsApp.',
    '/consoles',
  )

  const { params, set, setMany, reset } = useUrlParams()
  const common = readCommonFilters(params)
  const generation = parsePlatform(params.get('gen'))
  const variant = params.get('variante') ?? ''

  // Une variante qui n'existe plus pour la génération choisie est simplement ignorée.
  const variantOptions = consoleVariants(consoles, generation)
  const activeVariant = variantOptions.includes(variant) ? variant : undefined

  // Le budget est un plafond : il s'appuie sur le paramètre « max ».
  const filters: ConsoleFilters = { ...common, minPrice: undefined, generation, variant: activeVariant }
  const results = filterConsoles(consoles, filters)
  const activeCount = countActiveFilters({ ...filters, minPrice: undefined }, [generation, activeVariant])

  const byGeneration = (id: Platform): ConsoleProduct[] => results.filter((c) => c.generation === id)
  const visibleGroups = GENERATIONS.filter((g) => byGeneration(g.id).length > 0)

  const budget = parseAmount(params.get('max'))
  const budgetOptions = [
    { value: '', label: 'Tous les budgets' },
    ...BUDGETS.map((b) => ({ value: String(b), label: `Jusqu’à ${formatPrice(b)}` })),
    ...(budget !== undefined && !BUDGETS.includes(budget)
      ? [{ value: String(budget), label: `Jusqu’à ${formatPrice(budget)}` }]
      : []),
  ]

  return (
    <>
      <PageHeader
        title="Acheter une console"
        intro="PlayStation 4 et PlayStation 5, neuves ou d’occasion. Choisissez votre modèle, puis commandez sur WhatsApp."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Consoles' }]}
      >
        <ul className="jump-links" aria-label="Aller à une génération">
          {GENERATIONS.map((g) => (
            <li key={g.id}>
              <a href={`#${g.anchor}`} className="chip chip--link">
                {g.title} <span className="tabs__count">{consoles.filter((c) => c.generation === g.id).length}</span>
              </a>
            </li>
          ))}
        </ul>
      </PageHeader>

      <div className="container catalog">
        <DemoNotice />

        <FilterShell
          query={common.query}
          onQuery={(v) => set('q', v)}
          searchLabel="Rechercher une console"
          searchPlaceholder="Rechercher une console…"
          activeCount={activeCount}
          resultsText={pluralResults(results.length)}
          onReset={() => reset()}
        >
          <SelectField
            label="Génération"
            value={generation ?? ''}
            // Une seule mise à jour d'URL : changer de génération réinitialise la variante choisie.
            onChange={(v) => setMany({ gen: v, variante: '' })}
            options={[
              { value: '', label: 'PS4 et PS5' },
              { value: 'PS5', label: 'PlayStation 5' },
              { value: 'PS4', label: 'PlayStation 4' },
            ]}
          />
          <SelectField
            label="Variante"
            value={activeVariant ?? ''}
            onChange={(v) => set('variante', v)}
            options={[{ value: '', label: 'Toutes les variantes' }, ...variantOptions.map((v) => ({ value: v, label: v }))]}
          />
          <SelectField label="État" value={common.condition ?? ''} onChange={(v) => set('etat', v)} options={CONDITION_FILTER_OPTIONS} />
          <SelectField label="Budget" value={budget !== undefined ? String(budget) : ''} onChange={(v) => set('max', v)} options={budgetOptions} />
          <SelectField label="Trier par" value={common.sort} onChange={(v) => set('tri', v === 'recent' ? '' : v)} options={SORT_OPTIONS} />
          <CheckField label="Disponibles immédiatement" checked={common.inStockOnly} onChange={(c) => set('dispo', c ? '1' : '')} />
        </FilterShell>

        {visibleGroups.length === 0 ? (
          <EmptyState title="Aucune console ne correspond à votre recherche." onReset={() => reset()}>
            Essayez une autre génération, un budget plus large ou retirez un filtre.
          </EmptyState>
        ) : (
          visibleGroups.map((group, gi) => (
            <section key={group.id} id={group.anchor} className="generation" aria-labelledby={`${group.anchor}-title`}>
              <div className="generation__head">
                <h2 id={`${group.anchor}-title`}>{group.title}</h2>
                <p>{group.intro}</p>
              </div>
              <ul className="grid grid--consoles">
                {byGeneration(group.id).map((item, i) => (
                  <li key={item.id}>
                    <ProductCard product={item} priorityImage={gi === 0 && i < 2} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  )
}
