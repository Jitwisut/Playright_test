# Registration Page Automation

ชุด Node/TypeScript นี้ทดสอบเฉพาะ URL ต่อไปนี้:

```text
https://registration.expopass.co/register/form/kiso26/ThqcXW
```

ไม่มี Questionnaire, Complete, Conference, Email หรือ Invite Friend อยู่ใน Node Workbook suite

## คำสั่ง

```bash
npm run test:workbook
npm run report:workbook
```

ก่อนรัน ให้ตั้ง email สำหรับรับผลการสมัครจริง:

```powershell
$env:WORKBOOK_TEST_EMAIL="your-gmail@gmail.com"
```

`npm run test:workbook` จะเปิด Browser, รัน Safe UI tests ทั้งหมด แล้วกรอกและ Submit จริง
ในเคสสุดท้าย โดยจะรอให้คนทำ hCaptcha ได้สูงสุด 10 นาที ก่อน Submit ต่ออัตโนมัติ
ระบบจะสร้าง Gmail alias จาก email นี้ในแต่ละรอบ เพื่อไม่ใช้ email สมัครซ้ำ

ภาพเต็มหน้าของทุก test อยู่ใน `test-results-workbook/` และ HTML report อยู่ใน
`playwright-report-workbook/`
