# Expopass Visitor Registration — Playwright Test Suite

Automated test suite สำหรับหน้า Visitor Registration ด้วย Playwright, TypeScript และ Node.js

Target URL:

```text
https://registration.expopass.co/register/form/kiso26/ThqcXW
```

ชุดทดสอบนี้มี Logical Test Cases จำนวน 400 cases ครอบคลุม Smoke, Validation, Boundary, Negative, Responsive, Accessibility, Upload, Network/Error Handling และ Browser State

นอกจากนี้มีชุดทดสอบเฉพาะหน้า Registration URL นี้ แยก config/report จาก 400 เคสเดิม

## ข้อควรระวังด้าน Production Safety

Target เป็นเว็บไซต์จริงหรือ production-like ดังนั้นโปรเจกต์นี้ถูกตั้งค่าให้ปลอดภัยเป็นค่าเริ่มต้น:

- ใช้ `workers: 1` และไม่รัน parallel กับ target
- Default run ใช้ Chromium และ exclude `@submission`
- Fixture block requests ไปยัง registration save endpoint และ upload endpoint
- ใช้ synthetic test data เท่านั้น
- ไม่ solve หรือ bypass hCaptcha/Verification
- ไม่ทำ load test, stress test, DDoS, rate-limit evasion หรือสร้าง registration จริง
- ไฟล์ upload เป็นไฟล์จำลองที่สร้างใน memory ไม่ใช่ malware จริง

แม้ชุด `@submission` จะมีชื่อว่า submission แต่ในโปรเจกต์นี้ route guard ยังคงบล็อกการส่งข้อมูลจริงทุกครั้ง

## Prerequisites

ติดตั้ง Node.js LTS และ npm จากนั้นตรวจสอบเวอร์ชัน:

```bash
node --version
npm --version
```

แนะนำให้ใช้ macOS/Linux เนื่องจากคำสั่ง `RUN_SUBMISSION=1` เป็นรูปแบบ environment variable ของ shell เหล่านี้

## Installation

เข้าโฟลเดอร์โปรเจกต์:

```bash
cd /Users/jitwisutthobut/Desktop/test_auto
```

ติดตั้ง dependencies:

```bash
npm install
```

ติดตั้ง browser ที่ใช้โดย default:

```bash
npx playwright install chromium
```

ถ้าต้องการรัน cross-browser smoke tests ให้ติดตั้งเพิ่ม:

```bash
npx playwright install firefox webkit
```

## Quick Start

รัน default regression ซึ่งไม่รวม `@submission`:

```bash
npm test
```

หลัง test จบ เปิด HTML report:

```bash
npm run report
```

`npm run report` ไม่ได้รัน test ใหม่ แต่เปิด report ล่าสุดที่อยู่ใน `playwright-report/`

## ชุดทดสอบเฉพาะหน้า Registration

Target เดียวของชุดนี้คือ:

```text
https://registration.expopass.co/register/form/kiso26/ThqcXW
```

ครอบคลุมการเปิดหน้า, required validation, email/email-confirm/mobile validation,
dropdown ประเทศและอุตสาหกรรม, upload capability, refresh, SQL/XSS input safety,
placeholder, tab order, copy/paste, responsive layout และ Submit จริง

ตรวจรายชื่อทั้งหมดโดยไม่รัน:

```bash
npm run test:workbook:list
```

ตั้งอีเมลที่จะใช้รับผลการสมัครจริงก่อน (อย่าใส่อีเมลลงใน source code):

```powershell
$env:WORKBOOK_TEST_EMAIL="your-gmail@gmail.com"
```

จากนั้นรันทุกเคสด้วยคำสั่งเดียว:

```bash
npm run test:workbook
```

Browser จะเปิดขึ้นเพื่อให้ทำ hCaptcha เองที่เคสสุดท้าย แล้ว test จะ Submit ต่ออัตโนมัติ
และรอได้สูงสุด 10 นาที คำสั่ง `test:workbook:headed` เป็น alias ของคำสั่งเดียวกัน

เปิด report:

```bash
npm run report:workbook
```

Node/TypeScript จะบันทึก Full-page screenshot ของทุก Workbook test ไว้ใน:

```text
test-results-workbook/
```

แต่ละรอบรัน Playwright จะสร้างผลลัพธ์ใหม่ในโฟลเดอร์นี้ หากต้องการเก็บรูปไว้ระยะยาวให้คัดลอกออกก่อนรันรอบถัดไป

เคส Submit สร้าง Gmail alias ใหม่จากอีเมลที่ตั้งไว้ทุกครั้ง เพื่อไม่ใช้ account ซ้ำ
และแนบภาพก่อน/หลัง Submit รวมถึง URL หลัง Submit เข้า HTML report

## Python Playwright Example

โปรเจกต์มีตัวอย่าง Python ที่แก้ locator, validation, upload safety และ full-page screenshot แล้วใน `python_tests/test_registration_fixed.py`

สร้าง virtual environment และติดตั้ง dependencies:

```bash
python3 -m venv .venv-python
.venv-python/bin/pip install -r requirements-python.txt
.venv-python/bin/playwright install chromium
```

รันทุกเคส:

```bash
.venv-python/bin/pytest -q python_tests/test_registration_fixed.py
```

รันแบบเปิด browser ให้เห็นการทำงาน:

```bash
PW_HEADLESS=0 .venv-python/bin/pytest -q -s python_tests/test_registration_fixed.py
```

รันเฉพาะ Test Case:

```bash
.venv-python/bin/pytest -q -s python_tests/test_registration_fixed.py -k "reg_018"
```

ภาพของทุก Test จะถูกสร้างที่ `screenshots/python/` ด้วย `full_page=True` ซึ่งหมายถึงแคปเนื้อหาเว็บตั้งแต่บนสุดถึงล่างสุด ไม่รวม browser toolbar หรือ desktop ของระบบปฏิบัติการ

### Python suite ตาม Excel จำนวน 114 IDs

ชุด Python ที่ตรงกับชีต `Web Registration Online` อยู่ใน `python_tests/workbook/` และแยกจากไฟล์ตัวอย่าง 20 เคสเดิม เพื่อป้องกันรหัส `REG-*` คนละความหมายชนกัน

ติดตั้ง dependencies บน Windows PowerShell:

```powershell
py -m venv .venv-python
.\.venv-python\Scripts\python.exe -m pip install -r .\requirements-python.txt
.\.venv-python\Scripts\python.exe -m playwright install chromium
```

ตรวจว่าพบครบ 114 tests โดยไม่รัน:

```powershell
.\.venv-python\Scripts\python.exe -m pytest `
  -c .\pytest-workbook.ini --collect-only -q
```

รันทั้ง 114 IDs โดยเคสที่ยังไม่มี session/credentials จะถูก skip พร้อมเหตุผล:

```powershell
.\.venv-python\Scripts\python.exe -m pytest `
  -c .\pytest-workbook.ini -q
```

รันเฉพาะ Registration 43 เคสแบบ Production-safe:

```powershell
.\.venv-python\Scripts\python.exe -m pytest `
  -c .\pytest-workbook.ini -q -m registration
```

รันแบบเปิด Browser และปรับความเร็ว:

```powershell
$env:PW_HEADLESS="0"
$env:PW_SLOW_MO="1000"

.\.venv-python\Scripts\python.exe -m pytest `
  -c .\pytest-workbook.ini -q -s -m registration
```

รันรหัสเดียว เช่น `REG-018`:

```powershell
.\.venv-python\Scripts\python.exe -m pytest `
  -c .\pytest-workbook.ini -q -k "REG-018"
```

สร้าง HTML report:

```powershell
New-Item -ItemType Directory -Force .\reports\python-workbook | Out-Null

.\.venv-python\Scripts\python.exe -m pytest `
  -c .\pytest-workbook.ini `
  --html=.\reports\python-workbook\report.html `
  --self-contained-html

Start-Process .\reports\python-workbook\report.html
```

Screenshot แบบเต็มหน้าอยู่ที่:

```text
screenshots/python-workbook/
```

รัน Questionnaire หรือ Complete หลังมี test session URL:

```powershell
$env:WORKBOOK_QUESTIONNAIRE_URL="https://test.example/questionnaire/session-id"
$env:WORKBOOK_COMPLETE_URL="https://test.example/complete/session-id"
$env:WORKBOOK_STORAGE_STATE="C:\secure\workbook-storage-state.json"

.\.venv-python\Scripts\python.exe -m pytest `
  -c .\pytest-workbook.ini -q -m questionnaire

.\.venv-python\Scripts\python.exe -m pytest `
  -c .\pytest-workbook.ini -q -m complete
```

### โหลดค่าลับจาก Excel โดยไม่ฝังไว้ในโค้ด

ชุด Python จะค้นหาไฟล์ `Trainee BU3_ Manage Expopass.xlsx` ในโฟลเดอร์
`Downloads` โดยอัตโนมัติ แล้วอ่านค่าเฉพาะต่อไปนี้จากชีต
`Web Registration Online`:

- `F113` -> `WORKBOOK_CONFERENCE_USER` และ `WORKBOOK_CONFERENCE_PASSWORD`
- `F120` -> `WORKBOOK_INVITE_URL` สำหรับ `INF-001`

ค่าจะอยู่ใน memory เฉพาะตอนรัน pytest และจะไม่ถูกพิมพ์ลง terminal/report
ถ้าตั้ง `$env:` ไว้เอง ค่าที่ตั้งเองจะถูกใช้แทน Excel เสมอ

ถ้าไฟล์อยู่ตำแหน่งอื่น ให้ระบุ path ก่อนรัน:

```powershell
$env:WORKBOOK_XLSX_PATH="C:\secure\Trainee BU3_ Manage Expopass.xlsx"
```

ปิดการอ่าน Excel อัตโนมัติได้ด้วย:

```powershell
$env:WORKBOOK_AUTOLOAD_EXCEL="0"
```

ไฟล์ Excel ไม่มี Conference Login URL จึงต้องกำหนดค่านี้แยกต่างหาก:

```powershell
$env:WORKBOOK_CONFERENCE_URL="https://uat.example.com/conference/login"
```

Cross-browser ใช้ `PW_BROWSER=chromium`, `edge`, `firefox` หรือ `webkit` ตัวอย่าง:

```powershell
$env:PW_BROWSER="firefox"
.\.venv-python\Scripts\python.exe -m playwright install firefox
.\.venv-python\Scripts\python.exe -m pytest `
  -c .\pytest-workbook.ini -q -m registration
```

## Test Commands

| Command | รายละเอียด |
| --- | --- |
| `npm test` | รัน default Chromium regression และ exclude `@submission` |
| `npm run test:smoke` | รัน tests ที่มี tag `@smoke` |
| `npm run test:validation` | รัน tests ที่มี tag `@validation` |
| `npm run test:ui` | รัน tests ที่มี tag `@responsive` |
| `npm run test:a11y` | รัน tests ที่มี tag `@accessibility` |
| `npm run test:submission` | รันเฉพาะ 6 เคส `@submission` แบบ isolated พร้อม safety guard |
| `npm run test:cross-browser` | รัน smoke tests บน Chromium, Firefox และ WebKit |
| `npm run test:headed` | รัน Chromium โดยเปิด browser ให้เห็น UI |
| `npm run test:debug` | เปิด Playwright Inspector สำหรับ debug smoke tests |
| `npm run report` | เปิด Playwright HTML report ล่าสุด |
| `npm run test:workbook` | รันทุกเคสของ Registration URL รวม Submit จริงและรอ hCaptcha |
| `npm run test:workbook:list` | แสดงรายชื่อทุกเคสโดยไม่รัน |
| `npm run test:workbook:headed` | Alias ของ `test:workbook` |
| `npm run report:workbook` | เปิด HTML report ที่ `playwright-report-workbook/` |
| `npm run generate:matrix` | สร้าง `docs/test-case-matrix.md` ใหม่จาก test catalog |

### Default Regression

```bash
npm test
```

คำสั่งนี้เทียบเท่ากับ:

```bash
npx playwright test --project=chromium
```

ใน `playwright.config.ts` มี default `grepInvert: /@submission/` ดังนั้น test discovery ปกติจะพบ 394 cases จาก 400 logical cases

### Isolated Submission Tests

```bash
npm run test:submission
```

คำสั่งนี้จะตั้งค่า `RUN_SUBMISSION=1` เพื่อเปิดกลุ่ม `@submission` และรันเฉพาะ 6 cases:

- TC294 — Submission isolation
- TC295 — hCaptcha gate
- TC296 — Form data preservation
- TC297 — Duplicate click behavior
- TC298 — Synthetic response handling
- TC299 — No-success-without-verification

ห้ามใช้คำสั่งนี้เพื่อสร้าง registration จริง เพราะ route guard จะ abort request ที่ไปยัง production save/upload endpoints อยู่แล้ว

ถ้าใช้ Playwright CLI โดยตรง ต้องตั้ง environment variable ด้วย:

```bash
RUN_SUBMISSION=1 npx playwright test --project=chromium --grep @submission
```

### Cross-browser Smoke

```bash
npm run test:cross-browser
```

คำสั่งนี้ตั้ง `CROSS_BROWSER=1` และรันเฉพาะ `@smoke` บน browser projects ที่เปิดใช้งาน ได้แก่ Chromium, Firefox และ WebKit ไม่ควรรัน full 400 cases × 3 browsers กับ production-like target โดยอัตโนมัติ

## Running Specific Tests

รัน test file เดียว:

```bash
npx playwright test tests/registration/email.spec.ts --project=chromium
```

รันตาม Test Case ID:

```bash
npx playwright test --project=chromium --grep "TC353"
```

รันตาม tag:

```bash
npx playwright test --project=chromium --grep @critical
```

รันหลาย tag หรือกรอง submission ออก explicitly:

```bash
npx playwright test --project=chromium --grep @network --grep-invert @submission
```

แสดงรายการ tests โดยไม่รัน:

```bash
npx playwright test --list --project=chromium
```

ตรวจว่า default discovery มี 394 cases:

```bash
npx playwright test --list --project=chromium | tail -1
```

## Project Structure

```text
/Users/jitwisutthobut/Desktop/test_auto/
├── playwright.config.ts
├── package.json
├── pages/
│   └── RegistrationPage.ts
├── fixtures/
│   └── registration.fixture.ts
├── utils/
│   ├── assertions.ts
│   ├── generators.ts
│   ├── test-data.ts
│   └── upload-fixtures.ts
├── test-data/
│   └── registration-cases.ts
├── tests/registration/
│   ├── smoke.spec.ts
│   ├── email.spec.ts
│   ├── name.spec.ts
│   ├── company.spec.ts
│   ├── position.spec.ts
│   ├── mobile.spec.ts
│   ├── country.spec.ts
│   ├── color.spec.ts
│   ├── industry.spec.ts
│   ├── job-title.spec.ts
│   ├── upload.spec.ts
│   ├── verification.spec.ts
│   ├── submission.spec.ts
│   ├── validation.spec.ts
│   ├── responsive.spec.ts
│   ├── accessibility.spec.ts
│   ├── robustness.spec.ts
│   ├── browser-state.spec.ts
│   └── test-helpers.ts
└── docs/
    ├── field-inventory.md
    ├── test-case-matrix.md
    ├── coverage-summary.md
    └── bugs-found.md
```

## Test Case Distribution

| Category | Test Cases | จำนวน |
| --- | --- | ---: |
| Smoke / Page / Basic Behavior | TC001–TC020 | 20 |
| Individual Field Validation | TC021–TC130 | 110 |
| Cross-field / Business Validation | TC131–TC180 | 50 |
| Dropdown / Radio / Selection | TC181–TC215 | 35 |
| File Upload | TC216–TC250 | 35 |
| Verification / CAPTCHA | TC251–TC265 | 15 |
| Submit / Network / Error Handling | TC266–TC300 | 35 |
| UI / Responsive / Layout | TC301–TC335 | 35 |
| Accessibility / Keyboard | TC336–TC360 | 25 |
| Input Robustness / Safe Security | TC361–TC385 | 25 |
| Browser State / Navigation | TC386–TC400 | 15 |
| **Total** | **TC001–TC400** | **400** |

ตรวจจำนวน rows ใน matrix:

```bash
rg -c '^\| TC[0-9]{3} \|' docs/test-case-matrix.md
```

ผลที่คาดหวังคือ `400`

## Test Architecture

### Page Object Model

`pages/RegistrationPage.ts` เก็บ selectors และ actions ของหน้า เช่น:

- `goto()`
- `fillEmail()`
- `fillConfirmEmail()`
- `fillFirstName()` / `fillLastName()`
- `fillCompany()` / `fillPosition()` / `fillMobile()`
- `selectJobTitle()` / `selectCountry()` / `selectIndustry()`
- `selectColor()`
- `uploadProfile()`
- `clickSubmit()`
- `fillMinimumValidForm()`
- `getValidity()` / `formCheckValidity()`

Selector ใช้ accessible role/label เป็นหลัก และใช้ DOM selector ที่ inspect จาก live page เฉพาะจุดที่จำเป็น

### Fixture และ Route Guard

`fixtures/registration.fixture.ts` ทำหน้าที่:

- เปิด target page ก่อนแต่ละ test
- ติดตาม console error, page error และ failed request
- abort `**/registrationv5/save_page/**`
- abort `**/registrationv5/upload`

ดังนั้น test สามารถตรวจ client-side behavior และ synthetic network response ได้โดยไม่ส่ง registration/upload ไป production

### Test Data

`utils/test-data.ts` และ `utils/generators.ts` ใช้ข้อมูลจำลอง เช่น:

- synthetic email
- synthetic Thai/English names
- dummy phone numbers
- long strings
- harmless XSS/SQL-like strings

ห้ามใส่ข้อมูลส่วนบุคคลจริงลงใน test data หรือ commit ลง repository

## CAPTCHA / Verification

ห้ามคลิก checkbox, solve challenge หรือพยายาม bypass hCaptcha

Verification tests ตรวจเฉพาะ:

- iframe/component presence
- accessible name และ title
- loading/retry/timeout behavior
- network failure ที่จำลองด้วย `page.route()`
- form visibility และ data preservation
- mobile/desktop layout
- graceful failure เมื่อ third-party iframe ไม่พร้อม

ถ้า hCaptcha iframe ไม่โหลด test จะตรวจว่า host form ยัง visible และบันทึก dependency boundary แทนการ bypass

## Upload Testing

Upload tests ใช้ไฟล์ synthetic ที่สร้างด้วย `utils/upload-fixtures.ts` และส่งผ่าน `setInputFiles()`

ครอบคลุม:

- JPG, JPEG, PNG, GIF
- invalid extensions และ fake MIME
- corrupted/zero-byte file
- long filename, Thai filename และ special characters
- replace/same file twice
- preview/feedback/accessibility

ไม่มีการใช้ malware หรือไฟล์ executable จริง

## Reports และ Artifacts

Playwright config ตั้งค่าไว้ดังนี้:

- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`
- `trace: 'retain-on-failure'`
- HTML reporter ที่ `playwright-report/`

เปิด report:

```bash
npm run report
```

หรือใช้ Playwright CLI:

```bash
npx playwright show-report
```

ไฟล์ที่เกี่ยวข้อง:

```text
playwright-report/index.html
test-results/
```

เมื่อรัน test command ใหม่ report อาจถูกสร้างทับด้วยผลของ run ล่าสุด ถ้าต้องการเก็บผลแต่ละรอบ ให้ copy `playwright-report/` และ `test-results/` ไปยังโฟลเดอร์ที่มีชื่อรอบการทดสอบก่อนรันรอบถัดไป

## Known Application Defect

`TC353` ตรวจว่า ID ใน `aria-describedby` ต้องมี element ปลายทางจริง ปัจจุบันหน้าเว็บมีปัญหา:

- `#pf_countryID` อ้างถึง `pf_countryID_err`
- `#pf_color` อ้างถึง `pf_color_err`
- แต่ element ของทั้งสอง ID ไม่ถูก render ใน DOM

เคสนี้ถูกประกาศด้วย Playwright `test.fail()` เป็น expected application failure เพื่อให้:

- assertion ยังคงทำงานและตรวจพบ defect
- regression process ไม่ fail ทั้งชุดจาก known defect
- report ยังแสดงรายละเอียด failure, screenshot, video และ trace

วิธีแก้ที่ application ควรทำคือ render description/error elements ที่มี ID ตรงกัน เช่น error region สำหรับ Country และ Color จากนั้นจึงนำ `test.fail()` ออกจาก `tests/registration/accessibility.spec.ts`

รายละเอียดอยู่ที่ [docs/bugs-found.md](docs/bugs-found.md)

## Failure Classification

เมื่อ test fail ให้จำแนกก่อนแก้:

- `APPLICATION_BUG` — behavior ของ application ไม่ตรง requirement หรือ accessibility contract
- `AUTOMATION_BUG` — locator, setup หรือ test logic ผิด
- `ENVIRONMENT` — browser/OS/runtime issue
- `THIRD_PARTY` — dependency ภายนอก เช่น hCaptcha ไม่พร้อม
- `VERIFICATION_BLOCKED` — test ไปต่อไม่ได้เพราะ CAPTCHA ยังไม่ผ่าน
- `NETWORK` — timeout, connection failure หรือ target availability
- `UNKNOWN` — ยังหาสาเหตุไม่ได้

ห้ามแก้ assertion ให้ผ่านเพียงเพื่อซ่อน application defect

## Adding or Updating Test Cases

1. เพิ่มหรือแก้ case ใน `test-data/registration-cases.ts`
2. รักษา ID ให้เป็น TC001–TC400 แบบต่อเนื่องและไม่ซ้ำ
3. ตั้ง `category`, `kind`, `title`, `expected`, `tags` และ `automated` ให้ครบ
4. ผูก scenario กับ spec/helper ที่เหมาะสม
5. regenerate matrix:

   ```bash
   npm run generate:matrix
   ```

6. ตรวจ TypeScript:

   ```bash
   npx tsc --noEmit
   ```

7. ตรวจ test discovery:

   ```bash
   npx playwright test --list --project=chromium
   ```

8. รัน targeted test ก่อน แล้วจึงรัน category regression

ทุก test ควรมีชื่อที่อ้างอิง TC ID ผ่าน `titleFor(testCase)` และใช้ `test.step()` เพื่อให้ report อ่านง่าย

## Troubleshooting

### `No tests found` เมื่อรัน submission

อย่าใช้เพียง:

```bash
npx playwright test --grep @submission
```

ให้ใช้:

```bash
npm run test:submission
```

หรือ:

```bash
RUN_SUBMISSION=1 npx playwright test --project=chromium --grep @submission
```

### Browser executable ไม่พบ

ติดตั้ง browser ใหม่:

```bash
npx playwright install chromium
```

### Navigation timeout

ตรวจ internet/target availability และ rerun เฉพาะเคสก่อน:

```bash
npx playwright test --project=chromium --grep "TC278"
```

อย่าเพิ่ม workers หรือรันซ้ำจำนวนมากกับ production-like target

### Report ไม่ใช่ผลรอบที่ต้องการ

ตรวจว่า test run ล่าสุดคือรอบใด เพราะ `npm run report` เปิด report ล่าสุดเท่านั้น จากนั้นรัน test ที่ต้องการใหม่แล้วเปิด report อีกครั้ง

### ต้องการ debug แบบเห็น browser

```bash
npm run test:headed
```

หรือใช้ Inspector:

```bash
npm run test:debug
```

## Latest Verification Notes

ตรวจสอบล่าสุดแล้ว:

- `npx tsc --noEmit` ผ่าน
- Default discovery พบ 394 tests จาก 18 files
- Accessibility suite ผ่าน 42/42 โดย TC353 เป็น expected application failure
- Isolated `@submission` suite ผ่าน 6/6
- Matrix มี 400 rows ตั้งแต่ TC001 ถึง TC400

ดูผล coverage และ failure classification เพิ่มเติมได้ที่ [docs/coverage-summary.md](docs/coverage-summary.md)
