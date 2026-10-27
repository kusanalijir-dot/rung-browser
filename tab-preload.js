// รันในทุกหน้าเว็บก่อนสคริปต์ของเว็บ: ฉีด scriptlet กรองโฆษณา (เช่น ตัดโฆษณาในข้อมูลของ YouTube)
const { ipcRenderer, webFrame } = require('electron');
try {
  if (/^https?:$/.test(location.protocol)) {
    const code = ipcRenderer.sendSync('cosmetic-scripts', location.href);
    if (code) webFrame.executeJavaScript(code);
  }
} catch (_) {}
