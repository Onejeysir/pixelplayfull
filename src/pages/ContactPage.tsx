import { PageHeader } from '../components/Common'
import { PhoneIcon, PinIcon, WhatsAppIcon } from '../components/Icons'
import { ADDRESS_ONE_LINE, MAPS_SEARCH_URL, PHONE_HREF, SITE } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { buildContactMessage, buildWhatsAppUrl } from '../lib/whatsapp'

export function ContactPage() {
  usePageMeta(
    'Contact et localisation',
    `Contactez PIXEL PLAY par WhatsApp ou par téléphone au ${SITE.phone.display}. ${ADDRESS_ONE_LINE}.`,
    '/contact',
  )

  return (
    <>
      <PageHeader
        title="Contact et localisation"
        intro="Le plus rapide : un message WhatsApp. Vous pouvez aussi nous appeler ou passer à la boutique."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Contact' }]}
      />

      <div className="container contact">
        <div className="contact__cards">
          <article className="contact-card contact-card--wa">
            <WhatsAppIcon size={32} />
            <h2>WhatsApp</h2>
            <p className="contact-card__value">{SITE.phone.display}</p>
            <p>Posez votre question ou commandez : nous confirmons la disponibilité et le prix.</p>
            <a
              className="btn btn--wa btn--block"
              href={buildWhatsAppUrl(buildContactMessage())}
              target="_blank"
              rel="noopener noreferrer"
              data-hide-wa
            >
              <WhatsAppIcon size={20} />
              Écrire sur WhatsApp
              <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
            </a>
          </article>

          <article className="contact-card">
            <PhoneIcon size={32} />
            <h2>Téléphone</h2>
            <p className="contact-card__value">{SITE.phone.display}</p>
            <p>Pour un échange direct, appelez-nous.</p>
            <a className="btn btn--primary btn--block" href={PHONE_HREF} data-hide-wa>
              <PhoneIcon size={20} />
              Appeler le {SITE.phone.display}
            </a>
          </article>

          <article className="contact-card">
            <PinIcon size={32} />
            <h2>Boutique</h2>
            <address className="contact-card__value">
              {SITE.address.line1}
              <br />
              {SITE.address.city}, {SITE.address.country}
            </address>
            <p>Les horaires d’ouverture seront précisés ici dès qu’ils seront confirmés.</p>
            <a className="btn btn--outline btn--block" href={MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer" data-hide-wa>
              <PinIcon size={20} />
              Rechercher sur la carte
              <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
            </a>
          </article>
        </div>

        <section className="contact__location" aria-labelledby="loc-title">
          <h2 id="loc-title">Comment nous trouver</h2>
          <p>
            PIXEL PLAY se trouve à <strong>Bonamoussadi, face Petit Terrain</strong>, à Douala. Le bouton « Rechercher sur
            la carte » ouvre une recherche sur cette adresse ; en cas de doute, écrivez-nous sur WhatsApp et nous vous
            guiderons.
          </p>
        </section>
      </div>
    </>
  )
}
