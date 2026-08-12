# Registration Page Automation

ชุด Node/TypeScript นี้ทดสอบเฉพาะ URL ต่อไปนี้:

```text
https://registration.expopass.co/register/form/kiso26/ThqcXW
```

ไม่มี Questionnaire, Complete, Conference, Email หรือ Invite Friend อยู่ใน Node Workbook suite

## คำสั่ง

```bash
npm run test:workbook
npm run test:workbook:headed
npm run report:workbook
```

`test:workbook` รัน Safe UI tests ที่ไม่บันทึก Registration จริง
และ `test:workbook:live-flow` รัน flow จริงโดยรอให้คนทำ hCaptcha ก่อน Submit:

```powershell
$env:WORKBOOK_TEST_EMAIL="your-gmail@gmail.com"
npm run test:workbook:live-flow
```

ภาพเต็มหน้าของทุก test อยู่ใน `test-results-workbook/` และ HTML report อยู่ใน
`playwright-report-workbook/`
