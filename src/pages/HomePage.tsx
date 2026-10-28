import { Link } from 'react-router-dom'
import { DemoNotice, Faq } from '../components/Common'
import { ArrowRightIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '../components/Icons'
import { Illustration, type IllustrationKind } from '../components/Illustration'
import { LogoMark } from '../components/Logo'
import { ProductCard } from '../components/ProductCard'
import { ADDRESS_ONE_LINE, MAPS_SEARCH_URL, PHONE_HREF, SITE } from '../config/site'
import { allProducts, consoles, devices, digitalGames, physicalGames } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'
import { sortProducts } from '../lib/catalog'
import { buildContactMessage, buildWhatsAppUrl } from '../lib/whatsapp'
import type { Product } from '../types/catalog'

interface Axis {
  n: string
  /** Variante de couleur du bloc : surface claire, violet, violet foncé. */
  tone: 'light' | 'violet' | 'dark'
  title: string
  text: string
  tags: string[]
  to: string
  cta: string
  art: IllustrationKind
}

const AXES: Axis[] = [
  {
    n: '01',
    tone: 'light',
    title: 'Jeux vidéo',
    text: 'Jeux numériques et jeux sur disque pour PS4 et PS5.',
    tags: ['Numériques', 'Sur disque'],
    to: '/jeux',
    cta: 'Découvrir les jeux',
    art: 'disc',
  },
  {
    n: '02',
    tone: 'violet',
    title: 'Consoles',
    text: 'PlayStation 4 et PlayStation 5, neuves ou d’occasion.',
    tags: ['PS4', 'PS5'],
    to: '/consoles',
    cta: 'Explorer les consoles',
    art: 'console-tall',
  },
  {
    n: '03',
    tone: 'dark',
    title: 'Achat / Vente',
    text: 'Ordinateurs, téléphones et consoles : vendez le vôtre ou trouvez un appareil.',
    tags: ['Ordinateurs', 'Téléphones', 'Consoles'],
    to: '/appareils',
    cta: 'Acheter ou vendre',
    art: 'devices',
  },
]

const GAME_CATEGORIES = [
  { label: 'Jeux sur disque PS5', to: '/jeux/physiques?plateforme=PS5', count: physicalGames.filter((g) => g.platform === 'PS5').length },
  { label: 'Jeux sur disque PS4', to: '/jeux/physiques?plateforme=PS4', count: physicalGames.filter((g) => g.platform === 'PS4').length },
  { label: 'Jeux numériques', to: '/jeux/numeriques', count: digitalGames.length },
  { label: 'Jeux d’occasion', to: '/jeux/physiques?etat=occasion', count: physicalGames.filter((g) => g.condition === 'occasion').length },
]

const SELL_STEPS = [
  { title: 'Décrivez votre appareil', text: 'Choisissez ordinateur, téléphone ou console : seuls les champs utiles s’affichent.' },
  { title: 'Vérifiez le récapitulatif', text: 'Vous relisez votre demande avant qu’elle ne soit envoyée. Rien n’est transmis tant que vous ne l’avez pas décidé.' },
  { title: 'Envoyez sur WhatsApp', text: 'WhatsApp s’ouvre avec le message prérempli. Vous y joignez vos photos, puis PIXEL PLAY vous répond avec une estimation.' },
]

function Row({
  id,
  title,
  to,
  linkLabel,
  items,
}: {
  id: string
  title: string
  to: string
  linkLabel: string
  items: Product[]
}) {
  if (items.length === 0) return null
  return (
    <section className="section" aria-labelledby={id}>
      <div className="container">
        <div className="section__head">
          <h2 id={id}>{title}</h2>
          <Link to={to} className="text-link">
            {linkLabel}
            <ArrowRightIcon size={18} />
          </Link>
        </div>
        <ul className="grid grid--home">
          {items.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function HomePage() {
  usePageMeta(
    SITE.name,
    'PIXEL PLAY, Bonamoussadi (Douala) : jeux vidéo PS4 et PS5, consoles PlayStation, achat et vente d’appareils électroniques. Commandez sur WhatsApp.',
    '/',
  )

  // « Populaires » = produits mis en avant par PIXEL PLAY (champ `featured`) : jamais un chiffre de ventes inventé.
  const featured = sortProducts(allProducts.filter((p) => p.featured && p.availability !== 'out_of_stock'), 'recent').slice(0, 4)
  const newest = sortProducts(allProducts.filter((p) => p.availability !== 'out_of_stock'), 'recent').slice(0, 4)
  const latestConsoles = sortProducts(consoles, 'recent').slice(0, 3)

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Bonamoussadi · Douala</p>
            <h1 id="hero-title" className="hero__title">
              Jouez.
              <br />
              Achetez.
              <br />
              <span className="hero__title-accent">Revendez.</span>
            </h1>
            <p className="hero__lead">
              Jeux PS4 et PS5, consoles PlayStation et appareils électroniques. Vous choisissez, vous commandez sur
              WhatsApp.
            </p>
            <div className="hero__actions">
              <Link to="/consoles" className="btn btn--primary btn--lg">
                Explorer les consoles
                <ArrowRightIcon size={20} />
              </Link>
              <Link to="/jeux" className="btn btn--outline btn--lg">
                Découvrir les jeux
              </Link>
            </div>
            <p className="hero__sell">
              Un appareil à vendre ? <Link to="/vendre-mon-appareil">Vendre mon appareil</Link>
            </p>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <div className="hero__plate">
              <LogoMark height={300} className="hero__mark" />
            </div>
            <Illustration kind="console-tall" className="hero__art hero__art--console" />
          </div>
        </div>
      </section>

      <section className="axes" aria-labelledby="axes-title">
        <div className="container">
          <h2 id="axes-title" className="sr-only">
            Nos trois activités
          </h2>
          <ul className="axes__grid">
            {AXES.map((axis) => (
              <li key={axis.to}>
                <article className={`axis${axis.tone === 'light' ? '' : ` axis--${axis.tone}`}`}>
                  <Illustration kind={axis.art} className="axis__art" />
                  <p className="axis__n" aria-hidden="true">
                    {axis.n}
                  </p>
                  <h3 className="axis__title">
                    <Link to={axis.to} className="axis__link">
                      {axis.title}
                    </Link>
                  </h3>
                  <p className="axis__text">{axis.text}</p>
                  <ul className="axis__tags" aria-label="Catégories">
                    {axis.tags.map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <span className="axis__cta">
                    {axis.cta}
                    <ArrowRightIcon size={20} />
                  </span>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container">
        <DemoNotice />
      </div>

      <Row id="populaires" title="Produits populaires" to="/jeux" linkLabel="Voir les jeux" items={featured} />
      <Row id="dernieres-consoles" title="Dernières consoles ajoutées" to="/consoles" linkLabel="Toutes les consoles" items={latestConsoles} />
      <Row id="nouveautes" title="Nouveautés" to="/jeux" linkLabel="Tout le catalogue" items={newest} />

      <section className="section section--tint" aria-labelledby="categories-title">
        <div className="container">
          <div className="section__head">
            <h2 id="categories-title">Catégories de jeux</h2>
          </div>
          <ul className="category-grid">
            {GAME_CATEGORIES.map((c) => (
              <li key={c.label}>
                <Link to={c.to} className="category-tile">
                  <span className="category-tile__label">{c.label}</span>
                  <span className="category-tile__count">
                    {c.count} jeu{c.count > 1 ? 'x' : ''}
                  </span>
                  <ArrowRightIcon size={20} />
                </Link>
              </li>
            ))}
          </ul>
          {devices.length > 0 && (
            <p className="section__after">
              Vous cherchez un ordinateur ou un téléphone ? <Link to="/appareils#acheter">Voir les appareils disponibles</Link>.
            </p>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="vendre-title">
        <div className="container sell-steps">
          <div className="sell-steps__intro">
            <p className="eyebrow">Achat / Vente</p>
            <h2 id="vendre-title">Comment vendre son appareil</h2>
            <p>
              Ordinateur, téléphone ou console : proposez-le à PIXEL PLAY pour une estimation. C’est une demande, sans
              engagement : le rachat n’est conclu qu’après confirmation de PIXEL PLAY.
            </p>
            <Link to="/vendre-mon-appareil" className="btn btn--primary">
              Vendre mon appareil
              <ArrowRightIcon size={20} />
            </Link>
          </div>
          <ol className="sell-steps__list">
            {SELL_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="sell-steps__num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="presentation-title">
        <div className="container about">
          <div>
            <p className="eyebrow">Qui sommes-nous</p>
            <h2 id="presentation-title">PIXEL PLAY, la boutique gaming de Bonamoussadi</h2>
          </div>
          <div className="about__text">
            <p>
              PIXEL PLAY vend des jeux vidéo, des consoles PlayStation 4 et 5, et rachète comme revend des appareils
              électroniques. Pas de compte à créer, pas de paiement en ligne : vous nous écrivez sur WhatsApp, on vous
              confirme la disponibilité et le prix, puis on s’organise pour le retrait ou la livraison.
            </p>
            <p>
              Passez nous voir : {ADDRESS_ONE_LINE}.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="container faq-layout">
          <div>
            <p className="eyebrow">Questions fréquentes</p>
            <h2 id="faq-title">Avant de commander</h2>
          </div>
          <Faq ids={['commander', 'prix', 'compte', 'paiement', 'vendre', 'photos']} />
        </div>
      </section>

      <section className="section section--contact" aria-labelledby="contact-title">
        <div className="container contact-band">
          <div>
            <h2 id="contact-title">Venez nous voir ou écrivez-nous</h2>
            <address className="contact-band__address">
              {SITE.address.line1}
              <br />
              {SITE.address.city}, {SITE.address.country}
            </address>
          </div>
          <div className="contact-band__actions" data-hide-wa>
            <a
              className="btn btn--wa btn--lg"
              href={buildWhatsAppUrl(buildContactMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={22} />
              WhatsApp {SITE.phone.display}
              <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
            </a>
            <a className="btn btn--light btn--lg" href={PHONE_HREF}>
              <PhoneIcon size={20} />
              Appeler
            </a>
            <a className="btn btn--light btn--lg" href={MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer">
              <PinIcon size={20} />
              Voir sur la carte
              <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
