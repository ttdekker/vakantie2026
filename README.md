# Gezinszomer Elzas 2026 — planner & brainstormbord

Eén-bestands webapp (`index.html`) die alle uitjes rond Schœnbourg (Alsace
Bossue + Vosges du Nord, 18–31 juli 2026) verzamelt, filterbaar maakt, op de
kaart toont en een brainstorm-status per idee bijhoudt. Geen build-stap.
Leaflet zit lokaal in `vendor/leaflet/`, dus de app werkt ook offline (alleen
de kaarttegels hebben internet nodig). Open `index.html` direct, of draai
`python3 -m http.server` in deze map.

## Wat het kan

- **Filteren & zoeken** — zoekbalk, "alleen tijdens verblijf" (18–31 jul), voor
  wie (peuter / kids / ouders), soort, max afstand, sorteren (afstand / datum /
  rating) en "alleen shortlist/geboekt".
- **Regendag-proof** — elke kaart heeft een binnen/buiten/beide-label; de
  ☔-toggle verbergt activiteiten die alleen buiten zijn.
- **Kaartweergave** — schakel tussen Lijst en 🗺️ Kaart. Alle (gefilterde)
  activiteiten staan als gekleurde stippen rond Schœnbourg op de kaart, met een
  popup met info- en route-link. Posities zijn de dorpskern bij benadering; voor
  exacte navigatie gebruik je "Route ↗".
- **Brainstorm-status** per kaart: Shortlist / Geboekt / Nee, met telbalk
  bovenaan. Bewaard in `localStorage`.
- **Exporteren & delen** (werkt op je shortlist + geboekt):
  - **Agenda (.ics)** — items met een datum als agenda-bestand voor je telefoon.
  - **Markdown** — een nette lijst op je klembord om te appen.
  - **Deel-link** — je keuzes (inclusief eigen plannen) gecodeerd in de URL, zo
    deel je het bord zonder account. Open je zo'n link, dan worden de keuzes
    ingeladen.
- **Eigen plannen** toevoegen via de ＋-knop (of direct in de `ACTIVITIES`-array).

## Alle links geverifieerd

Elke activiteit verwijst naar een gecontroleerde, werkende officiële pagina
(operator of toeristenbureau, gecheckt juni 2026). Activiteiten waarvoor geen
eigen officiële website bestaat (bv. de ponytochtjes) krijgen een
**"te verifiëren"**-label en linken naar de
[CCAB-agenda](https://www.alsace-bossue.net/agenda-complet.html). De exacte data
van het CCAB-zomerprogramma worden pas in juni/juli definitief — bevestig per
activiteit via de Info-link of de agenda.

## Datamodel (één activiteit)

```js
{
  id:        "unieke-string",
  title:     "Naam",
  what:      "Korte omschrijving",
  town:      "Plaats",            // moet in COORDS staan voor een kaartstip
  dist:      8,                   // km vanaf Schœnbourg, bij benadering
  category:  "natuur",           // natuur|dieren|water|erfgoed|feest|actief
  tags:      ["peuter","kids","ouders"],
  env:       "buiten",           // buiten | binnen | beide (voor regendag-filter)
  dates:     null                // = altijd beschikbaar
            | ["2026-07-22"]     // losse data
            | {from:"2026-07-24", to:"2026-07-26"}, // periode
  whenLabel: "wo 22 jul · 14–16u",
  rating:    4.6,                // of null
  price:     "€12/kind",
  book:      "OT reserveren",    // of null → toont 'reserveren'-tag
  url:       "https://…",        // geverifieerde officiële link
  img:       null,               // pad "images/x.jpg" of vrije URL; leeg = stempel
  verify:    true,               // optioneel → toont 'te verifiëren'-label
  source:    "ccab"             // ccab | web | eigen
}
```

Een nieuwe plaats op de kaart? Voeg de dorpskern-coördinaten toe aan de
`COORDS`-tabel (`[lat, lon]`).

## Foto's toevoegen

Zet bij een activiteit `img:"images/saintecroix.jpg"` (maak een map `images/`
naast `index.html`) of een vrij gelicentieerde URL (bv. Wikimedia Commons). De
kaart toont 'm automatisch; faalt het laden, dan valt 'ie terug op de
categorie-stempel. Gebruik geen auteursrechtelijk beschermde foto's.

## Mogelijke volgende stappen

- Dag-indeling / agenda-view: groepeer per dag van het verblijf (22 juli is al
  een ankerdag met meerdere opties).
- Weer-API koppelen aan de regendag-toggle (automatisch voorstellen per dag).
- Data los trekken naar een `data.json` + `fetch()`.
