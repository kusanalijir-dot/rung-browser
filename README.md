<h1 align="center">รุ้ง · Rung Browser</h1>

<p align="center">
  เว็บเบราว์เซอร์สำหรับ Windows และ macOS ที่บล็อกโฆษณา เตือนเว็บหลอกลวงภาษาไทย<br>
  และอธิบายทุกการตั้งค่าด้วยภาษาที่ทุกคนในบ้านเข้าใจ
</p>

<p align="center">
  <a href="https://github.com/kusanalijir-dot/rung-browser/actions/workflows/build.yml"><img alt="Build" src="https://github.com/kusanalijir-dot/rung-browser/actions/workflows/build.yml/badge.svg"></a>
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-555">
  <img alt="Electron" src="https://img.shields.io/badge/Electron-33-47848F">
  <img alt="Filters" src="https://img.shields.io/badge/กฎกรองโฆษณา-157%2C000%2B-brightgreen">
</p>

<p align="center">
  <img src="docs/screenshot-light.png" alt="หน้าจอหลักโหมดสว่าง" width="100%">
</p>

---

## ทำไมต้องรุ้ง

เบราว์เซอร์ส่วนใหญ่ออกแบบมาให้คนที่คุ้นเคยกับเทคโนโลยีอยู่แล้ว เมนูความเป็นส่วนตัวเต็มไปด้วยศัพท์ที่คนทั่วไปไม่เข้าใจ
จึงมักถูกปล่อยไว้ตามค่าเริ่มต้น ส่วนมิจฉาชีพก็อาศัยช่องว่างนี้หลอกให้กดลิงก์ปลอมและติดตั้งแอพอันตราย

รุ้งแก้ปัญหานี้ด้วยสามอย่าง: **ตั้งค่าที่ปลอดภัยมาตั้งแต่เปิดเครื่องแรก**, **คำอธิบายที่บอกตรง ๆ ว่าเปิดหรือปิดแล้วอะไรจะใช้ไม่ได้**
และ **คำเตือนที่เจาะจงกับภัยในไทย** อย่างเว็บแอบอ้างธนาคารและหน่วยงานรัฐ

---

## คุณสมบัติ

### บล็อกโฆษณาและตัวติดตาม

| ความสามารถ | รายละเอียด |
|---|---|
| **กฎกรอง 157,000+ ข้อ** | ชุดเดียวกับ uBlock Origin (EasyList, EasyPrivacy, uBlock filters, Peter Lowe) ติดมากับแอพ ไม่ต้องดาวน์โหลดเพิ่ม |
| **กรอง 3 ชั้น** | บล็อกคำขอเครือข่าย ซ่อนกล่องโฆษณาที่หลุดมา และฉีด scriptlet สำหรับเว็บที่ตรวจจับตัวบล็อก |
| **อัปเดตได้เอง** | กดอัปเดตกฎล่าสุดจากเมนูได้ทุกเมื่อ |

### ป้องกันมิจฉาชีพ

| ความสามารถ | รายละเอียด |
|---|---|
| **เตือนเว็บแอบอ้าง** | ตรวจชื่อโดเมนกับรายชื่อแบรนด์ไทย 16 แห่ง (ธนาคาร ไปรษณีย์ไทย กรมสรรพากร ขนส่ง ฯลฯ) เช่น `kbank-verify.xyz` จะขึ้นหน้าเตือนก่อนเข้า |
| **เตือนก่อนโหลดไฟล์เสี่ยง** | ไฟล์ `.exe` `.msi` `.dmg` `.bat` และอื่น ๆ ที่รันโปรแกรมได้ จะถามก่อนทุกครั้ง |
| **บังคับ HTTPS** | อัปเกรดลิงก์ที่ไม่เข้ารหัสอัตโนมัติ เว็บที่ไม่รองรับจะถามก่อนเปิด |

### ความเป็นส่วนตัว

- ตัดรหัสติดตามออกจากลิงก์ (`utm_*`, `fbclid`, `gclid` และอื่น ๆ)
- บล็อกคุกกี้ของบุคคลที่สาม และส่งสัญญาณ Do Not Track / GPC
- แท็บส่วนตัวแยกข้อมูลจริง ไม่บันทึกประวัติ คุกกี้หายเมื่อปิดแท็บสุดท้าย
- กันไอพีรั่วผ่าน WebRTC และเลือกล้างข้อมูลทั้งหมดเมื่อปิดแอพได้
- กล้องและไมโครโฟนถามก่อนทุกครั้ง ตำแหน่งและการแจ้งเตือนปฏิเสธเสมอ

> ทุกสวิตช์มีคำอธิบายสองบรรทัด บรรทัดแรกบอกว่าทำอะไร บรรทัดที่สองบอกว่าเปิดหรือปิดแล้วอะไรจะใช้ไม่ได้

### การใช้งาน

- **แถบข้างแนวตั้ง** พร้อม Spaces แยกกลุ่มแท็บตามเรื่อง แต่ละ Space มีสีประจำตัว
- **ช่องที่อยู่เดียวจบ** ค้นหาเว็บ แท็บที่เปิดอยู่ รายการโปรด และประวัติ พร้อมกันในที่เดียว
- **โหมดอ่าน** ตัดโฆษณาและจัดหน้าใหม่ให้อ่านสบาย ปรับขนาดตัวอักษรเว็บได้ 4 ระดับ
- **ส่วนขยายสไตล์ Chrome** เพิ่มจากโฟลเดอร์ที่แตกไฟล์แล้ว (รองรับบางส่วน)
- ค้นหาในหน้า บุ๊กมาร์ก ประวัติ และตัวจัดการดาวน์โหลด

### ดีไซน์

ออกแบบตามแนว Human Interface Guidelines ของ Apple สลับโหมดสว่างและมืดตามระบบ
เลือกสีเน้นได้ 8 แบบ ใช้วัสดุโปร่งแสงของแต่ละระบบ (vibrancy บน macOS, Mica บน Windows 11)
รายละเอียดทั้งหมดอยู่ใน [DESIGN.md](DESIGN.md)

<table>
  <tr>
    <td width="50%"><img src="docs/screenshot-dark.png" alt="โหมดมืด"><p align="center"><sub>โหมดมืด</sub></p></td>
    <td width="50%"><img src="docs/screenshot-privacy.png" alt="หน้าตั้งค่าความเป็นส่วนตัว"><p align="center"><sub>หน้าตั้งค่าความเป็นส่วนตัว</sub></p></td>
  </tr>
</table>

---

## ติดตั้ง

### ดาวน์โหลดไฟล์ติดตั้ง

ไฟล์ `.exe` และ `.dmg` สร้างจาก GitHub Actions ดาวน์โหลดได้จากหน้า
[Releases](../../releases) หรือหัวข้อ Artifacts ใน [Actions](../../actions)

ไฟล์ยังไม่ได้เซ็นรับรอง ครั้งแรกที่เปิดจะมีหน้าเตือน

| ระบบ | วิธีผ่าน |
|---|---|
| Windows | หน้าจอฟ้า SmartScreen > **More info** > **Run anyway** |
| macOS | คลิกขวาที่แอพ > **Open** > ยืนยัน (ทำครั้งเดียว) |

### รันจากซอร์สโค้ด

ต้องมี [Node.js](https://nodejs.org) 20 ขึ้นไป

```bash
git clone https://github.com/kusanalijir-dot/rung-browser.git
cd rung-browser
npm install
npm start
```

### สร้างไฟล์ติดตั้งเอง

```bash
npm run dist:win    # บน Windows -> dist/Rung Setup 1.0.0.exe
npm run dist:mac    # บน macOS   -> dist/Rung-1.0.0-universal.dmg
```

แต่ละระบบต้อง build บนเครื่องของระบบนั้น หรือใช้ GitHub Actions ให้ build ทั้งสองระบบพร้อมกัน
ขั้นตอนละเอียดอยู่ใน [GITHUB.md](GITHUB.md)

---

## ปุ่มลัด

| คำสั่ง | Windows | macOS |
|---|---|---|
| แท็บใหม่ | `Ctrl` `T` | `⌘` `T` |
| แท็บส่วนตัวใหม่ | `Ctrl` `Shift` `N` | `⌘` `⇧` `N` |
| ปิดแท็บ | `Ctrl` `W` | `⌘` `W` |
| ช่องที่อยู่ / ค้นหา | `Ctrl` `L` | `⌘` `L` |
| ค้นหาในหน้า | `Ctrl` `F` | `⌘` `F` |
| ซ่อนหรือแสดงแถบข้าง | `Ctrl` `S` | `⌘` `S` |
| โหมดอ่าน | `Ctrl` `Shift` `R` | `⌘` `⇧` `R` |
| ขนาดตัวอักษรเว็บ | `Ctrl` `+` / `-` | `⌘` `+` / `-` |
| ย้อนกลับ / ไปข้างหน้า | `Ctrl` `[` / `]` | `⌘` `[` / `]` |

---

## โครงสร้างโปรเจกต์

```
main.js              กระบวนการหลัก: หน้าต่าง แท็บ เซสชัน กรองคำขอเครือข่าย ดาวน์โหลด
preload.js           สะพานเชื่อมระหว่างหน้าตากับกระบวนการหลัก (contextBridge)
tab-preload.js       ฉีด scriptlet กรองโฆษณาก่อนสคริปต์ของหน้าเว็บทำงาน
lib/blocker.js       เครื่องมือบล็อกโฆษณา (@ghostery/adblocker)
lib/scam.js          ตรวจเว็บแอบอ้างแบรนด์ไทย
lib/cosmetic.js      กฎซ่อนองค์ประกอบและสคริปต์ข้ามโฆษณา YouTube
ui/                  หน้าตาทั้งหมด (HTML / CSS / JS ล้วน ไม่ใช้เฟรมเวิร์ก)
assets/filters/      ชุดกฎกรองโฆษณาที่แถมมากับแอพ
```

**เทคโนโลยี:** Electron 33 (Chromium) · JavaScript ล้วน ไม่มีเฟรมเวิร์กฝั่งหน้าตา · electron-builder · @ghostery/adblocker

---

## สถานะและข้อจำกัด

โปรเจกต์นี้อยู่ในช่วงเริ่มต้น เปิดเผยตรงไปตรงมาว่าอะไรยังไม่พร้อม

- ทดสอบรันบน Linux ที่จำลองหน้าจอเท่านั้น **ยังไม่ได้ทดสอบบน Windows และ macOS จริง**
- ส่วนขยาย Chrome รองรับไม่ครบ ตัวจัดการรหัสผ่านอย่าง Bitwarden ยังไม่ได้ยืนยันว่าใช้ได้
- ตัวตรวจเว็บหลอกลวงตรวจจากชื่อโดเมนเท่านั้น ไม่ได้จับเว็บหลอกลวงทุกแบบ
- ยังไม่มีการซิงค์ข้อมูลข้ามเครื่อง
- ฟีเจอร์ที่มีเฉพาะในเวอร์ชัน Android: Boosts, Split View, Peek, เก็บแท็บอัตโนมัติ, ล็อกแอพ

ก่อนนำไปแจกจ่าย ควรเปลี่ยน `appId` และ `author` ใน `package.json` เป็นของตัวเอง

---

## สัญญาอนุญาตและเครดิต

ซอร์สโค้ดของโปรเจกต์นี้ยังไม่ได้กำหนดสัญญาอนุญาต หากต้องการให้คนอื่นนำไปใช้หรือต่อยอดได้ ควรเพิ่มไฟล์ LICENSE

ส่วนประกอบจากภายนอกและสัญญาอนุญาตของแต่ละราย

| ส่วนประกอบ | สัญญาอนุญาต |
|---|---|
| [Electron](https://www.electronjs.org) | MIT |
| [@ghostery/adblocker](https://github.com/ghostery/adblocker) | MPL-2.0 |
| [EasyList / EasyPrivacy](https://easylist.to) | GPLv3 และ CC BY-SA 3.0 |
| [uBlock Origin filters](https://github.com/uBlockOrigin/uAssets) | GPLv3 |
| [Peter Lowe's list](https://pgl.yoyo.org/adservers/) | ใช้ได้ฟรีสำหรับงานที่ไม่แสวงหากำไร |
| [Inter](https://rsms.me/inter/) · [Noto Sans Thai](https://fonts.google.com/noto/specimen/Noto+Sans+Thai) | SIL Open Font License 1.1 |

รายละเอียดไลเซนส์ฟอนต์อยู่ใน [FONT-LICENSE-OFL.txt](FONT-LICENSE-OFL.txt)

ดีไซน์ได้แรงบันดาลใจจาก Human Interface Guidelines ของ Apple แต่ไม่ได้ใช้ทรัพย์สินของ Apple
(ไม่ได้ใช้ฟอนต์ SF Pro และไอคอน SF Symbols ซึ่งอนุญาตให้ใช้เฉพาะแอพบนอุปกรณ์ Apple)
ไอคอนทั้งหมดวาดขึ้นใหม่สำหรับโปรเจกต์นี้

---

## English

**Rung** (รุ้ง, "rainbow") is a privacy-focused desktop browser for Windows and macOS, built with Electron.

It ships with 157,000+ filter rules from the same lists uBlock Origin uses, warns about phishing sites
impersonating Thai banks and government agencies, blocks third-party cookies and tracking parameters,
and explains every privacy setting in plain language — including what will stop working if you turn it on.

The interface follows Apple's Human Interface Guidelines with system light/dark mode, eight accent colors,
and native materials (vibrancy on macOS, Mica on Windows 11). The UI language is Thai.

**Status:** early stage. Tested only on a headless Linux display — not yet verified on real Windows or macOS hardware.
Installers are unsigned, so expect a SmartScreen or Gatekeeper prompt on first launch.
