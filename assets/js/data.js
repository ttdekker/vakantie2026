/* ====================================================================
   DATA — activiteiten, gezin, categorieën, coördinaten.
   Voeg hier simpel nieuwe activiteiten toe (of via de knop ＋ Eigen plan).
   Velden: zie README.md. Alle url's zijn geverifieerde officiële
   pagina's (juni 2026). Categorieën: natuur · dieren · water · erfgoed ·
   feest · actief
   ==================================================================== */
const HOME = "27 Rue Lot. Waldmatt, 67320 Schœnbourg, France";
const AGENDA = "https://www.alsace-bossue.net/agenda-complet.html";

/* Gezinsleden — voor de 'wie wil erheen'-stemknoppen */
const PEOPLE = {
  alma:    {name:"Alma",    color:"#D1495B"},
  freija:  {name:"Freija",  color:"#E8871E"},
  marloes: {name:"Marloes", color:"#7A5195"},
  tom:     {name:"Tom",     color:"#2A7DE1"},
  lotta:   {name:"Lotta",   color:"#3E9B6D"},
};

const CATS = {
  natuur:{label:"Natuur",  color:"#3E7A4E", emoji:"🌲"},
  dieren:{label:"Dieren & boerderij", color:"#D98E2B", emoji:"🐐"},
  water: {label:"Water & varen", color:"#2C6E8F", emoji:"🛶"},
  erfgoed:{label:"Erfgoed & cultuur", color:"#6E3B55", emoji:"🏛️"},
  feest: {label:"Feest & spektakel", color:"#B85C4A", emoji:"🎪"},
  actief:{label:"Actief", color:"#2E7D74", emoji:"🚲"},
};

/* Dorpskern-coördinaten (bij benadering) voor de kaartweergave */
const COORDS = {
  "Schœnbourg":[48.8292222,7.2654444],   /* exacte locatie verblijf: 48°49'45.2"N 7°15'55.6"E */
  "Rhodes":[48.7560,6.9450],
  "Kintzheim":[48.2569,7.3950],
  "La Petite-Pierre":[48.8589,7.3175],
  "Saverne":[48.7411,7.3625],
  "Arzviller":[48.7131,7.2272],
  "Sarrebourg":[48.7372,7.0553],
  "Drulingen":[48.8658,7.1819],
  "Sarrewerden":[48.9169,7.0731],
  "Altwiller":[48.9258,6.9969],
  "Dehlingen":[48.9719,7.1622],
  "Lorentzen":[48.9669,7.1311],
  "Berg":[48.8806,7.2206],
  "Hirschland":[48.9011,7.1664],
  "Harskirchen":[48.9169,7.0181],
  "Mackwiller":[48.9511,7.1431],
  "Wolfskirchen":[48.9011,7.0875],
  "Sarre-Union":[48.9389,7.0900],
  "Steinbourg":[48.7567,7.4042],
  "Schiltigheim":[48.6075,7.7508],
  "Alsace Bossue":[48.8800,7.1400],
  "Voellerdingen":[48.9122,7.0881],
  "Ratzwiller":[48.9028,7.1328],
  "Lembach":[49.0064,7.7664],
  "Strasbourg":[48.5839,7.7455],
  "Orschwiller":[48.2494,7.3444],
  "Hunawihr":[48.1761,7.3019],
  "Lichtenberg":[48.9214,7.4869],
  "Wingen-sur-Moder":[48.9169,7.3831],
  "Philippsbourg":[48.9861,7.6531],
  "Bitche":[49.0522,7.4283],
  "Oberhaslach":[48.5853,7.3161],
};

const ACTIVITIES = [
  /* ---- Omgeving / grotere attracties (web) ---- */
  {id:"saintecroix", title:"Parc animalier de Sainte-Croix", what:"130 ha natuurpark met Europese fauna, ~1.500 dieren in halve vrijheid. Topper, reken op een hele dag.", town:"Rhodes", dist:40, category:"dieren", tags:["peuter","kids","ouders"], env:"buiten", dates:null, rating:4.6, price:"€€", url:"https://parcsaintecroix.com", img:"img/saintecroix.jpg", source:"web"},
  {id:"kintzheim", title:"Cigoland + Volerie des Aigles + Montagne des Singes", what:"Ooievaarpark met attracties, roofvogelshow en apenberg, dicht bij elkaar. Ver — maak er een dagtrip van.", town:"Kintzheim", dist:90, category:"dieren", tags:["kids","ouders"], env:"buiten", dates:null, rating:4.6, price:"€€", url:"https://cigoland.fr", img:"img/kintzheim.jpg", source:"web"},
  {id:"petitepierre", title:"La Petite-Pierre & Vosges du Nord", what:"Vestingdorp met bos, makkelijke wandelingen en speeltuinen. Kinderwagen-vriendelijk op verharde paden.", town:"La Petite-Pierre", dist:18, category:"natuur", tags:["peuter","kids","ouders"], env:"beide", dates:null, rating:4.5, price:"gratis", url:"https://tourisme.hanau-lapetitepierre.alsace", img:"img/petitepierre.jpg", source:"web"},
  {id:"rohan", title:"Château des Rohan & centrum Saverne", what:"Kasteel ('klein Versailles'), vakwerkhuizen en rozentuin (~8.500 rozen). Kort en kindvriendelijk.", town:"Saverne", dist:20, category:"erfgoed", tags:["kids","ouders"], env:"beide", dates:null, rating:4.1, price:"€", url:"https://www.tourisme-saverne.fr", img:"img/rohan.jpg", source:"web"},
  {id:"hautbarr", title:"Château du Haut-Barr", what:"Kasteelruïne op rotsen ('het oog van de Elzas'), mooi uitzicht. ~1,5 km door het bos — draagzak voor de jongste.", town:"Saverne", dist:21, category:"erfgoed", tags:["kids","ouders"], env:"buiten", dates:null, rating:4.5, price:"gratis", url:"https://www.tourisme-saverne.fr", img:"img/hautbarr.jpg", source:"web"},
  {id:"oceanide", title:"Centre nautique L'Océanide", what:"Binnen- en buitenbad met peuterbad. Handig op een warme dag.", town:"Saverne", dist:20, category:"water", tags:["peuter","kids","ouders"], env:"beide", dates:null, rating:3.8, price:"€", url:"https://www.cc-saverne.fr", img:null, source:"web"},
  {id:"botanique", title:"Jardin botanique du col de Saverne", what:"Botanische tuin / arboretum van 2,5 ha. Rustig en mooi, dagelijks open mei–aug.", town:"Saverne", dist:22, category:"natuur", tags:["kids","ouders"], env:"buiten", dates:null, rating:4.0, price:"€", url:"https://www.jardin-botanique-saverne.org", img:"img/botanique.jpg", source:"web"},
  {id:"planincline", title:"Plan Incliné de Saint-Louis-Arzviller", what:"Unieke scheepslift in Europa (44 m) + museum. Korte rondleiding ideaal; boottocht ook mogelijk via dezelfde uitbater.", town:"Arzviller", dist:35, category:"actief", tags:["kids","ouders"], env:"buiten", dates:null, rating:4.5, price:"€€", url:"https://www.plan-incline.com", img:"img/planincline.jpg", source:"web"},
  {id:"sarrebourg", title:"Plan d'eau de Sarrebourg (Étang Lévêque)", what:"Recreatiemeer met strandje, zwemvijver en picknick. Fijn voor warme dagen.", town:"Sarrebourg", dist:30, category:"water", tags:["peuter","kids","ouders"], env:"buiten", dates:null, rating:4.0, price:"gratis", url:"https://www.tourisme-sarrebourg.fr/fr/base-de-loisirs", img:"img/sarrebourg.jpg", source:"web"},

  /* ---- Verder weg — dagtripjes de moeite waard (web) ---- */
  {id:"fleckenstein", title:"Château de Fleckenstein & P'tit Fleck", what:"Spectaculaire rotsburcht in het noordelijke Vosges-woud. Met het speelse ontdekkingsparcours 'P'tit Fleck' en het openluchtspel 'Le Château des Défis' een topper voor kinderen.", town:"Lembach", dist:48, category:"erfgoed", tags:["kids","ouders"], env:"buiten", dates:null, rating:4.5, price:"€€", url:"https://www.fleckenstein.fr", img:"img/fleckenstein.jpg", source:"web"},
  {id:"vaisseau", title:"Le Vaisseau (kinder-sciencemuseum)", what:"Interactief sciencemuseum in Straatsburg waar alles draait om zelf doen en ontdekken. Ideaal voor een regendag, leuk vanaf ~3 jaar.", town:"Strasbourg", dist:55, category:"erfgoed", tags:["peuter","kids","ouders"], env:"binnen", dates:null, rating:4.6, price:"€€", url:"https://www.levaisseau.com", img:"img/vaisseau.jpg", source:"web"},
  {id:"orangerie", title:"Parc de l'Orangerie (Straatsburg)", what:"Gratis stadspark met ooievaars, een mini-boerderij, speeltuinen, bootjes en een meertje. Perfect te combineren met de binnenstad.", town:"Strasbourg", dist:55, category:"natuur", tags:["peuter","kids","ouders"], env:"buiten", dates:null, rating:4.6, price:"gratis", url:"https://www.strasbourg.eu", img:"img/orangerie.jpg", source:"web"},
  {id:"strasbourg", title:"Straatsburg: Grande Île & boottocht", what:"Unesco-binnenstad met de kathedraal (astronomisch uurwerk), Petite France en een Batorama-boottocht over de Ill. Grote dagtrip, maar de moeite waard.", town:"Strasbourg", dist:55, category:"erfgoed", tags:["kids","ouders"], env:"beide", dates:null, rating:4.7, price:"€€", url:"https://www.batorama.com", img:"img/strasbourg.jpg", source:"web"},
  {id:"hautkoenigsbourg", title:"Château du Haut-Kœnigsbourg", what:"Volledig herbouwd middeleeuws kasteel op 750 m met weids uitzicht over de Elzasvlakte. Indrukwekkend voor jong en oud; combineer eventueel met Kintzheim.", town:"Orschwiller", dist:82, category:"erfgoed", tags:["kids","ouders"], env:"beide", dates:null, rating:4.5, price:"€", url:"https://www.haut-koenigsbourg.fr", img:"img/hautkoenigsbourg.jpg", source:"web"},
  {id:"naturoparc", title:"Naturoparc Hunawihr (ooievaars & otters)", what:"Reservaat met ooievaars, otters, bevers en aalscholvers — inclusief een visshow. Klein, groen en heel toegankelijk met een kinderwagen.", town:"Hunawihr", dist:75, category:"dieren", tags:["peuter","kids","ouders"], env:"buiten", dates:null, rating:4.4, price:"€€", url:"https://www.naturoparc.fr", img:"img/naturoparc.jpg", source:"web"},
  {id:"lichtenberg", title:"Château de Lichtenberg", what:"Vestingkasteel met een verrassende moderne staal-en-glas-inbouw, tentoonstellingen en zomerevenementen. Mooi uitzicht en relatief dichtbij.", town:"Lichtenberg", dist:22, category:"erfgoed", tags:["kids","ouders"], env:"beide", dates:null, rating:4.3, price:"€", url:"https://www.chateaudelichtenberg.com", img:"img/lichtenberg.jpg", source:"web"},
  {id:"lalique", title:"Musée Lalique", what:"Sfeervol glasmuseum in Wingen-sur-Moder, in het hart van de Vosges du Nord. Rustig en mooi; vooral voor de ouders en de oudere kids.", town:"Wingen-sur-Moder", dist:25, category:"erfgoed", tags:["kids","ouders"], env:"binnen", dates:null, rating:4.4, price:"€", url:"https://www.musee-lalique.com", img:"img/lalique.jpg", source:"web"},
  {id:"hanau", title:"Étang de Hanau (zwemmeer)", what:"Bewaakt zwemmeer met strandje midden in het bos van de Vosges du Nord — zwemmen, waterfietsen en picknick. Fijn op een hete dag.", town:"Philippsbourg", dist:38, category:"water", tags:["peuter","kids","ouders"], env:"buiten", dates:null, rating:4.2, price:"€", url:"https://www.parc-vosges-nord.fr", img:"img/hanau.jpg", source:"web", verify:true},
  {id:"bitche", title:"Citadelle de Bitche", what:"Imposante 18e-eeuwse vestingstad met een audiogeleide route door de ondergrondse gangen. Even rijden, maar bijzonder.", town:"Bitche", dist:42, category:"erfgoed", tags:["kids","ouders"], env:"beide", dates:null, rating:4.4, price:"€€", url:"https://www.citadelle-bitche.com", img:"img/bitche.jpg", source:"web"},
  {id:"nideck", title:"Cascade & château du Nideck", what:"Bekende waterval met kasteelruïne en uitzichtpunt in het Bruche-woud. Pittige boswandeling (~1,5–2u) — stevige schoenen aan.", town:"Oberhaslach", dist:45, category:"natuur", tags:["kids","ouders"], env:"buiten", dates:null, rating:4.5, price:"gratis", url:"https://www.valleedelabruche.fr", img:"img/nideck.jpg", source:"web", verify:true},

  /* ---- CCAB-zomerprogramma, BINNEN het verblijf (18–31 juli) ---- */
  {id:"animtarue", title:"Anim'ta rue", what:"Rondreizende zomeranimatie met 15 namiddagen gratis activiteiten in de Alsace Bossue: houten spellen, knutsel- en kunstactiviteiten, circus- en muziekworkshops. Geen reservering nodig.", town:"Alsace Bossue", dist:8, category:"feest", tags:["peuter","kids","ouders"], env:"buiten", dates:{from:"2026-07-13",to:"2026-07-31"}, whenLabel:"13–31 jul · 14–18u", rating:null, price:"gratis", book:null, url:AGENDA, img:"img/animtarue.jpg", source:"ccab"},
  {id:"saxs", title:"Concert pique-nique Saxs'Union", what:"Breng je picknick mee en strijk neer aan de oever van de Isch-brug. Bij het zachte geluid van de rivier klinken de saxofoons van ensemble Saxs'Union voor een feestelijk concert in het idyllische kader van Wolfskirchen. Drank en kleine hapjes ter plaatse. Bij slecht weer → 25/7.", town:"Wolfskirchen", dist:7, category:"feest", tags:["kids","ouders"], env:"buiten", dates:["2026-07-18"], whenLabel:"za 18 jul · 19u30", rating:null, price:"gratis", book:null, url:AGENDA, img:null, source:"ccab"},
  {id:"helici19", title:"Ferme hélicicole (slakkenboerderij)", what:"Slakkenkwekerij + Limousin-koeien, eindigt met proeverij.", town:"Hirschland", dist:6, category:"dieren", tags:["kids","ouders"], env:"buiten", dates:["2026-07-19"], whenLabel:"zo 19 jul · 10u30", rating:null, price:"€4,50", book:"OT reserveren", url:AGENDA, img:null, source:"ccab"},
  {id:"kirchberg", title:"Après-midi Chapelle du Kirchberg", what:"Kapelletje op een van de hoogste punten van de Alsace Bossue, met wandelingen en prachtig panorama over dorpen en boomgaarden. Elke zondag: bar vanaf 14u, eten (flammkuchen, knackworst) vanaf 17u. Reserveren aanbevolen.", town:"Berg", dist:6, category:"natuur", tags:["kids","ouders"], env:"buiten", dates:["2026-07-19","2026-07-26"], whenLabel:"zo 19 & 26 jul · v.a. 14u", rating:null, price:"gratis", book:null, url:AGENDA, img:"img/kirchberg.jpg", source:"ccab"},
  {id:"escape", title:"Escape Game in het kasteelpark", what:"Vind de schat van de oude tuinier. Voor de grote twee.", town:"Lorentzen", dist:8, category:"actief", tags:["kids"], env:"buiten", dates:["2026-07-20"], whenLabel:"ma 20 jul · 9–11u", rating:null, price:"gratis", book:"GAP 03 88 00 55 55", url:"https://www.grangeauxpaysages.fr", img:null, source:"ccab"},
  {id:"yogapero", title:"Yoga-Péro", what:"Yoga + aperitief op de Kirchberg. Iets voor de ouders (vanaf 10 jr).", town:"Berg", dist:6, category:"natuur", tags:["ouders"], env:"buiten", dates:["2026-07-21","2026-07-28"], whenLabel:"di 21 & 28 jul · 18u45", rating:null, price:"vrije gift", book:null, url:AGENDA, img:null, source:"ccab"},
  {id:"toutptits", title:"Tout P'tits Nature", what:"Ochtend voelen/ontdekken in de natuur — speciaal voor 1–3 jaar. Ideaal voor de jongste.", town:"Lorentzen", dist:8, category:"natuur", tags:["peuter"], env:"buiten", dates:["2026-07-22"], whenLabel:"wo 22 jul · 10–11u", rating:null, price:"gratis", book:"GAP 03 88 00 55 55", url:"https://www.grangeauxpaysages.fr", img:null, source:"ccab"},
  {id:"petitsheros", title:"Voorlezen: Mes petits héros", what:"Verhaaltjes voor de allerkleinsten (0–3 jr) in de médiathèque.", town:"Sarre-Union", dist:12, category:"erfgoed", tags:["peuter"], env:"binnen", dates:["2026-07-22"], whenLabel:"wo 22 jul · 11–11u30", rating:null, price:"gratis", book:null, url:AGENDA, img:null, source:"ccab"},
  {id:"petitspaysans", title:"Après-midi petits paysans", what:"Onderdompeling op de boerderij (Les Amis'Nimaux) met rondleiding, educatieve workshops en contact met de dieren. Kinderen ontdekken de landbouwwereld op speelse wijze — eindigt met een gezellig boerentussendoortje met lokale producten.", town:"Harskirchen", dist:12, category:"dieren", tags:["peuter","kids"], env:"buiten", dates:["2026-07-22"], whenLabel:"wo 22 jul · 14–16u", rating:null, price:"€12/kind · €3/volw", book:"OT reserveren", url:AGENDA, img:"img/petitspaysans.jpg", source:"ccab"},
  {id:"thermes", title:"Romeinse thermen van Mackwiller", what:"Een archeoloog en een 'Romein' vertellen over de baden in de oudheid.", town:"Mackwiller", dist:8, category:"erfgoed", tags:["kids","ouders"], env:"buiten", dates:["2026-07-22"], whenLabel:"wo 22 jul · 18–19u", rating:null, price:"gratis", book:"OT reserveren", url:"https://www.cip-lavilla.fr", img:"img/thermes.jpg", source:"ccab"},
  {id:"pilatre", title:"Wandeling Pilâtre de Rozier-circuit", what:"Begeleide wandeling (3u) vanuit Voellerdingen: door natuur en herinnering naar het gedenkteken voor de crash van het luchtschip 'Pilâtre de Rozier' (1917) in de vallei van de Eichel. Lunch mogelijk in de molen. Wandelschoenen verplicht.", town:"Voellerdingen", dist:12, category:"natuur", tags:["kids","ouders"], env:"buiten", dates:["2026-07-22"], whenLabel:"wo 22 jul · 9–12u", rating:null, price:"gratis", book:"OT 03 88 00 40 39", url:AGENDA, img:"img/pilatre.jpg", source:"ccab"},
  {id:"clubarcheo", title:"Club archéo (meegraven)", what:"Troffel in de hand: maak kennis met de archeologie door deel te nemen aan een of meer opgravingsdagen bij de Romeinse villa van de Gurtelbach, samen met professionele archeologen.", town:"Dehlingen", dist:12, category:"erfgoed", tags:["kids"], env:"buiten", dates:["2026-07-23","2026-07-30"], whenLabel:"do 23 & 30 jul · 11–16u30", rating:null, price:"—", book:"OT reserveren", url:"https://www.cip-lavilla.fr", img:"img/clubarcheo.jpg", source:"ccab"},
  {id:"opinel", title:"Opinel et bout de ficelle", what:"Natuurspeelgoed maken in een Natura 2000-gebied.", town:"Sarre-Union", dist:12, category:"natuur", tags:["kids"], env:"buiten", dates:["2026-07-24"], whenLabel:"vr 24 jul · 14–17u", rating:null, price:"gratis", book:"GAP 03 88 00 55 55", url:"https://www.grangeauxpaysages.fr", img:null, source:"ccab"},
  {id:"percollons", title:"Circus: Percollons-nous", what:"Acrobatiek onder de tent (Les Branques Associés). Vanaf 3 jaar. Onder de tent — ook bij regen.", town:"Drulingen", dist:5, category:"feest", tags:["kids","ouders"], env:"binnen", dates:["2026-07-24","2026-07-25","2026-07-26","2026-07-31"], whenLabel:"24–26 & 31 jul · avond", rating:null, price:"€5–15", book:"sms 06 10 43 08 55", url:AGENDA, img:null, source:"ccab"},
  {id:"rcvliegtuig", title:"NK/EK radiografische kunstvliegtuigen", what:"Een groot stuntvliegconcours + spectaculaire nachtshow (za 25, 18–23u). Bevestig data via de agenda.", town:"Sarre-Union", dist:12, category:"feest", tags:["kids","ouders"], env:"buiten", dates:{from:"2026-07-24",to:"2026-07-26"}, whenLabel:"24–26 jul · 9–18u", rating:null, price:"gratis", book:null, url:AGENDA, img:null, source:"ccab", verify:true},
  {id:"lederbewerking", title:"Ontdek de lederbewerking", what:"Duw de deur van het atelier open bij Delphine in Altwiller: ontdek en voel de leersoorten en leer de eeuwenoude technieken voor het maken van lederwaren. Vanaf 12 jaar.", town:"Altwiller", dist:14, category:"erfgoed", tags:["ouders"], env:"binnen", dates:["2026-07-25"], whenLabel:"za 25 jul · 15u", rating:null, price:"€4/persoon", book:"OT 03 88 00 40 39", url:AGENDA, img:"img/lederbewerking.jpg", source:"ccab"},
  {id:"rencontre", title:"Rencontre romaine (re-enactment)", what:"Re-enactors laten het Romeinse leven zien op de archeosite. Vrij toegankelijk.", town:"Dehlingen", dist:12, category:"erfgoed", tags:["kids","ouders"], env:"buiten", dates:["2026-07-26"], whenLabel:"zo 26 jul · 13u30–17u30", rating:null, price:"gratis", book:null, url:"https://www.cip-lavilla.fr", img:null, source:"ccab"},
  {id:"diepetiid", title:"Wandeling door de diepe tijd", what:"Begeleide en vertelde wandeling van 4,6 km: herleef de 4,6 miljard jaar geschiedenis van de Aarde met haltes bij de sleutelmomenten in de evolutie. Kadert het rijke erfgoed van de mensheid en geeft inzicht in de verbondenheid van alle levensvormen. Voor volwassenen.", town:"Ratzwiller", dist:10, category:"natuur", tags:["ouders"], env:"buiten", dates:["2026-07-29"], whenLabel:"wo 29 jul · 9–12u30", rating:null, price:"vrije bijdrage", book:"www.hoplatransition.org", url:AGENDA, img:null, source:"ccab"},
  {id:"gouter", title:"Cuisine ton goûter romain", what:"Zintuigenspel in de gallo-Romeinse tuin, daarna je eigen Romeinse snack maken.", town:"Dehlingen", dist:12, category:"erfgoed", tags:["kids"], env:"beide", dates:["2026-07-29"], whenLabel:"wo 29 jul · 14–17u", rating:null, price:"€5", book:"OT reserveren", url:"https://www.cip-lavilla.fr", img:null, source:"ccab"},
  {id:"powwow", title:"Festival Pow Wow", what:"Noord-Amerikaanse indianencultuur: dans, kamp, kostuums. Erg leuk voor kinderen. (Valt net na vertrek.)", town:"Steinbourg", dist:18, category:"feest", tags:["kids","ouders"], env:"buiten", dates:{from:"2026-07-31",to:"2026-08-02"}, whenLabel:"31 jul–2 aug", rating:null, price:"—", book:null, url:"https://www.festivalpowwow.com", img:null, source:"web"},
  {id:"alpagas", title:"Festival Les Alpagas Bleus", what:"Muziek/cultuur in het kasteelpark van Saverne. Loopt af op jullie aankomstdag.", town:"Saverne", dist:20, category:"feest", tags:["kids","ouders"], env:"buiten", dates:{from:"2026-07-16",to:"2026-07-18"}, whenLabel:"t/m za 18 jul", rating:null, price:"—", book:null, url:"https://www.festival-lesalpagasbleus.fr", img:null, source:"web"},
  {id:"biere", title:"Fête de la Bière", what:"Bierfeest in Schiltigheim. Vooral voor de ouders. (Valt net na vertrek.)", town:"Schiltigheim", dist:50, category:"feest", tags:["ouders"], env:"buiten", dates:{from:"2026-07-31",to:"2026-08-03"}, whenLabel:"31 jul–3 aug", rating:null, price:"—", book:null, url:"https://www.ville-schiltigheim.fr/culture-sports-et-loisirs/grands-evenements/fete-de-la-biere-et-braderie-de-lucas/", img:null, source:"web"},

  /* ---- CCAB — de hele zomer beschikbaar (op afspraak) ---- */
  {id:"velorail", title:"Vélorail du Pays Secret", what:"Beleef de bijzondere railfiets-ervaring! Aan boord van een voertuig voor 4 personen (elektrisch of standaard) leg je bijna 14 km af tussen heuvels en bossen, op het pad van de ooievaars.", town:"Drulingen", coords:[48.8659843,7.1866897], dist:5, category:"actief", tags:["kids","ouders"], env:"buiten", dates:null, whenLabel:"hele zomer · reserveren", rating:null, price:"€€", book:"07 66 49 29 09", url:"https://lesvelorailsdugrandest.fr/vallee-du-pays-secret/", img:"img/velorail.jpg", source:"ccab"},
  {id:"barque", title:"Balade en barque op de Sarre", what:"Stap aan boord en laat je wiegen door de zachte stroming van de Saar, terwijl je geniet van de rijke fauna en flora langs de oevers.", town:"Sarrewerden", dist:12, category:"water", tags:["kids","ouders"], env:"buiten", dates:null, whenLabel:"jul–sep · reserveren", rating:null, price:"€", book:"OT 03 88 00 40 39", url:"https://www.alsace-bossue.net/decouvrir/incontournables1.html?titre=decouverte-de-la-sarre-en-barques&fiche=270004751", img:"img/barque.jpg", source:"ccab"},
  {id:"chevalpark", title:"Parc Nature de Cheval", what:"Beleef een onvergetelijk moment met de paardenshow 'Les terres oubliées'. Doorkruis in een middeleeuws-fantastische wereld de thematische wijken — leerzaam en vermakelijk voor het hele gezin.", town:"Altwiller", dist:14, category:"dieren", tags:["kids","ouders"], env:"buiten", dates:null, whenLabel:"hele zomer · check tijden", rating:null, price:"€€", book:"03 88 01 45 21", url:"https://www.parc-naturedecheval.fr", img:"img/chevalpark.jpg", source:"ccab"},
  {id:"randoland", title:"Randoland & Géocaching", what:"Speelse speurtochten met raadselboekjes (Lorentzen, Dehlingen, Diemeringen) voor 4–12 jr + geocaching. Een mix van rally en oriëntatieloop — verrassende en ludieke ontdekkingen voor het hele gezin.", town:"Alsace Bossue", dist:5, category:"natuur", tags:["peuter","kids","ouders"], env:"buiten", dates:null, whenLabel:"hele zomer · materiaal bij OT", rating:null, price:"gratis/€", book:null, url:"https://www.alsace-bossue.net", img:"img/randoland.jpg", source:"ccab"},
  {id:"musee", title:"Musée La Villa + Romeinse villa Gurtelbach", what:"In het museum ontdek je de methoden van de archeologie en het dagelijks leven in de Alsace Bossue in de Romeinse tijd. Op de site van de Gurtelbach duik je in het verleden met augmented reality.", town:"Dehlingen", dist:12, category:"erfgoed", tags:["kids","ouders"], env:"beide", dates:null, whenLabel:"hele zomer · check openingstijden", rating:null, price:"€", book:null, url:"https://www.cip-lavilla.fr", img:"img/musee.jpg", source:"ccab"},
  {id:"poney", title:"Pony-tochtjes (Écurie de Beltane)", what:"Begeleide ponytochtjes door velden en boomgaarden. Geen eigen website — data/plek via OT.", town:"Dehlingen", dist:12, category:"dieren", tags:["kids"], env:"buiten", dates:null, whenLabel:"regelmatig · reserveren", rating:null, price:"€20/kind", book:"06 71 09 33 41", url:AGENDA, img:null, source:"ccab", verify:true},

  /* ---- Exposities (lopen je hele verblijf, gratis tenzij anders) ---- */
  {id:"vuesduciel", title:"Expo: Vues du ciel", what:"Fotowerk van Kris Le Jeune en Estelle Wasbauer: een reflectie over het herontdekken van traagheid en verbeelding, met wolken en de schoonheid van de hemel als thema. Gratis tijdens openingsuren OT.", town:"Lorentzen", dist:8, category:"erfgoed", tags:["kids","ouders"], env:"binnen", dates:{from:"2026-05-26",to:"2026-09-05"}, whenLabel:"t/m 5 sep · gratis", rating:null, price:"gratis", book:null, url:"https://www.alsace-bossue.net", img:"img/vuesduciel.jpg", source:"ccab"},
  {id:"fragment", title:"Expo: Fragment", what:"Een rondtrekkende container neemt je mee op reis door de grote historische tijdperken. Vijf archeologische objecten, op interactieve en vernieuwende wijze tentoongesteld, vertellen over de leefwijzen die de streek hebben gevormd.", town:"Alsace Bossue", dist:8, category:"erfgoed", tags:["kids","ouders"], env:"binnen", dates:{from:"2026-07-01",to:"2026-08-31"}, whenLabel:"t/m 31 aug · gratis", rating:null, price:"gratis", book:null, url:"https://www.cip-lavilla.fr", img:"img/fragment.jpg", source:"ccab"},
  {id:"vasa", title:"Expo: Vasa et sapores", what:"Samenwerking tussen beeldend kunstenaar Zoé Joliclercq en culinair ontwerper Danaé Viney: landschapsborden geïnspireerd op de Gallo-Romeinse tijd, waar gebaren, kunst en keuken op subtiele wijze in dialoog gaan.", town:"Dehlingen", dist:12, category:"erfgoed", tags:["kids","ouders"], env:"binnen", dates:{from:"2026-07-01",to:"2026-08-31"}, whenLabel:"t/m 31 aug · 14–17u30", rating:null, price:"bij entree", book:null, url:"https://www.cip-lavilla.fr", img:"img/vasa.jpg", source:"ccab"},

  /* ---- Zelf checken ---- */
  {id:"marktsaverne", title:"Wekelijkse markt Saverne", what:"Laagdrempelig uitje op donderdagochtend (Place du Général-de-Gaulle).", town:"Saverne", dist:20, category:"feest", tags:["peuter","kids","ouders"], env:"buiten", dates:null, whenLabel:"do-ochtend · wekelijks", rating:null, price:"gratis", book:null, url:"https://www.saverne.fr/notre-ville/foires-et-marches/", img:"img/marktsaverne.jpg", source:"web"},
];

const TRIP_FROM="2026-07-18", TRIP_TO="2026-07-31";
