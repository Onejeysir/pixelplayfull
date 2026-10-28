import { Link } from 'react-router-dom'
import { DemoNotice, EmptyState, PageHeader } from '../components/Common'
import {
  CheckField,
  FilterShell,
  pluralResults,
  AmountField,
  SelectField,
  SORT_OPTIONS,
} from '../components/FilterControls'
import { ArrowRightIcon } from '../components/Icons'
import { Illustration } from '../components/Illustration'
import { ProductCard } from '../components/ProductCard'
import { devices } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'
import { useUrlParams } from '../hooks/useUrlParams'
import { countActiveFilters, filterDevices, parseDeviceType, readCommonFilters, type DeviceFilters } from '../lib/catalog'

export function DevicesPage() {
  usePageMeta(
    'Achat / Vente d’appareils électroniques',
    'Vendez votre ordinateur, téléphone ou console à PIXEL PLAY pour une estimation, ou découvrez les appareils disponibles à l’achat à Douala.',
    '/appareils',
  )

  const { params, set, reset } = useUrlParams()
  const common = readCommonFilters(params)
  const deviceType = parseDeviceType(params.get('type'))
  const filters: DeviceFilters = { ...common, condition: undefined, deviceType }
  const results = filterDevices(devices, filters)
  const activeCount = countActiveFilters(filters, [deviceType])

  return (
    <>
      <PageHeader
        title="Achat / Vente d’appareils"
        intro="Ordinateurs, téléphones et consoles : proposez le vôtre pour une estimation, ou trouvez un appareil disponible."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Achat / Vente' }]}
      />

      <div className="container catalog">
        <div className="choice-grid">
          <article className="choice choice--sell">
            <Illustration kind="devices" className="choice__art" />
            <div className="choice__body">
              <h2>Vendre mon appareil à PIXEL PLAY</h2>
              <p>
                Décrivez votre ordinateur, téléphone ou console. Vous vérifiez le récapitulatif, puis vous l’envoyez sur
                WhatsApp pour obtenir une estimation. Il s’agit d’une demande : aucun rachat n’est conclu avant la
                confirmation de PIXEL PLAY.
              </p>
              <Link to="/vendre-mon-appareil" className="btn btn--light">
                Vendre mon appareil
                <ArrowRightIcon size={20} />
              </Link>
            </div>
          </article>

          <article className="choice choice--buy">
            <Illustration kind="laptop" className="choice__art" />
            <div className="choice__body">
              <h2>Acheter un appareil disponible</h2>
              <p>
                Appareils d’occasion proposés par PIXEL PLAY. Consultez la liste ci-dessous et commandez sur WhatsApp
                pour confirmer la disponibilité et le prix.
              </p>
              <a href="#acheter" className="btn btn--outline">
                Voir les appareils
              </a>
            </div>
          </article>
        </div>

        <section id="acheter" className="section-block" aria-labelledby="acheter-title">
          <div className="section-block__head">
            <h2 id="acheter-title">Appareils disponibles à l’achat</h2>
          </div>
          <DemoNotice />

          <FilterShell
            query={common.query}
            onQuery={(v) => set('q', v)}
            searchLabel="Rechercher un appareil"
            searchPlaceholder="Rechercher un appareil…"
            activeCount={activeCount}
            resultsText={pluralResults(results.length)}
            onReset={() => reset()}
          >
            <SelectField
              label="Type d’appareil"
              value={deviceType ?? ''}
              onChange={(v) => set('type', v)}
              options={[
                { value: '', label: 'Tous les appareils' },
                { value: 'ordinateur', label: 'Ordinateurs' },
                { value: 'telephone', label: 'Téléphones' },
                { value: 'console', label: 'Consoles' },
              ]}
            />
            <AmountField label="Prix minimum" value={params.get('min') ?? ''} onChange={(v) => set('min', v.trim())} placeholder="0" />
            <AmountField label="Prix maximum" value={params.get('max') ?? ''} onChange={(v) => set('max', v.trim())} placeholder="Sans limite" />
            <SelectField label="Trier par" value={common.sort} onChange={(v) => set('tri', v === 'recent' ? '' : v)} options={SORT_OPTIONS} />
            <CheckField label="Disponibles immédiatement" checked={common.inStockOnly} onChange={(c) => set('dispo', c ? '1' : '')} />
          </FilterShell>

          {results.length > 0 ? (
            <ul className="grid grid--games" aria-label="Appareils disponibles">
              {results.map((device) => (
                <li key={device.id}>
                  <ProductCard product={device} />
                </li>
              ))}
            </ul>
          ) : devices.length === 0 ? (
            <EmptyState title="Aucun appareil n’est proposé à l’achat pour le moment.">
              Écrivez-nous sur WhatsApp : nous vous dirons ce qui arrive prochainement.
            </EmptyState>
          ) : (
            <EmptyState title="Aucun appareil ne correspond à votre recherche." onReset={() => reset()}>
              Essayez un autre type d’appareil ou élargissez la fourchette de prix.
            </EmptyState>
          )}
        </section>
      </div>
    </>
  )
}
