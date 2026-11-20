/* Season calendar — finviz snapshots (earnings preview / earnings / dividends /
 * economic), served as static JSON on this origin (see ~/market-clock/
 * fetch_calendar.py on pgpi). Default tab: Dividends (the bottom control).
 * Data is lazy-loaded once per tab; times render in UTC+8 (epoch from scraper).
 */
'use strict';

const SEASON_TABS = {
  preview:   { file: 'data/season.json' },
  earnings:  { file: 'data/earnings.json' },
  dividends: { file: 'data/dividends.json' },
  economic:  { file: 'data/economic.json' },
};
const seasonCache = {};
let seasonActive = 'dividends';

const $s = sel => document.querySelector(sel);
const escH = s => String(s ?? '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const fmtCap = v => v == null ? '' :
  v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'T' :
  v >= 1e3 ? '$' + (v / 1e3).toFixed(1) + 'B' : '$' + v.toFixed(0) + 'M';
const fmtT = ep => {
  if (!ep) return '';
  const d = new Date(ep * 1000);
  return d.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', timeZone: 'Asia/Hong_Kong' }) + ' ' +
         d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Hong_Kong' });
};
const num = (v, suffix = '') => v == null ? '—' : v + suffix;
const surprise = v => v == null ? '' :
  `<span class="${v >= 0 ? 'up' : 'down'}">${v >= 0 ? '+' : ''}${Number(v).toFixed(1)}%</span>`;

function table(cols, rows) {
  return `<table class="s-table"><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>` +
         `<tbody>${rows}</tbody></table>`;
}

function renderPreview(d) {
  const byDate = {};
  for (const e of d.entries) {
    (byDate[e.date] = byDate[e.date] || []).push(e);
  }
  return Object.keys(byDate).sort().map(day => {
    const rows = byDate[day].map(e => `<tr>
      <td class="tk">${escH(e.ticker)}</td><td>${escH(e.company)}</td>
      <td class="r">${fmtCap(e.marketCap)}</td>
      <td class="r">${num(e.epsEstimate)}</td>
      <td class="r">${num(e.epsActual)}</td>
      <td class="r">${surprise(e.epsActual != null && e.epsEstimate ? (e.epsActual - e.epsEstimate) / Math.abs(e.epsEstimate) * 100 : null)}</td>
    </tr>`).join('');
    const n = (d.totalsPerDay || {})[day] ?? byDate[day].length;
    return `<h3 class="s-day">${day} <span class="s-count">${n} reports</span></h3>` +
           table(['Ticker', 'Company', 'Mkt cap', 'EPS est', 'EPS act', 'Surprise'], rows);
  }).join('');
}

function renderEarnings(d) {
  const rows = [...d.entries].sort((a, b) => (a.epoch || 0) - (b.epoch || 0)).map(e => `<tr>
    <td class="t">${fmtT(e.epoch)}</td><td class="tk">${escH(e.ticker)}</td><td>${escH(e.company)}</td>
    <td class="r">${fmtCap(e.marketCap)}</td><td class="r">${num(e.epsEstimate)}</td>
    <td class="r">${num(e.epsActual)}</td><td class="r">${surprise(e.epsSurprise)}</td>
  </tr>`).join('');
  return table(['Date (UTC+8)', 'Ticker', 'Company', 'Mkt cap', 'EPS est', 'EPS act', 'Surprise'], rows);
}

function renderDividends(d) {
  const rows = [...d.entries].sort((a, b) => String(a.exdate).localeCompare(String(b.exdate))).map(e => `<tr>
    <td class="t">${escH(e.exdate)}</td><td class="tk">${escH(e.ticker)}</td><td>${escH(e.company)}</td>
    <td class="r">${num(e.ordinary)}</td><td class="r">${e.special ? num(e.special) : '—'}</td>
    <td class="r">${e.yield == null ? '—' : e.yield.toFixed(2) + '%'}</td>
  </tr>`).join('');
  return table(['Ex-date', 'Ticker', 'Company', 'Dividend', 'Special', 'Yield'], rows);
}

function renderEconomic(d) {
  const rows = [...d.entries].sort((a, b) => (a.epoch || 0) - (b.epoch || 0)).map(e => `<tr>
    <td class="t">${fmtT(e.epoch)}</td><td>${escH(e.event)}</td><td>${escH(e.category)}</td>
    <td class="imp imp${e.importance}">${'●'.repeat(e.importance || 0)}${'○'.repeat(3 - (e.importance || 0))}</td>
    <td class="r">${num(e.actual)}</td><td class="r">${num(e.forecast)}</td><td class="r">${num(e.previous)}</td>
  </tr>`).join('');
  return table(['Date (UTC+8)', 'Event', 'Category', 'Impact', 'Actual', 'Forecast', 'Previous'], rows);
}

async function activateSeasonTab(tab) {
  seasonActive = tab;
  document.querySelectorAll('#season-tabs button').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab));
  const body = $s('#season-body');
  body.innerHTML = '<p class="season-empty">Loading…</p>';
  try {
    if (!seasonCache[tab]) {
      const r = await fetch(SEASON_TABS[tab].file, { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      seasonCache[tab] = await r.json();
    }
    const d = seasonCache[tab];
    $s('#season-updated').textContent = 'snapshot ' + (d.updated || '').replace('T', ' ').replace('Z', 'Z');
    body.innerHTML = { preview: renderPreview, earnings: renderEarnings,
                       dividends: renderDividends, economic: renderEconomic }[tab](d);
  } catch (err) {
    body.innerHTML = `<p class="season-empty">Data unavailable (${escH(err.message)}) — snapshots regenerate 2×/day.</p>`;
  }
}

$s('#season-tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]');
  if (b) activateSeasonTab(b.dataset.tab);
});
const seasonObserver = new IntersectionObserver((entries, observer) => {
  if (entries.some(entry => entry.isIntersecting)) {
    observer.disconnect();
    activateSeasonTab(seasonActive);
  }
}, { rootMargin: '120px 0px' });
seasonObserver.observe($s('#season'));

$s('#season-toggle').addEventListener('click', () => {
  seasonObserver.disconnect();
  $s('#season').scrollIntoView({ behavior: 'smooth', block: 'start' });
  activateSeasonTab(seasonActive); // default dividends on first open
});
