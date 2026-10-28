import { Link } from 'react-router-dom'
import { LOGO_ASPECT, LOGO_PATH, LOGO_VIEWBOX } from '../assets/logoPath'

/**
 * Symbole PIXEL PLAY : tracé vectoriel fidèle du logo fourni (mêmes proportions, aucune retouche).
 * La couleur vient de `currentColor`, ce qui permet la version sombre sur fond clair
 * et la version blanche sur fond violet.
 */
export function LogoMark({ height = 36, className }: { height?: number; className?: string }) {
  return (
    <svg
      className={className}
      viewBox={LOGO_VIEWBOX}
      height={height}
      width={Math.round(height * LOGO_ASPECT)}
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
      focusable="false"
    >
      <path d={LOGO_PATH} />
    </svg>
  )
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    // Le libellé commence par le texte visible « PIXEL PLAY » (WCAG 2.5.3 : étiquette dans le nom accessible).
    <Link to="/" className={`logo${light ? ' logo--light' : ''}`} aria-label="PIXEL PLAY, retour à l’accueil">
      <LogoMark height={34} className="logo__mark" />
      <span className="logo__word">
        PIXEL <span className="logo__word-play">PLAY</span>
      </span>
    </Link>
  )
}
