const { app, BrowserWindow, WebContentsView, session, ipcMain, Menu, dialog, shell, net, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Blocker } = require('./lib/blocker');
const scam = require('./lib/scam');
const { HIDE_SELECTORS, YOUTUBE_SCRIPT, READER_SCRIPT } = require('./lib/cosmetic');

const HOME = process.env.RUNG_HOME || 'https://duckduckgo.com';
const IS_MAC = process.platform === 'darwin';
const TOP_H = 52;
const IS_WIN = process.platform === 'win32';
// Mica ต้องใช้ Windows 11 22H2 (build 22621) ขึ้นไป รุ่นเก่ากว่าใช้พื้นทึบแทน
const HAS_MICA = IS_WIN && Number((require('os').release().split('.')[2]) || 0) >= 22621;
const MAIN_PARTITION = 'persist:rung';
const PRIVATE_PARTITION = 'rung-private'; // ไม่มี persist: = อยู่ในหน่วยความจำ หายเมื่อปิดแอพ
const ZOOM_LEVELS = [0.9, 1.0, 1.25, 1.5];

// ธีมสีทั้งหมดอยู่ใน ui/app.js; main ใช้แค่สีของแถบปุ่มหน้าต่าง
let userDir;
let blocker;
let win;
let state;
let saveTimer = null;
let pushTimer = null;
const rt = new Map();          // tabId -> { view }
const privateTabs = [];        // แท็บส่วนตัว (ไม่บันทึกลงดิสก์)
let activeId = null;
let rect = { x: 272, y: TOP_H, w: 800, h: 600 };
let overlay = false;
const stats = { blocked: 0, stripped: 0, upgraded: 0 };
const scamAllowed = new Set();
const httpAllowed = new Set();
const upgraded = new Map();    // https url -> http url ต้นฉบับ (ไว้ถอยกลับถ้าเว็บไม่รองรับ)
const downloads = [];
let pendingFind = '';

const uid = () => crypto.randomBytes(6).toString('hex');

// ------------------------------------------------------------------ state
function defaults() {
  const mk = (name, tabs) => ({ id: uid(), name, tabs, lastActive: null });
  return {
    spaces: [
      mk('ส่วนตัว', [{ id: uid(), url: HOME, title: 'DuckDuckGo', pinned: false, last: Date.now() }]),
      mk('งาน', [{ id: uid(), url: HOME, title: 'DuckDuckGo', pinned: false, last: Date.now() }]),
      mk('บันเทิง', [{ id: uid(), url: HOME, title: 'DuckDuckGo', pinned: false, last: Date.now() }])
    ],
    current: 0,
    theme: 0,
    sidebar: true,
    settings: {
      adblock: true, ytSkip: true, httpsOnly: true, stripTracking: true, blockThirdPartyCookies: true,
      sendGpc: true, scamGuard: true, guardDownloads: true, blockWebRtc: false, clearOnExit: false, textLevel: 1, appearance: 'system'
    },
    bookmarks: [],
    history: []
  };
}

function loadState() {
  const file = path.join(userDir, 'rung-state.json');
  try {
    const s = JSON.parse(fs.readFileSync(file, 'utf8'));
    const d = defaults();
    s.settings = Object.assign(d.settings, s.settings || {});
    s.bookmarks = s.bookmarks || [];
    s.history = s.history || [];
    if (!s.spaces || !s.spaces.length) return d;
    s.current = Math.min(Math.max(0, s.current | 0), s.spaces.length - 1);
    if (typeof s.sidebar !== 'boolean') s.sidebar = true;
    return s;
  } catch (_) {
    return defaults();
  }
}

function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { fs.writeFileSync(path.join(userDir, 'rung-state.json'), JSON.stringify(state)); } catch (_) {}
  }, 400);
}

const space = () => state.spaces[state.current];
const allTabs = () => [...state.spaces.flatMap((s) => s.tabs), ...privateTabs];
const findTab = (id) => allTabs().find((t) => t.id === id);
const activeTab = () => findTab(activeId);
const activeView = () => (rt.get(activeId) ? rt.get(activeId).view : null);

function summary(t) {
  const r = rt.get(t.id);
  return { id: t.id, title: t.title || t.url, url: t.url, pinned: !!t.pinned, favicon: t.favicon || null, loading: !!(r && r.loading), private: !!t.private };
}

function snapshot() {
  const t = activeTab();
  const v = activeView();
  const sp = space();
  return {
    spaces: state.spaces.map((s) => ({ id: s.id, name: s.name })),
    current: state.current,
    tabs: sp.tabs.map(summary),
    privateTabs: privateTabs.map(summary),
    activeId,
    activeUrl: t ? t.url : '',
    activePrivate: !!(t && t.private),
    theme: state.theme,
    sidebar: state.sidebar,
    settings: state.settings,
    stats,
    blocklistSize: blocker.size,
    extensions: extList(),
    canGoBack: !!(v && v.webContents.navigationHistory.canGoBack()),
    canGoForward: !!(v && v.webContents.navigationHistory.canGoForward()),
    bookmarked: !!(t && state.bookmarks.some((b) => b.url === t.url)),
    bookmarks: state.bookmarks.slice(0, 200),
    history: state.history.slice(0, 150),
    downloads: downloads.slice(0, 30),
    isMac: IS_MAC,
    isWin: IS_WIN,
    material: IS_MAC || HAS_MICA,
    dark: nativeTheme.shouldUseDarkColors
  };
}

function push() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    if (win && !win.isDestroyed()) win.webContents.send('state', snapshot());
  }, 30);
}

function send(ch, data) {
  if (win && !win.isDestroyed()) win.webContents.send(ch, data);
}

// ------------------------------------------------------------------ URL helpers
function normalize(input) {
  const s = String(input || '').trim();
  if (!s) return HOME;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return s;
  if (/^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/.*)?$/i.test(s)) return 'http://' + s;
  if (!/\s/.test(s) && /^[^\s/]+\.[^\s/.]{2,}(\/.*)?$/.test(s)) return 'https://' + s;
  return 'https://duckduckgo.com/?q=' + encodeURIComponent(s);
}

const TRACK = /^(utm_[a-z]+|fbclid|gclid|dclid|msclkid|mc_eid|mc_cid|igshid|yclid|_hsenc|_hsmi|ref_src|spm|scm|gbraid|wbraid|twclid|ttclid|li_fat_id)$/i;
function cleanUrl(u) {
  try {
    const x = new URL(u);
    let changed = false;
    for (const k of [...x.searchParams.keys()]) {
      if (TRACK.test(k)) { x.searchParams.delete(k); changed = true; }
    }
    return changed ? x.toString() : u;
  } catch (_) { return u; }
}

function site(u) {
  try {
    const h = new URL(u).hostname.split('.');
    if (h.length <= 2) return h.join('.');
    const sl = h[h.length - 2];
    const tld = h[h.length - 1];
    if (tld.length === 2 && ['co', 'or', 'go', 'ac', 'in', 'com', 'net', 'org', 'gov', 'edu'].includes(sl)) return h.slice(-3).join('.');
    return h.slice(-2).join('.');
  } catch (_) { return ''; }
}

// ------------------------------------------------------------------ sessions
function setupSession(ses, isPrivate) {
  ses.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (d, cb) => {
    const s = state.settings;
    const u = d.url;
    const main = d.resourceType === 'mainFrame';
    if (!main) {
      if (s.adblock) {
        const m = blocker.match(d);
        if (m && m.cancel) { stats.blocked++; push(); return cb({ cancel: true }); }
        if (m && m.redirectUrl) { stats.blocked++; push(); return cb({ redirectURL: m.redirectUrl }); }
      }
      return cb({});
    }
    if (d.method !== 'GET') return cb({});
    let host = '';
    try { host = new URL(u).hostname; } catch (_) { return cb({}); }
    if (s.scamGuard && !scamAllowed.has(host)) {
      const reason = scam.check(host);
      if (reason) {
        promptScam(d.webContentsId, u, host, reason);
        return cb({ cancel: true });
      }
    }
    if (s.stripTracking) {
      const c = cleanUrl(u);
      if (c !== u) { stats.stripped++; push(); return cb({ redirectURL: c }); }
    }
    if (s.httpsOnly && u.startsWith('http://') && !httpAllowed.has(host) && !/^(localhost|127\.|10\.|192\.168\.)/.test(host)) {
      const t = 'https://' + u.slice(7);
      upgraded.set(t, u);
      stats.upgraded++;
      push();
      return cb({ redirectURL: t });
    }
    cb({});
  });

  ses.webRequest.onBeforeSendHeaders({ urls: ['http://*/*', 'https://*/*'] }, (d, cb) => {
    const h = d.requestHeaders;
    const s = state.settings;
    if (s.sendGpc) { h['Sec-GPC'] = '1'; h['DNT'] = '1'; }
    if (s.blockThirdPartyCookies && d.resourceType !== 'mainFrame' && d.webContents) {
      const page = d.webContents.getURL();
      if (page && site(page) !== site(d.url)) delete h['Cookie'];
    }
    cb({ requestHeaders: h });
  });

  ses.webRequest.onHeadersReceived({ urls: ['http://*/*', 'https://*/*'] }, (d, cb) => {
    const h = d.responseHeaders;
    if (state.settings.blockThirdPartyCookies && d.resourceType !== 'mainFrame' && d.webContents) {
      const page = d.webContents.getURL();
      if (page && site(page) !== site(d.url)) {
        for (const k of Object.keys(h)) if (k.toLowerCase() === 'set-cookie') delete h[k];
      }
    }
    cb({ responseHeaders: h });
  });

  const OK = ['fullscreen', 'clipboard-sanitized-write', 'pointerLock'];
  ses.setPermissionCheckHandler((wc, perm) => OK.includes(perm));
  ses.setPermissionRequestHandler((wc, perm, cb, details) => {
    if (OK.includes(perm)) return cb(true);
    if (perm === 'media') {
      const kinds = (details.mediaTypes || []).map((m) => (m === 'video' ? 'กล้อง' : 'ไมโครโฟน')).join(' และ ') || 'กล้อง/ไมโครโฟน';
      let host = '';
      try { host = new URL(details.requestingUrl).hostname; } catch (_) {}
      dialog.showMessageBox(win, {
        type: 'question', buttons: ['ไม่อนุญาต', 'อนุญาต'], defaultId: 0, cancelId: 0,
        message: `${host} ต้องการใช้${kinds}`,
        detail: 'อนุญาตเฉพาะเมื่อคุณกำลังโทรวิดีโอหรือประชุมอยู่จริง'
      }).then((r) => cb(r.response === 1));
      return;
    }
    cb(false); // ตำแหน่ง การแจ้งเตือน ฯลฯ ปฏิเสธเสมอ
  });

  ses.on('will-download', (e, item) => {
    const name = item.getFilename();
    const risky = /\.(exe|msi|bat|cmd|scr|jar|apk|dmg|pkg|sh|ps1|vbs|js|hta)$/i.test(name);
    let dest = path.join(app.getPath('downloads'), name);
    for (let i = 1; fs.existsSync(dest); i++) {
      const ext = path.extname(name);
      dest = path.join(app.getPath('downloads'), `${path.basename(name, ext)} (${i})${ext}`);
    }
    item.setSavePath(dest);
    const rec = { id: uid(), name, path: dest, done: false, time: Date.now() };
    const go = () => {
      downloads.unshift(rec);
      push();
    };
    if (state.settings.guardDownloads && risky) {
      item.pause();
      dialog.showMessageBox(win, {
        type: 'warning', buttons: ['ยกเลิก', 'ดาวน์โหลดต่อ'], defaultId: 0, cancelId: 0,
        message: 'ไฟล์นี้อาจเป็นโปรแกรมอันตราย',
        detail: `${name}\n\nไฟล์ประเภทนี้รันโปรแกรมในเครื่องได้ มัลแวร์มักมาในรูปแบบนี้ ดาวน์โหลดเฉพาะเมื่อมาจากเว็บทางการที่คุณเชื่อใจ`
      }).then((r) => {
        if (r.response === 1) { item.resume(); go(); } else item.cancel();
      });
    } else go();
    item.once('done', (_e, st) => { rec.done = st === 'completed'; rec.failed = st !== 'completed'; push(); });
  });

  if (isPrivate) ses.setSpellCheckerEnabled(false);
}

function promptScam(wcId, url, host, reason) {
  dialog.showMessageBox(win, {
    type: 'warning', buttons: ['กลับไปก่อน', 'ไปต่อ (เสี่ยง)'], defaultId: 0, cancelId: 0,
    message: 'เว็บนี้อาจเป็นเว็บหลอกลวง',
    detail: `${host}\n\n${reason}\n\nอย่ากรอกรหัสผ่าน เลขบัตร หรือ OTP ในเว็บนี้ ถ้าไม่แน่ใจ ให้เข้าผ่านแอพหรือเว็บทางการแทน`
  }).then((r) => {
    if (r.response !== 1) return;
    scamAllowed.add(host);
    for (const { view } of rt.values()) {
      if (view.webContents.id === wcId) { view.webContents.loadURL(url); return; }
    }
  });
}

// ------------------------------------------------------------------ tabs
function layout() {
  const v = activeView();
  if (!v) return;
  const show = !overlay && rect.w > 0;
  v.setVisible(show);
  if (show) v.setBounds({ x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.w), height: Math.round(rect.h) });
}

function applyZoom(wc) { wc.setZoomFactor(ZOOM_LEVELS[state.settings.textLevel] || 1); }

function ensureView(tab) {
  let r = rt.get(tab.id);
  if (r) return r.view;
  const view = new WebContentsView({
    webPreferences: {
      session: session.fromPartition(tab.private ? PRIVATE_PARTITION : MAIN_PARTITION),
      sandbox: true, contextIsolation: true, nodeIntegration: false
    }
  });
  r = { view, loading: false };
  rt.set(tab.id, r);
  const wc = view.webContents;
  wc.setWebRTCIPHandlingPolicy(state.settings.blockWebRtc ? 'disable_non_proxied_udp' : 'default');

  wc.on('page-title-updated', (_e, title) => { tab.title = title; saveSoon(); push(); });
  wc.on('page-favicon-updated', (_e, icons) => { tab.favicon = icons[0] || null; push(); });
  wc.on('did-start-loading', () => { r.loading = true; push(); });
  wc.on('did-stop-loading', () => { r.loading = false; push(); });
  const nav = (_e, url) => {
    if (!url || url === 'about:blank') return;
    tab.url = url;
    tab.last = Date.now();
    if (!tab.private && /^https?:/.test(url)) {
      state.history = state.history.filter((h) => h.url !== url);
      state.history.unshift({ title: tab.title || url, url, time: Date.now() });
      if (state.history.length > 400) state.history.length = 400;
    }
    saveSoon(); push();
  };
  wc.on('did-navigate', nav);
  wc.on('did-navigate-in-page', nav);
  wc.on('dom-ready', () => injectCosmetic(wc));
  wc.on('did-fail-load', (_e, code, desc, url, isMain) => {
    if (!isMain || code === -3) return;
    const orig = upgraded.get(url);
    if (orig) {
      upgraded.delete(url);
      dialog.showMessageBox(win, {
        type: 'question', buttons: ['ยกเลิก', 'เปิดแบบไม่เข้ารหัส'], defaultId: 0, cancelId: 0,
        message: 'เว็บนี้ไม่รองรับการเข้ารหัส (HTTPS)',
        detail: `${orig}\n\nข้อมูลที่พิมพ์ในเว็บนี้อาจถูกดักอ่านได้ ไม่ควรกรอกรหัสผ่าน`
      }).then((x) => {
        if (x.response === 1) { try { httpAllowed.add(new URL(orig).hostname); } catch (_) {} wc.loadURL(orig); }
      });
    }
  });
  wc.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) openTab(url, !!tab.private);
    return { action: 'deny' };
  });
  wc.on('found-in-page', (_e, res) => send('find-result', { active: res.activeMatchOrdinal, total: res.matches }));
  wc.on('context-menu', (_e, p) => {
    const items = [];
    if (p.linkURL) {
      items.push({ label: 'เปิดลิงก์ในแท็บใหม่', click: () => openTab(p.linkURL, !!tab.private) });
      items.push({ label: 'คัดลอกลิงก์', click: () => require('electron').clipboard.writeText(p.linkURL) });
    }
    if (p.selectionText) items.push({ label: 'คัดลอก', role: 'copy' });
    if (p.isEditable) items.push({ label: 'วาง', role: 'paste' });
    if (p.srcURL && p.mediaType === 'image') items.push({ label: 'คัดลอกที่อยู่รูป', click: () => require('electron').clipboard.writeText(p.srcURL) });
    items.push({ type: 'separator' }, { label: 'ย้อนกลับ', enabled: wc.navigationHistory.canGoBack(), click: () => wc.navigationHistory.goBack() },
      { label: 'โหลดใหม่', click: () => wc.reload() }, { label: 'ตรวจสอบองค์ประกอบ', click: () => wc.inspectElement(p.x, p.y) });
    Menu.buildFromTemplate(items).popup({ window: win });
  });
  applyZoom(wc);
  wc.loadURL(tab.url && tab.url !== 'about:blank' ? tab.url : HOME);
  return view;
}

function injectCosmetic(wc) {
  const s = state.settings;
  if (!s.adblock) return;
  let host = '';
  try { host = new URL(wc.getURL()).hostname; } catch (_) { return; }
  const c = blocker.cosmetics(wc.getURL());
  if (c && c.styles) wc.insertCSS(c.styles).catch(() => {});
  wc.insertCSS(HIDE_SELECTORS.join(',') + '{display:none!important}').catch(() => {});
  if (s.ytSkip && host.endsWith('youtube.com')) wc.executeJavaScript(YOUTUBE_SCRIPT).catch(() => {});
}

function activate(id) {
  const tab = findTab(id);
  if (!tab) return;
  const prev = activeView();
  if (prev && win) { try { win.contentView.removeChildView(prev); } catch (_) {} }
  activeId = id;
  if (!tab.private) { space().lastActive = id; }
  const view = ensureView(tab);
  win.contentView.addChildView(view);
  layout();
  if (!overlay) view.webContents.focus();
  tab.last = Date.now();
  saveSoon(); push();
}

function openTab(url, priv = false, focusUrl = false) {
  const tab = { id: uid(), url: url || HOME, title: '', pinned: false, last: Date.now(), private: priv || undefined };
  if (priv) privateTabs.push(tab); else space().tabs.push(tab);
  activate(tab.id);
  if (focusUrl) send('focus-url');
  return tab;
}

function destroyView(id) {
  const r = rt.get(id);
  if (!r) return;
  try { win.contentView.removeChildView(r.view); } catch (_) {}
  try { r.view.webContents.close(); } catch (_) {}
  rt.delete(id);
}

function closeTab(id) {
  const t = findTab(id);
  if (!t) return;
  const list = t.private ? privateTabs : space().tabs;
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) {
    // แท็บของ Space อื่น
    for (const s of state.spaces) { const i = s.tabs.findIndex((x) => x.id === id); if (i >= 0) { s.tabs.splice(i, 1); destroyView(id); saveSoon(); push(); return; } }
    return;
  }
  list.splice(idx, 1);
  destroyView(id);
  if (t.private && privateTabs.length === 0) wipePrivate();
  if (activeId === id) {
    activeId = null;
    const next = list[idx] || list[idx - 1] || (t.private ? space().tabs[0] : null);
    if (next) activate(next.id);
    else openTab(HOME, false, true);
  }
  saveSoon(); push();
}

function wipePrivate() {
  const s = session.fromPartition(PRIVATE_PARTITION);
  s.clearStorageData().catch(() => {});
  s.clearCache().catch(() => {});
}

async function clearAll() {
  for (const p of [MAIN_PARTITION, PRIVATE_PARTITION]) {
    const s = session.fromPartition(p);
    await s.clearStorageData().catch(() => {});
    await s.clearCache().catch(() => {});
  }
  state.history = [];
  saveSoon(); push();
}

function switchSpace(i) {
  if (i < 0 || i >= state.spaces.length) return;
  state.current = i;
  const sp = space();
  if (!sp.tabs.length) sp.tabs.push({ id: uid(), url: HOME, title: '', pinned: false, last: Date.now() });
  const t = sp.tabs.find((x) => x.id === sp.lastActive) || sp.tabs[0];
  activate(t.id);
}

// ------------------------------------------------------------------ extensions
function extApi(ses) { return ses.extensions || ses; }
function extList() {
  try {
    return extApi(session.fromPartition(MAIN_PARTITION)).getAllExtensions().map((e) => ({ id: e.id, name: e.name, version: e.version, path: e.path }));
  } catch (_) { return []; }
}
async function loadSavedExtensions(ses) {
  for (const p of state.extensions || []) {
    try { await extApi(ses).loadExtension(p, { allowFileAccess: true }); } catch (_) {}
  }
  push();
}

// ------------------------------------------------------------------ IPC
function handlers() {
  // สคริปต์กรองโฆษณา (scriptlet) ที่ต้องรันก่อนสคริปต์ของหน้าเว็บ เรียกจาก tab-preload.js
  ipcMain.on('cosmetic-scripts', (e, url) => {
    let out = '';
    try {
      if (state.settings.adblock && /^https?:/.test(url)) {
        const c = blocker.cosmetics(url);
        if (c && c.scripts) out = c.scripts.join('\n');
      }
    } catch (_) {}
    e.returnValue = out;
  });
  ipcMain.on('ext:add', async () => {
    const r = await dialog.showOpenDialog(win, { title: 'เลือกโฟลเดอร์ส่วนขยายที่แตกไฟล์แล้ว (มีไฟล์ manifest.json)', properties: ['openDirectory'] });
    if (r.canceled || !r.filePaths[0]) return;
    try {
      const ext = await extApi(session.fromPartition(MAIN_PARTITION)).loadExtension(r.filePaths[0], { allowFileAccess: true });
      state.extensions = [...new Set([...(state.extensions || []), r.filePaths[0]])];
      saveSoon(); push();
      send('toast', `เพิ่มส่วนขยาย ${ext.name} แล้ว`);
    } catch (err) { send('toast', 'เพิ่มส่วนขยายไม่สำเร็จ: ' + String(err.message || err).slice(0, 80)); }
  });
  ipcMain.on('ext:remove', async (_e, id) => {
    try {
      const api = extApi(session.fromPartition(MAIN_PARTITION));
      const ext = api.getAllExtensions().find((x) => x.id === id);
      if (ext) state.extensions = (state.extensions || []).filter((p) => p !== ext.path);
      await (api.removeExtension ? api.removeExtension(id) : null);
      saveSoon(); push();
      send('toast', 'ลบส่วนขยายแล้ว');
    } catch (_) {}
  });
  ipcMain.on('ui:rect', (_e, r) => { rect = r; layout(); });
  // เปิดแผง/ช่องค้นหา: ถ่ายภาพหน้าเว็บไว้ทำพื้นหลังกระจกฝ้า แล้วค่อยซ่อนหน้าเว็บ
  ipcMain.on('ui:overlay', async (_e, on) => {
    const v = activeView();
    if (on && !overlay && v && rect.w > 0) {
      try {
        const img = await v.webContents.capturePage();
        const sz = img.getSize();
        send('backdrop', sz.width ? img.resize({ width: Math.max(1, Math.round(sz.width / 3)) }).toDataURL() : null);
      } catch (_) { send('backdrop', null); }
    }
    overlay = !!on;
    layout();
    if (!on && v) v.webContents.focus();
  });
  ipcMain.on('ui:ready', () => push());
  ipcMain.on('ui:titlebar', (_e, c) => { if (!IS_MAC && win.setTitleBarOverlay) { try { win.setTitleBarOverlay({ color: c.color, symbolColor: c.symbol, height: TOP_H }); } catch (_) {} } });
  nativeTheme.on('updated', () => {
    if (win && !IS_MAC && !HAS_MICA) win.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#1C1C1E' : '#ECECF1');
    push();
  });
  ipcMain.on('sidebar:toggle', () => { state.sidebar = !state.sidebar; saveSoon(); push(); });

  ipcMain.on('tab:new', (_e, priv) => openTab(HOME, !!priv, true));
  ipcMain.on('tab:close', (_e, id) => closeTab(id));
  ipcMain.on('tab:activate', (_e, id) => activate(id));
  ipcMain.on('tab:menu', (_e, id) => {
    const t = findTab(id); if (!t) return;
    Menu.buildFromTemplate([
      { label: t.pinned ? 'เลิกปักหมุด' : 'ปักหมุด', enabled: !t.private, click: () => { t.pinned = !t.pinned; saveSoon(); push(); } },
      { label: 'ทำซ้ำแท็บ', click: () => openTab(t.url, !!t.private) },
      { label: 'คัดลอกลิงก์', click: () => require('electron').clipboard.writeText(t.url) },
      { type: 'separator' },
      { label: 'ปิดแท็บ', click: () => closeTab(id) }
    ]).popup({ window: win });
  });
  ipcMain.on('go', (_e, text) => {
    const url = normalize(text);
    const v = activeView();
    if (v) { activeTab().url = url; v.webContents.loadURL(url); v.webContents.focus(); } else openTab(url);
  });
  ipcMain.on('open', (_e, url, inNew) => { if (inNew) openTab(url, !!(activeTab() && activeTab().private)); else { const v = activeView(); if (v) v.webContents.loadURL(url); else openTab(url); } });
  ipcMain.on('nav', (_e, what) => {
    const v = activeView(); if (!v) return;
    const wc = v.webContents;
    if (what === 'back') wc.navigationHistory.goBack();
    else if (what === 'forward') wc.navigationHistory.goForward();
    else if (what === 'reload') wc.reload();
    else if (what === 'stop') wc.stop();
  });

  ipcMain.on('space:switch', (_e, i) => switchSpace(i));
  ipcMain.on('space:new', (_e, name) => {
    state.spaces.push({ id: uid(), name: (name || '').trim() || `Space ${state.spaces.length + 1}`, tabs: [], lastActive: null });
    switchSpace(state.spaces.length - 1);
  });
  ipcMain.on('space:rename', (_e, i, name) => { if (state.spaces[i] && name.trim()) { state.spaces[i].name = name.trim(); saveSoon(); push(); } });
  ipcMain.on('space:delete', (_e, i) => {
    if (state.spaces.length <= 1) return;
    for (const t of state.spaces[i].tabs) destroyView(t.id);
    const wasCurrent = i === state.current;
    state.spaces.splice(i, 1);
    if (state.current >= state.spaces.length) state.current = state.spaces.length - 1;
    else if (i < state.current) state.current--;
    if (wasCurrent) { activeId = null; switchSpace(state.current); } else push();
    saveSoon();
  });

  ipcMain.on('theme:set', (_e, i) => { state.theme = i; saveSoon(); push(); });
  ipcMain.on('settings:set', (_e, key, val) => {
    if (!(key in state.settings)) return;
    state.settings[key] = val;
    if (key === 'appearance') nativeTheme.themeSource = val;
    if (key === 'textLevel') for (const { view } of rt.values()) applyZoom(view.webContents);
    if (key === 'blockWebRtc') for (const { view } of rt.values()) view.webContents.setWebRTCIPHandlingPolicy(val ? 'disable_non_proxied_udp' : 'default');
    saveSoon(); push();
    const needReload = ['adblock', 'httpsOnly', 'stripTracking', 'blockThirdPartyCookies', 'sendGpc', 'ytSkip'].includes(key);
    if (needReload && activeView()) activeView().webContents.reload();
  });

  ipcMain.on('find', (_e, text, forward) => {
    const v = activeView(); if (!v) return;
    if (!text) { v.webContents.stopFindInPage('clearSelection'); return; }
    // หมายเหตุ: ห้ามส่ง findNext:false ตรง ๆ (Electron จะไม่คืนผล) ให้ใส่เฉพาะตอนเป็น true
    const opts = { forward: forward !== false };
    if (text === pendingFind) opts.findNext = true;
    v.webContents.findInPage(text, opts);
    pendingFind = text;
  });
  ipcMain.on('find:stop', () => { pendingFind = ''; const v = activeView(); if (v) v.webContents.stopFindInPage('clearSelection'); });
  ipcMain.on('reader', () => {
    const v = activeView(); if (!v) return;
    v.webContents.executeJavaScript(READER_SCRIPT).then((r) => { if (r === 'none') send('toast', 'หน้านี้ไม่มีบทความยาว ๆ ให้ใช้โหมดอ่าน'); }).catch(() => {});
  });
  ipcMain.on('bookmark:toggle', () => {
    const t = activeTab(); if (!t || t.private) return;
    const i = state.bookmarks.findIndex((b) => b.url === t.url);
    if (i >= 0) state.bookmarks.splice(i, 1); else state.bookmarks.unshift({ title: t.title || t.url, url: t.url, time: Date.now() });
    saveSoon(); push();
  });
  ipcMain.on('bookmark:remove', (_e, url) => { state.bookmarks = state.bookmarks.filter((b) => b.url !== url); saveSoon(); push(); });
  ipcMain.on('history:clear', () => { state.history = []; saveSoon(); push(); });
  ipcMain.on('data:clear', () => clearAll().then(() => send('toast', 'ล้างข้อมูลท่องเว็บแล้ว')));
  ipcMain.on('download:show', (_e, p) => { if (p) shell.showItemInFolder(p); else shell.openPath(app.getPath('downloads')); });
  ipcMain.on('blocklist:update', async () => {
    try {
      send('toast', 'กำลังดาวน์โหลดกฎกรองล่าสุด...');
      const n = await blocker.update((u, o) => net.fetch(u, o));
      send('toast', `อัปเดตกฎกรองแล้ว (${n.toLocaleString()} ข้อ)`); push();
    } catch (_) { send('toast', 'อัปเดตรายชื่อบล็อกไม่สำเร็จ ตรวจสอบอินเทอร์เน็ต'); }
  });
  ipcMain.on('devtools', () => { const v = activeView(); if (v) v.webContents.openDevTools({ mode: 'detach' }); });

  ipcMain.handle('suggest', (_e, q) => {
    const s = String(q || '').toLowerCase().trim();
    if (!s) return [];
    const out = [];
    const seen = new Set();
    const add = (kind, title, url, id) => { const k = kind + url; if (!seen.has(k) && out.length < 8) { seen.add(k); out.push({ kind, title, url, id }); } };
    for (const t of allTabs()) if ((t.title + ' ' + t.url).toLowerCase().includes(s)) add('tab', t.title || t.url, t.url, t.id);
    for (const b of state.bookmarks) if ((b.title + ' ' + b.url).toLowerCase().includes(s)) add('bookmark', b.title, b.url);
    for (const h of state.history) if ((h.title + ' ' + h.url).toLowerCase().includes(s)) add('history', h.title, h.url);
    return out;
  });
}

// ------------------------------------------------------------------ menu / window
function buildMenu() {
  const cmd = (label, accelerator, click) => ({ label, accelerator, click });
  const t = [
    ...(IS_MAC ? [{ role: 'appMenu' }] : []),
    {
      label: 'ไฟล์',
      submenu: [
        cmd('แท็บใหม่', 'CmdOrCtrl+T', () => openTab(HOME, false, true)),
        cmd('แท็บส่วนตัวใหม่', 'CmdOrCtrl+Shift+N', () => openTab(HOME, true, true)),
        cmd('ปิดแท็บ', 'CmdOrCtrl+W', () => closeTab(activeId)),
        { type: 'separator' },
        IS_MAC ? { role: 'close', label: 'ปิดหน้าต่าง' } : { role: 'quit', label: 'ออก' }
      ]
    },
    { label: 'แก้ไข', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    {
      label: 'มุมมอง',
      submenu: [
        cmd('ช่องที่อยู่เว็บ / คำสั่ง', 'CmdOrCtrl+L', () => send('focus-url')),
        cmd('ค้นหาในหน้า', 'CmdOrCtrl+F', () => send('open-find')),
        cmd('โหลดหน้าใหม่', 'CmdOrCtrl+R', () => { const v = activeView(); if (v) v.webContents.reload(); }),
        cmd('ย้อนกลับ', 'CmdOrCtrl+[', () => { const v = activeView(); if (v) v.webContents.navigationHistory.goBack(); }),
        cmd('ไปข้างหน้า', 'CmdOrCtrl+]', () => { const v = activeView(); if (v) v.webContents.navigationHistory.goForward(); }),
        cmd('โหมดอ่าน', 'CmdOrCtrl+Shift+R', () => ipcMain.emit('reader')),
        cmd('แสดง/ซ่อนแถบข้าง', 'CmdOrCtrl+S', () => { state.sidebar = !state.sidebar; saveSoon(); push(); }),
        cmd('ขยายตัวอักษร', 'CmdOrCtrl+Plus', () => { state.settings.textLevel = Math.min(3, state.settings.textLevel + 1); for (const { view } of rt.values()) applyZoom(view.webContents); saveSoon(); push(); }),
        cmd('ย่อตัวอักษร', 'CmdOrCtrl+-', () => { state.settings.textLevel = Math.max(0, state.settings.textLevel - 1); for (const { view } of rt.values()) applyZoom(view.webContents); saveSoon(); push(); }),
        cmd('แท็บถัดไป', 'CmdOrCtrl+Alt+Right', () => stepTab(1)),
        cmd('แท็บก่อนหน้า', 'CmdOrCtrl+Alt+Left', () => stepTab(-1)),
        cmd('เครื่องมือนักพัฒนา', 'CmdOrCtrl+Alt+I', () => ipcMain.emit('devtools')),
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'เต็มจอ' }
      ]
    },
    { role: 'windowMenu' }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(t));
}

function stepTab(d) {
  const list = [...space().tabs, ...privateTabs];
  const i = list.findIndex((x) => x.id === activeId);
  if (i < 0 || !list.length) return;
  activate(list[(i + d + list.length) % list.length].id);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 760, minHeight: 520, show: false,
    title: 'รุ้ง',
    icon: path.join(__dirname, 'build', 'icon.png'),
    titleBarStyle: IS_MAC ? 'hiddenInset' : 'hidden',
    trafficLightPosition: { x: 22, y: 22 },
    // วัสดุโปร่งแสงของระบบ: Mac = vibrancy, Windows 11 = Mica, Linux = สีทึบ
    ...(IS_MAC ? { vibrancy: 'sidebar', visualEffectState: 'followWindow', backgroundColor: '#00000000' }
      : HAS_MICA ? { backgroundMaterial: 'mica', backgroundColor: '#00000000' }
      : { backgroundColor: nativeTheme.shouldUseDarkColors ? '#1C1C1E' : '#ECECF1' }),
    titleBarOverlay: IS_MAC ? undefined : { color: '#00000000', symbolColor: nativeTheme.shouldUseDarkColors ? '#FFFFFF' : '#000000', height: TOP_H },
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'ui', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.webContents.on('did-finish-load', () => {
    if (!activeId) {
      const sp = space();
      const t = sp.tabs.find((x) => x.id === sp.lastActive) || sp.tabs[0];
      if (t) activate(t.id); else openTab(HOME);
    }
    push();
  });
  win.on('closed', () => { win = null; });
}

app.whenReady().then(() => {
  userDir = app.getPath('userData');
  state = loadState();
  nativeTheme.themeSource = state.settings.appearance || 'system';
  blocker = new Blocker(userDir);
  blocker.load();
  const mainSes = session.fromPartition(MAIN_PARTITION);
  const privSes = session.fromPartition(PRIVATE_PARTITION);
  setupSession(mainSes, false);
  setupSession(privSes, true);
  for (const ses of [mainSes, privSes]) ses.setPreloads([path.join(__dirname, 'tab-preload.js')]);
  loadSavedExtensions(mainSes);
  handlers();
  buildMenu();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (!IS_MAC) app.quit(); });
app.on('before-quit', (e) => {
  try { fs.writeFileSync(path.join(userDir, 'rung-state.json'), JSON.stringify(state)); } catch (_) {}
  if (state && state.settings.clearOnExit && !app._cleared) {
    e.preventDefault();
    app._cleared = true;
    clearAll().finally(() => app.quit());
  } else {
    wipePrivate();
  }
});
