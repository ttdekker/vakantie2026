# Elzas 2026 — gezinsplanner & inspiratiebord

Statische webapp (geen build-stap) die alle uitjes rond Schœnbourg (Alsace
Bossue + Vosges du Nord, **18–31 juli 2026**) verzamelt: ontdekken, stemmen,
op de kaart bekijken en dag voor dag plannen. Draait op GitHub Pages; werkt
ook lokaal via `python3 -m http.server` of direct vanaf `file://` (alleen de
kaarttegels en het weerbericht hebben internet nodig).

## Weergaven

- **Ontdek** — fotokaarten met rijtijd vanaf het huis, prijs, binnen/buiten
  en per gezinslid een stemknop ("wil erheen"). Presetfilters (Regen-oké,
  Gratis, Met Lotta, ≤ 20 min), categorieën, zoeken en een "Meer"-paneel
  (sorteren, hele zomer, alleen geboekt, wie wil erheen). Bovenaan verschijnt
  automatisch **Onze favorieten** zodra genoeg items 2+ stemmen hebben; bij
  5/5 stemmen: "Iedereen wil dit!".
- **Kaart** — Leaflet (lokaal in `vendor/`, lazy geladen) met CARTO
  Voyager + Esri-satelliet, categoriekleuren, popups met foto en stemmen, en
  het verblijf als pulserende thuis-pin. Sleutelvrij; navigatie loopt via
  Google Maps-deeplinks ("Route").
- **Ons plan** — 14 dagkaarten (18–31 juli). Activiteiten met een vaste datum
  staan er automatisch op; alles zonder datum plan je in via "Plan in" op een
  kaart. Per dag het weerbericht (Open-Meteo, sleutelvrij, faalt stil) met een
  regendag-hint. Lange periodes (expo's, Anim'ta rue) lopen mee als
  "doorlopend". Export: **Agenda (.ics)** (geboekt + ingepland) en **Kopieer
  lijstje** (Markdown per dag, voor WhatsApp).

## Speciaal voor het gezin

- **Kies maar!** — fullscreen swipe-modus voor de kinderen: kies je avatar,
  swipe of tik ❤️ Leuk! / Volgende door de uitjes. Elke ❤️ is een gewone stem.
- **Even Frans** — kopieerbare zinnen met fonetische hint, plus per
  reserveer-activiteit een uitklapbaar **bel-script** (Frans + Nederlands +
  belknop naar het juiste nummer).
- **Deel-link** (deelknop in de balk) — keuzes, stemmen, eigen plannen én
  dagplanning reizen gecodeerd mee in de URL; openen op een ander toestel
  merget alles met wat daar al staat. Geen account nodig.
- **PWA** — `manifest.webmanifest` + iconen: zet 'm op je homescreen.

## Structuur

```
index.html            markup + SVG-iconensprite
assets/css/style.css  al het design
assets/js/data.js     PEOPLE · CATS · COORDS · ACTIVITIES · TRIP_FROM/TO
assets/js/app.js      state, filters, kaarten, stemmen, kids-modus, export
assets/js/map.js      Leaflet-weergave (lazy geladen bij eerste gebruik)
assets/js/planner.js  dagplanner + Open-Meteo-weer
img/                  foto's + fallback-SVG's + ATTRIBUTION.md
vendor/leaflet/       Leaflet lokaal
```

Gewone `<script defer>`-globals, bewust geen ES-modules: zo blijft `file://`
werken. Opslag in `localStorage` onder `elzas2026.v1`
(`{status, votes, custom, plan}`).

## Data

Eén activiteit (`assets/js/data.js`):

```js
{
  id:"unieke-string", title:"Naam", what:"Korte omschrijving",
  town:"Plaats",                  // moet in COORDS staan voor een kaartstip
  coords:[lat,lon],               // optioneel: exacte pin i.p.v. dorpskern
  dist:8,                         // km vanaf Schœnbourg (rijtijd ≈ dist × 1,15 min)
  category:"natuur",              // natuur|dieren|water|erfgoed|feest|actief
  tags:["peuter","kids","ouders"],
  env:"buiten",                   // buiten|binnen|beide (regen-filter)
  dates:null | ["2026-07-22"] | {from:"…",to:"…"},  // ≤3 dagen → per dag in Ons plan, langer → "doorlopend"
  whenLabel:"wo 22 jul · 14–16u", rating:4.6|null, price:"€12/kind",
  book:"OT reserveren"|null,      // → toont reserveren + bel-script
  url:"https://…",                // geverifieerde officiële pagina
  img:"img/x.jpg"|null,           // leeg → nette categorie-SVG
  verify:true,                    // optioneel: "checken"-label
  source:"ccab"|"web"|"eigen"
}
```

Alle URL's zijn geverifieerde officiële pagina's (juni 2026). Activiteiten
zonder eigen site linken naar de
[CCAB-agenda](https://www.alsace-bossue.net/agenda-complet.html); de exacte
data van het zomerprogramma worden pas in juni/juli definitief.

## Foto's

Foto's komen van Wikimedia Commons (vrij gelicentieerd, verkleind en
gecomprimeerd) — bronnen en licenties staan in
[`img/ATTRIBUTION.md`](img/ATTRIBUTION.md). Items zonder foto krijgen een
duotone categorie-illustratie (`img/fallback-*.svg`). Nieuwe foto toevoegen:
±760 px breed, ≤ 80 KB, pad in `img:` zetten.

## Waarom geen Google Maps JavaScript-API

Die vereist een API-sleutel met billing. De kaart is bewust sleutelvrij
(Leaflet + CARTO/Esri-tegels); voor echte navigatie linkt elke popup en kaart
diep naar Google Maps. Het weer komt eveneens sleutelvrij van
[Open-Meteo](https://open-meteo.com) en verschijnt alleen voor dagen binnen
het voorspelbereik (±16 dagen).
