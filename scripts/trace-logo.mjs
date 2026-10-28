// Vectorise le masque du logo PIXEL PLAY (tracé fidèle, aucune retouche du symbole).
// Usage : node scripts/trace-logo.mjs
import potrace from 'potrace'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const input = join(root, 'scripts', '.build', 'logo-mask.png')

const params = {
  threshold: 128,
  turdSize: 20, // ignore les poussières
  optTolerance: 0.2, // courbes précises : le symbole a des angles nets
  alphaMax: 0.6, // garde les angles vifs du logo
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
}

potrace.trace(readFileSync(input), params, (err, svg) => {
  if (err) throw err

  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]
  const [, , w, h] = (viewBox ?? '').split(/\s+/).map(Number)
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ')
  if (!d) throw new Error('Aucun tracé obtenu')

  // 1) Symbole seul, couleur héritée (currentColor) pour l'en-tête / le pied de page.
  const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="PIXEL PLAY"><path fill="currentColor" fill-rule="evenodd" d="${d}"/></svg>\n`

  // 2) Favicon : symbole blanc centré sur pastille violette de la charte.
  const side = 512
  const target = side * 0.64
  const scale = target / h
  const tx = (side - w * scale) / 2
  const ty = (side - h * scale) / 2
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}"><rect width="${side}" height="${side}" rx="96" fill="#6C3BEA"/><path fill="#fff" fill-rule="evenodd" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(5)})" d="${d}"/></svg>\n`

  mkdirSync(join(root, 'src', 'assets'), { recursive: true })
  mkdirSync(join(root, 'public'), { recursive: true })
  writeFileSync(join(root, 'src', 'assets', 'logo-mark.svg'), mark)
  writeFileSync(join(root, 'public', 'favicon.svg'), favicon)

  // 3) Chemin exposé en module TypeScript : permet d'inliner le logo en composant React.
  const ts = `// Fichier généré par scripts/trace-logo.mjs — ne pas modifier à la main.\nexport const LOGO_VIEWBOX = '0 0 ${w} ${h}'\nexport const LOGO_ASPECT = ${(w / h).toFixed(5)}\nexport const LOGO_PATH =\n  '${d}'\n`
  writeFileSync(join(root, 'src', 'assets', 'logoPath.ts'), ts)

  console.log(`tracé OK — viewBox ${w}x${h}, chemin ${d.length} caractères`)
})
