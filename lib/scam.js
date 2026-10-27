// ตรวจเว็บที่แอบอ้างเป็นธนาคาร/หน่วยงาน/ขนส่งไทย (heuristic ไม่ใช่รายชื่อสมบูรณ์)
const brands = [
  ['ธนาคารกสิกรไทย', ['kasikorn', 'kbank', 'kplus'], ['kasikornbank.com', 'kasikornbank.co.th', 'kbank.co.th', 'kasikornbankgroup.com']],
  ['ธนาคารไทยพาณิชย์', ['scbeasy', 'scb-easy', 'scbtha'], ['scb.co.th', 'scbeasy.com']],
  ['ธนาคารกรุงไทย', ['krungthai'], ['krungthai.com', 'ktb.co.th']],
  ['ธนาคารกรุงเทพ', ['bangkokbank', 'bualuang'], ['bangkokbank.com', 'bbl.co.th']],
  ['ธนาคารกรุงศรี', ['krungsri'], ['krungsri.com']],
  ['ttb', ['ttbbank'], ['ttbbank.com']],
  ['ธนาคารออมสิน', ['gsb-', '-gsb', 'mymogsb'], ['gsb.or.th']],
  ['กรมสรรพากร', ['revenue-', '-revenue', 'rdgo', 'rd-go'], ['rd.go.th', 'revenue.go.th']],
  ['ไปรษณีย์ไทย', ['thailandpost', 'thaipost'], ['thailandpost.com', 'thailandpost.co.th']],
  ['Kerry Express', ['kerryexpress', 'kerry-express'], ['kerryexpress.com', 'kex-express.com']],
  ['Flash Express', ['flashexpress', 'flash-express'], ['flashexpress.com', 'flashexpress.co.th']],
  ['Shopee', ['shopee'], ['shopee.co.th', 'shopee.com', 'shopeemobile.com', 'shp.ee']],
  ['Lazada', ['lazada'], ['lazada.co.th', 'lazada.com', 'lazcdn.com']],
  ['TrueMoney', ['truemoney'], ['truemoney.com', 'truemoney.co.th']],
  ['AIS', ['ais-', '-ais.'], ['ais.th', 'ais.co.th']],
  ['PromptPay', ['promptpay'], ['bot.or.th', 'itmx.co.th']]
];
const badTlds = ['.xyz', '.top', '.click', '.icu', '.vip', '.cyou', '.buzz', '.sbs', '.cfd', '.rest'];

function check(host) {
  if (!host) return null;
  const h = host.toLowerCase().replace(/^www\./, '');
  if (h.startsWith('xn--') || h.includes('.xn--')) {
    return 'ชื่อเว็บใช้ตัวอักษรพิเศษที่หน้าตาเหมือนตัวอักษรจริง ซึ่งมิจฉาชีพมักใช้ปลอมเว็บ';
  }
  for (const [name, keys, official] of brands) {
    if (!keys.some((k) => h.includes(k))) continue;
    if (!official.some((o) => h === o || h.endsWith('.' + o))) {
      const extra = badTlds.some((t) => h.endsWith(t)) ? ' และใช้ท้ายชื่อเว็บที่มิจฉาชีพนิยมใช้' : '';
      return `ชื่อเว็บมีคำว่า ${name} แต่ไม่ใช่เว็บทางการ${extra}`;
    }
  }
  return null;
}
module.exports = { check };
