# Web Registration Online — Workbook Automation

เอกสารนี้อ้างอิงตาราง `Web Registration Online` ในไฟล์ `Trainee BU3_ Manage Expopass.xlsx`

## จำนวน Test IDs

| Area | IDs | จำนวน |
| --- | --- | ---: |
| Registration | REG-001–REG-043 | 43 |
| Questionnaire | QN-001–QN-040 | 40 |
| Complete | CMP-001–CMP-009 และ CMP-011–CMP-026 | 25 |
| Conference | CFR-001–CFR-004 | 4 |
| Email Registration | EMF-001 | 1 |
| รวม |  | 113 |

หมายเหตุ: ต้นฉบับไม่มี `CMP-010` และชุด Automation นี้ตัด Invite Friend ออกตามขอบเขตงานล่าสุด

## การแบ่งการรัน

- `REG-*` เปิดหน้าลงทะเบียนสาธารณะได้ และใช้ route guard ป้องกันการบันทึก/อัปโหลดเข้า Production
- `QN-*` ต้องมี `WORKBOOK_QUESTIONNAIRE_URL` ที่ผูกกับ test session หลังผ่าน Registration
- `CMP-*` ต้องมี `WORKBOOK_COMPLETE_URL` ที่ผูกกับ test session ที่ลงทะเบียนสำเร็จ
- `CFR-*` ต้องกำหนด URL และ credentials ผ่าน environment variables
- `EMF-001` อ่าน JSON fixture ที่ export จาก test mailbox เพื่อไม่ผูก automation กับบัญชีอีเมลส่วนตัว

## Production safety

- Password ที่ปรากฏใน Excel ไม่ถูกคัดลอกลง source code หรือ Git
- ค่าเริ่มต้นบล็อก `registrationv5/save_page` และ `registrationv5/upload`
- การ Submit จริงอนุญาตเฉพาะ URL ที่ไม่ใช่ `registration.expopass.co` และต้องตั้งทั้ง `WORKBOOK_ALLOW_WRITE=1` กับ `WORKBOOK_CAPTCHA_TEST_MODE=1`
- Upload fixtures เป็นไฟล์สังเคราะห์ ไม่ใช่ไฟล์ส่วนตัวหรือ malware จริง
- Email/Database/Back Office cases จะ skip จนกว่าจะมี test-only integration ที่เหมาะสม

## Environment variables

| Variable | ใช้กับ | รายละเอียด |
| --- | --- | --- |
| `WORKBOOK_REGISTRATION_URL` | REG | URL Registration; ถ้าไม่กำหนดจะใช้ URL ในชีต note |
| `WORKBOOK_QUESTIONNAIRE_URL` | QN | URL พร้อม test session ของ Questionnaire |
| `WORKBOOK_COMPLETE_URL` | CMP | URL พร้อม test session ของ Complete page |
| `WORKBOOK_CONFERENCE_URL` | CFR | URL Login Conference/Profile ที่ถูกต้อง |
| `WORKBOOK_CONFERENCE_USER` | CFR | Username จาก secret store/environment |
| `WORKBOOK_CONFERENCE_PASSWORD` | CFR | Password จาก secret store/environment |
| `WORKBOOK_EMAIL_FIXTURE` | EMF/CMP | Path ของ JSON message ตามตัวอย่าง `test-data/mail-fixture.example.json` |
| `WORKBOOK_STORAGE_STATE` | QN/CMP/CFR | Path ของ Playwright storage-state JSON ถ้าระบบต้องใช้ session |
| `WORKBOOK_EXPECTED_NAME` | CMP | ชื่อ synthetic registrant ที่ควรแสดงบน Complete/Email |
| `WORKBOOK_QUESTION_COUNT` | QN | จำนวนคำถามที่คาดหวัง ถ้าไม่กำหนดจะตรวจว่าอย่างน้อยหนึ่งข้อ |
| `WORKBOOK_SESSION_TIMEOUT_MS` | REG/QN/CMP | ระยะ session timeout ตาม requirement |
| `WORKBOOK_CLOSED_EVENT_URL` | REG-043 | URL ของ event ที่ปิด/ยังไม่เปิด/หมดอายุ |
| `WORKBOOK_SLA_MS` | Performance | SLA milliseconds; default 3000 |
| `WORKBOOK_CROSS_BROWSER` | Browser cases | ตั้ง `1` เพื่อเพิ่ม Firefox/WebKit และ Edge บน Windows |
| `WORKBOOK_ALLOW_WRITE` | Submission | ตั้ง `1` เฉพาะ non-production test environment |
| `WORKBOOK_CAPTCHA_TEST_MODE` | REG Submit | ตั้ง `1` เมื่อ test environment ใช้ CAPTCHA test key/disabled mode |

## Expected failures จาก Requirement mismatch ปัจจุบัน

- `REG-004` และ `REG-007`: ช่องชื่อ/นามสกุลไม่มี English-only pattern
- `REG-013`: Mobile ไม่มีข้อกำหนด validity สำหรับ 8/15 หลัก
- `REG-017`: ช่องรายละเอียดหลังเลือก Other ไม่ได้เป็น required
- `REG-021` และ `REG-022`: Event form ปัจจุบันไม่มี PDPA checkbox

Expected failure ยังคงรัน assertion ตาม Excel ถ้า behavior ถูกแก้ในอนาคต Playwright จะรายงานว่า test ที่คาดว่าจะ fail กลับผ่าน เพื่อให้ทีมอัปเดตสถานะ defect

## Python implementation

Python + pytest + Playwright implementation อยู่ใน `python_tests/workbook/`:

- `cases.py` เป็น catalog 113 IDs และตรวจ duplicate IDs ตอน import
- `conftest.py` จัดการ Browser, storage state, speed และ full-page screenshots
- `test_registration_workbook.py` ครอบคลุม `REG-001–REG-043`
- `test_questionnaire_workbook.py` ครอบคลุม `QN-001–QN-040`
- `test_complete_workbook.py` ครอบคลุม Complete 25 IDs ตาม Excel
- `test_external_workbook.py` ครอบคลุม Conference และ Email
- `pytest-workbook.ini` กำหนด markers และ test path แยกจาก Python example เดิม

คำสั่งหลัก:

```bash
.venv-python/bin/python -m pytest -c pytest-workbook.ini --collect-only -q
.venv-python/bin/python -m pytest -c pytest-workbook.ini -q -m registration
.venv-python/bin/python -m pytest -c pytest-workbook.ini -q
```

HTML report ใช้ `pytest-html` ที่ระบุใน `requirements-python.txt`:

```bash
.venv-python/bin/python -m pytest -c pytest-workbook.ini \
  --html=reports/python-workbook/report.html \
  --self-contained-html
```

Python suite ใช้ environment variables ชุดเดียวกับ TypeScript suite ในตารางด้านบน และไม่คัดลอก credentials จาก Excel ลง source code
