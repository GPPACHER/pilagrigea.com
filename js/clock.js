/* Market Clock — 24h analog dial, venue rings + world-time dots.
 *
 * Design notes (read before editing):
 * - Dial frame is DEVICE LOCAL time. Session constants below are UTC+8 wall
 *   times (WINTER). They are shifted into the local frame at boot via SHIFT.
 *   This fixes the old bug where the hand showed UTC+8 regardless of the
 *   viewer's timezone.
 * - One thin ring per venue, outer -> inner: TSE, HKEX, LDN, FRA, NYSE,
 *   NASDAQ, BMF. Lunch breaks are dimmed sub-arcs, not gaps.
 * - DST ghosts: ±1h offset arcs at 30% opacity for DST-observing venues
 *   (LDN, FRA, NYSE, NASDAQ). BMF/TSE/HKEX have no DST.
 *   TODO(DST): real DST-aware windows; ghosts are static approximations and
 *   are wrong for 1-3 weeks around US/EU DST transitions.
 * - Now-dots sit ON each ring at that venue's local time-of-day. The dial's
 *   numerals are the viewer's local hour; each dot is the venue's hour.
 * - Overlap zones (two+ venues open at the same angle, e.g. LDN∩NYSE
 *   21:30-00:30 +8) get a darker composite notch track just inside the
 *   innermost ring. Rings themselves are concentric and never share pixels,
 *   so true multiply blending between rings is not possible; the notch
 *   track is the composite-darkening read.
 * - ?t=HH:MM[:SS] pins the dial for screenshot tests.
 */
'use strict';

const TZ8 = 8 * 60;                       // session constants are +8 wall time
const DEV_OFF = -new Date().getTimezoneOffset(); // device offset from UTC, minutes
const SHIFT = DEV_OFF - TZ8;              // +8 minutes -> local minutes

const CX = 300, CY = 300;
const R_FACE = 298;
const R_TICK_OUT = 293, R_TICK_MAJOR = 285;
const R_NUM = 275;
const CAUT_BAND = [267, 263];             // attention / volatility-trigger track
const OVERLAP_BAND = [176, 172];          // dark composite overlap track
const RING_W = 7, RING_GAP = 4, RING_OUT = 256; // 7 rings, 11px pitch -> inner edge 183

const M = h => Math.round(h * 60);
const C = {
  tse: '#8b7bff', hkex: '#5f8dff',
  ldn: '#35c46f', fra: '#2aa9a0',
  nyse: '#e8712e', nasdaq: '#f0a13c', bmf: '#e05a4e',
};
const CAUTION_COLOR = '#f5c518';

/* Session spans are UTC+8 wall minutes; wrap past midnight allowed.
 * off = venue UTC offset in minutes (standard time; ghosts cover DST). */
const VENUES = [
  { id: 'TSE',    label: 'TSE · TOKYO',      color: C.tse,    off: 540,
    segs: [[M(8), M(10.5)], [M(11.5), M(14)]], lunch: [M(10.5), M(11.5)], ghosts: [] },
  { id: 'HKEX',   label: 'HKEX · HONG KONG', color: C.hkex,   off: 480,
    segs: [[M(9), M(12)], [M(13), M(16)]],   lunch: [M(12), M(13)],   ghosts: [] },
  { id: 'LDN',    label: 'LDN · LONDON',     color: C.ldn,    off: 0,
    segs: [[M(16), M(24.5)]], lunch: null,
    ghosts: [[M(15), M(16)], [M(24.5), M(25.5)]] },
  { id: 'FRA',    label: 'FRA · FRANKFURT',  color: C.fra,    off: 60,
    segs: [[M(16), M(24.5)]], lunch: null,
    ghosts: [[M(15), M(16)], [M(24.5), M(25.5)]] },
  { id: 'NYSE',   label: 'NYSE · NEW YORK',  color: C.nyse,   off: -300,
    segs: [[M(21.5), M(28)]], lunch: null,
    ghosts: [[M(20.5), M(21.5)], [M(28), M(29)]] },
  { id: 'NASDAQ', label: 'NASDAQ',           color: C.nasdaq, off: -300,
    segs: [[M(21.5), M(28)]], lunch: null,
    ghosts: [[M(20.5), M(21.5)], [M(28), M(29)]] },
  { id: 'BMF',    label: 'BMF · SÃO PAULO',  color: C.bmf,    off: -180,
    segs: [[M(21), M(28)]],   lunch: null,   ghosts: [] },
];
/* Attention track: volatility-trigger slots (+8 winter frame).
 * bright = do-not-trade (Raghee Horner "red times"); reg = reduced size
 * ("yellow times"). US slots are ET->+8 and get -1h faded ghosts for summer
 * (EDT); Asia has no DST, so no ghosts there. */
const ATTENTION = [
  // Asia — funds activity
  { s: M(8),     e: M(9),      lvl: 'reg',    txt: '08:00–09:00 Asia open — funds positioning' },
  { s: M(10),    e: M(10.5),   lvl: 'bright', txt: '10:00–10:30 the 10:00 reversal — stop-run / AMD' },
  { s: M(11.5),  e: M(12),     lvl: 'reg',    txt: '11:30–12:00 pre-lunch — HK liquidity pulled' },
  { s: M(14.5),  e: M(15),     lvl: 'reg',    txt: '14:30–15:00 HK re-open — whipsaw' },
  { s: M(16),    e: M(16.5),   lvl: 'reg',    txt: '16:00–16:30 late-Asia fixing' },
  // US — Raghee Horner volatility triggers (ET)
  { s: M(22.5),  e: M(22.75),  lvl: 'bright', us: 1, txt: '22:30–22:45 9:30 ET cash open — funds loading at the bell' },
  { s: M(22.583),e: M(22.75),  lvl: 'bright', us: 1, txt: '22:35–22:45 9:35 ET first 5-min reversal — stop-run' },
  { s: M(22.833),e: M(23),     lvl: 'reg',    us: 1, txt: '22:50–23:00 9:50 ET momentum flip' },
  { s: M(23.167),e: M(23.333), lvl: 'reg',    us: 1, txt: '23:10–23:20 10:10 ET trap window' },
  { s: M(23.583),e: M(23.75),  lvl: 'bright', us: 1, txt: '23:35–23:45 10:35 ET late-morning flush' },
  { s: M(27),    e: M(27.25),  lvl: 'bright', us: 1, txt: '03:00–03:15 14:00 ET FOMC statement window' },
  { s: M(28),    e: M(28.167), lvl: 'reg',    us: 1, txt: '04:00–04:10 15:00 ET power hour starts' },
  { s: M(28.333),e: M(28.5),   lvl: 'reg',    us: 1, txt: '04:20–04:30 15:20 ET' },
  { s: M(28.667),e: M(28.833), lvl: 'bright', us: 1, txt: '04:40–04:50 15:40 ET MOC imbalance window' },
  { s: M(28.833),e: M(29),     lvl: 'bright', us: 1, txt: '04:50–05:00 15:50 ET MOC imbalance' },
  { s: M(29),    e: M(29.167), lvl: 'bright', us: 1, txt: '05:00–05:10 16:00 ET close — closing auction' },
];

/* ---------- time helpers ---------- */
const PARAM_T = (() => {
  const m = new URLSearchParams(location.search).get('t');
  if (!m) return null;
  const p = m.split(':').map(Number);
  return (p[0] || 0) * 60 + (p[1] || 0) + (p[2] || 0) / 60;
})();
function localMinutes() { // device-local minutes of day
  if (PARAM_T !== null) return PARAM_T;
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60 + d.getMilliseconds() / 60000;
}
const sh = mins => { const s = mins + SHIFT; return s < 0 ? s + 1440 : s; }; // +8 -> local
const inSpan = (now, s, e) => now >= s && now < e;
const wrap = m => ((m % 1440) + 1440) % 1440;

/* ---------- geometry ---------- */
function pt(r, min) { // minutes of day -> xy, 00:00 at top, clockwise
  const a = (min / 1440) * 2 * Math.PI - Math.PI / 2;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}
const svgEl = (tag, attrs) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
};
function arcPath(band, start, end) { // closed annular sector
  const [ro, ri] = band;
  const [x1, y1] = pt(ro, start), [x2, y2] = pt(ro, end);
  const [x3, y3] = pt(ri, end),   [x4, y4] = pt(ri, start);
  const large = (end - start) > 720 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${ro} ${ro} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}` +
         `L${x3.toFixed(2)} ${y3.toFixed(2)}A${ri} ${ri} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}Z`;
}
const arcLine = (r, start, end) => { // open arc along center radius (for textPath)
  const [x1, y1] = pt(r, start), [x2, y2] = pt(r, end);
  const large = (end - start) > 720 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

/* ---------- static layers (built once) ---------- */
function buildRim() {
  const ticks = document.getElementById('ticks');
  const nums = document.getElementById('numerals');
  for (let h = 0; h < 24; h++) {
    const min = h * 60;
    const major = h % 6 === 0;
    const [x1, y1] = pt(major ? R_TICK_MAJOR : R_TICK_OUT - 5, min);
    const [x2, y2] = pt(R_TICK_OUT, min);
    ticks.appendChild(svgEl('line', { x1, y1, x2, y2, class: major ? 'major' : 'minor' }));
    const [tx, ty] = pt(R_NUM, min);
    const t = svgEl('text', { x: tx, y: ty });
    t.textContent = String(h).padStart(2, '0');
    nums.appendChild(t);
  }
}

function buildRings() {
  const g = document.getElementById('rings');
  const defs = document.getElementById('dial-defs');
  VENUES.forEach((v, i) => {
    const band = [RING_OUT - i * (RING_W + RING_GAP), RING_OUT - i * (RING_W + RING_GAP) - RING_W];
    const rc = (band[0] + band[1]) / 2;
    v.band = band; v.rc = rc;
    v.lsegs = v.segs.map(([s, e]) => [sh(s), sh(e)]);
    v.lunchSeg = v.lunch ? [sh(v.lunch[0]), sh(v.lunch[1])] : null;
    v.lghosts = v.ghosts.map(([s, e]) => [sh(s), sh(e)]);
    const mk = ([s, e], cls, track) => {
      const el = svgEl('path', {
        d: arcPath(band, s, e), fill: v.color,
        class: 'arc ' + cls, 'data-v': v.id, 'data-s': s, 'data-e': e,
      });
      (track || g).appendChild(el);
      return el;
    };
    v.lsegs.forEach(seg => mk(seg, 'main'));
    if (v.lunchSeg) v.lunchEl = mk(v.lunchSeg, 'lunch');
    v.lghosts.forEach(seg => mk(seg, 'ghost'));
    // city label centered on the longest bright sub-arc, along the ring centerline
    const longest = v.lsegs.reduce((a, b) => (b[1] - b[0]) > (a[1] - a[0]) ? b : a);
    if (longest[1] - longest[0] >= M(2.5)) {
      const pid = 'lbl-' + v.id;
      defs.appendChild(svgEl('path', { id: pid, d: arcLine(rc, longest[0], longest[1]), fill: 'none' }));
      const t = svgEl('text', { class: 'ring-label' });
      const tp = svgEl('textPath', { href: '#' + pid, startOffset: '50%', 'text-anchor': 'middle' });
      tp.textContent = v.label;
      t.appendChild(tp);
      g.appendChild(t);
      // shrink-to-fit without clipping if the natural length outgrows the arc
      const arcLen = (longest[1] - longest[0]) / 1440 * 2 * Math.PI * rc;
      const natural = t.getComputedTextLength();
      if (natural > arcLen * 0.86) {
        t.setAttribute('textLength', (arcLen * 0.86).toFixed(1));
        t.setAttribute('lengthAdjust', 'spacingAndGlyphs');
      }
    }
  });
  // attention track: volatility-trigger notches (bright = do-not-trade)
  for (const a of ATTENTION) {
    g.appendChild(svgEl('path', {
      d: arcPath(CAUT_BAND, sh(a.s), sh(a.e)), fill: CAUTION_COLOR,
      class: 'arc att-' + a.lvl,
    }));
    if (a.us) { // summer (EDT) ghost at -1h, faded
      g.appendChild(svgEl('path', {
        d: arcPath(CAUT_BAND, sh(a.s - 60), sh(a.e - 60)), fill: CAUTION_COLOR,
        class: 'arc att-ghost',
      }));
    }
  }
  // overlap composite: union of pairwise intersections of main session spans
  const spans = [];
  VENUES.forEach(v => v.lsegs.forEach(([s, e]) => spans.push([s, e])));
  const cuts = new Set();
  spans.forEach(([s, e]) => { cuts.add(s); cuts.add(e); });
  const sorted = [...cuts].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    if (b - a < 1) continue;
    const depth = spans.filter(([s, e]) => s <= a && e >= b).length;
    if (depth >= 2) {
      g.appendChild(svgEl('path', {
        d: arcPath(OVERLAP_BAND, a, b), fill: '#000', 'fill-opacity': 0.3, class: 'overlap',
      }));
    }
  }
}

function buildHands() {
  const g = document.getElementById('hands');
  // 24h hour hand: long, clean triangle taper, short tail — no bent segments
  const hour = svgEl('polygon', {
    points: `${CX - 2.4},${CY + 24} ${CX},${CY - 170} ${CX + 2.4},${CY + 24}`,
    id: 'hand-hour',
  });
  // minute hand: shorter, thin, small tail
  const minute = svgEl('line', {
    x1: CX, y1: CY + 16, x2: CX, y2: CY - 140, id: 'hand-minute',
  });
  // second hand: very thin + counterweight tail
  const second = svgEl('line', {
    x1: CX, y1: CY + 34, x2: CX, y2: CY - 232, id: 'hand-second',
  });
  const hub = svgEl('circle', { cx: CX, cy: CY, r: 6.5, id: 'hand-hub' });
  const pin = svgEl('circle', { cx: CX, cy: CY, r: 2.2, id: 'hand-pin' });
  g.append(hour, minute, second, hub, pin);
  return { hour, minute, second };
}

function buildDots() {
  const g = document.getElementById('dots');
  for (const v of VENUES) {
    v.halo = svgEl('circle', { r: 7.5, class: 'dot-halo', fill: v.color, cx: CX, cy: CY });
    v.dot = svgEl('circle', { r: 4, class: 'dot', fill: v.color, cx: CX, cy: CY });
    g.append(v.halo, v.dot);
  }
}

/* ---------- live layer (rAF; only transform/position writes) ---------- */
let HANDS;
function tick() {
  const now = localMinutes();
  const deg = (now / 1440) * 360;
  HANDS.hour.setAttribute('transform', `rotate(${deg.toFixed(4)} ${CX} ${CY})`);
  HANDS.minute.setAttribute('transform', `rotate(${(deg * 24).toFixed(4)} ${CX} ${CY})`);
  HANDS.second.setAttribute('transform', `rotate(${(deg * 1440).toFixed(4)} ${CX} ${CY})`);
  for (const v of VENUES) {
    const m = wrap(now + (v.off - DEV_OFF)); // venue wall minutes on the local dial
    const [x, y] = pt(v.rc, m);
    v.dot.setAttribute('cx', x.toFixed(2)); v.dot.setAttribute('cy', y.toFixed(2));
    v.halo.setAttribute('cx', x.toFixed(2)); v.halo.setAttribute('cy', y.toFixed(2));
    const live = v.lsegs.some(([s, e]) => inSpan(now, s, e));
    if (live !== v.live) {
      v.live = live;
      v.dot.classList.toggle('live', live);
      v.halo.classList.toggle('live', live);
      for (const el of document.querySelectorAll(`.arc.main[data-v="${v.id}"]`)) {
        el.classList.toggle('active', live);
      }
      if (v.lunchEl) v.lunchEl.classList.toggle('active', live);
    }
  }
  requestAnimationFrame(tick);
}

/* ---------- ICS (unchanged contract) ---------- */
const TZ_OFFSET_MIN = TZ8;
const FLAGS = { USD: '🇺🇸', EUR: '🇪🇺', JPY: '🇯🇵', GBP: '🇬🇧', CNY: '🇨🇳', AUD: '🇦🇺', NZD: '🇳🇿', CAD: '🇨🇦', CHF: '🇨🇭', BRL: '🇧🇷', HKD: '🇭🇰', ALL: '🌐' };
const notified = new Set();
let eventsToday = [];

function parseIcs(text) {
  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  const out = [];
  const re = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let m;
  while ((m = re.exec(unfolded))) {
    const b = m[1];
    const get = k => { const mm = b.match(new RegExp('^' + k + '(?:;[^:]*)?:(.*)$', 'm')); return mm ? mm[1].trim() : null; };
    const dt = get('DTSTART');
    if (!dt) continue;
    const dm = dt.match(/T(\d{2})(\d{2})/);
    const dayM = dt.match(/(\d{4})(\d{2})(\d{2})/);
    if (!dm || !dayM) continue;
    let day = `${dayM[1]}-${dayM[2]}-${dayM[3]}`;
    let mins = (+dm[1]) * 60 + (+dm[2]);
    if (/Z\s*$/.test(dt)) { // UTC stamp -> convert to +8 wall time (date may roll)
      const t8 = new Date(Date.UTC(+dayM[1], +dayM[2] - 1, +dayM[3], +dm[1], +dm[2]) + TZ_OFFSET_MIN * 60000);
      mins = t8.getUTCHours() * 60 + t8.getUTCMinutes();
      day = `${t8.getUTCFullYear()}-${String(t8.getUTCMonth() + 1).padStart(2, '0')}-${String(t8.getUTCDate()).padStart(2, '0')}`;
    }
    out.push({
      uid: get('UID') || get('SUMMARY') + dt,
      impact: get('X-IMPACT') || 'HIGH',
      date: day, mins,
      title: (get('SUMMARY') || '').replace(/\\,/g, ','),
      desc: (get('DESCRIPTION') || '').replace(/\\,/g, ',').replace(/\\n/g, ' | '),
      rrule: get('RRULE'),
    });
  }
  return out;
}

function todayStr() {
  const d = PARAM_T !== null ? new Date() : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderEvents() {
  const list = document.getElementById('event-list');
  const today = todayStr();
  const now = localMinutes();
  eventsToday = eventsToday.filter(e => e.date === today).sort((a, b) => a.mins - b.mins);
  list.textContent = '';
  if (!eventsToday.length) {
    const li = document.createElement('li');
    li.className = 'empty'; li.textContent = 'No events today.';
    list.appendChild(li); return;
  }
  for (const e of eventsToday) {
    const li = document.createElement('li');
    if (e.impact !== 'HIGH') li.classList.add('med');
    if (e.mins >= now && e.mins - now <= 60) li.classList.add('hot');
    const cur = (e.title.match(/\b([A-Z]{3})\b/) || [null, 'ALL'])[1];
    const hh = String(Math.floor(e.mins / 60) % 24).padStart(2, '0');
    const mm = String(Math.floor(e.mins % 60)).padStart(2, '0');
    li.innerHTML = `<span class="ev-time">${hh}:${mm}</span>` +
      `<span class="ev-flag">${FLAGS[cur] || ''} ${cur}</span>` +
      `<span class="ev-title"></span>` +
      (e.desc ? `<span class="ev-fc"></span>` : '');
    li.querySelector('.ev-title').textContent = e.title;
    if (e.desc) li.querySelector('.ev-fc').textContent = e.desc;
    list.appendChild(li);
  }
}

function checkNotifications() {
  const now = localMinutes();
  const today = todayStr();
  for (const e of eventsToday) {
    if (e.date !== today) continue;
    if (e.impact !== 'HIGH') continue; // Medium = info only, never alert
    const until = (e.mins - now) * 60000; // ms
    for (const [win, label] of [[20, 'in 20 min'], [1, 'in 1 min']]) {
      const key = e.uid + ':' + win;
      if (until > (win - 0.5) * 60000 && until <= (win + 0.5) * 60000 && !notified.has(key)) {
        notified.add(key);
        if (Notification.permission === 'granted') {
          new Notification('Market Clock', { body: `${e.title} — ${label}` });
        }
      }
    }
  }
}

async function refreshIcs() {
  const st = document.getElementById('ics-status');
  try {
    const r = await fetch('market-events.ics', { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    let evs = parseIcs(await r.text());
    // expand simple daily repeats onto today
    const today = todayStr();
    for (const e of evs) {
      if (e.rrule && e.rrule.includes('FREQ=DAILY') && e.date !== today) {
        evs.push(Object.assign({}, e, { date: today }));
      }
    }
    eventsToday = evs;
    st.textContent = '· updated ' + new Date().toTimeString().slice(0, 5);
    renderEvents();
  } catch (err) {
    st.textContent = '· ICS fetch failed (' + err.message + ')';
  }
}

/* ---------- boot ---------- */
buildRim();
buildRings();
buildDots();
HANDS = buildHands();
requestAnimationFrame(tick);

/* legend panel: ⓘ button or "h" key toggles; collapsed by default on narrow */
const legend = document.getElementById('legend');
const setLegend = open => legend.classList.toggle('collapsed', !open);
document.getElementById('legend-toggle').addEventListener('click', () =>
  setLegend(legend.classList.contains('collapsed')));
addEventListener('keydown', e => {
  if (e.key === 'h' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    setLegend(legend.classList.contains('collapsed'));
  }
});
if (matchMedia('(max-width: 1100px)').matches) setLegend(false);
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
refreshIcs();
setInterval(refreshIcs, 30 * 60 * 1000);   // ICS auto-refresh
setInterval(checkNotifications, 20 * 1000); // alert 20 min + 1 min before
