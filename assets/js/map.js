/* ============================================================
   Kaartweergave (Leaflet, sleutelvrij): CARTO Voyager +
   Esri-satelliet. Navigeren gaat via Google Maps-deeplinks.
   ============================================================ */
"use strict";

let map = null, markerLayer = null, leafletLoading = null;

/* Leaflet pas laden zodra de kaart voor het eerst wordt geopend —
   scheelt ~160 KB op de eerste paginalading. */
function loadLeaflet(){
  if (window.L) return Promise.resolve();
  if (leafletLoading) return leafletLoading;
  leafletLoading = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet"; css.href = "vendor/leaflet/leaflet.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "vendor/leaflet/leaflet.js";
    js.onload = resolve; js.onerror = reject;
    document.head.appendChild(js);
  });
  return leafletLoading;
}

function pinIcon(color){
  return L.divIcon({ className:"mpin", html:`<span style="--c:${color}"></span>`, iconSize:[22,22], iconAnchor:[11,11], popupAnchor:[0,-12] });
}
function homeIcon(){
  return L.divIcon({ className:"homepin", html:`<div class="homepin-dot"><svg class="icon" style="width:20px;height:20px;stroke:#fff"><use href="#i-home"/></svg></div>`, iconSize:[42,42], iconAnchor:[21,21], popupAnchor:[0,-20] });
}

/* Coöperatieve gestures op touch: één vinger scrollt de pagina, twee vingers
   bewegen/zoomen de kaart. Zo blijft de pagina scrollbaar op de telefoon. */
function setupTouchGestures(m){
  const c = m.getContainer();
  const hint = document.getElementById("mapHint");
  let t, shows = 0, armed = false, last = 0;
  m.dragging.disable();
  c.addEventListener("touchstart", e => {
    if (e.touches.length >= 2){ m.dragging.enable(); if (hint) hint.classList.remove("show"); }
    else { m.dragging.disable(); armed = true; }
  }, { passive:true });
  c.addEventListener("touchmove", e => {
    // hint spaarzaam: max 2× per sessie, hooguit eens per 30 s
    if (e.touches.length < 2 && hint && armed){
      armed = false;
      const now = Date.now();
      if (shows < 2 && now - last > 30000){
        shows++; last = now;
        hint.classList.add("show"); clearTimeout(t); t = setTimeout(() => hint.classList.remove("show"), 1200);
      }
    }
  }, { passive:true });
  c.addEventListener("touchend", () => { armed = false; }, { passive:true });
}

function jitter(id){
  // kleine spreiding (~120 m) zodat pins in hetzelfde dorp niet exact op elkaar vallen
  let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  return [((h % 100) / 100 - 0.5) * 0.0022, (((h >> 4) % 100) / 100 - 0.5) * 0.0022];
}

function popupHtml(it){
  const info = it.url ? `<a href="${it.url}" target="_blank" rel="noopener">Info ↗</a> · ` : "";
  const photo = it.img ? `<img class="popup-photo" src="${it.img}" alt="" loading="lazy">` : "";
  const desc = it.what ? `<div class="popup-desc">${esc(it.what)}</div>` : "";
  const v = votesOf(it);
  const votes = v.length ? `<div class="popup-votes">` + v.map(p => `<span class="avmini" style="background:${PEOPLE[p].color}" title="${PEOPLE[p].name}">${PEOPLE[p].name[0]}</span>`).join("") + `</div>` : "";
  return `${photo}<strong>${esc(it.title)}</strong><br>`
    + `<span style="color:#5B6B66">${esc(it.town)}${it.whenLabel ? " · " + esc(it.whenLabel) : ""} · ${driveLabel(it)}</span>`
    + `${desc}${votes}`
    + `${info}<a href="${mapsUrl(it)}" target="_blank" rel="noopener">Route ↗</a>`;
}

function ensureMap(){
  if (map) return;
  if (!window.L){
    loadLeaflet().then(() => { ensureMap(); renderMap(filteredSorted()); }).catch(() => {});
    return;
  }
  const isTouch = window.matchMedia("(pointer:coarse)").matches;
  map = L.map("map", { scrollWheelZoom: !isTouch }).setView(COORDS["Schœnbourg"], 11);
  const voyager = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    { maxZoom:19, subdomains:"abcd", attribution:'&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
  const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom:19, attribution:'Tiles &copy; Esri' });

  const toggle = L.control({ position:"topright" });
  toggle.onAdd = function(){
    const d = L.DomUtil.create("div", "maptoggle");
    d.innerHTML = `<button class="active" data-l="map">Kaart</button><button data-l="sat">Satelliet</button>`;
    L.DomEvent.disableClickPropagation(d);
    d.addEventListener("click", ev => {
      const btn = ev.target.closest("button"); if (!btn) return;
      d.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
      if (btn.dataset.l === "sat"){ map.removeLayer(voyager); sat.addTo(map); }
      else { map.removeLayer(sat); voyager.addTo(map); }
    });
    return d;
  };
  toggle.addTo(map);

  markerLayer = L.layerGroup().addTo(map);
  L.marker(COORDS["Schœnbourg"], { icon: homeIcon(), zIndexOffset:1000, keyboard:false })
    .addTo(map)
    .bindPopup("<strong>Ons verblijf</strong><br>27 Rue Lot. Waldmatt, Schœnbourg")
    .bindTooltip("Ons verblijf", { permanent:true, direction:"top", offset:[0,-22], className:"home-label" });
  if (isTouch) setupTouchGestures(map);
  buildLegend();
}

function renderMap(items){
  if (!map) return;
  markerLayer.clearLayers();
  const pts = [COORDS["Schœnbourg"]];
  items.forEach(it => {
    // exacte coördinaten (indien opgegeven) 1-op-1; anders dorpskern + kleine spreiding
    let ll;
    if (Array.isArray(it.coords)){
      ll = it.coords;
    } else {
      const base = COORDS[it.town] || COORDS["Alsace Bossue"];
      if (!base) return;
      const j = jitter(it.id);
      ll = [base[0] + j[0], base[1] + j[1]];
    }
    pts.push(ll);
    L.marker(ll, { icon: pinIcon(CATS[it.category].color) }).bindPopup(popupHtml(it), { maxWidth:250 }).addTo(markerLayer);
  });
  if (pts.length > 1){ try { map.fitBounds(pts, { padding:[34,34], maxZoom:12 }); } catch(e){} }
  setTimeout(() => map.invalidateSize(), 30);
}

function buildLegend(){
  document.getElementById("legend").innerHTML =
    Object.values(CATS).map(c => `<span class="li"><span class="dot" style="background:${c.color}"></span>${c.label}</span>`).join("")
    + `<span class="li"><span class="dot" style="background:var(--feest);border:2px solid #fff;box-shadow:0 0 0 1px var(--line)"></span>Ons verblijf</span>`;
}
