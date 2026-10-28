"""Audit d'accessibilité automatisé (axe-core, WCAG 2.0/2.1 A + AA) sur les pages principales."""
import json
import sys
from playwright.sync_api import sync_playwright

import os
from pathlib import Path
HERE = Path(__file__).resolve().parent
BASE = os.environ.get("BASE_URL", "http://localhost:4173")
AXE = str(HERE.parent / "node_modules" / "axe-core" / "axe.min.js")
ROUTES = [
    "/", "/jeux", "/jeux/numeriques", "/jeux/physiques", "/consoles", "/appareils",
    "/vendre-mon-appareil", "/contact", "/produit/console-ps5-standard-neuf",
    "/produit/num-compte-ps5-pack-sport", "/recherche?q=ps5", "/recherche?q=zzz", "/confidentialite", "/inexistante",
]
TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]
problems = []

with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (390, 1280):
        ctx = b.new_context(viewport={"width": w, "height": 900})
        pg = ctx.new_page()
        for route in ROUTES:
            pg.goto(BASE + route, wait_until="networkidle")
            pg.wait_for_timeout(400)  # fin de l'animation d'entrée (le contraste se mesure sur l'état final)
            states = [("", None)]
            if route == "/vendre-mon-appareil":
                states = [("(vide)", None), ("(console + erreurs)", "err"), ("(récapitulatif)", "recap")]
            for label, action in states:
                if action == "err":
                    pg.locator("label[for=category-console]").click()
                    pg.get_by_role("button", name="Vérifier ma demande").click()
                    pg.wait_for_timeout(300)
                if action == "recap":
                    pg.goto(BASE + route + "?categorie=console", wait_until="networkidle")
                    for sel, val in (("#field-fullName", "Marie Ngo"), ("#field-phone", "697692598"), ("#field-location", "Douala"), ("#field-brand", "Sony"), ("#field-model", "PS5")):
                        pg.fill(sel, val)
                    pg.select_option("#field-condition", "Bon état")
                    pg.select_option("#field-generation", "PlayStation 5")
                    pg.select_option("#field-edition", "Standard")
                    pg.select_option("#field-discDrive", "Fonctionne bien")
                    pg.select_option("#field-controllersCount", "1")
                    pg.check("#consent")
                    pg.get_by_role("button", name="Vérifier ma demande").click()
                    pg.wait_for_selector(".recap")
                    pg.wait_for_timeout(400)
                pg.add_script_tag(path=AXE)
                res = pg.evaluate("axe.run(document, {runOnly: {type: 'tag', values: %s}})" % json.dumps(TAGS))
                for v in res["violations"]:
                    nodes = [n["target"][0] if n["target"] else "?" for n in v["nodes"][:3]]
                    problems.append((w, route + " " + label, v["id"], v["impact"], v["help"], nodes, len(v["nodes"])))
        ctx.close()
    b.close()

print(f"{len(ROUTES)} pages × 2 largeurs auditées (avec états du formulaire)")
if problems:
    from collections import defaultdict
    grouped = defaultdict(lambda: {"pages": set(), "nodes": set(), "help": "", "impact": ""})
    for w, r, i, imp, h, nodes, n in problems:
        g = grouped[i]
        g["pages"].add(f"{w}:{r.strip()}")
        g["nodes"].update(nodes)
        g["help"], g["impact"] = h, imp
    print(f"{len(grouped)} règle(s) en violation :")
    for i, g in grouped.items():
        print(f" - {i} ({g['impact']}) {g['help']}")
        print(f"     {len(g['pages'])} page(s)/largeur(s) ; éléments : {sorted(g['nodes'])[:6]}")
else:
    print("Aucune violation axe-core.")
sys.exit(1 if problems else 0)
