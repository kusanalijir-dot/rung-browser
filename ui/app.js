'use strict';
const $ = (id) => document.getElementById(id);
const A = window.api;

// ไอคอนเส้น (วาดเอง สไตล์ใกล้เคียงไอคอนระบบของ Apple แต่ไม่ใช่ SF Symbols)
const ICONS = {
  back: '<path d="M14.5 5.5L8 12l6.5 6.5"/>', fwd: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
  reload: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4.2h-4.2"/>', stop: '<path d="M7 7l10 10M17 7L7 17"/>',
  sidebar: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M9.5 5v14"/>',
  plus: '<path d="M12 5.5v13M5.5 12h13"/>', close: '<path d="M7 7l10 10M17 7L7 17"/>',
  search: '<circle cx="10.8" cy="10.8" r="6"/><path d="M15.3 15.3L19.5 19.5"/>',
  lock: '<rect x="6" y="10.5" width="12" height="9" rx="2.5"/><path d="M8.8 10.5V8a3.2 3.2 0 0 1 6.4 0v2.5"/>',
  shield: '<path d="M12 3.5l6.5 2.6v5.2c0 4.1-2.7 7.5-6.5 9.2-3.8-1.7-6.5-5.1-6.5-9.2V6.1z"/><path d="M9.3 12l1.9 1.9 3.6-3.8"/>',
  menu: '<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>',
  star: '<path d="M12 4.2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.6l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/>',
  starf: '<path fill="currentColor" d="M12 4.2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.6l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/>',
  reader: '<rect x="5" y="4" width="14" height="16" rx="2.5"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5"/>',
  incog: '<path d="M4.5 11.5l1.8-5h11.4l1.8 5M3 11.5h18"/><circle cx="8" cy="16" r="2.6"/><circle cx="16" cy="16" r="2.6"/><path d="M10.6 16h2.8"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>', down: '<path d="M12 4.5v10.5M7.5 10.5L12 15l4.5-4.5M5.5 19.5h13"/>',
  text: '<path d="M4 18.5L8.5 6.5h1L14 18.5M5.6 14.5h6.8M15.5 18.5l2.6-7h.8l2.6 7M16.3 16.3h4.4"/>',
  brush: '<path d="M14.5 4.5l5 5-7.5 7.5h-5v-5z"/><path d="M4.5 19.5h7"/>',
  palette: '<path d="M12 3.8a8.2 8.2 0 1 0 0 16.4c1.2 0 1.9-.8 1.4-1.8-.5-1.1.1-2.1 1.3-2.1h1.9a3.6 3.6 0 0 0 3.6-3.6c0-5-3.7-8.9-8.2-8.9z"/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="11.5" cy="7.8" r="1" fill="currentColor"/><circle cx="15.5" cy="9.5" r="1" fill="currentColor"/>',
  layers: '<path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5L12 17l8.5-4.5"/><path d="M3.5 16.2L12 20.7l8.5-4.5"/>',
  globe: '<circle cx="12" cy="12" r="8.3"/><path d="M3.7 12h16.6M12 3.7c2.8 3 2.8 13.6 0 16.6M12 3.7c-2.8 3-2.8 13.6 0 16.6"/>',
  trash: '<path d="M5 7h14M10 7V4.8h4V7M6.8 7l.9 12.2h8.6L17.2 7"/>', check: '<path d="M5.5 12.5l4.2 4.2L18.5 8"/>',
  up: '<path d="M6.5 14.5L12 9l5.5 5.5"/>', dn: '<path d="M6.5 9.5L12 15l5.5-5.5"/>', chev: '<path d="M7 10l5 5 5-5"/>',
  puzzle: '<path d="M9 4.5h3a1.8 1.8 0 1 1 3.4 0H19v4a1.8 1.8 0 1 0 0 3.4V19h-4.5a1.8 1.8 0 1 0-3.4 0H5.5v-4.2a1.8 1.8 0 1 1 0-3.4V7.5A3 3 0 0 1 9 4.5z"/>',
  refresh2: '<path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 9M19.5 4.5V9H15M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4.5 15M4.5 19.5V15H9"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4L6 18M18 18l-1.6-1.6M7.6 7.6L6 6"/>'
};
const ic = (n) => `<svg viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;

// ธีมเดิม 8 แบบ กลายเป็น "สีเน้น" (tint) แต่ละสีมีค่าสำหรับโหมดสว่าง/มืด
const THEMES = [
  ['รุ้ง', '#1F7F83', '#4CC3C7'],
  ['Honey Gold', '#A87A06', '#F6C555'],
  ['Scarlet Nova', '#D7263D', '#FF6B7D'],
  ['Ivory Dawn', '#D9452E', '#FF7A63'],
  ['Dawn Linen', '#004643', '#EFC7C2'],
  ['Abyss Current', '#267A76', '#5FB3AE'],
  ['Lantern Gold', '#2B2B9C', '#FFD700'],
  ['Crimson Reverie', '#8A3540', '#E3A9B3']
];
const PRIVATE_TINT = ['#6E6E73', '#A1A1A6'];
const SPACE_DOTS = ['#34A1A5', '#E94F37', '#F6C555', '#7D6BD8', '#D7263D', '#30A46C', '#3A7BD5', '#C46BAE'];

let S = null;
let mode = null;          // null | 'suggest' | 'panel'
let panel = null;
let sugItems = [], sugSel = -1;
let findOpen = false;

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (_) { return ''; } }
function letterOf(t) { return esc((hostOf(t.url) || t.title || '?').charAt(0).toUpperCase()); }
function favHtml(t, cls = 'fav') {
  if (t.loading) return '<div class="spin"></div>';
  if (t.favicon) return `<img class="${cls}" src="${esc(t.favicon)}" onerror="this.outerHTML='<div class=&quot;${cls} l&quot;>${letterOf(t)}</div>'">`;
  return `<div class="${cls} l">${letterOf(t)}</div>`;
}
function lum(hex) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// ------------------------------------------------------------------ render
function applyTint() {
  const t = THEMES[S.theme] || THEMES[0];
  const tint = S.activePrivate ? PRIVATE_TINT[S.dark ? 1 : 0] : t[S.dark ? 2 : 1];
  const r = document.documentElement.style;
  r.setProperty('--tint', tint);
  r.setProperty('--tint-fg', lum(tint) > 0.62 ? '#111' : '#fff');
  document.documentElement.classList.toggle('dark', !!S.dark);
  // ปุ่มหน้าต่างของ Windows/Linux: โปร่งใสเมื่อมีวัสดุ Mica ไม่งั้นใช้สีพื้นหน้าต่าง
  A.titlebar({ color: S.material ? '#00000000' : (S.dark ? '#1C1C1E' : '#ECECF1'), symbol: S.dark ? '#FFFFFF' : '#000000' });
}

function prettyUrl(u) {
  try { const x = new URL(u); return x.hostname ? x.hostname.replace(/^www\./, '') : u; } catch (_) { return u || ''; }
}

function render() {
  if (!S) return;
  const b = document.body.classList;
  b.toggle('nosidebar', !S.sidebar); b.toggle('mac', S.isMac); b.toggle('win', !!S.isWin); b.toggle('solid', !S.material);
  applyTint();

  const all = [...S.tabs, ...S.privateTabs];
  const active = all.find((t) => t.id === S.activeId);
  const loading = !!(active && active.loading);

  $('btn-collapse').innerHTML = ic('sidebar');
  $('btn-expand').innerHTML = ic('sidebar'); $('btn-expand').hidden = S.sidebar;
  $('btn-back').innerHTML = ic('back'); $('btn-back').disabled = !S.canGoBack;
  $('btn-fwd').innerHTML = ic('fwd'); $('btn-fwd').disabled = !S.canGoForward;
  $('btn-reload').innerHTML = ic(loading ? 'stop' : 'reload'); $('btn-reload').dataset.mode = loading ? 'stop' : 'reload';
  $('btn-bm').innerHTML = ic(S.bookmarked ? 'starf' : 'star'); $('btn-bm').classList.toggle('on', S.bookmarked); $('btn-bm').disabled = S.activePrivate;
  $('btn-reader').innerHTML = ic('reader'); $('btn-find').innerHTML = ic('search');
  $('btn-newtab').innerHTML = ic('plus'); $('btn-menu').innerHTML = ic('menu');
  $('find-ic').innerHTML = ic('search'); $('find-prev').innerHTML = ic('up'); $('find-next').innerHTML = ic('dn');
  $('addr-ic').innerHTML = ic(S.activePrivate ? 'incog' : (S.activeUrl.startsWith('https:') ? 'lock' : 'globe'));
  $('loadbar').classList.toggle('on', loading);
  if (document.activeElement !== $('url')) $('url').value = prettyUrl(S.activeUrl);
  const total = S.stats.blocked + S.stats.stripped;
  $('shield-chip').innerHTML = ic('shield') + `<span>${total.toLocaleString()}</span>`;

  // หัวแถบข้าง: ชื่อ Space ปัจจุบัน
  const sp = S.spaces[S.current];
  const spColor = SPACE_DOTS[S.current % SPACE_DOTS.length];
  $('space-dot').style.background = S.activePrivate ? PRIVATE_TINT[0] : spColor;
  document.documentElement.style.setProperty('--space', S.activePrivate ? 'transparent' : spColor);
  $('space-name').textContent = S.activePrivate ? 'ส่วนตัว (ไม่บันทึก)' : sp.name;
  $('space-chev').innerHTML = ic('chev');

  const pins = S.tabs.filter((t) => t.pinned);
  $('pins').innerHTML = pins.map((t) => `<div class="pin ${t.id === S.activeId ? 'active' : ''}" data-id="${t.id}" title="${esc(t.title)}">${favHtml(t)}</div>`).join('');
  $('pins').hidden = !pins.length;
  const rows = (list) => list.map((t) => `<div class="row ${t.id === S.activeId ? 'active' : ''}" data-id="${t.id}">${favHtml(t)}<span class="t">${esc(t.title || hostOf(t.url))}</span><span class="x" data-close="${t.id}" title="ปิดแท็บ">${ic('close')}</span></div>`).join('');
  $('tabs').innerHTML = rows(S.tabs.filter((t) => !t.pinned));
  $('priv-sec').hidden = !S.privateTabs.length;
  $('privtabs').innerHTML = rows(S.privateTabs);
  $('spaces').innerHTML = S.spaces.map((s, i) => `<div class="sp ${i === S.current && !S.activePrivate ? 'active' : ''}" data-sp="${i}" title="${esc(s.name)}"><i style="background:${SPACE_DOTS[i % SPACE_DOTS.length]}"></i></div>`).join('') +
    `<div class="sp add" id="sp-add" title="สร้าง Space ใหม่">${ic('plus')}</div>`;

  if (mode === 'panel') renderPanel();
  reportRect();
}

function reportRect() {
  const r = $('webarea').getBoundingClientRect();
  A.rect({ x: r.left, y: r.top, w: r.width, h: r.height });
}

// ------------------------------------------------------------------ overlay (กระจกฝ้าทับหน้าเว็บ)
function openOverlay(m) {
  const was = mode;
  mode = m;
  $('overlay').hidden = false;
  $('suggest').hidden = m !== 'suggest';
  $('panel').hidden = m !== 'panel';
  if (!was) A.overlay(true);
}
function closeOverlay() {
  if (!mode) return;
  mode = null; panel = null;
  $('overlay').hidden = true; $('suggest').hidden = true; $('panel').hidden = true;
  $('backdrop').style.backgroundImage = '';
  A.overlay(false);
}
$('overlay').addEventListener('mousedown', (e) => {
  if (e.target === $('overlay') || e.target === $('backdrop')) { if (mode === 'suggest') $('url').blur(); closeOverlay(); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mode === 'panel') closeOverlay(); });

// ------------------------------------------------------------------ ช่องที่อยู่ + คำแนะนำ
async function renderSuggest() {
  const q = $('url').value.trim();
  const box = $('suggest');
  const typed = q && q !== prettyUrl(S.activeUrl) && q !== S.activeUrl;
  if (!typed) {
    // ยังไม่พิมพ์: แสดงรายการโปรด (บุ๊กมาร์ก) แบบ Safari
    sugItems = [];
    const favs = S.bookmarks.slice(0, 12);
    box.innerHTML = `<div class="h3">รายการโปรด</div>` + (favs.length
      ? `<div class="favgrid">${favs.map((f, i) => `<div class="favtile" data-fav="${i}"><div class="big">${esc((hostOf(f.url) || f.title).charAt(0).toUpperCase())}</div><span>${esc(f.title)}</span></div>`).join('')}</div>`
      : `<div class="lead" style="margin:4px 10px 10px">ยังไม่มีรายการโปรด กดรูปดาวที่แถบเครื่องมือเพื่อเพิ่มหน้าที่ชอบ</div>`) +
      (S.history.length ? `<div class="h3">เข้าล่าสุด</div>` + S.history.slice(0, 5).map((h, i) => `<div class="row" data-hist="${i}"><span class="ic">${ic('clock')}</span><div class="col"><span class="t">${esc(h.title)}</span><span class="sub">${esc(hostOf(h.url))}</span></div></div>`).join('') : '');
    return;
  }
  const found = await A.suggest(q);
  sugItems = [{ kind: 'go', title: /\.|:\/\//.test(q) && !/\s/.test(q) ? `ไปที่ ${q}` : `ค้นหา "${q}"`, url: q }, ...found];
  sugSel = 0;
  box.innerHTML = sugItems.map((s, i) => {
    const tag = { go: '', tab: 'สลับไปแท็บ', bookmark: 'รายการโปรด', history: 'ประวัติ' }[s.kind];
    const icon = s.kind === 'go' ? 'search' : s.kind === 'tab' ? 'layers' : s.kind === 'bookmark' ? 'star' : 'clock';
    return `<div class="row ${i === 0 ? 'sel' : ''}" data-s="${i}"><span class="ic">${ic(icon)}</span><div class="col"><span class="t">${esc(s.title)}</span>${s.kind === 'go' ? '' : `<span class="sub">${tag} · ${esc(hostOf(s.url))}</span>`}</div></div>`;
  }).join('');
}
function pickSuggest(i) {
  const s = sugItems[i]; if (!s) return;
  if (s.kind === 'tab') A.activate(s.id);
  else if (s.kind === 'go') A.go(s.url);
  else A.open(s.url, false);
  $('url').blur();
}
$('url').addEventListener('focus', () => { $('url').value = S ? S.activeUrl : ''; $('url').select(); openOverlay('suggest'); renderSuggest(); });
$('url').addEventListener('input', renderSuggest);
$('url').addEventListener('blur', () => setTimeout(() => { if (mode === 'suggest') closeOverlay(); if (S) $('url').value = prettyUrl(S.activeUrl); }, 140));
$('url').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); if (sugItems.length) pickSuggest(Math.max(sugSel, 0)); else { A.go($('url').value); $('url').blur(); } }
  else if (e.key === 'Escape') { $('url').blur(); }
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!sugItems.length) return;
    sugSel = (sugSel + (e.key === 'ArrowDown' ? 1 : -1) + sugItems.length) % sugItems.length;
    [...$('suggest').querySelectorAll('[data-s]')].forEach((el, i) => el.classList.toggle('sel', i === sugSel));
  }
});
$('suggest').addEventListener('mousedown', (e) => {
  e.preventDefault();
  const r = e.target.closest('[data-s]'); if (r) { pickSuggest(+r.dataset.s); return; }
  const f = e.target.closest('[data-fav]'); if (f) { A.open(S.bookmarks[+f.dataset.fav].url, false); $('url').blur(); return; }
  const h = e.target.closest('[data-hist]'); if (h) { A.open(S.history[+h.dataset.hist].url, false); $('url').blur(); }
});

// ------------------------------------------------------------------ คลิกทั่วไป
document.addEventListener('click', (e) => {
  const t = e.target;
  if (!$('menu').hidden && !t.closest('#menu') && !t.closest('#btn-menu') && !t.closest('#space-btn')) $('menu').hidden = true;
  const close = t.closest('[data-close]');
  if (close) { e.stopPropagation(); A.closeTab(close.dataset.close); return; }
  const tab = t.closest('.row[data-id], .pin[data-id]');
  if (tab) { A.activate(tab.dataset.id); return; }
  const sp = t.closest('[data-sp]');
  if (sp) { A.switchSpace(+sp.dataset.sp); return; }
  if (t.closest('#sp-add')) askText('Space ใหม่', 'ชื่อ Space เช่น งานวิจัย', '', (v) => A.newSpace(v));
});
document.addEventListener('auxclick', (e) => { const tab = e.target.closest('[data-id]'); if (tab && e.button === 1) A.closeTab(tab.dataset.id); });
document.addEventListener('contextmenu', (e) => {
  const tab = e.target.closest('[data-id]');
  if (tab) { e.preventDefault(); A.tabMenu(tab.dataset.id); return; }
  const sp = e.target.closest('[data-sp]');
  if (sp) { e.preventDefault(); spaceMenu(+sp.dataset.sp, sp); }
});
$('btn-collapse').onclick = () => A.toggleSidebar();
$('btn-expand').onclick = () => A.toggleSidebar();
$('btn-back').onclick = () => A.nav('back');
$('btn-fwd').onclick = () => A.nav('forward');
$('btn-reload').onmousedown = (e) => e.preventDefault();
$('btn-reload').onclick = () => A.nav($('btn-reload').dataset.mode === 'stop' ? 'stop' : 'reload');
$('btn-newtab').onclick = () => A.newTab(false);
$('btn-bm').onclick = () => A.toggleBookmark();
$('btn-reader').onclick = () => A.reader();
$('btn-find').onclick = () => toggleFind(true);
$('shield-chip').onclick = () => openPanel('privacy');
$('btn-menu').onclick = (e) => { e.stopPropagation(); mainMenu(); };
$('space-btn').onclick = (e) => { e.stopPropagation(); spacesMenu(); };
window.addEventListener('resize', reportRect);
new ResizeObserver(reportRect).observe($('webarea'));

// ------------------------------------------------------------------ ค้นหาในหน้า
function toggleFind(on) {
  findOpen = on;
  $('findbar').hidden = !on;
  if (on) { $('find-in').focus(); $('find-in').select(); } else { A.findStop(); $('find-count').textContent = ''; }
  setTimeout(reportRect, 0);
}
$('find-in').addEventListener('input', () => A.find($('find-in').value, true));
$('find-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') A.find($('find-in').value, !e.shiftKey); if (e.key === 'Escape') toggleFind(false); });
$('find-next').onclick = () => A.find($('find-in').value, true);
$('find-prev').onclick = () => A.find($('find-in').value, false);
$('find-close').onclick = () => toggleFind(false);

// ------------------------------------------------------------------ เมนู
function showMenu(items, anchor, above) {
  const m = $('menu');
  m.innerHTML = items.map((x, i) => x === null ? '<div class="sep"></div>'
    : typeof x === 'string' ? `<div class="mh">${esc(x)}</div>`
    : `<div class="mi" data-m="${i}">${x[0] ? ic(x[0]) : '<svg></svg>'}<span>${esc(x[1])}</span>${x[3] ? `<span class="k">${esc(x[3])}</span>` : ''}</div>`).join('');
  m.onclick = (e) => { const r = e.target.closest('[data-m]'); if (r) { m.hidden = true; items[+r.dataset.m][2](); } };
  m.hidden = false;
  const r = anchor.getBoundingClientRect();
  // ให้เมนูอยู่ในแถบข้างเสมอ (ถ้าล้นไปทับหน้าเว็บ หน้าเว็บจะบังเมนู)
  const side = $('sidebar').getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(r.left, side.right - m.offsetWidth - 6)) + 'px';
  if (above) { m.style.top = ''; m.style.bottom = (window.innerHeight - r.top + 6) + 'px'; }
  else { m.style.bottom = ''; m.style.top = (r.bottom + 6) + 'px'; }
}
const MOD = () => (S && S.isMac ? '⌘' : 'Ctrl+');
function mainMenu() {
  showMenu([
    ['plus', 'แท็บใหม่', () => A.newTab(false), MOD() + 'T'],
    ['incog', 'แท็บส่วนตัวใหม่', () => A.newTab(true), MOD() + (S.isMac ? '⇧N' : 'Shift+N')],
    null,
    ['star', 'รายการโปรด', () => openPanel('bookmarks')],
    ['clock', 'ประวัติ', () => openPanel('history')],
    ['down', 'ดาวน์โหลด', () => openPanel('downloads')],
    null,
    ['shield', 'ความเป็นส่วนตัวและความปลอดภัย', () => openPanel('privacy')],
    ['palette', 'ลักษณะที่ปรากฏ', () => openPanel('appearance')],
    ['puzzle', 'ส่วนขยาย', () => openPanel('extensions')],
    null,
    ['refresh2', 'อัปเดตกฎบล็อกโฆษณา', () => A.updateBlocklist()],
    ['brush', 'ล้างข้อมูลท่องเว็บ...', () => openPanel('clear')]
  ], $('btn-menu'), true);
}
function spacesMenu() {
  const items = ['Spaces'];
  S.spaces.forEach((s, i) => items.push([i === S.current && !S.activePrivate ? 'check' : null, s.name, () => A.switchSpace(i)]));
  items.push(null, ['plus', 'Space ใหม่...', () => askText('Space ใหม่', 'ชื่อ Space เช่น งานวิจัย', '', (v) => A.newSpace(v))]);
  if (!S.activePrivate) items.push(['gear', `เปลี่ยนชื่อ "${S.spaces[S.current].name}"...`, () => askText('เปลี่ยนชื่อ Space', 'ชื่อใหม่', S.spaces[S.current].name, (v) => A.renameSpace(S.current, v))]);
  showMenu(items, $('space-btn'), false);
}
function spaceMenu(i, el) {
  const items = [['gear', 'เปลี่ยนชื่อ...', () => askText('เปลี่ยนชื่อ Space', 'ชื่อใหม่', S.spaces[i].name, (v) => A.renameSpace(i, v))]];
  if (S.spaces.length > 1) items.push(['trash', 'ลบ Space นี้...', () => confirmPanel(`ลบ Space "${S.spaces[i].name}"?`, 'แท็บทั้งหมดใน Space นี้จะถูกปิด', 'ลบ', () => A.deleteSpace(i))]);
  showMenu(items, el, true);
}

// ------------------------------------------------------------------ แผง (แบบ sheet + grouped list)
function openPanel(name) { panel = name; $('menu').hidden = true; openOverlay('panel'); renderPanel(); }
const head = (title, lead) => `<div class="ph"><h2>${title}</h2><button class="xbtn" data-act="close" title="ปิด">${ic('close')}</button></div>${lead ? `<p class="lead">${lead}</p>` : ''}`;
const ghd = (t) => `<div class="ghd">${t}</div>`;
const gft = (t) => `<div class="gft">${t}</div>`;
const sw = (key, title, ds, note) => `<div class="cellr"><div class="tx"><div class="tt">${title}</div><div class="ds">${ds}</div>${note ? `<div class="nt">${note}</div>` : ''}</div><div class="sw ${S.settings[key] ? 'on' : ''}" data-set="${key}"></div></div>`;
const group = (inner) => `<div class="group">${inner}</div>`;

function renderPanel() {
  const p = $('panel');
  let h = '';
  if (panel === 'privacy') {
    h = head('ความเป็นส่วนตัวและความปลอดภัย', 'ไม่แน่ใจ? เปิดข้อที่มีคำว่า (แนะนำ) ไว้ก็ปลอดภัยพอสำหรับใช้ทั่วไป') +
      `<div class="stats"><div class="stat"><b>${S.stats.blocked.toLocaleString()}</b><span>โฆษณาและตัวติดตามที่บล็อก</span></div><div class="stat"><b>${S.stats.stripped.toLocaleString()}</b><span>รหัสติดตามที่ตัดออก</span></div><div class="stat"><b>${S.stats.upgraded.toLocaleString()}</b><span>ลิงก์ที่อัปเกรดเป็น HTTPS</span></div></div>` +
      ghd('บล็อกโฆษณา') + group(
        sw('adblock', 'บล็อกโฆษณาและตัวติดตาม (แนะนำ)', 'ไม่โหลดโฆษณาและสคริปต์ติดตาม ซ่อนกล่องโฆษณาที่หลุดมา', 'ปิดแล้ว: เว็บจะมีโฆษณาและโหลดช้าลง') +
        sw('ytSkip', 'ข้ามโฆษณา YouTube (ทดลอง)', 'กรอข้ามโฆษณาวิดีโอเองอัตโนมัติ', 'YouTube เปลี่ยนระบบบ่อย บางครั้งอาจใช้ไม่ได้')) +
      gft(`กฎกรองในเครื่อง ${S.blocklistSize.toLocaleString()} ข้อ ชุดเดียวกับ EasyList และ uBlock Origin`) +
      ghd('กันมัลแวร์และเว็บหลอกลวง') + group(
        sw('scamGuard', 'เตือนเว็บที่แอบอ้างธนาคารหรือหน่วยงาน (แนะนำ)', 'เว็บที่ใช้ชื่อธนาคาร ไปรษณีย์ กรมสรรพากร แต่ไม่ใช่เว็บทางการ จะขึ้นหน้าเตือนก่อนเข้า', 'ปิดแล้ว: เข้าเว็บปลอมได้โดยไม่มีคำเตือน (ตรวจจากชื่อเว็บเท่านั้น)') +
        sw('guardDownloads', 'เตือนก่อนโหลดไฟล์ที่รันโปรแกรมได้ (แนะนำ)', 'ไฟล์ .exe .msi .dmg .bat ฯลฯ คือทางที่มัลแวร์ใช้เข้าเครื่อง จะถามก่อนทุกครั้ง', 'ปิดแล้ว: ไฟล์พวกนี้จะโหลดทันทีโดยไม่ถาม') +
        sw('httpsOnly', 'บังคับใช้ HTTPS (แนะนำ)', 'เปลี่ยนเว็บที่ไม่เข้ารหัสเป็นแบบเข้ารหัส ป้องกันคนดักอ่านข้อมูล', 'ปิดแล้ว: รหัสผ่านที่พิมพ์ในเว็บไม่เข้ารหัสอาจถูกดักได้')) +
      ghd('กันการสะกดรอย') + group(
        sw('stripTracking', 'ตัดรหัสติดตามออกจากลิงก์ (แนะนำ)', 'รหัสต่อท้ายลิงก์ เช่น utm หรือ fbclid จะถูกตัดทิ้ง', 'ปิดแล้ว: ลิงก์มีรหัสที่บอกว่าใครกด') +
        sw('blockThirdPartyCookies', 'บล็อกคุกกี้ของเว็บอื่น (แนะนำ)', 'ไม่ให้โฆษณาจากเว็บอื่นแอบจำคุณข้ามเว็บ', 'เปิดแล้ว: การเข้าสู่ระบบผ่านเว็บอื่น (เช่น ด้วย Facebook) อาจใช้ไม่ได้') +
        sw('sendGpc', 'บอกเว็บว่าไม่อนุญาตให้ติดตาม (แนะนำ)', 'ส่งสัญญาณ Do Not Track / GPC', 'บางเว็บอาจไม่สนใจสัญญาณนี้') +
        sw('blockWebRtc', 'กันที่อยู่เครื่องรั่วผ่านวิดีโอคอล', 'ไม่ให้เว็บแอบดูไอพีจริงของเครื่อง', 'เปิดแล้ว: ประชุมวิดีโอบนเว็บอาจใช้ไม่ได้ (มีผลกับแท็บใหม่)')) +
      ghd('ข้อมูลในเครื่อง') + group(
        sw('clearOnExit', 'ล้างข้อมูลเมื่อปิดแอพ', 'ลบคุกกี้ การล็อกอิน แคช และประวัติทุกครั้งที่ปิดแอพ', 'เปิดแล้ว: ต้องล็อกอินเว็บใหม่ทุกครั้ง')) +
      gft('กล้องและไมโครโฟน: ถามก่อนทุกครั้ง · ตำแหน่งและการแจ้งเตือน: ปฏิเสธเสมอ · แท็บส่วนตัวไม่บันทึกประวัติ และคุกกี้หายเมื่อปิดแท็บสุดท้าย');
  } else if (panel === 'appearance') {
    const ap = S.settings.appearance || 'system';
    const seg = [['system', 'อัตโนมัติ'], ['light', 'สว่าง'], ['dark', 'มืด']].map(([k, n]) => `<button class="${ap === k ? 'on' : ''}" data-ap="${k}">${n}</button>`).join('');
    const sizes = ['เล็ก', 'ปกติ', 'ใหญ่', 'ใหญ่มาก'];
    h = head('ลักษณะที่ปรากฏ') +
      group(`<div class="cellr"><div class="tx"><div class="tt">โหมดสี</div><div class="ds">อัตโนมัติ = ตามการตั้งค่าของเครื่อง</div></div><div class="seg">${seg}</div></div>`) +
      ghd('สีเน้น') + group(`<div class="swatches">${THEMES.map((t, i) => `<div class="swc ${S.theme === i ? 'on' : ''}" data-theme="${i}" title="${t[0]}" style="background:${t[S.dark ? 2 : 1]}"></div>`).join('')}</div>`) +
      gft(`สีปุ่ม ตัวเลือก และสวิตช์ทั้งแอพ: ${THEMES[S.theme][0]}`) +
      ghd('ขนาดตัวอักษรเว็บ') + group(sizes.map((n, i) => `<div class="cellr click" data-text="${i}"><div class="tx"><div class="tt">${n} (${[90, 100, 125, 150][i]}%)</div></div>${S.settings.textLevel === i ? `<span class="chk">${ic('check')}</span>` : ''}</div>`).join('')) +
      gft('ใช้ปุ่มลัด Ctrl/Cmd + และ - ได้');
  } else if (panel === 'bookmarks' || panel === 'history') {
    const isB = panel === 'bookmarks';
    const list = isB ? S.bookmarks : S.history;
    h = head(isB ? 'รายการโปรด' : 'ประวัติ') +
      (list.length ? group(list.map((x) => `<div class="cellr click" data-open="${esc(x.url)}"><span class="ic">${ic(isB ? 'star' : 'clock')}</span><div class="tx"><div class="tt ell">${esc(x.title)}</div><div class="ds ell">${esc(x.url)}</div></div>${isB ? `<button class="ib sm" data-rmbm="${esc(x.url)}" title="ลบ">${ic('trash')}</button>` : ''}</div>`).join(''))
        : `<p class="lead">${isB ? 'ยังไม่มีรายการโปรด กดรูปดาวที่แถบเครื่องมือเพื่อเพิ่ม' : 'ยังไม่มีประวัติ'}</p>`) +
      (!isB && list.length ? '<div class="btnrow"><button class="btn danger" data-act="clearhist">ล้างประวัติ</button></div>' : '');
  } else if (panel === 'downloads') {
    h = head('ดาวน์โหลด', 'บันทึกไว้ในโฟลเดอร์ Downloads ของเครื่อง') +
      (S.downloads.length ? group(S.downloads.map((d) => `<div class="cellr click" data-show="${esc(d.path)}"><span class="ic">${ic('down')}</span><div class="tx"><div class="tt ell">${esc(d.name)}</div><div class="ds">${d.failed ? 'ไม่สำเร็จ' : d.done ? 'เสร็จแล้ว · คลิกเพื่อแสดงในโฟลเดอร์' : 'กำลังดาวน์โหลด...'}</div></div></div>`).join('')) : '<p class="lead">ยังไม่มีไฟล์ที่ดาวน์โหลดในรอบนี้</p>') +
      '<div class="btnrow"><button class="btn" data-show="">เปิดโฟลเดอร์ Downloads</button></div>';
  } else if (panel === 'extensions') {
    h = head('ส่วนขยาย', 'เพิ่มส่วนขยายสไตล์ Chrome จากโฟลเดอร์ที่แตกไฟล์แล้ว') +
      (S.extensions.length ? group(S.extensions.map((x) => `<div class="cellr"><span class="ic">${ic('puzzle')}</span><div class="tx"><div class="tt">${esc(x.name)} <span class="ds">${esc(x.version)}</span></div><div class="ds ell">${esc(x.path)}</div></div><button class="ib sm" data-rmext="${esc(x.id)}" title="ลบ">${ic('trash')}</button></div>`).join('')) : '<p class="lead">ยังไม่มีส่วนขยาย</p>') +
      gft('รองรับเฉพาะส่วนขยายบางแบบ ส่วนขยายที่ใช้ฟังก์ชันขั้นสูง (เช่น ตัวจัดการรหัสผ่านบางตัว) อาจใช้ไม่ได้ ติดตั้งเฉพาะที่เชื่อถือได้ เพราะส่วนขยายอ่านข้อมูลในหน้าเว็บได้') +
      '<div class="btnrow"><button class="btn pri" data-act="addext">เพิ่มส่วนขยาย...</button></div>';
  } else if (panel === 'clear') {
    h = head('ล้างข้อมูลท่องเว็บ') + `<p class="lead">ลบคุกกี้ แคช และประวัติทั้งหมด เว็บที่ล็อกอินไว้จะต้องล็อกอินใหม่</p>` +
      '<div class="btnrow"><button class="btn" data-act="close">ยกเลิก</button><button class="btn pri" data-act="clear">ล้างข้อมูล</button></div>';
  } else if (panel === 'ask' || panel === 'confirm') {
    return; // จัดการใน askText / confirmPanel
  }
  const st = p.scrollTop;
  p.innerHTML = h;
  p.scrollTop = st;
}

$('panel').addEventListener('click', (e) => {
  const t = e.target;
  const s = t.closest('[data-set]'); if (s) { A.setSetting(s.dataset.set, !S.settings[s.dataset.set]); return; }
  const ap = t.closest('[data-ap]'); if (ap) { A.setSetting('appearance', ap.dataset.ap); return; }
  const th = t.closest('[data-theme]'); if (th) { A.setTheme(+th.dataset.theme); return; }
  const tx = t.closest('[data-text]'); if (tx) { A.setSetting('textLevel', +tx.dataset.text); return; }
  const rx = t.closest('[data-rmext]'); if (rx) { A.removeExtension(rx.dataset.rmext); return; }
  const rm = t.closest('[data-rmbm]'); if (rm) { e.stopPropagation(); A.removeBookmark(rm.dataset.rmbm); return; }
  const op = t.closest('[data-open]'); if (op) { closeOverlay(); A.open(op.dataset.open, false); return; }
  const sh = t.closest('[data-show]'); if (sh) { A.showDownload(sh.dataset.show); return; }
  const a = t.closest('[data-act]');
  if (!a) return;
  const act = a.dataset.act;
  if (act === 'close') closeOverlay();
  else if (act === 'addext') A.addExtension();
  else if (act === 'clear') { A.clearData(); closeOverlay(); }
  else if (act === 'clearhist') A.clearHistory();
});

function askText(title, hint, value, cb) {
  panel = 'ask'; $('menu').hidden = true; openOverlay('panel');
  $('panel').innerHTML = head(esc(title)) + `<input class="pi" id="ask-in" placeholder="${esc(hint)}" value="${esc(value)}"><div class="btnrow"><button class="btn" id="ask-no">ยกเลิก</button><button class="btn pri" id="ask-ok">ตกลง</button></div>`;
  const inp = $('ask-in'); setTimeout(() => { inp.focus(); inp.select(); }, 30);
  const done = (ok) => { const v = inp.value; closeOverlay(); if (ok && v.trim()) cb(v.trim()); };
  $('ask-ok').onclick = () => done(true); $('ask-no').onclick = () => done(false);
  inp.onkeydown = (e) => { if (e.key === 'Enter') done(true); };
}
function confirmPanel(title, msg, okText, cb) {
  panel = 'confirm'; $('menu').hidden = true; openOverlay('panel');
  $('panel').innerHTML = head(esc(title)) + `<p class="lead">${esc(msg)}</p><div class="btnrow"><button class="btn" id="cf-no">ยกเลิก</button><button class="btn pri" id="cf-ok">${esc(okText)}</button></div>`;
  $('cf-no').onclick = () => closeOverlay();
  $('cf-ok').onclick = () => { closeOverlay(); cb(); };
}

// ------------------------------------------------------------------ toast + เหตุการณ์จาก main
let toastTimer;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
}
A.on('state', (s) => { S = s; render(); if (mode === 'suggest') renderSuggest(); });
A.on('backdrop', (url) => { if (mode) $('backdrop').style.backgroundImage = url ? `url("${url}")` : ''; });
A.on('toast', toast);
A.on('focus-url', () => { $('url').focus(); });
A.on('open-find', () => toggleFind(true));
A.on('find-result', (r) => { $('find-count').textContent = r.total ? `${r.active} จาก ${r.total}` : 'ไม่พบ'; });
A.ready();
