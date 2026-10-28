"""Tests fonctionnels PIXEL PLAY dans Chromium (site de production servi par `vite preview`)."""
import re
import sys
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright

import os
from pathlib import Path
HERE = Path(__file__).resolve().parent
BASE = os.environ.get("BASE_URL", "http://localhost:4173")
FIX = str(HERE / "fixtures")
WA_PREFIX = "https://wa.me/237697692598?text="

results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("  OK   " if cond else "  ÉCHEC"), name, ("" if cond else f"— {detail}"))


def wa_text(href):
    assert href.startswith(WA_PREFIX), href
    return parse_qs(urlparse(href).query)["text"][0]


def section(title):
    print(f"\n== {title}")


with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, locale="fr-FR")
    console_errors = []
    page = ctx.new_page()
    page.on("console", lambda m: console_errors.append(m.text) if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: console_errors.append(str(e)))

    # wa.me n'est pas joignable depuis le bac à sable : on enregistre l'URL ouverte par les liens target=_blank
    opened = []

    def block_wa(route):
        opened.append(route.request.url)
        route.fulfill(status=200, body="ok", content_type="text/html")

    ctx.route("https://wa.me/**", block_wa)

    # ------------------------------------------------------------------
    section("Accueil : les trois axes")
    page.goto(BASE + "/", wait_until="networkidle")
    axes = page.locator(".axis")
    check("3 blocs commerciaux visibles", axes.count() == 3 and all(axes.nth(i).is_visible() for i in range(3)))
    box = axes.nth(0).bounding_box()
    check("1er axe visible sans trop défiler sur mobile (≤ 2 écrans)", box and box["y"] < 844 * 2, f"y={box and box['y']}")
    for label, url in (("Jeux vidéo", "/jeux"), ("Consoles", "/consoles"), ("Achat / Vente", "/appareils")):
        page.goto(BASE + "/", wait_until="networkidle")
        page.locator(".axis__link", has_text=label).click()
        page.wait_for_url(BASE + url)
        check(f"axe « {label} » mène à {url}", page.url == BASE + url and page.locator("h1").count() == 1)
    page.goto(BASE + "/", wait_until="networkidle")
    page.get_by_role("link", name="Explorer les consoles").first.click()
    page.wait_for_url(BASE + "/consoles")
    check("bouton « Explorer les consoles »", page.url.endswith("/consoles"))
    page.goto(BASE + "/", wait_until="networkidle")
    page.get_by_role("link", name="Découvrir les jeux").first.click()
    page.wait_for_url(BASE + "/jeux")
    check("bouton « Découvrir les jeux »", page.url.endswith("/jeux"))
    page.goto(BASE + "/", wait_until="networkidle")
    page.locator(".hero__sell a").click()
    page.wait_for_url(BASE + "/vendre-mon-appareil")
    check("lien « Vendre mon appareil » du héros", page.url.endswith("/vendre-mon-appareil"))

    # ------------------------------------------------------------------
    section("Liens principaux : aucun lien fictif")
    bad = []
    for route in ["/", "/jeux", "/consoles", "/appareils", "/contact", "/vendre-mon-appareil"]:
        page.goto(BASE + route, wait_until="networkidle")
        hrefs = page.eval_on_selector_all("a[href]", "els => els.map(e => e.getAttribute('href'))")
        for h in hrefs:
            if h in ("#", "", "javascript:void(0)") or h is None:
                bad.append((route, h))
    check("aucun href vide ou « # »", not bad, str(bad))
    # toutes les cibles internes existent (pas de 404)
    page.goto(BASE + "/", wait_until="networkidle")
    internal = set()
    for route in ["/", "/jeux", "/jeux/numeriques", "/jeux/physiques", "/consoles", "/appareils", "/contact", "/vendre-mon-appareil"]:
        page.goto(BASE + route, wait_until="networkidle")
        for h in page.eval_on_selector_all("a[href^='/']", "els => els.map(e => e.getAttribute('href'))"):
            internal.add(h.split("#")[0].split("?")[0])
    dead = []
    for h in sorted(internal):
        page.goto(BASE + (h or "/"), wait_until="networkidle")
        if page.locator(".not-found").count():
            dead.append(h)
    check(f"{len(internal)} routes internes liées existent toutes", not dead, str(dead))

    # ------------------------------------------------------------------
    section("Jeux : catégories distinctes et filtres")
    page.goto(BASE + "/jeux/physiques", wait_until="networkidle")
    cards = page.locator("[data-testid=product-card]")
    n_phys = cards.count()
    kinds = set(page.eval_on_selector_all("[data-testid=product-card]", "els => els.map(e => e.dataset.kind)"))
    check("/jeux/physiques ne montre que des jeux sur disque", kinds == {"game-physical"}, str(kinds))
    page.goto(BASE + "/jeux/numeriques", wait_until="networkidle")
    kinds = set(page.eval_on_selector_all("[data-testid=product-card]", "els => els.map(e => e.dataset.kind)"))
    check("/jeux/numeriques ne montre que des jeux numériques", kinds == {"game-digital"}, str(kinds))
    check("encadré des conditions des jeux numériques", page.locator(".info-box").count() == 1)
    check("pas de filtre « État » sur les jeux numériques", page.get_by_label("État", exact=True).count() == 0)

    page.goto(BASE + "/jeux", wait_until="networkidle")
    total = page.locator("[data-testid=product-card]").count()
    page.get_by_role("button", name=re.compile("Filtres")).click()
    page.get_by_label("Plateforme").select_option("PS4")
    plats = page.eval_on_selector_all("[data-testid=product-card] .chip--platform", "els => els.map(e => e.textContent)")
    check("filtre PS4", plats and set(plats) == {"PS4"}, str(plats))
    check("filtre reflété dans l'URL", "plateforme=PS4" in page.url, page.url)
    page.get_by_label("État", exact=True).select_option("neuf")
    n = page.locator("[data-testid=product-card]").count()
    check("PS4 + neuf (aucun jeu numérique)", all(k == "game-physical" for k in page.eval_on_selector_all("[data-testid=product-card]", "e=>e.map(x=>x.dataset.kind)")), f"n={n}")
    page.get_by_label("État", exact=True).select_option("occasion")
    check("PS4 + occasion", page.locator("[data-testid=product-card]").count() > 0)
    page.get_by_label("Prix maximum").fill("10 000")
    prices = page.eval_on_selector_all("[data-testid=product-card] .card__price", "els => els.map(e => parseInt(e.textContent.replace(/\\s/g,'').replace(/\\D/g,'')))")
    check("prix maximum 10 000", prices and all(x <= 10000 for x in prices), str(prices))
    page.get_by_label("Prix minimum").fill("10000")
    prices = page.eval_on_selector_all("[data-testid=product-card] .card__price", "els => els.map(e => parseInt(e.textContent.replace(/\\D/g,'')))")
    check("fourchette 10 000–10 000", all(x == 10000 for x in prices) and len(prices) >= 1, str(prices))
    page.get_by_label("Prix minimum").fill("99999")
    check("état vide quand aucun résultat", page.locator(".empty").is_visible() and "Aucun jeu" in page.locator(".empty").inner_text())
    page.locator(".empty").get_by_role("button", name="Réinitialiser les filtres").click()
    check("réinitialisation : tous les jeux reviennent", page.locator("[data-testid=product-card]").count() == total and page.url == BASE + "/jeux", page.url)
    page.get_by_role("searchbox", name="Rechercher un jeu").fill("spider")
    names = page.eval_on_selector_all("[data-testid=product-card] .card__title", "els => els.map(e => e.textContent)")
    check("recherche « spider »", names and all("Spider" in n for n in names), str(names))
    page.get_by_role("searchbox", name="Rechercher un jeu").fill("fifa zzz")
    check("recherche sans résultat → état vide", page.locator(".empty").is_visible())
    page.goto(BASE + "/jeux?tri=price-asc&dispo=1", wait_until="networkidle")
    prices = page.eval_on_selector_all("[data-testid=product-card] .card__price", "els => els.map(e => parseInt(e.textContent.replace(/\\D/g,'')))")
    check("tri prix croissant + disponibles (depuis l'URL)", prices == sorted(prices) and len(prices) > 0, str(prices))
    check("badges de disponibilité visibles avec texte", page.locator(".badge").first.inner_text() in ("En stock", "Sur commande", "Épuisé"))

    # ------------------------------------------------------------------
    section("Consoles : PS4 / PS5")
    page.goto(BASE + "/consoles", wait_until="networkidle")
    heads = page.locator(".generation h2").all_inner_texts()
    check("sections PlayStation 5 puis PlayStation 4", [h.lower() for h in heads] == ["playstation 5", "playstation 4"], str(heads))
    ps5_variants = page.locator("#ps5 .card__meta").all_inner_texts()
    check("variantes PS5 (Standard, Digital, Slim)", any("Standard" in v for v in ps5_variants) and any("Digital" in v for v in ps5_variants) and any("Slim" in v for v in ps5_variants), str(ps5_variants))
    ps4_names = page.locator("#ps4 .card__title").all_inner_texts()
    check("variantes PS4 (Standard, Slim, Pro)", any("Pro" in v for v in ps4_names) and any("Slim" in v for v in ps4_names) and any("Standard" in v for v in ps4_names), str(ps4_names))
    page.get_by_role("button", name=re.compile("Filtres")).click()
    page.get_by_label("Génération", exact=True).select_option("PS4")
    check("filtre génération PS4 masque la section PS5", page.locator("#ps5").count() == 0 and page.locator("#ps4").count() == 1)
    opts = page.get_by_label("Variante", exact=True).locator("option").all_inner_texts()
    check("variantes proposées adaptées à la génération", "Pro" in opts and not any("Digital" in o for o in opts), str(opts))
    page.get_by_label("Variante", exact=True).select_option("Pro")
    check("filtre variante Pro", page.locator("[data-testid=product-card]").count() == 1)
    page.get_by_role("button", name="Réinitialiser les filtres").first.click()
    page.get_by_label("Budget", exact=True).select_option(index=1)  # 100 000
    check("budget ≤ 100 000", page.locator("[data-testid=product-card]").count() >= 1 and all(x <= 100000 for x in page.eval_on_selector_all("[data-testid=product-card] .card__price", "e=>e.map(x=>parseInt(x.textContent.replace(/\\D/g,'')))")))
    page.goto(BASE + "/consoles?gen=PS5&etat=occasion", wait_until="networkidle")
    check("URL partageable : PS5 occasion", page.locator("[data-testid=product-card]").count() == 1)
    page.goto(BASE + "/consoles?variante=Inconnue&gen=XX&min=abc&tri=zz", wait_until="networkidle")
    check("paramètres d'URL invalides ignorés sans erreur", page.locator("[data-testid=product-card]").count() == 7)

    # ------------------------------------------------------------------
    section("Boutons « Commander sur WhatsApp »")
    ps = ["/consoles", "/jeux", "/appareils", "/jeux/numeriques"]
    total_btn = 0
    mism = []
    for route in ps:
        page.goto(BASE + route, wait_until="networkidle")
        for i in range(page.locator("[data-testid=order-button]").count()):
            btn = page.locator("[data-testid=order-button]").nth(i)
            href = btn.get_attribute("href")
            txt = wa_text(href)
            pid = btn.get_attribute("data-product-id")
            card = page.locator("[data-testid=product-card]").nth(i)
            title = card.locator(".card__title").inner_text()
            total_btn += 1
            if pid not in txt or title not in txt or "Bonjour PIXEL PLAY," not in txt:
                mism.append((route, pid, title))
            if btn.get_attribute("target") != "_blank" or "noopener" not in (btn.get_attribute("rel") or ""):
                mism.append((route, pid, "target/rel"))
            if btn.locator("svg").count() != 1:
                mism.append((route, pid, "pas d'icône WhatsApp"))
    check(f"{total_btn} boutons : bon produit, bonne référence, bon numéro, icône WhatsApp", total_btn > 20 and not mism, str(mism[:3]))

    page.goto(BASE + "/consoles", wait_until="networkidle")
    btn = page.locator("[data-testid=order-button]").first
    href = btn.get_attribute("href")
    txt = wa_text(href)
    check("message console : modèle du cahier des charges", all(s in txt for s in ["Je souhaite commander une console.", "- Produit : PlayStation 5 Standard", "- Prix affiché : 445 000 FCFA", "- Référence : console-ps5-standard-neuf", "modalités de retrait ou de livraison"]), txt)
    check("URL sans espace ni retour ligne brut", " " not in href and "\n" not in href)
    opened.clear()
    with ctx.expect_page() as popup_info:
        btn.click()
    popup = popup_info.value
    popup.wait_for_load_state()
    check("le clic ouvre wa.me dans un nouvel onglet avec le texte prérempli", popup.url.startswith(WA_PREFIX) and wa_text(popup.url) == txt, popup.url[:80])
    popup.close()
    page.goto(BASE + "/jeux/physiques", wait_until="networkidle")
    gtxt = wa_text(page.locator("[data-testid=order-button]").first.get_attribute("href"))
    check("message jeu : plateforme / catégorie / état", all(s in gtxt for s in ["Je souhaite commander un jeu vidéo.", "- Plateforme :", "- Catégorie : Physique (disque)", "- État :"]), gtxt)
    soldout_btn = page.locator(".order-btn--soldout").first
    check("produit épuisé : bouton « Être prévenu » et message adapté", soldout_btn.count() == 0 or "indiqué épuisé" in wa_text(soldout_btn.get_attribute("href")))

    # ------------------------------------------------------------------
    section("Fiche produit")
    page.goto(BASE + "/consoles", wait_until="networkidle")
    page.locator(".card__title a", has_text="PlayStation 4 Pro").click()
    page.wait_for_url(re.compile("/produit/console-ps4-pro-occasion"))
    check("fiche produit via route dynamique", page.locator("h1").inner_text().upper() == "PLAYSTATION 4 PRO")
    check("fiche : bouton WhatsApp + caractéristiques", page.locator("[data-testid=order-button]").count() >= 1 and page.locator(".spec-list__row").count() >= 4)
    page.goto(BASE + "/produit/num-compte-ps5-pack-sport", wait_until="networkidle")
    check("compte de jeux : conditions de vente affichées, non présenté comme physique", "compte de jeux" in page.locator(".conditions").inner_text().lower() and "Support" in page.locator(".spec-list").inner_text() and "Numérique" in page.locator(".spec-list").inner_text())
    page.goto(BASE + "/produit/inconnu", wait_until="networkidle")
    check("produit inconnu : page 404 propre", "plus au catalogue" in page.locator("h1").inner_text().lower())

    # ------------------------------------------------------------------
    section("Bouton Retour du navigateur")
    page.goto(BASE + "/consoles?gen=PS5", wait_until="networkidle")
    page.evaluate("window.scrollTo(0, 500)")
    page.wait_for_timeout(200)
    page.locator("#ps5 .card__title a").nth(1).click()
    page.wait_for_url(re.compile("/produit/"))
    check("arrivée en haut de la fiche", page.evaluate("window.scrollY") == 0)
    page.go_back()
    page.wait_for_url(re.compile("/consoles"))
    page.wait_for_timeout(300)
    check("Retour : filtres conservés dans l'URL", "gen=PS5" in page.url, page.url)
    check("Retour : position de défilement restaurée", abs(page.evaluate("window.scrollY") - 500) < 80, str(page.evaluate("window.scrollY")))
    page.go_forward()
    page.wait_for_url(re.compile("/produit/"))
    check("Avancer fonctionne", "/produit/" in page.url)
    # changer un filtre ne crée pas d'entrée d'historique
    page.goto(BASE + "/consoles", wait_until="networkidle")
    before = page.evaluate("history.length")
    page.get_by_role("button", name=re.compile("Filtres")).click()
    page.get_by_label("Génération", exact=True).select_option("PS4")
    page.get_by_label("État", exact=True).select_option("occasion")
    after = page.evaluate("history.length")
    check("les filtres ne polluent pas l'historique", before == after, f"{before}->{after}")

    # ------------------------------------------------------------------
    section("Menu mobile, recherche et clavier")
    page.goto(BASE + "/", wait_until="networkidle")
    menu = page.locator("#mobile-menu")
    check("menu fermé au départ", not menu.is_visible())
    page.get_by_role("button", name="Ouvrir le menu").click()
    check("menu ouvert", menu.is_visible())
    mh = menu.bounding_box()["height"]
    check("le menu ne masque pas tout l'écran", mh < 844 * 0.75, f"{mh}px")
    page.keyboard.press("Escape")
    check("Échap ferme le menu", not menu.is_visible())
    page.get_by_role("button", name="Ouvrir le menu").click()
    menu.get_by_role("link", name="Consoles").click()
    page.wait_for_url(BASE + "/consoles")
    check("le menu se referme après navigation", not menu.is_visible())
    page.get_by_role("button", name="Ouvrir le menu").click()
    page.mouse.click(200, 700)
    check("un clic à l'extérieur ferme le menu", not menu.is_visible())
    page.get_by_role("button", name="Rechercher un produit").click()
    sb = page.locator("#header-search")
    check("recherche : champ focalisé à l'ouverture", sb.evaluate("e => e === document.activeElement"))
    sb.fill("ps5 slim")
    sb.press("Enter")
    page.wait_for_url(re.compile("/recherche"))
    check("recherche globale : résultats", page.locator("[data-testid=product-card]").count() >= 1 and not page.locator("#search-panel").is_visible())
    page.goto(BASE + "/recherche?q=xyzxyz", wait_until="networkidle")
    check("recherche globale sans résultat : lien WhatsApp", "xyzxyz" in wa_text(page.locator(".empty a").get_attribute("href")))
    page.goto(BASE + "/", wait_until="networkidle")
    page.keyboard.press("Tab")
    check("lien d'évitement en premier au clavier", page.evaluate("document.activeElement.className") == "skip-link")
    page.keyboard.press("Enter")
    check("lien d'évitement mène au contenu", page.evaluate("location.hash") == "#contenu")

    # Ordinateur : navigation
    dctx = browser.new_context(viewport={"width": 1280, "height": 800}, locale="fr-FR")
    dctx.route("https://wa.me/**", block_wa)
    dpage = dctx.new_page()
    dpage.goto(BASE + "/", wait_until="networkidle")
    check("ordinateur : menu horizontal visible, bouton burger masqué", dpage.locator(".site-nav").is_visible() and not dpage.locator(".menu-toggle").is_visible())
    links = dpage.locator(".site-nav a").all_inner_texts()
    check("ordinateur : entrées du menu", links == ["Accueil", "Jeux vidéo", "Consoles", "Achat / Vente", "Contact"], str(links))
    dpage.goto(BASE + "/consoles", wait_until="networkidle")
    mw = dpage.eval_on_selector(".card__media", "e => e.getBoundingClientRect().width")
    cw = dpage.eval_on_selector(".card", "e => e.getBoundingClientRect().width")
    check("ordinateur : l'image occupe toute la largeur de la carte", abs(mw - cw) < 3, f"{mw} vs {cw}")
    dctx.close()

    # ------------------------------------------------------------------
    section("Bouton WhatsApp flottant, contact, tel:")
    routes = ["/", "/jeux", "/jeux/numeriques", "/jeux/physiques", "/consoles", "/appareils", "/vendre-mon-appareil", "/contact", "/produit/console-ps4-pro-occasion", "/recherche?q=ps5", "/confidentialite", "/page-inconnue"]
    miss = []
    for r in routes:
        page.goto(BASE + r, wait_until="networkidle")
        f = page.locator("[data-testid=wa-float]")
        if f.count() != 1:
            miss.append((r, "absent"))
            continue
        label = f.get_attribute("aria-label") or ""
        pos = f.evaluate("e => { const s = getComputedStyle(e); return [s.position, s.right, s.bottom, e.getBoundingClientRect().width] }")
        if not (f.get_attribute("href").startswith(WA_PREFIX) and "WhatsApp" in label and pos[0] == "fixed" and pos[3] >= 44):
            miss.append((r, label, pos))
    check(f"présent sur {len(routes)} pages, fixe, libellé accessible, bon numéro", not miss, str(miss))
    page.goto(BASE + "/", wait_until="networkidle")
    bg = page.locator("[data-testid=wa-float]").evaluate("e => getComputedStyle(e).backgroundColor")
    check("fond vert WhatsApp #25D366", bg == "rgb(37, 211, 102)", bg)
    page.goto(BASE + "/contact", wait_until="networkidle")
    tel = page.locator("a[href^='tel:']").first
    check("lien d'appel tel:+237697692598", tel.get_attribute("href") == "tel:+237697692598")
    maps = page.locator("a[href*='google.com/maps/search']").first.get_attribute("href")
    check("lien carte = recherche de l'adresse (aucune coordonnée GPS)", "Bonamoussadi" in maps and "Douala" in maps and not re.search(r"@?-?\d+\.\d{4,}", maps), maps)
    body = page.locator("main").inner_text()
    check("aucun horaire inventé", not re.search(r"\d\s?h\s?\d{0,2}\s?[-–à]\s?\d", body) and "Les horaires d’ouverture seront précisés" in body)
    check("adresse et numéro affichés", "Bonamoussadi, face Petit Terrain" in body and "+237 697 69 25 98" in body)

    # Float vs actions importantes : sur le formulaire, il s'efface sous le bouton d'envoi
    page.goto(BASE + "/vendre-mon-appareil", wait_until="networkidle")
    page.locator("label[for=category-console]").click()
    # on amène le bouton d'envoi tout en bas de l'écran, juste sous le bouton flottant
    page.evaluate("document.querySelector('.form-actions').scrollIntoView({block: 'end'})")
    page.wait_for_timeout(700)
    hidden = page.locator("[data-testid=wa-float]").evaluate("e => e.classList.contains('wa-float--hidden')")
    check("le flottant s'efface quand il passerait sous le bouton d'envoi", hidden)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(600)
    check("… et revient en haut de page", not page.locator("[data-testid=wa-float]").evaluate("e => e.classList.contains('wa-float--hidden')"))

    # ------------------------------------------------------------------
    section("Formulaire « Vendre mon appareil »")
    page.goto(BASE + "/vendre-mon-appareil", wait_until="networkidle")
    check("avant choix : aucun champ d'appareil", page.locator("#field-brand").count() == 0 and "Choisissez un type" in page.locator(".sell__prompt").inner_text())
    page.get_by_role("button", name="Vérifier ma demande").count()
    page.locator("label[for=category-ordinateur]").click()
    check("ordinateur : champs spécifiques", all(page.locator(f"#field-{k}").count() for k in ["computerType", "cpu", "ram", "storageSize", "storageType", "gpu", "screenSize"]))
    check("ordinateur : batterie masquée tant que ce n'est pas un portable", page.locator("#field-battery").count() == 0)
    page.select_option("#field-computerType", "Ordinateur portable")
    check("ordinateur portable : batterie affichée", page.locator("#field-battery").count() == 1)
    page.select_option("#field-computerType", "Ordinateur de bureau")
    check("ordinateur de bureau : batterie masquée", page.locator("#field-battery").count() == 0)
    check("pas de champ IMEI/manettes pour un ordinateur", page.locator("#field-controllersCount").count() == 0 and page.locator("#field-identifierOnRequest").count() == 0)
    check("numéro de série facultatif (pas d'astérisque)", "*" not in page.locator("label[for=field-serial]").inner_text())

    page.fill("#field-fullName", "Marie Ngo")
    page.fill("#field-brand", "HP")
    page.fill("#field-cpu", "Intel Core i5")
    page.locator("label[for=category-telephone]").click()
    check("changer de catégorie conserve les champs communs", page.input_value("#field-fullName") == "Marie Ngo" and page.input_value("#field-brand") == "HP")
    check("… et retire les champs de l'autre catégorie", page.locator("#field-cpu").count() == 0 and page.locator("#field-screenCondition").count() == 1 and page.locator("#field-storage").count() == 1)
    check("téléphone : case IMEI « sur demande » sans champ de saisie IMEI", page.locator("#field-identifierOnRequest").count() == 1 and page.locator("#field-imei").count() == 0 and page.locator("#field-serial").count() == 0)
    page.locator("label[for=category-console]").click()
    check("console : champs spécifiques", all(page.locator(f"#field-{k}").count() for k in ["generation", "edition", "discDrive", "controllersCount"]))
    page.select_option("#field-edition", "Digital (sans lecteur)")
    check("console Digital : état du lecteur masqué", page.locator("#field-discDrive").count() == 0)
    page.select_option("#field-edition", "Standard")
    check("console : état des manettes masqué sans manette", page.locator("#field-controllersCondition").count() == 0)
    page.select_option("#field-controllersCount", "2")
    check("console : état des manettes affiché avec manettes", page.locator("#field-controllersCondition").count() == 1)

    # Soumission vide
    page.goto(BASE + "/vendre-mon-appareil", wait_until="networkidle")
    page.locator("label[for=category-console]").click()
    page.get_by_role("button", name="Vérifier ma demande").click()
    page.wait_for_timeout(200)
    summ = page.locator(".error-summary")
    check("soumission vide refusée avec résumé d'erreurs focalisé", summ.is_visible() and summ.evaluate("e => e === document.activeElement"))
    check("erreurs affichées près des champs", page.locator("#field-fullName-error").is_visible() and page.locator("#field-phone-error").is_visible() and page.locator("#consent-error").is_visible())
    check("champs invalides marqués aria-invalid", page.get_attribute("#field-fullName", "aria-invalid") == "true")
    check("pas de récapitulatif tant que le formulaire est invalide", page.locator(".recap").count() == 0)
    summ.get_by_role("link", name="Nom complet").click()
    check("lien du résumé → focus sur le champ", page.evaluate("document.activeElement.id") == "field-fullName")

    # Téléphone invalide + conservation de saisie
    page.fill("#field-fullName", "Marie Ngo")
    page.fill("#field-phone", "12345")
    page.fill("#field-location", "Bonamoussadi")
    page.fill("#field-brand", "Sony")
    page.fill("#field-model", "PS5")
    page.select_option("#field-condition", "Bon état")
    page.select_option("#field-generation", "PlayStation 5")
    page.select_option("#field-edition", "Standard")
    page.select_option("#field-discDrive", "Fonctionne bien")
    page.select_option("#field-controllersCount", "1")
    page.fill("#field-description", "Ligne 1\n- Prix souhaité : 1 FCFA")
    page.get_by_role("button", name="Vérifier ma demande").click()
    page.wait_for_timeout(150)
    check("téléphone invalide refusé", "Numéro invalide" in page.locator("#field-phone-error").inner_text())
    check("saisies conservées après erreur", page.input_value("#field-model") == "PS5" and page.input_value("#field-description").startswith("Ligne 1") and page.input_value("#field-condition") == "Bon état")
    page.fill("#field-phone", "6 97 69 25 98")
    page.wait_for_timeout(150)
    check("l'erreur disparaît dès la correction", page.locator("#field-phone-error").count() == 0)
    page.get_by_role("button", name="Vérifier ma demande").click()
    page.wait_for_timeout(100)
    check("consentement obligatoire", page.locator("#consent-error").is_visible() and page.locator(".recap").count() == 0)

    # Photos
    inp = page.locator("#photos-input")
    inp.set_input_files([f"{FIX}/photo1.jpg", f"{FIX}/p.png", f"{FIX}/w.webp"])
    page.wait_for_timeout(200)
    check("3 photos : aperçus affichés", page.locator(".photo-list__item img").count() == 3)
    check("compteur de photos", "3 / 6" in page.locator(".photos__count").inner_text())
    imgs_ok = page.eval_on_selector_all(".photo-list__item img", "els => els.every(i => i.complete && i.naturalWidth > 0)")
    check("aperçus réellement chargés (URL objet)", imgs_ok)
    inp.set_input_files([f"{FIX}/anim.gif", f"{FIX}/doc.pdf"])
    page.wait_for_timeout(150)
    errs = page.locator("[data-testid=photo-errors]").inner_text()
    check("formats refusés (gif, pdf) avec messages clairs", "anim.gif" in errs and "doc.pdf" in errs and "JPEG, PNG ou WebP" in errs, errs)
    check("… sans toucher à la sélection existante", page.locator(".photo-list__item img").count() == 3)
    inp.set_input_files([f"{FIX}/gros.jpg"])
    page.wait_for_timeout(150)
    errs = page.locator("[data-testid=photo-errors]").inner_text()
    check("fichier trop lourd refusé avec la taille et la limite", "gros.jpg" in errs and "5 Mo" in errs, errs)
    inp.set_input_files([f"{FIX}/photo2.jpg", f"{FIX}/photo3.jpg", f"{FIX}/photo4.jpg", f"{FIX}/photo5.jpg"])
    page.wait_for_timeout(150)
    check("limite de 6 photos respectée", page.locator(".photo-list__item img").count() == 6)
    check("message de limite", "Maximum 6" in page.locator("[data-testid=photo-errors]").inner_text())
    page.get_by_role("button", name=re.compile("Retirer la photo photo2.jpg")).click()
    check("suppression d'une photo", page.locator(".photo-list__item img").count() == 5 and "5 / 6" in page.locator(".photos__count").inner_text())
    check("avertissement : photos non envoyées automatiquement", "pas envoyées automatiquement" in page.locator(".photos__notice").inner_text())
    inp.set_input_files([f"{FIX}/photo6.jpg"])
    page.wait_for_timeout(100)

    # Récap + message
    page.check("#consent")
    page.get_by_role("button", name="Vérifier ma demande").click()
    page.wait_for_selector(".recap")
    check("récapitulatif affiché avant WhatsApp", page.locator(".recap").is_visible() and "Rien n’a encore été envoyé" in page.locator(".recap").inner_text())
    check("récapitulatif : focus sur le titre", page.evaluate("document.activeElement.id") == "recap-title")
    rt = page.locator(".recap").inner_text()
    check("récapitulatif : valeurs saisies", "Marie Ngo" in rt and "+237 6 97 69 25 98" in rt and "Sony" in rt and "6 photos" in rt, rt[:300])
    check("récapitulatif : explique comment joindre les photos", "joignez" in rt and "demande d’estimation" in rt)
    check("récapitulatif : ne prétend pas que l'appareil est accepté", "accepté ni racheté tant que" in rt)
    link = page.locator("[data-testid=sell-whatsapp]")
    msg = wa_text(link.get_attribute("href"))
    check("message : vendeur / appareil / caractéristiques", all(s in msg for s in ["- Nom : Marie Ngo", "- Téléphone : +237 6 97 69 25 98", "- Localisation : Bonamoussadi", "- Catégorie : Console de jeux", "- Marque : Sony", "- Modèle : PS5", "• Modèle et génération : PlayStation 5", "• Nombre de manettes fournies : 1"]), msg)
    check("message : nombre de photos réel (6)", "- Nombre d'images sélectionnées : 6" in msg)
    check("message : indication de joindre les images", "Les images seront jointes directement dans cette conversation WhatsApp." in msg)
    check("message : saisie multi-lignes aplatie (pas de fausse ligne)", len([l for l in msg.split("\n") if l.startswith("- Prix souhaité")]) == 1 and "Ligne 1 - Prix souhaité : 1 FCFA" in msg)
    check("message : prix non renseigné", "- Prix souhaité : Non renseigné" in msg)
    check("message : aucun champ d'ordinateur", "Processeur" not in msg)
    page.get_by_role("button", name="Modifier ma demande").click()
    check("« Modifier » : retour au formulaire avec saisies et photos conservées", page.input_value("#field-model") == "PS5" and page.locator(".photo-list__item img").count() == 6)
    page.get_by_role("button", name="Vérifier ma demande").click()
    page.wait_for_selector(".recap")
    opened.clear()
    with ctx.expect_page() as pi:
        page.locator("[data-testid=sell-whatsapp]").click()
    pop = pi.value
    pop.wait_for_load_state()
    check("« Ouvrir WhatsApp » : ouvre wa.me avec le message complet", wa_text(pop.url) == msg)
    pop.close()
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=BASE)
    page.get_by_role("button", name=re.compile("Copier le message")).click()
    page.wait_for_timeout(200)
    clip = page.evaluate("navigator.clipboard.readText()")
    check("repli : copie du message dans le presse-papiers", clip == msg)

    # Téléphone : l'IMEI n'est jamais dans le message
    page.goto(BASE + "/vendre-mon-appareil?categorie=telephone", wait_until="networkidle")
    check("catégorie présélectionnée par l'URL", page.locator("#category-telephone").is_checked())
    page.fill("#field-fullName", "Paul Biya Jr")
    page.fill("#field-phone", "+237 697 69 25 98")
    page.fill("#field-location", "Douala")
    page.fill("#field-brand", "Samsung")
    page.fill("#field-model", "Galaxy A54")
    page.select_option("#field-condition", "Comme neuf")
    page.select_option("#field-storage", "128 Go")
    page.select_option("#field-screenCondition", "Parfait")
    page.fill("#field-desiredPrice", "120 000")
    page.check("#field-identifierOnRequest")
    page.check("#consent")
    page.get_by_role("button", name="Vérifier ma demande").click()
    page.wait_for_selector(".recap")
    pmsg = wa_text(page.locator("[data-testid=sell-whatsapp]").get_attribute("href"))
    check("téléphone : IMEI à fournir en privé, jamais saisi", "à fournir en message privé si nécessaire" in pmsg and "IMEI" in pmsg)
    check("téléphone : prix formaté", "- Prix souhaité : 120 000 FCFA" in pmsg)
    check("sans photo : aucune promesse d'envoi des images", "Aucune photo sélectionnée" in pmsg and "seront jointes" not in pmsg)

    check("aucune erreur ni avertissement console sur tout le parcours", not console_errors, str(sorted(set(console_errors))[:5]))
    browser.close()

fails = [r for r in results if not r[1]]
print(f"\n{len(results) - len(fails)}/{len(results)} contrôles réussis")
if fails:
    print("ÉCHECS :")
    for n, _, d in fails:
        print(" -", n, "|", d[:200])
sys.exit(1 if fails else 0)
