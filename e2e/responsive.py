"""Contrôle responsive : pour chaque route et chaque largeur du cahier des charges,
vérifie l'absence de débordement horizontal (y compris masqué par overflow-x) et d'erreurs console."""
import json
import sys
from playwright.sync_api import sync_playwright

import os
from pathlib import Path
HERE = Path(__file__).resolve().parent
BASE = os.environ.get("BASE_URL", "http://localhost:4173")
WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440]
ROUTES = [
    "/",
    "/jeux",
    "/jeux/numeriques",
    "/jeux/physiques",
    "/consoles",
    "/appareils",
    "/vendre-mon-appareil",
    "/vendre-mon-appareil?categorie=console",
    "/contact",
    "/produit/console-ps5-standard-neuf",
    "/produit/num-compte-ps5-pack-sport",
    "/produit/appareil-hp-probook-450-g7",
    "/recherche?q=ps5",
    "/recherche?q=zzzz",
    "/confidentialite",
    "/page-inexistante",
    "/produit/inconnu",
]

JS_OFFENDERS = """
() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  const skip = (el) => el.closest('.tabs, .photo-strip, .sr-only, .skip-link, svg');
  for (const el of document.body.querySelectorAll('*')) {
    if (skip(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      out.push(`${el.tagName.toLowerCase()}.${(el.className && el.className.baseVal === undefined ? el.className : '').toString().split(' ')[0]} [${Math.round(r.left)}→${Math.round(r.right)}] "${(el.textContent||'').trim().slice(0,30)}"`);
    }
  }
  return { vw, scrollW: document.documentElement.scrollWidth, bodyScrollW: document.body.scrollWidth, offenders: out.slice(0, 6) };
}
"""

failures = []
errors_seen = []

with sync_playwright() as p:
    browser = p.chromium.launch()
    for w in WIDTHS:
        ctx = browser.new_context(viewport={"width": w, "height": 800}, device_scale_factor=1)
        page = ctx.new_page()
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: console_errors.append(f"pageerror: {e}"))
        page.on("requestfailed", lambda r: console_errors.append(f"requestfailed: {r.url}"))
        for route in ROUTES:
            page.goto(BASE + route, wait_until="networkidle")
            if route.startswith("/vendre-mon-appareil"):
                # état le plus chargé : catégorie ordinateur + soumission vide pour afficher le résumé d'erreurs
                if "categorie" not in route:
                    page.check("#category-ordinateur", force=True)
                page.click("text=Vérifier ma demande")
                page.wait_for_timeout(100)
            res = page.evaluate(JS_OFFENDERS)
            bad = res["scrollW"] > res["vw"] or res["bodyScrollW"] > res["vw"] or res["offenders"]
            if bad:
                failures.append((w, route, res))
        if console_errors:
            errors_seen.append((w, sorted(set(console_errors))))
        ctx.close()
    browser.close()

print(f"{len(WIDTHS)} largeurs × {len(ROUTES)} routes = {len(WIDTHS) * len(ROUTES)} contrôles")
if failures:
    print(f"ÉCHECS débordement : {len(failures)}")
    for w, route, res in failures[:25]:
        print(f"  {w}px {route} -> {json.dumps(res, ensure_ascii=False)}")
else:
    print("Aucun débordement horizontal détecté.")
if errors_seen:
    print("Erreurs/avertissements console :")
    for w, errs in errors_seen:
        print(f"  {w}px: {errs}")
else:
    print("Aucune erreur ni avertissement console.")
sys.exit(1 if failures or errors_seen else 0)
