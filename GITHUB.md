# สร้างไฟล์ติดตั้ง .exe และ .dmg ด้วย GitHub Actions

ไม่ต้องมีเครื่อง Mac และไม่ต้องติดตั้งอะไรเพิ่ม GitHub จะ build ให้บนเครื่อง Windows และ Mac ของเขาเอง
บัญชีฟรีใช้ได้ ถ้าตั้ง repo เป็น Public จะไม่กินโควตานาที (Private กิน และฝั่ง Mac คิดเป็น 10 เท่า)

---

## ขั้นที่ 1 - สร้าง repo
1. เข้า github.com ล็อกอิน (ถ้ายังไม่มีบัญชี สมัครฟรี)
2. กดปุ่ม **+** มุมขวาบน > **New repository**
3. ตั้งชื่อ เช่น `rung-browser` > เลือก **Public** > กด **Create repository**

## ขั้นที่ 2 - อัปโหลดโค้ด (เลือกทางใดทางหนึ่ง)

### ทาง A: GitHub Desktop (แนะนำ)
1. ติดตั้ง GitHub Desktop จาก desktop.github.com แล้วล็อกอิน
2. **File > Add local repository** > เลือกโฟลเดอร์ `Rung-Desktop` ที่แตก zip ไว้
3. ถ้าขึ้นว่าไม่ใช่ repository ให้กด **create a repository** ในข้อความนั้น
4. ใส่ข้อความใน Summary แล้วกด **Commit to main** > กด **Publish repository**

ข้อดี: โฟลเดอร์ `.github` (ซึ่งเป็นโฟลเดอร์ซ่อน) จะถูกอัปขึ้นไปด้วยแน่นอน

### ทาง B: ลากไฟล์ขึ้นเว็บ
1. ในหน้า repo กด **uploading an existing file**
2. ลากไฟล์และโฟลเดอร์ทั้งหมดใน `Rung-Desktop` เข้าไป (ยกเว้น `node_modules` และ `dist` ถ้ามี)
3. **สำคัญ:** โฟลเดอร์ `.github` เป็นโฟลเดอร์ซ่อน การลากมักไม่ติดไปด้วย ต้องสร้างเอง
   - กด **Add file > Create new file**
   - ช่องชื่อไฟล์พิมพ์ `.github/workflows/build.yml` (พิมพ์ `/` แล้วมันจะสร้างโฟลเดอร์ให้เอง)
   - เปิดไฟล์ `.github/workflows/build.yml` ในเครื่อง คัดลอกเนื้อหาทั้งหมดมาวาง
   - กด **Commit changes**

## ขั้นที่ 3 - สั่ง build
1. เปิดแท็บ **Actions** ของ repo
2. ถ้าขึ้นหน้าถามให้เปิดใช้งาน กด **I understand my workflows, go ahead and enable them**
3. เมนูซ้ายเลือก **Build installers** > ปุ่ม **Run workflow** (มุมขวา) > กด **Run workflow** สีเขียว
4. รอประมาณ 10-20 นาที จนทั้งสองงานขึ้นเครื่องหมายถูกสีเขียว

## ขั้นที่ 4 - ดาวน์โหลดไฟล์
1. กดเข้าไปในผลรันที่เพิ่งเสร็จ
2. เลื่อนลงล่างสุด หัวข้อ **Artifacts** จะมี
   - `Rung-windows-latest` - ข้างในคือ `Rung Setup 1.0.0.exe`
   - `Rung-macos-latest` - ข้างในคือ `Rung-1.0.0-universal.dmg`
3. ดาวน์โหลดมาแล้วแตก zip จะได้ไฟล์ติดตั้ง

---

## ถ้าอยากให้มีหน้า Release ให้คนอื่นโหลด
ในหน้า repo กด **Releases > Create a new release > Choose a tag** พิมพ์ `v1.0.0` แล้วกด Create new tag
เมื่อกด Publish release ระบบจะ build ใหม่และแนบไฟล์ .exe กับ .dmg เข้าไปเป็นฉบับร่างให้เอง
(เปลี่ยนเลขเวอร์ชันใน `package.json` ให้ตรงกับ tag ด้วย)

## เรื่องหน้าเตือนตอนติดตั้ง
ไฟล์ที่ได้ยังไม่ได้เซ็นรับรอง ติดตั้งได้ปกติแต่จะมีหน้าเตือน
- Windows: หน้าจอฟ้า SmartScreen > กด **More info** > **Run anyway**
- Mac: คลิกขวาที่แอพ > **Open** > ยืนยัน (ทำครั้งแรกครั้งเดียว)

ถ้าต้องการให้หน้าเตือนหายไป ต้องซื้อใบรับรอง แล้วใส่เป็น Secrets ของ repo
(**Settings > Secrets and variables > Actions > New repository secret**) ตามชื่อนี้
- Windows: `WIN_CSC_LINK` (ไฟล์ .pfx แปลงเป็น base64) และ `WIN_CSC_KEY_PASSWORD`
- Mac: `MAC_CSC_LINK`, `MAC_CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`

ใบรับรอง Windows ราว 100-400 USD ต่อปี ส่วน Mac ต้องสมัคร Apple Developer Program 99 USD ต่อปี

## ถ้า build ไม่ผ่าน
กดเข้าไปในงานที่ขึ้นกากบาทสีแดง จะเห็นข้อความ error ของขั้นตอนที่พัง
ส่งข้อความนั้นมาให้ผมดูได้ จุดที่มักพลาดคือลืมอัปโหลดโฟลเดอร์ `.github` หรือลืมไฟล์ `package.json`
