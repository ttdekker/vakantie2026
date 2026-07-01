# PLAN.md — Overhaul "Vakantie 2026" (Elzas gezinsplanner)

**Doel van dit document:** een bouwagent kan hiermee in één keer de complete overhaul uitvoeren.
Lees eerst alles, bouw daarna in de volgorde van §9. Alle UI-tekst is **Nederlands**; dit plan is in het Nederlands geschreven, codecommentaar mag Engels.

---

## 1. Context

- Statische site (GitHub Pages, workflow bestaat al, geen build-stap). Eén `index.html` (~1.700 regels) met inline CSS/JS, lokale Leaflet in `vendor/`, ~45 activiteiten rond **Schœnbourg (67320)**, verblijf **18–31 juli 2026**.
- Gebruikers: Nederlands gezin — Tom & Marloes, Alma (9), Freija (7), Lotta (1½). **Spreekt geen Frans.** Ze willen: relaxen, natuur, lokale cultuur, plezier. De site is een **inspiratiebord**: iedereen bladert, stemt ("wil erheen"), ouders boeken.
- Bestaat al en moet blijven werken: filters, stemmen per gezinslid (localStorage), status Geboekt/Nee, Leaflet-kaart (CARTO Voyager + Esri sat, sleutelvrij), export .ics / Markdown / deel-link (state in URL-hash), eigen plannen toevoegen, werkt vanaf `file://` én Pages.

## 2. Kritische review van de huidige site (waarom deze overhaul)

**Design / sfeer**
1. Het voelt als een **database, geen vakantie**. Compacte hero zonder foto, mono-font labels overal (Space Mono), 4 rijen filtercontrols boven de vouw. Nul "zin-in-vakantie"-gevoel.
2. **Beeldmateriaal is het grootste probleem.** Slechts ~17 van 45 kaarten hebben een foto, en dat zijn lage-resolutie brochurescans (207–354 px breed) die opgeblazen worden → wazig. De rest valt terug op een platte kleurvlak+emoji — dat oogt goedkoop.
3. Kaarten zijn **druk**: categorielabel, titel, plaats, lange tekst, 3–5 badges, prijs, rating, 2 links, 5 stemknopjes, 2 statusknoppen. Te veel gelijkwaardige elementen, geen hiërarchie.
4. Emoji als UI-iconen (⚙ ☰ 🗺️ 📍 👶 🌳 …) rendert per platform anders en oogt rommelig.
5. Mobiel: exportbalk + resultaatregel duwen de eerste kaart ver naar beneden; filterpaneel is een lange ongeordende stapel.

**Functioneel**
6. Er is **geen dag-/agendaweergave**, terwijl de helft van de items een vaste datum heeft. "Wat doen we dinsdag?" is dé vraag die het gezin gaat stellen. (Stond al in README als volgende stap.)
7. Stemmen is voor de kinderen (7 & 9) niet leuk genoeg: kleine lettercirkels onderaan een volwassen kaart. De opdracht "kinderen geven aan wat ze leuk vinden" verdient een eigen, speelse modus.
8. Geen hulp bij het échte pijnpunt: **reserveren in het Frans** (veel items vereisen bellen met het Office de Tourisme).
9. Afstand in km zegt ouders weinig; **rijtijd** is de relevante maat.
10. Geen weer-integratie, terwijl er wél een handmatige regendag-toggle is.
11. Prijzen inconsistent ("gratis", "€", "€€", "€4,50", "—", ""). Rating alleen bij grote attracties.

**Techniek**
12. Elke stem/status-klik doet `grid.innerHTML = …` → focus weg (toetsenbord/a11y) en onnodig herrenderen.
13. `img/actief_fietsen.jpg` en `img/natuur_landschap.jpg` worden nergens gebruikt.
14. Alles in één bestand van 74 KB is onhoudbaar geworden.

## 3. Concept & informatie-architectuur

Van "filterbare lijst" naar **gezinsmagazine + planner** met drie hoofdweergaven:

```
┌───────────────────────────────────────────────┐
│ Hero (foto, countdown, gezin)                 │
├───────────────────────────────────────────────┤
│ Tabs:  ✦ Ontdek   🗺 Kaart   📅 Ons plan      │
├───────────────────────────────────────────────┤
│ Ontdek : favorieten-strip + filters + grid    │
│ Kaart  : Leaflet zoals nu, betere markers     │
│ Ons plan: 14 dagkolommen 18–31 jul + weer     │
├───────────────────────────────────────────────┤
│ Praktisch (contact, taalhulp, noodnummers)    │
└───────────────────────────────────────────────┘
```

- **Desktop:** tabs als segmented control rechtsboven in de sticky balk (zoals nu Lijst/Kaart).
- **Mobiel (<720px):** vaste **bottom-tab-bar** (Ontdek / Kaart / Plan) — app-gevoel, geen lange sticky filterheader meer.
- De export-acties (.ics / Markdown / Deel-link) verhuizen naar "Ons plan" en naar een klein "Delen"-icoon in de header; de permanente exportbalk boven de grid verdwijnt.

## 4. Bestandsstructuur (na overhaul)

Geen build-stap, geen ES-modules (moet vanaf `file://` werken → gewone `<script defer>`-tags, globals):

```
index.html                  — alleen markup + script/link-tags
assets/css/style.css        — alle styling
assets/js/data.js           — PEOPLE, CATS, COORDS, ACTIVITIES, config (TRIP_FROM/TO, HOME)
assets/js/app.js            — state, render, filters, votes, export, kids-modus, taalhulp
assets/js/planner.js        — dagplanner + weer (Open-Meteo)
assets/js/map.js            — Leaflet-weergave
img/                        — foto's (zie §6) + img/ATTRIBUTION.md
icons.svg                   — SVG-sprite met UI-iconen (zie §5)
manifest.webmanifest + img/icon-192.png / icon-512.png
vendor/leaflet/             — ongewijzigd
.nojekyll                   — laten staan (verplicht voor Pages)
.github/workflows/deploy.yml— ongewijzigd
README.md                   — aan het eind actualiseren
```

**Behoud verplicht:** alle 45 activiteiten met exact dezelfde `id`'s, geverifieerde `url`'s, datums, prijzen en teksten (redactie van teksten mag, feiten niet — **verzin geen nieuwe activiteiten of links**). localStorage-key `elzas2026.v1` blijft; breid het object uit (zie §8) zodat bestaande stemmen/statussen van het gezin niet verloren gaan.

## 5. Designsysteem

**Sfeer:** rustig, warm, "Frans platteland in de zomer". Veel wit(ruimte), foto's doen het werk.

- **Kleur:** behoud de bestaande paletbasis (`--paper #EEF1EC`, `--ink #182524`, categorie-accenten natuur/dieren/water/erfgoed/feest/actief) — die is goed. Verwijder visuele ruis: minder borders, minder schaduwvarianten; kaarten krijgen `border:none` + één zachte schaduw.
- **Typografie:** **Bricolage Grotesque** (koppen) + **Inter** (alles). **Space Mono verdwijnt volledig** — grootste bron van het rommelige gevoel. Labels worden Inter 11px/600/uppercase/letter-spacing .08em.
- **Iconen:** geen emoji meer in UI-chrome. Maak `icons.svg` (inline SVG-sprite, stroke 1.75, 20×20) met: zoek, lijst, kaart, kalender, pin, route, auto/klok, euro, regen, zon, huis-binnen, boom-buiten, hart, hart-gevuld, vink, kruis, delen, download, kopieer, telefoon, plus, filter, pijl-extern, ster. Emoji mag alléén nog in redactionele tekst en de categorie-fallbackafbeeldingen.
- **Chips/knoppen:** één chipstijl (radius 999, 36px hoog, aanraakvriendelijk), actief = ink-gevuld. Eén primaire knop (ink), één ghost.
- **Kaart-component (activiteit), nieuwe opbouw:**
  1. Afbeelding 16:9 (`aspect-ratio:16/9`, `object-fit:cover`, lazy, expliciete `width/height`-attrs). Op de foto max 2 chips: linksboven datum (indien `whenLabel`), rechtsonder **rijtijd** ("± 25 min").
  2. Body: categorielabel (klein, accentkleur) · titel (20px) · plaats · omschrijving `-webkit-line-clamp:3`.
  3. Eén metaregel met iconen: prijs · binnen/buiten · "reserveren"-stip · ★rating (indien aanwezig) · ⚠ te verifiëren (indien `verify`).
  4. Stemrij: 5 avatar-cirkels (32px, initiaal, persoonskleur; gevuld = wil erheen) — blijft tap-to-toggle.
  5. Voetregel: links `Info ↗` + `Route ↗`, rechts een compacte **Geboekt**-toggle (vinkje-pill, groen indien aan) en een klein ✕ ("verberg") dat de oude status "nee" zet. Verborgen items verdwijnen uit de grid; een regel onder de grid "🚫 n verborgen ideeën — toon" haalt ze terug (grijs, met herstelknop).
- **Rijtijd:** `minuten = Math.round(dist * 1.15)`, toon "± X min rijden" (bij <5 → "vlakbij"). Km alleen nog in de title-tooltip.
- **Hero:** volledige breedte, 260–340px hoog, landschapsfoto (zie §6) met donkere gradient-overlay onderaan; daarin: eyebrow "Alsace Bossue · Vosges du Nord", H1 **"Wat doen we deze zomer?"**, subregel "Schœnbourg · 18–31 juli 2026" en een **countdown-badge**: vóór 18 jul "Nog X dagen!", tijdens "Dag X van 14 🌞", erna "Dat was 'm — tot volgend jaar!". De ooievaar-SVG blijft als klein merkje in de hoek.
- **Filters (Ontdek), gereduceerd:**
  - Rij 1: zoekveld + (desktop) view-tabs + "＋ Eigen plan".
  - Rij 2, horizontaal scrollend op mobiel: **presetchips** `☔ Regen-oké` (env≠buiten) · `Gratis` · `Met Lotta` (tag peuter) · `≤ 20 min` (maxdist 15) — gevolgd door de 6 categoriechips (met kleurstip).
  - "Meer filters"-knop → klein paneel/popover met: sorteer (standaard **"Aanraders"** = stemmen desc → rating desc → rijtijd asc; verder dichtstbij/datum), "hele zomer tonen" (inverse van onlyTrip, default uit), wie-wil-erheen-chips, "alleen geboekt", afstand.
  - Badge met actief-filter-teller + "wis alles". De aparte regels VOOR WIE GESCHIKT (peuter/kids/ouders-chips) vervallen als aparte rij; `Met Lotta` dekt de peuter-case, de rest zat toch al in bijna alles.
- **Toegankelijkheid:** behoud `aria-pressed`/focus-visible. **Fix §2.12:** stem- en statusklikken muteren de bestaande DOM-knop (class/aria) in plaats van de hele grid opnieuw te renderen; volledige re-render alleen bij filterwijziging.

## 6. Beeldplan (belangrijkste kwaliteitssprong)

Doel: **elke kaart een goede foto**, hero-foto, totaalgewicht van de pagina bij eerste load < 1,5 MB.

1. **Sourcing.** Gebruik uitsluitend vrij gelicentieerd materiaal, primair **Wikimedia Commons** (API: `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=...&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&format=json&origin=*`). Kies per activiteit een foto van de **echte plek/attractie**; alleen als die er niet is een passende regiofoto (Vosges du Nord/Alsace Bossue). Licentie moet PD/CC0/CC BY/CC BY-SA zijn; noteer bestand, auteur en licentie in `img/ATTRIBUTION.md` en link die in de footer ("Fotoverantwoording").
   Zoektermen per item (richtlijn): Parc Sainte-Croix Rhodes; Cigoland / Montagne des Singes Kintzheim; La Petite-Pierre; Château des Rohan Saverne; Château du Haut-Barr; roseraie Saverne / jardin botanique col de Saverne; plan incliné Saint-Louis-Arzviller; étang Lévêque Sarrebourg; Château de Fleckenstein; Le Vaisseau Strasbourg; Parc de l'Orangerie; Petite France Strasbourg; Haut-Kœnigsbourg; NaturOparC Hunawihr; Château de Lichtenberg; Musée Lalique Wingen-sur-Moder; étang de Hanau; citadelle de Bitche; cascade du Nideck; Kirchberg Berg Alsace; canal de la Sarre / Sarrewerden; Dehlingen villa gallo-romaine; Mackwiller; Saverne marché.
2. **Verwerking.** Download op ~900px breed, hercomprimeer naar JPEG kwaliteit ~72, doel ≤ 120 KB per kaartfoto. Hero: ~1600px, ≤ 250 KB. Overschrijf de wazige brochurescans wanneer een beter alternatief bestaat; zo niet, behoud de scan (beter iets echts dan niets) maar toon 'm nooit breder dan hij scherp is.
3. **Fallback zonder foto.** Vervang de emoji-fallback door **6 duotone SVG-illustraties** (één per categorie: bos, boerderijdier, kano op water, Romeinse zuil, circusvlag, fiets) in de categoriekleur op `--paper2`-achtergrond — inline of als losse `img/fallback-*.svg`. Moet er bewust en verzorgd uitzien, niet als placeholder.
4. **Bestaand.** `actief_fietsen.jpg` inzetten voor Randoland/vélorail-achtige items of verwijderen; `natuur_landschap.jpg` mag hero-fallback worden. Geen dode verwijzingen achterlaten.
5. **Kwaliteitsregel:** geen foto upscalen boven bronbreedte; `onerror` valt terug op de categorie-SVG (niet `this.remove()`).

## 7. Nieuwe features (met acceptatiecriteria)

### 7.1 "Ons plan" — dagplanner (hoogste prioriteit)
- Weergave: 14 dagen, **za 18 t/m vr 31 juli 2026**. Mobiel verticale lijst per dag; desktop 2-koloms grid van dagkaarten.
- Per dag automatisch: alle activiteiten met die datum (uit `dates`), gemarkeerd of ze geboekt zijn; plus de door het gezin **ingeplande** items.
- Inplannen: op elke activiteitkaart (Ontdek) een "📅 Plan in"-actie → datumkiezer beperkt tot 18–31 jul → item verschijnt op die dag. Verwijderen kan in de dagweergave. Opslag: `store.plan = { "2026-07-21": ["velorail", …] }`.
- Dagkaart toont: dagnaam + datum, weericoon (7.2), items (mini-kaartjes: fotothumb, titel, tijdlabel, stem-avatars, geboekt-vink), en bij lege dagen: "Nog niks — rustdag? 🌿" plus 2 suggestiechips (hoogst gestemde nog niet ingeplande items die die dag kunnen).
- .ics-export (verplaatst naar deze tab) neemt nu mee: geboekte items met datum **én** ingeplande items (ingeplande dag = event-datum). Markdown-export idem, gegroepeerd per dag.
- **Acceptatie:** item inplannen → zichtbaar op dag → overleeft reload → zit in deel-link → verschijnt in .ics met juiste datum.

### 7.2 Weer (Open-Meteo, sleutelvrij)
- `https://api.open-meteo.com/v1/forecast?latitude=48.8292&longitude=7.2654&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe/Berlin&forecast_days=16`
- Toon per dag in "Ons plan" (alleen voor datums binnen het forecast-bereik): icoon + max/min + regenkans. Bij regenkans ≥ 60%: subtiele hint "☔ Regendag? Bekijk binnen-ideeën" die de Ontdek-tab opent met Regen-oké-preset aan.
- Cache respons in `sessionStorage` (3 uur). **Faalt de fetch (offline/file://), verberg alles weersgerelateerd zonder foutmelding.**
- **Acceptatie:** met netwerk: iconen zichtbaar voor komende dagen; zonder netwerk: geen console-errors, layout intact.

### 7.3 Kids-stemmodus ("Kies maar!")
- Doel: Alma (9) en Freija (7) laten swipen wat ze leuk vinden.
- Entry: opvallende knop in de Ontdek-tab: "🎉 Kies maar! — wat vind jij leuk?".
- Flow: (1) fullscreen overlay "Wie ben jij?" met 5 grote avatarknoppen → (2) deck van activiteiten die passen bij die persoon (voor kids: `tags` bevat kids; voor Lotta: peuter; ouders: alles) waar die persoon nog niet op stemde, in willekeurige volgorde → grote kaart met foto, titel, één zin → twee grote knoppen **❤️ Leuk!** en **➡️ Volgende** (swipe l/r als extraatje, knoppen zijn de vereiste interactie) → voortgang "7 / 23" → einde: "Klaar! Je hebt X favorieten ❤️" met knop "Bekijk jullie lijstje".
- ❤️ schrijft gewoon een stem in `store.votes` (zelfde datamodel).
- **Acceptatie:** stemmen uit de modus zijn direct zichtbaar op de kaarten en in de favorieten-strip; overlay sluitbaar met ✕ en Esc; werkt op 390px.

### 7.4 Favorieten van het gezin
- Bovenaan Ontdek een horizontaal scrollende strip "❤️ Onze favorieten" zodra ≥ 3 items minstens 2 stemmen hebben: gesorteerd op aantal stemmen, kaartjes met foto + titel + avatar-rij. Items met 5/5 stemmen krijgen badge **"Iedereen wil dit!"**.
- **Acceptatie:** strip verschijnt/verdwijnt live met stemmen; klik scrollt naar / opent de betreffende kaart.

### 7.5 Taalhulp (gezin spreekt geen Frans)
- Sectie "🇫🇷 Even Frans" in het Praktisch-blok: 10–12 zinnen met NL → FR → fonetische hint, gericht op dit gezin: reserveren via OT, "Spreekt u Engels?", bestellen (2 volwassenen/3 kinderen), kinderstoel, allergie/luierruimte, betalen, bedanken. Elke zin een kopieerknop.
- **Bel-script per activiteit:** op kaarten met `book` een uitklapregel "📞 Zo reserveer je" met gegenereerde zin: *"Bonjour, je voudrais réserver « {title} » pour le {datum in het Frans}. Nous sommes deux adultes et trois enfants (9 ans, 7 ans et un bébé). Est-ce que vous parlez anglais ? Merci !"* + NL-vertaling + kopieerknop + de telefoonlink uit `book`/footer.
- **Acceptatie:** kopieerknoppen werken (met toast), telefoonnummers zijn `tel:`-links.

### 7.6 Praktisch-blok (vervangt de huidige footer-kolommen)
- Kaartjes: **Reserveren & info** (OT 03 88 00 40 39, mail, GAP 03 88 00 55 55, CCAB-agenda-link — bestaande gegevens overnemen), **Markt & vers** (donderdagochtend Saverne, bestaande tekst), **Noodnummers** (112 algemeen · 15 SAMU · 17 politie · 18 brandweer · 3237 apotheek-wachtdienst), **Even Frans** (7.5), **Fotoverantwoording** (link naar ATTRIBUTION.md), en de bestaande "check vlak voor vertrek"-tekst.

### 7.7 PWA-licht
- `manifest.webmanifest` (naam "Elzas 2026", themakleur `#EEF1EC`, icons 192/512 — genereer simpel icoon met de ooievaar op groen) + meta-tags, zodat de kids 'm op het homescreen kunnen zetten. **Geen service worker** (scope/cache-gedoe op Pages niet waard).

## 8. Datamodel & opslag

- `ACTIVITIES` ongewijzigd qua inhoud; voeg per item optioneel toe: `img` (nieuw pad), `priceLevel: "gratis"|"€"|"€€"` + laat bestaande `price`-string als detail. Normaliseer weergave: chip toont priceLevel, tooltip de exacte string.
- `store` (key `elzas2026.v1`) wordt: `{ status:{}, votes:{}, custom:[], plan:{} }` — ontbrekend `plan` bij load initialiseren (migratie = niets kapotmaken).
- Deel-link-payload: `{s, v, c, p}`; oude links zonder `p` blijven werken; merge-gedrag (union) zoals nu, plan merged per dag (union van ids).

## 9. Bouwvolgorde

1. **Refactor** naar bestandsstructuur §4, zonder gedragswijziging; verifieer dat alles nog werkt (lijst, kaart, stemmen, export, file://).
2. **Designsysteem + kaartcomponent + hero + filters** (§5): grootste visuele slag. Space Mono eruit, iconensprite erin, mobiele bottom-tabs.
3. **Beeldplan** (§6): foto's sourcen, comprimeren, ATTRIBUTION.md, fallback-SVG's.
4. **Ons plan + weer** (§7.1, 7.2) incl. verplaatste export.
5. **Kids-modus + favorieten-strip** (§7.3, 7.4).
6. **Taalhulp + Praktisch + PWA** (§7.5–7.7).
7. **README actualiseren**, QA (§10), commit & push.

## 10. QA-checklist (verplicht vóór afronden)

- [ ] `python3 -m http.server` + Playwright-screenshots op 390, 768 en 1440 px van: Ontdek, Kaart, Ons plan, kids-modus, filters open — geen kapotte layout, geen console-errors.
- [ ] Alle `img`-verwijzingen in `data.js` bestaan als bestand (scriptmatig checken); geen 404's; geen foto boven bronresolutie geschaald.
- [ ] Alle 45 oorspronkelijke activiteit-`id`'s en `url`'s ongewijzigd aanwezig (diff tegen huidige `ACTIVITIES`).
- [ ] Stemmen/geboekt/inplannen: klik → persist na reload → aanwezig in deel-link → deel-link openen in schone sessie merget correct.
- [ ] .ics: geboekt-met-datum én ingeplande items; geldige structuur (BEGIN/END-paren, CRLF); import getest in minimaal een parser-check.
- [ ] Focus blijft op de aangeklikte stem-/statusknop (geen full re-render bij die acties); alles bedienbaar met toetsenbord.
- [ ] Werkt vanaf `file://` (geen modules, weer faalt stil) én via http.
- [ ] Eerste-load gewicht < 1,5 MB (netwerk-tab check); afbeeldingen lazy met width/height.
- [ ] `.nojekyll` en deploy-workflow onaangetast; site draait na merge op Pages.

## 11. Buiten scope

Geen backend/accounts, geen build-stap, geen Google Maps JS API (bewust sleutelvrij — zie README), geen service worker, geen nieuwe activiteiten of niet-geverifieerde links, geen auteursrechtelijk beschermde foto's.
