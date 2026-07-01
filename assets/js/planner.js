/* ============================================================
   Ons plan: dag-voor-dag-overzicht 18–31 juli + weer
   (Open-Meteo, sleutelvrij; faalt stil zonder netwerk).
   ============================================================ */
"use strict";

/* ---------- Weer ---------- */
const WX_KEY = "elzas2026.wx";
let wxData = null; // { time:[], code:[], tmax:[], tmin:[], rain:[] }

function wxIcon(code){
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

function loadWeather(){
  try {
    const raw = sessionStorage.getItem(WX_KEY);
    if (raw){
      const c = JSON.parse(raw);
      if (Date.now() - c.at < 3 * 3600e3){ wxData = c.data; renderPlanner(); return; }
    }
  } catch(e){}
  const [lat, lon] = COORDS["Schœnbourg"];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Europe%2FBerlin&forecast_days=16`;
  fetch(url).then(r => r.json()).then(j => {
    if (!j || !j.daily || !Array.isArray(j.daily.time)) return;
    wxData = { time:j.daily.time, code:j.daily.weather_code, tmax:j.daily.temperature_2m_max, tmin:j.daily.temperature_2m_min, rain:j.daily.precipitation_probability_max };
    try { sessionStorage.setItem(WX_KEY, JSON.stringify({ at:Date.now(), data:wxData })); } catch(e){}
    renderPlanner();
  }).catch(() => {}); // geen netwerk → gewoon geen weer
}

function wxFor(dateISO){
  if (!wxData) return null;
  const i = wxData.time.indexOf(dateISO);
  if (i < 0) return null;
  return { code:wxData.code[i], tmax:wxData.tmax[i], tmin:wxData.tmin[i], rain:wxData.rain[i] };
}

/* ---------- Doorlopend (lange periodes horen niet op één dag) ---------- */
function runningItems(){
  return allItems().filter(it => {
    if (isHidden(it) || !it.dates || Array.isArray(it.dates)) return false;
    const span = (new Date(it.dates.to) - new Date(it.dates.from)) / 864e5;
    return span > 3 && inTrip(it);
  });
}

/* ---------- Render ---------- */
function renderPlanner(){
  const daysEl = document.getElementById("days");
  if (!daysEl || document.getElementById("view-plan").hidden) return;

  const run = runningItems();
  const doorEl = document.getElementById("doorlopend");
  if (run.length){
    doorEl.hidden = false;
    doorEl.innerHTML = `<h4><svg class="icon sm"><use href="#i-clock"/></svg> Doorlopend tijdens ons verblijf</h4>` +
      run.map(it => `<button class="linklike" data-goto="${it.id}" style="margin-right:14px">${esc(it.title)}${it.whenLabel ? " · " + esc(it.whenLabel) : ""}</button>`).join("");
  } else doorEl.hidden = true;

  const today = todayISO();
  daysEl.innerHTML = tripDays().map(d => {
    const date = new Date(d + "T12:00:00");
    const dname = date.toLocaleDateString("nl-NL", { weekday:"long", day:"numeric", month:"long" });
    const isToday = d === today;

    const planned = plannedOn(d);
    const dated = allItems().filter(it => !isHidden(it) && datedOn(it, d) && !planned.includes(it));
    const items = [...planned.map(it => ({ it, planned:true })), ...dated.map(it => ({ it, planned:false }))];

    const w = wxFor(d);
    const wx = w ? `<span class="wx"><span class="wico">${wxIcon(w.code)}</span> ${Math.round(w.tmax)}° / ${Math.round(w.tmin)}°${w.rain != null ? ` <span class="rain">${Math.round(w.rain)}%</span>` : ""}</span>` : "";
    const rainHint = (w && w.rain >= 60) ? `<button class="rainhint" data-rainhint><svg class="icon sm"><use href="#i-rain"/></svg> Regendag? Bekijk binnen-ideeën</button>` : "";

    let body;
    if (items.length){
      body = `<div class="dayitems">` + items.map(({ it, planned }) => `
        <div class="pitem">
          <img src="${imgOf(it)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg(it.category)}'"/>
          <div class="pmain">
            <div class="ptitle">${isBooked(it) ? `<svg class="icon sm gcheck"><use href="#i-check"/></svg>` : ""}<button class="linklike" data-goto="${it.id}" style="text-decoration:none;color:inherit;font-weight:600;text-align:left">${esc(it.title)}</button></div>
            <div class="pwhen">${esc(it.whenLabel || driveLabel(it))}${it.book ? " · reserveren" : ""}</div>
            ${votesOf(it).length ? `<div class="pav">${avatarsHtml(it, 18)}</div>` : ""}
          </div>
          ${planned ? `<button class="prm" data-unplan="${it.id}" data-date="${d}" title="Van deze dag halen" aria-label="Van deze dag halen"><svg class="icon sm"><use href="#i-x"/></svg></button>` : ""}
        </div>`).join("") + `</div>`;
    } else {
      // suggesties: hoogst gestemde, nog niet ingeplande uitjes zonder vaste datum
      const plannedIds = new Set(Object.values(store.plan).flat());
      const sugg = allItems()
        .filter(it => !isHidden(it) && !it.dates && !plannedIds.has(it.id))
        .sort((a,b) => votesOf(b).length - votesOf(a).length || (b.rating||0) - (a.rating||0))
        .slice(0, 2);
      body = `<div class="dayempty">Nog niks — rustdag? 🌿</div>` +
        (sugg.length ? `<div class="sugrow">` + sugg.map(it =>
          `<button class="chip small" data-sug="${it.id}" data-date="${d}"><svg class="icon sm"><use href="#i-plus"/></svg> ${esc(it.title)}</button>`).join("") + `</div>` : "");
    }

    return `<div class="day ${isToday?"today":""}">
      <div class="dayhead"><span class="dname">${dname}</span>${isToday?`<span class="dtoday">vandaag</span>`:""}<span class="spacer"></span>${wx}</div>
      ${body}${rainHint}
    </div>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const view = document.getElementById("view-plan");
  view.addEventListener("click", e => {
    const g = e.target.closest("[data-goto]");
    if (g){ gotoCard(g.dataset.goto); return; }
    const up = e.target.closest("[data-unplan]");
    if (up){
      const d = up.dataset.date, id = up.dataset.unplan;
      store.plan[d] = (store.plan[d] || []).filter(x => x !== id);
      if (!store.plan[d].length) delete store.plan[d];
      save(); renderPlanner();
      return;
    }
    const s = e.target.closest("[data-sug]");
    if (s){
      const d = s.dataset.date, id = s.dataset.sug;
      const arr = Array.isArray(store.plan[d]) ? store.plan[d] : [];
      if (!arr.includes(id)) arr.push(id);
      store.plan[d] = arr;
      save(); renderPlanner();
      toast("Ingepland!");
      return;
    }
    if (e.target.closest("[data-rainhint]")){
      state.rain = true;
      document.getElementById("pRain").setAttribute("aria-pressed", "true");
      setView("ontdek");
      render();
      window.scrollTo({ top: 0, behavior:"smooth" });
    }
  });
  loadWeather();
});
