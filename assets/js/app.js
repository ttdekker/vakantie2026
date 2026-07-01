/* ============================================================
   App-logica: state, filters, kaarten, stemmen, kids-modus,
   favorieten, delen & export. Gewone globals (geen modules),
   zodat alles ook vanaf file:// werkt.
   ============================================================ */
"use strict";

/* ---------- Opslag (localStorage, met migratie) ---------- */
const STORE_KEY = "elzas2026.v1";
let store = { status:{}, votes:{}, custom:[], plan:{} };
try { const raw = localStorage.getItem(STORE_KEY); if (raw) store = JSON.parse(raw); } catch(e){}
if (!store.status) store.status = {};
if (!store.votes) store.votes = {};
if (!Array.isArray(store.custom)) store.custom = [];
if (!store.plan || typeof store.plan !== "object") store.plan = {};
function save(){ try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch(e){} }

const state = {
  q:"", cat:new Set(), who:new Set(),
  rain:false, free:false, peuter:false, near:false,
  maxdist:999, wholeSummer:false, onlyPicked:false, showHidden:false,
  sort:"aanraders", view:"ontdek"
};

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
function allItems(){ return [...store.custom, ...ACTIVITIES]; }
function votesOf(it){ const v = store.votes[it.id]; return Array.isArray(v) ? v : []; }
function isHidden(it){ return store.status[it.id] === "nee"; }
function isBooked(it){ return store.status[it.id] === "geboekt"; }
function driveMin(it){ return Math.max(2, Math.round(it.dist * 1.15)); }
function driveLabel(it){ return it.dist <= 3 ? "vlakbij" : "± " + driveMin(it) + " min"; }
function priceLevel(it){
  const p = (it.price || "").toLowerCase();
  if (!p || p === "—") return null;
  if (p.includes("gratis") || p.includes("vrije")) return "gratis";
  return it.price;
}
function fallbackImg(cat){ return "img/fallback-" + cat + ".svg"; }
function imgOf(it){ return it.img || fallbackImg(it.category); }
function mapsUrl(it){
  const dest = encodeURIComponent((it.title ? it.title + " " : "") + (it.town || "") + ", France");
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(HOME)}&destination=${dest}`;
}
function inTrip(it){
  if (!it.dates) return true;
  if (Array.isArray(it.dates)) return it.dates.some(d => d >= TRIP_FROM && d <= TRIP_TO);
  return it.dates.from <= TRIP_TO && it.dates.to >= TRIP_FROM;
}
function firstDate(it){
  if (!it.dates) return "9999";
  if (Array.isArray(it.dates)) return it.dates.slice().sort()[0];
  return it.dates.from;
}
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function todayISO(){ const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }

/* ---------- Filteren & sorteren ---------- */
function matches(it){
  if (!state.wholeSummer && !inTrip(it)) return false;
  if (state.rain && it.env === "buiten") return false;
  if (state.free && priceLevel(it) !== "gratis") return false;
  if (state.peuter && !it.tags.includes("peuter")) return false;
  if (state.near && it.dist > 15) return false;
  if (it.dist > state.maxdist) return false;
  if (state.cat.size && !state.cat.has(it.category)) return false;
  if (state.who.size){ const v = votesOf(it); if (!v.some(p => state.who.has(p))) return false; }
  if (state.onlyPicked && !isBooked(it)) return false;
  if (state.q){
    const hay = (it.title + " " + (it.what||"") + " " + (it.town||"") + " " + CATS[it.category].label).toLowerCase();
    if (!hay.includes(state.q.toLowerCase())) return false;
  }
  return true;
}
function filteredSorted(){
  const items = allItems().filter(it => matches(it) && !isHidden(it));
  items.sort((a,b) => {
    if (state.sort === "dist") return a.dist - b.dist;
    if (state.sort === "date") return firstDate(a).localeCompare(firstDate(b));
    // aanraders: meeste stemmen → beste rating → dichtstbij
    return (votesOf(b).length - votesOf(a).length)
      || ((b.rating||0) - (a.rating||0))
      || (a.dist - b.dist);
  });
  return items;
}
function hiddenItems(){ return allItems().filter(it => matches(it) && isHidden(it)); }

/* ---------- Frans bel-script ---------- */
const FR_DAYS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const FR_MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
function frDate(iso){
  const d = new Date(iso + "T12:00:00");
  return "le " + FR_DAYS[d.getDay()] + " " + d.getDate() + " " + FR_MONTHS[d.getMonth()];
}
function belScript(it){
  const fd = firstDate(it);
  const when = fd !== "9999" ? " pour " + frDate(fd) : "";
  return `Bonjour, je voudrais réserver « ${it.title} »${when}. Nous sommes deux adultes et trois enfants (9 ans, 7 ans et un bébé). Est-ce que vous parlez anglais ? Merci !`;
}
function belScriptNL(it){
  const fd = firstDate(it);
  const when = fd !== "9999" ? " voor " + new Date(fd + "T12:00:00").toLocaleDateString("nl-NL", {weekday:"long", day:"numeric", month:"long"}) : "";
  return `Goedendag, ik wil graag "${it.title}" reserveren${when}. We zijn met twee volwassenen en drie kinderen (9, 7 en een baby). Spreekt u Engels? Dank u wel!`;
}
function phoneOf(it){
  const m = (it.book || "").match(/0[\d .]{9,}/);
  if (m) return m[0].replace(/[ .]/g, "");
  if (/OT/i.test(it.book || "")) return "0388004039";
  if (/GAP/i.test(it.book || "")) return "0388005555";
  return null;
}

/* ---------- Kaart (activiteit) ---------- */
function avatarsHtml(it, size){
  return votesOf(it).map(p => PEOPLE[p]
    ? `<span class="avmini" style="background:${PEOPLE[p].color};width:${size}px;height:${size}px" title="${PEOPLE[p].name}">${PEOPLE[p].name[0]}</span>`
    : "").join("");
}
function cardHtml(it){
  const c = CATS[it.category];
  const booked = isBooked(it);
  const hidden = isHidden(it);
  const pl = priceLevel(it);
  const env = it.env === "binnen" ? `<span class="m"><svg class="icon sm"><use href="#i-home"/></svg> binnen</span>`
    : it.env === "beide" ? `<span class="m"><svg class="icon sm"><use href="#i-home"/></svg><svg class="icon sm" style="margin-left:-3px"><use href="#i-tree"/></svg> binnen + buiten</span>`
    : `<span class="m"><svg class="icon sm"><use href="#i-tree"/></svg> buiten</span>`;
  const price = pl ? `<span class="m"><svg class="icon sm"><use href="#i-euro"/></svg> ${esc(pl)}</span>` : "";
  const rate = it.rating ? `<span class="m"><svg class="icon sm" style="fill:currentColor"><use href="#i-star"/></svg> ${it.rating.toFixed(1)}</span>` : "";
  const res = it.book ? `<span class="m res"><svg class="icon sm"><use href="#i-phone"/></svg> reserveren</span>` : "";
  const verify = it.verify ? `<span class="m warn"><svg class="icon sm"><use href="#i-alert"/></svg> checken</span>` : "";
  const tel = phoneOf(it);
  const bel = it.book ? `<details class="belscript">
      <summary><svg class="icon sm"><use href="#i-phone"/></svg> Zo reserveer je (Frans)</summary>
      <div class="fr">${esc(belScript(it))}
        <em>${esc(belScriptNL(it))}</em>
        <div class="copyrow">
          <button class="copybtn" data-copy="${esc(belScript(it))}"><svg class="icon sm"><use href="#i-copy"/></svg> Kopieer</button>
          ${tel ? `<a class="copybtn" href="tel:+33${tel.slice(1)}"><svg class="icon sm"><use href="#i-phone"/></svg> Bel ${esc(it.book)}</a>` : `<span style="font-size:12px;color:var(--muted)">${esc(it.book)}</span>`}
        </div>
      </div>
    </details>` : "";
  const votes = `<div class="votes"><span class="vlabel">Wil erheen</span>` +
    Object.entries(PEOPLE).map(([k,p]) => {
      const on = votesOf(it).includes(k);
      return `<button class="pvote" data-id="${it.id}" data-p="${k}" style="--pc:${p.color}" aria-pressed="${on}" title="${p.name} wil ${on?"":"niet "}hierheen">${p.name[0]}</button>`;
    }).join("") + `</div>`;
  return `<article class="card ${booked?"is-geboekt":""}" id="card-${it.id}" style="--cat:${c.color};${hidden?"opacity:.55":""}">
    <div class="thumb">
      <img src="${imgOf(it)}" alt="" loading="lazy" width="800" height="450" onerror="this.onerror=null;this.src='${fallbackImg(it.category)}'"/>
      ${it.whenLabel ? `<span class="tchip date">${esc(it.whenLabel)}</span>` : ""}
      <span class="gbadge" data-gbadge ${booked?"":"hidden"}><svg class="icon sm"><use href="#i-check"/></svg> Geboekt</span>
      <span class="tchip time"><svg class="icon sm"><use href="#i-car"/></svg> ${driveLabel(it)}</span>
    </div>
    <div class="body">
      <span class="cat">${c.label}</span>
      <h3>${esc(it.title)}</h3>
      <div class="where"><svg class="icon sm"><use href="#i-pin"/></svg> ${esc(it.town)}</div>
      <p class="what">${esc(it.what || "")}</p>
      <div class="metarow">${env}${price}${rate}${res}${verify}</div>
      ${bel}
      ${votes}
      <div class="foot">
        <div class="links">
          ${it.url ? `<a href="${it.url}" target="_blank" rel="noopener">Info <svg class="icon sm"><use href="#i-ext"/></svg></a>` : ""}
          <a href="${mapsUrl(it)}" target="_blank" rel="noopener">Route <svg class="icon sm"><use href="#i-nav"/></svg></a>
        </div>
        <div class="actions">
          <button class="minibtn" data-act="plan" data-id="${it.id}" title="Zet dit uitje op een dag in Ons plan"><svg class="icon sm"><use href="#i-cal-plus"/></svg> Plan in</button>
          <button class="minibtn" data-act="book" data-id="${it.id}" aria-pressed="${booked}" title="Markeer als geboekt"><svg class="icon sm"><use href="#i-check"/></svg> Geboekt</button>
          ${hidden
            ? `<button class="minibtn" data-act="restore" data-id="${it.id}" title="Zet terug in de lijst"><svg class="icon sm"><use href="#i-reset"/></svg> Terug</button>`
            : `<button class="minibtn hidebtn" data-act="hide" data-id="${it.id}" title="Verberg dit idee (nee)" aria-label="Verberg"><svg class="icon sm"><use href="#i-x"/></svg></button>`}
        </div>
      </div>
    </div>
  </article>`;
}

/* ---------- Render ---------- */
function render(){
  const items = filteredSorted();
  const hid = hiddenItems();
  $("empty").hidden = items.length > 0;
  $("resultline").textContent = `${items.length} ${items.length===1?"idee":"ideeën"}` +
    (state.wholeSummer ? " · hele zomer" : " · tijdens ons verblijf");
  $("grid").innerHTML = items.map(cardHtml).join("") +
    (state.showHidden ? hid.map(cardHtml).join("") : "");
  const hl = $("hiddenline");
  if (hid.length && !state.showHidden){
    hl.hidden = false;
    hl.innerHTML = `${hid.length} verborgen ${hid.length===1?"idee":"ideeën"} — <button class="linklike" id="showHidden">toon</button>`;
  } else if (state.showHidden){
    hl.hidden = false;
    hl.innerHTML = `<button class="linklike" id="showHidden">verberg de nee-lijst weer</button>`;
  } else hl.hidden = true;
  renderFavs();
  renderWhoCounts();
  updateFilterBadge();
  if (state.view === "kaart" && typeof renderMap === "function") renderMap(items);
  if (typeof renderPlanner === "function") renderPlanner();
}

function updateFilterBadge(){
  const n = state.cat.size + state.who.size +
    (state.rain?1:0) + (state.free?1:0) + (state.peuter?1:0) + (state.near?1:0) +
    (state.onlyPicked?1:0) + (state.maxdist!==999?1:0) + (state.wholeSummer?1:0);
  const b = $("fCount");
  b.hidden = n === 0;
  b.textContent = n;
}

function renderWhoCounts(){
  const items = allItems();
  Object.keys(PEOPLE).forEach(k => {
    const n = items.filter(it => votesOf(it).includes(k)).length;
    const el = document.querySelector(`[data-cb="${k}"]`);
    if (el) el.textContent = n ? ` ${n}` : "";
  });
}

/* ---------- Favorieten-strip ---------- */
function renderFavs(){
  const favs = allItems().filter(it => !isHidden(it) && votesOf(it).length >= 2)
    .sort((a,b) => votesOf(b).length - votesOf(a).length || (b.rating||0) - (a.rating||0));
  const sec = $("favs");
  if (favs.length < 3){ sec.hidden = true; return; }
  sec.hidden = false;
  $("favstrip").innerHTML = favs.slice(0, 12).map(it => `
    <button class="favcard" data-goto="${it.id}">
      <span class="fthumb"><img src="${imgOf(it)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg(it.category)}'"/>
        ${votesOf(it).length === Object.keys(PEOPLE).length ? `<span class="allbadge">Iedereen wil dit!</span>` : ""}
      </span>
      <span class="fbody"><h4>${esc(it.title)}</h4><span class="fav-avatars">${avatarsHtml(it, 20)}</span></span>
    </button>`).join("");
}
function gotoCard(id){
  setView("ontdek");
  const el = $("card-" + id);
  if (!el) return;
  el.scrollIntoView({ behavior:"smooth", block:"center" });
  el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
}

/* ---------- Views ---------- */
function setView(v){
  state.view = v;
  $("view-ontdek").hidden = v !== "ontdek";
  $("view-kaart").hidden = v !== "kaart";
  $("view-plan").hidden = v !== "plan";
  $("filters").hidden = v !== "ontdek";
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
  if (v === "kaart" && typeof ensureMap === "function"){ ensureMap(); renderMap(filteredSorted()); }
  if (v === "plan" && typeof renderPlanner === "function") renderPlanner();
}

/* ---------- Countdown ---------- */
function renderCountdown(){
  const t = todayISO();
  const el = $("countdown");
  if (t < TRIP_FROM){
    const days = Math.round((new Date(TRIP_FROM) - new Date(t)) / 864e5);
    el.textContent = `Nog ${days} ${days===1?"dag":"dagen"}!`;
  } else if (t <= TRIP_TO){
    const day = Math.round((new Date(t) - new Date(TRIP_FROM)) / 864e5) + 1;
    el.textContent = `Dag ${day} van 14 🌞`;
  } else {
    el.textContent = "Dat was 'm — tot volgend jaar!";
  }
}

/* ---------- Toast, kopiëren, download ---------- */
function toast(msg){
  const el = $("toast");
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => el.hidden = true, 2800);
}
async function copyText(text, msg){
  try { await navigator.clipboard.writeText(text); }
  catch(e){
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
    ta.select(); try { document.execCommand("copy"); } catch(_){} ta.remove();
  }
  toast(msg);
}
function download(name, text, type){
  const blob = new Blob([text], { type });
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = u; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 1500);
}

/* ---------- Delen (state in URL-hash) ---------- */
function buildShareURL(){
  const payload = { s:store.status, v:store.votes, c:store.custom, p:store.plan };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  return location.origin + location.pathname + "#s=" + b64;
}
function loadShared(){
  const m = location.hash.match(/[#&]s=([^&]+)/);
  if (!m) return false;
  try {
    const p = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    if (p.s && typeof p.s === "object") store.status = Object.assign({}, store.status, p.s);
    if (p.v && typeof p.v === "object"){
      Object.entries(p.v).forEach(([id, arr]) => {
        if (!Array.isArray(arr)) return;
        const cur = new Set(votesOf({id})); arr.forEach(x => cur.add(x));
        store.votes[id] = [...cur];
      });
    }
    if (Array.isArray(p.c)){
      const ids = new Set(store.custom.map(x => x.id));
      p.c.forEach(x => { if (x && !ids.has(x.id)) store.custom.push(x); });
    }
    if (p.p && typeof p.p === "object"){
      Object.entries(p.p).forEach(([d, arr]) => {
        if (!Array.isArray(arr)) return;
        const cur = new Set(Array.isArray(store.plan[d]) ? store.plan[d] : []);
        arr.forEach(x => cur.add(x));
        store.plan[d] = [...cur];
      });
    }
    save(); return true;
  } catch(e){ return false; }
}

/* ---------- Export: .ics + lijstje ---------- */
function tripDays(){
  const out = [];
  for (let d = new Date(TRIP_FROM + "T12:00:00"); ; d.setDate(d.getDate() + 1)){
    const iso = d.toISOString().slice(0,10);
    if (iso > TRIP_TO) break;
    out.push(iso);
  }
  return out;
}
function plannedOn(dateISO){
  const ids = Array.isArray(store.plan[dateISO]) ? store.plan[dateISO] : [];
  const all = allItems();
  return ids.map(id => all.find(it => it.id === id)).filter(Boolean);
}
function datedOn(it, dateISO){
  if (!it.dates) return false;
  if (Array.isArray(it.dates)) return it.dates.includes(dateISO);
  // korte periodes (≤ 3 dagen) per dag tonen; lange lopen als 'doorlopend' mee
  const span = (new Date(it.dates.to) - new Date(it.dates.from)) / 864e5;
  return span <= 3 && dateISO >= it.dates.from && dateISO <= it.dates.to;
}
function nextDay(d){ const t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0,10); }
function icsEsc(s){ return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n"); }
function buildICS(){
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Elzas2026//planner//NL","CALSCALE:GREGORIAN"];
  const stamp = new Date().toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";
  const seen = new Set();
  let count = 0;
  const evt = (it, start, endExcl, suffix) => {
    const uid = it.id + (suffix||"") + "@elzas2026";
    if (seen.has(it.id + "|" + start)) return;
    seen.add(it.id + "|" + start);
    lines.push("BEGIN:VEVENT","UID:" + uid, "DTSTAMP:" + stamp,
      "DTSTART;VALUE=DATE:" + start.replace(/-/g,""), "DTEND;VALUE=DATE:" + endExcl.replace(/-/g,""),
      "SUMMARY:" + icsEsc("✓ " + it.title));
    if (it.town) lines.push("LOCATION:" + icsEsc(it.town + ", France"));
    const desc = [it.what, it.whenLabel, it.url].filter(Boolean).join(" — ");
    if (desc) lines.push("DESCRIPTION:" + icsEsc(desc));
    lines.push("END:VEVENT"); count++;
  };
  // geboekte items met een datum
  allItems().filter(isBooked).forEach(it => {
    if (!it.dates) return;
    if (Array.isArray(it.dates)) it.dates.filter(d => d >= TRIP_FROM && d <= TRIP_TO).forEach((d,i) => evt(it, d, nextDay(d), "-b" + i));
    else evt(it, it.dates.from, nextDay(it.dates.to), "-b");
  });
  // ingeplande items op hun geplande dag
  Object.entries(store.plan).forEach(([d, ids]) => {
    (Array.isArray(ids) ? ids : []).forEach((id, i) => {
      const it = allItems().find(x => x.id === id);
      if (it) evt(it, d, nextDay(d), "-p" + d + i);
    });
  });
  lines.push("END:VCALENDAR");
  return { ics: lines.join("\r\n"), count };
}
function buildMarkdown(){
  const out = ["# Elzas 2026 — ons plan", "", "_Schœnbourg · 18–31 juli 2026_", ""];
  const fmtDay = iso => new Date(iso + "T12:00:00").toLocaleDateString("nl-NL", { weekday:"long", day:"numeric", month:"long" });
  const fmt = it => {
    const who = votesOf(it).map(p => PEOPLE[p] ? PEOPLE[p].name : p);
    return `- **${it.title}** — ${it.town}${it.whenLabel ? " · " + it.whenLabel : ""}${it.price ? " · " + it.price : ""}${isBooked(it) ? " · ✓ geboekt" : ""}${who.length ? " · ❤️ " + who.join(", ") : ""}`;
  };
  let any = false;
  tripDays().forEach(d => {
    const items = [...plannedOn(d), ...allItems().filter(it => isBooked(it) && datedOn(it, d) && !plannedOn(d).includes(it))];
    if (!items.length) return;
    any = true;
    out.push(`## ${fmtDay(d)}`);
    items.forEach(it => out.push(fmt(it)));
    out.push("");
  });
  const loose = allItems().filter(it => isBooked(it) && !it.dates && !Object.values(store.plan).flat().includes(it.id));
  if (loose.length){ any = true; out.push("## Nog geen dag geprikt"); loose.forEach(it => out.push(fmt(it))); }
  if (!any) out.push("_Nog niets gepland of geboekt._");
  return out.join("\n");
}

/* ---------- Kids-modus: Kies maar! ---------- */
const kids = { person:null, deck:[], i:0, likes:0 };
function kidsSuitable(it, person){
  if (person === "lotta") return it.tags.includes("peuter");
  if (person === "alma" || person === "freija") return it.tags.includes("kids");
  return true;
}
function kidsOpen(){
  $("kids").hidden = false;
  document.body.style.overflow = "hidden";
  kidsRenderPersons();
}
function kidsClose(){
  $("kids").hidden = true;
  document.body.style.overflow = "";
  render();
}
function kidsRenderPersons(){
  $("kProgress").textContent = "";
  $("kBody").innerHTML = `<h2>Wie ben jij?</h2><div class="kpersons">` +
    Object.entries(PEOPLE).map(([k,p]) =>
      `<button class="kperson" data-kp="${k}" style="--pc:${p.color}"><span class="kav">${p.name[0]}</span><span class="kname">${p.name}</span></button>`
    ).join("") + `</div>`;
}
function kidsStart(person){
  kids.person = person; kids.i = 0; kids.likes = 0;
  kids.deck = allItems().filter(it => !isHidden(it) && inTrip(it) && kidsSuitable(it, person) && !votesOf(it).includes(person));
  for (let i = kids.deck.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [kids.deck[i], kids.deck[j]] = [kids.deck[j], kids.deck[i]]; }
  kidsRenderCard();
}
function kidsRenderCard(){
  const p = PEOPLE[kids.person];
  if (kids.i >= kids.deck.length){
    $("kProgress").textContent = "";
    $("kBody").innerHTML = `<div class="kdone"><div class="big">🎉</div>
      <h2>Klaar, ${p.name}!</h2>
      <p style="font-size:16px;color:var(--muted)">Je hebt ${kids.likes} ${kids.likes===1?"favoriet":"favorieten"} gekozen.</p>
      <div class="kbtns" style="justify-content:center;margin-top:16px">
        <button class="kbtn skip" data-kact="again">Nog een keer</button>
        <button class="kbtn like" data-kact="done"><svg class="icon"><use href="#i-heart"/></svg> Bekijk jullie lijstje</button>
      </div></div>`;
    return;
  }
  const it = kids.deck[kids.i];
  $("kProgress").textContent = `${p.name} · ${kids.i + 1} van ${kids.deck.length}`;
  $("kBody").innerHTML = `
    <div class="kcard" id="kcard">
      <div class="kimg"><img src="${imgOf(it)}" alt="" onerror="this.onerror=null;this.src='${fallbackImg(it.category)}'"/></div>
      <div class="kinfo"><h3>${esc(it.title)}</h3><div class="ktown">${esc(it.town)} · ${driveLabel(it)}</div><p>${esc(it.what || "")}</p></div>
    </div>
    <div class="kbtns">
      <button class="kbtn skip" data-kact="skip">Volgende</button>
      <button class="kbtn like" data-kact="like"><svg class="icon"><use href="#i-heart"/></svg> Leuk!</button>
    </div>`;
  // swipe: rechts = leuk, links = volgende
  const card = $("kcard");
  let x0 = null;
  card.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive:true });
  card.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (dx > 60) kidsAnswer(true);
    else if (dx < -60) kidsAnswer(false);
  }, { passive:true });
}
function kidsAnswer(like){
  const it = kids.deck[kids.i];
  const card = $("kcard");
  if (like){
    kids.likes++;
    const arr = Array.isArray(store.votes[it.id]) ? store.votes[it.id] : [];
    if (!arr.includes(kids.person)) arr.push(kids.person);
    store.votes[it.id] = arr;
    save();
  }
  if (card){
    card.classList.add(like ? "swipe-r" : "swipe-l");
    setTimeout(() => { kids.i++; kidsRenderCard(); }, 170);
  } else { kids.i++; kidsRenderCard(); }
}

/* ---------- Inplannen-dialoog ---------- */
let dayDlgFor = null;
function openDayDlg(id){
  const it = allItems().find(x => x.id === id);
  if (!it) return;
  dayDlgFor = id;
  $("dayDlgTitle").textContent = `Op welke dag zetten we "${it.title}"?`;
  $("dayPick").innerHTML = tripDays().map(d => {
    const label = new Date(d + "T12:00:00").toLocaleDateString("nl-NL", { weekday:"short", day:"numeric", month:"short" });
    const has = (store.plan[d] || []).includes(id);
    return `<button data-day="${d}" class="${has?"has":""}">${label}</button>`;
  }).join("");
  $("dayDlg").showModal();
}

/* ---------- Taalhulp ---------- */
const PHRASES = [
  ["Spreekt u Engels?", "Est-ce que vous parlez anglais ?", "es-kuh voo par-lee ong-glé"],
  ["Ik wil graag reserveren.", "Je voudrais réserver, s'il vous plaît.", "zjuh voe-dré ree-zer-vee, siel voe plè"],
  ["We zijn met 2 volwassenen en 3 kinderen.", "Nous sommes deux adultes et trois enfants.", "noe som deuz-a-dult ee trwaz-ong-fong"],
  ["Een tafel voor vijf, alstublieft.", "Une table pour cinq, s'il vous plaît.", "uun tabl poer sank, siel voe plè"],
  ["Heeft u een kinderstoel?", "Avez-vous une chaise haute ?", "avee-voe uun sjèz oot"],
  ["Twee stokbroden en drie croissants, alstublieft.", "Deux baguettes et trois croissants, s'il vous plaît.", "deu ba-get ee trwa krwa-song"],
  ["Mag ik pinnen?", "Est-ce que je peux payer par carte ?", "es-kuh zjuh peu pè-jee par kart"],
  ["De rekening, alstublieft.", "L'addition, s'il vous plaît.", "la-die-sjon, siel voe plè"],
  ["Waar is het toilet?", "Où sont les toilettes ?", "oe son lee twa-let"],
  ["Mijn dochter is allergisch voor…", "Ma fille est allergique à…", "ma fiej èt-a-ler-zjiek a"],
  ["Het was heerlijk!", "C'était délicieux !", "see-tè dee-lie-sjeu"],
  ["Dank u wel, fijne dag!", "Merci beaucoup, bonne journée !", "mer-sie bo-koe, bon zjoer-nee"],
];
function renderPhrases(){
  $("phraseList").innerHTML = PHRASES.map(([nl, fr, fon]) =>
    `<div class="phrase"><span class="nl">${nl}</span><span class="fr">${fr}</span><span class="fon">${fon}</span><button class="copybtn" data-copy="${esc(fr)}"><svg class="icon sm"><use href="#i-copy"/></svg> Kopieer</button></div>`
  ).join("");
}

/* ---------- UI opbouw + events ---------- */
function init(){
  // chips
  $("catChips").innerHTML = Object.entries(CATS).map(([k,c]) =>
    `<button class="chip" data-cat="${k}" aria-pressed="false"><span class="dot" style="background:${c.color}"></span>${c.label}</button>`).join("");
  $("whoChips").innerHTML = Object.entries(PEOPLE).map(([k,p]) =>
    `<button class="chip small" data-who="${k}" aria-pressed="false"><span class="dot" style="background:${p.color}"></span>${p.name}<span data-cb="${k}"></span></button>`).join("");
  $("addCat").innerHTML = Object.entries(CATS).map(([k,c]) => `<option value="${k}">${c.label}</option>`).join("");
  $("gmapsAll").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Schœnbourg, 67320, France");
  renderPhrases();
  renderCountdown();

  // zoek & filters
  $("q").addEventListener("input", e => { state.q = e.target.value; render(); });
  $("sort").addEventListener("change", e => { state.sort = e.target.value; render(); });
  $("maxdist").addEventListener("change", e => { state.maxdist = +e.target.value; render(); });
  $("wholeSummer").addEventListener("change", e => { state.wholeSummer = e.target.checked; render(); });
  $("onlyPicked").addEventListener("change", e => { state.onlyPicked = e.target.checked; render(); });
  [["pRain","rain"],["pFree","free"],["pPeuter","peuter"],["pNear","near"]].forEach(([id,key]) => {
    $(id).addEventListener("click", () => {
      state[key] = !state[key];
      $(id).setAttribute("aria-pressed", String(state[key]));
      render();
    });
  });
  $("catChips").addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    const k = b.dataset.cat, on = b.getAttribute("aria-pressed") === "true";
    b.setAttribute("aria-pressed", String(!on)); on ? state.cat.delete(k) : state.cat.add(k); render();
  });
  $("whoChips").addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    const k = b.dataset.who, on = b.getAttribute("aria-pressed") === "true";
    b.setAttribute("aria-pressed", String(!on)); on ? state.who.delete(k) : state.who.add(k); render();
  });
  $("moreBtn").addEventListener("click", () => {
    const p = $("morePanel");
    p.hidden = !p.hidden;
    $("moreBtn").setAttribute("aria-expanded", String(!p.hidden));
  });
  $("clearFilters").addEventListener("click", () => {
    state.q = ""; $("q").value = "";
    state.cat.clear(); state.who.clear();
    state.rain = state.free = state.peuter = state.near = false;
    state.maxdist = 999; $("maxdist").value = "999";
    state.wholeSummer = false; $("wholeSummer").checked = false;
    state.onlyPicked = false; $("onlyPicked").checked = false;
    state.sort = "aanraders"; $("sort").value = "aanraders";
    document.querySelectorAll(".chip[aria-pressed]").forEach(c => c.setAttribute("aria-pressed", "false"));
    render();
  });

  // weergave-tabs (boven + onder)
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));

  // grid-acties (event-delegatie; stemmen/status muteren de DOM in place zodat focus blijft staan)
  $("grid").addEventListener("click", e => {
    const pv = e.target.closest(".pvote");
    if (pv){
      const id = pv.dataset.id, p = pv.dataset.p;
      const arr = Array.isArray(store.votes[id]) ? store.votes[id] : [];
      const i = arr.indexOf(p);
      if (i >= 0) arr.splice(i, 1); else arr.push(p);
      if (arr.length) store.votes[id] = arr; else delete store.votes[id];
      save();
      pv.setAttribute("aria-pressed", String(i < 0));
      renderFavs(); renderWhoCounts();
      return;
    }
    const cp = e.target.closest("[data-copy]");
    if (cp){ copyText(cp.dataset.copy, "Gekopieerd!"); return; }
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.dataset.id;
    if (b.dataset.act === "plan"){ openDayDlg(id); return; }
    if (b.dataset.act === "book"){
      store.status[id] = store.status[id] === "geboekt" ? "" : "geboekt";
      save();
      const on = store.status[id] === "geboekt";
      b.setAttribute("aria-pressed", String(on));
      const card = $("card-" + id);
      if (card){
        card.classList.toggle("is-geboekt", on);
        const badge = card.querySelector("[data-gbadge]");
        if (badge) badge.hidden = !on;
      }
      if (typeof renderPlanner === "function") renderPlanner();
      return;
    }
    if (b.dataset.act === "hide"){ store.status[id] = "nee"; save(); render(); return; }
    if (b.dataset.act === "restore"){ store.status[id] = ""; save(); render(); return; }
  });
  $("hiddenline").addEventListener("click", e => {
    if (e.target.closest("#showHidden")){ state.showHidden = !state.showHidden; render(); }
  });
  $("favstrip").addEventListener("click", e => {
    const f = e.target.closest("[data-goto]");
    if (f) gotoCard(f.dataset.goto);
  });

  // delen + export
  $("shareBtn").addEventListener("click", () => copyText(buildShareURL(), "Deel-link gekopieerd — keuzes, stemmen en planning reizen mee."));
  $("expIcs").addEventListener("click", () => {
    const { ics, count } = buildICS();
    if (count === 0){ toast("Nog niets geboekt of ingepland met een datum."); return; }
    download("elzas-2026.ics", ics, "text/calendar;charset=utf-8");
    toast(`${count} ${count===1?"uitje":"uitjes"} naar agenda (.ics).`);
  });
  $("expMd").addEventListener("click", () => copyText(buildMarkdown(), "Lijstje gekopieerd — plak in WhatsApp of Notes."));

  // eigen plan
  $("addBtn").addEventListener("click", () => $("addDlg").showModal());
  $("addForm").addEventListener("submit", e => {
    if (e.submitter && e.submitter.value !== "ok") return;
    const f = new FormData(e.target);
    const aud = [...e.target.querySelectorAll("input[name=aud]:checked")].map(i => i.value);
    const item = {
      id: "eigen-" + Date.now(),
      title: (f.get("title") || "Naamloos plan").trim(),
      what: (f.get("what") || "").trim(),
      town: (f.get("town") || "").trim() || "—",
      dist: Number(f.get("dist")) || 0,
      category: f.get("category") || "feest",
      tags: aud.length ? aud : ["kids","ouders"],
      env: f.get("env") || "beide",
      dates: f.get("date") ? [f.get("date")] : null,
      whenLabel: f.get("date") ? new Date(f.get("date") + "T12:00:00").toLocaleDateString("nl-NL", { weekday:"short", day:"numeric", month:"short" }) : "eigen idee",
      rating: null, price: "", book: null,
      url: (f.get("url") || "").trim() || null, img: null, source: "eigen"
    };
    store.custom.unshift(item); save(); render();
    e.target.reset();
  });

  // inplannen-dialoog
  $("dayPick").addEventListener("click", e => {
    const b = e.target.closest("[data-day]"); if (!b) return;
    const d = b.dataset.day;
    const arr = Array.isArray(store.plan[d]) ? store.plan[d] : [];
    if (arr.includes(dayDlgFor)){
      store.plan[d] = arr.filter(x => x !== dayDlgFor);
      if (!store.plan[d].length) delete store.plan[d];
      b.classList.remove("has");
      toast("Van die dag gehaald.");
    } else {
      arr.push(dayDlgFor); store.plan[d] = arr;
      b.classList.add("has");
      const label = new Date(d + "T12:00:00").toLocaleDateString("nl-NL", { weekday:"long", day:"numeric", month:"long" });
      toast(`Ingepland op ${label} — zie Ons plan.`);
    }
    save();
    if (typeof renderPlanner === "function") renderPlanner();
  });
  $("dayCancel").addEventListener("click", () => $("dayDlg").close());

  // kids-modus
  $("kidsBtn").addEventListener("click", kidsOpen);
  $("kClose").addEventListener("click", kidsClose);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("kids").hidden) kidsClose(); });
  $("kBody").addEventListener("click", e => {
    const kp = e.target.closest("[data-kp]");
    if (kp){ kidsStart(kp.dataset.kp); return; }
    const ka = e.target.closest("[data-kact]");
    if (!ka) return;
    if (ka.dataset.kact === "like") kidsAnswer(true);
    else if (ka.dataset.kact === "skip") kidsAnswer(false);
    else if (ka.dataset.kact === "again") kidsRenderPersons();
    else if (ka.dataset.kact === "done"){ kidsClose(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });

  // kopieerknoppen buiten de grid (taalhulp)
  document.querySelector(".praktisch").addEventListener("click", e => {
    const cp = e.target.closest("[data-copy]");
    if (cp) copyText(cp.dataset.copy, "Gekopieerd!");
  });

  if (loadShared()) toast("Gedeelde keuzes, stemmen en planning geladen.");
  render();
}
document.addEventListener("DOMContentLoaded", init);
