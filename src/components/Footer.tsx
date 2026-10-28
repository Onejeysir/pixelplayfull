import { Link } from 'react-router-dom'
import { MAPS_SEARCH_URL, PHONE_HREF, SITE } from '../config/site'
import { buildContactMessage, buildWhatsAppUrl } from '../lib/whatsapp'
import { PhoneIcon, PinIcon, WhatsAppIcon } from './Icons'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo light />
          <p>{SITE.shortDescription}</p>
        </div>

        <nav aria-label="Pied de page">
          <h2 className="site-footer__title">Le site</h2>
          <ul>
            <li><Link to="/jeux/numeriques">Jeux numériques</Link></li>
            <li><Link to="/jeux/physiques">Jeux sur disque</Link></li>
            <li><Link to="/consoles">Consoles PS4 / PS5</Link></li>
            <li><Link to="/appareils">Achat / Vente d’appareils</Link></li>
            <li><Link to="/vendre-mon-appareil">Vendre mon appareil</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="site-footer__title">Nous trouver</h2>
          <ul className="site-footer__contact">
            <li>
              <PinIcon size={18} />
              <a href={MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer">
                {SITE.address.line1}
                <br />
                {SITE.address.city}, {SITE.address.country}
                <span className="sr-only"> (ouvre la carte dans un nouvel onglet)</span>
              </a>
            </li>
            <li>
              <PhoneIcon size={18} />
              <a href={PHONE_HREF}>{SITE.phone.display}</a>
            </li>
            <li>
              <WhatsAppIcon size={18} />
              <a href={buildWhatsAppUrl(buildContactMessage())} target="_blank" rel="noopener noreferrer">
                {SITE.phone.display}
                <span className="sr-only"> sur WhatsApp (s’ouvre dans un nouvel onglet)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container site-footer__legal">
        <p>
          © {new Date().getFullYear()} {SITE.name}. Prix et disponibilités confirmés sur WhatsApp avant toute commande.
        </p>
        <p>
          Les marques citées appartiennent à leurs propriétaires respectifs ; {SITE.name} n’est affilié à aucun
          constructeur.{' '}
          <Link to="/confidentialite">Confidentialité</Link>
        </p>
      </div>
    </footer>
  )
}
