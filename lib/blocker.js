// ตัวบล็อกโฆษณาแบบ uBlock Origin: ใช้ engine ของ Ghostery (@ghostery/adblocker) กับชุดกฎ EasyList, EasyPrivacy, uBlock filters
const fs = require('fs');
const path = require('path');
const { FiltersEngine, Request, adsAndTrackingLists } = require('@ghostery/adblocker');

const TYPE_MAP = {
  mainFrame: 'main_frame', subFrame: 'sub_frame', stylesheet: 'stylesheet', script: 'script', image: 'image',
  font: 'font', object: 'object', xhr: 'xhr', ping: 'ping', cspReport: 'csp_report', media: 'media',
  webSocket: 'websocket', other: 'other'
};

class Blocker {
  constructor(userDir) {
    this.dir = userDir;
    this.cache = path.join(userDir, 'engine-v1.bin');
    this.assets = path.join(__dirname, '..', 'assets', 'filters');
    this.engine = null;
    this.count = 0;
    this.ready = false;
  }

  // เปิดแอพ: อ่านแคชที่เคยสร้างไว้ ถ้าไม่มีให้สร้างจากกฎที่แถมมากับแอพ
  load() {
    try {
      if (fs.existsSync(this.cache)) {
        this.engine = FiltersEngine.deserialize(new Uint8Array(fs.readFileSync(this.cache)));
        this.afterLoad();
        return;
      }
    } catch (_) {}
    this.buildFromAssets();
  }

  buildFromAssets() {
    let text = '';
    for (const f of fs.readdirSync(this.assets)) {
      if (f.endsWith('.txt')) text += fs.readFileSync(path.join(this.assets, f), 'utf8') + '\n';
    }
    this.engine = FiltersEngine.parse(text, { loadCosmeticFilters: true, loadNetworkFilters: true, enableCompression: true });
    try {
      const rj = path.join(this.assets, 'resources.json');
      if (fs.existsSync(rj)) this.engine.updateResources(fs.readFileSync(rj, 'utf8'), 'bundled');
    } catch (_) {}
    this.afterLoad();
    try { fs.writeFileSync(this.cache, this.engine.serialize()); } catch (_) {}
  }

  afterLoad() {
    const s = this.engine.getFilters();
    this.count = (s.networkFilters || []).length + (s.cosmeticFilters || []).length;
    this.ready = true;
  }

  get size() { return this.count; }

  // คืน { cancel, redirectUrl } สำหรับคำขอเว็บ
  match(details) {
    if (!this.ready) return null;
    try {
      const req = Request.fromRawDetails({
        url: details.url,
        sourceUrl: details.referrer || (details.webContents ? details.webContents.getURL() : ''),
        type: TYPE_MAP[details.resourceType] || 'other'
      });
      const { match, redirect } = this.engine.match(req);
      if (redirect) return { redirectUrl: redirect.dataUrl };
      return match ? { cancel: true } : null;
    } catch (_) { return null; }
  }

  // กฎซ่อนองค์ประกอบ + สคริปต์ของหน้านั้น ๆ
  cosmetics(url) {
    if (!this.ready) return null;
    try {
      const u = new URL(url);
      const domain = u.hostname.split('.').slice(-2).join('.');
      return this.engine.getCosmeticsFilters({
        url, hostname: u.hostname, domain,
        classes: [], hrefs: [], ids: [],
        getBaseRules: true, getInjectionRules: true, getExtendedRules: false, getRulesFromDOM: false, getRulesFromHostname: true
      });
    } catch (_) { return null; }
  }

  // ดาวน์โหลดกฎล่าสุดจากอินเทอร์เน็ต แล้วเก็บแคช
  async update(fetchFn) {
    const engine = await FiltersEngine.fromLists(fetchFn, adsAndTrackingLists, { loadCosmeticFilters: true, loadNetworkFilters: true, enableCompression: true });
    try {
      const r = await fetchFn('https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/resources.json');
      if (r.ok) engine.updateResources(await r.text(), 'remote');
    } catch (_) {}
    this.engine = engine;
    this.afterLoad();
    fs.writeFileSync(this.cache, engine.serialize());
    return this.count;
  }
}
module.exports = { Blocker };
