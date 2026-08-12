export type WorkbookArea = 'Registration' | 'Questionnaire' | 'Complete' | 'Conference' | 'Email Registration' | 'Invite Friend';

export type WorkbookCase = {
  id: string;
  area: WorkbookArea;
  scenario: string;
  expected: string;
};

const registration: WorkbookCase[] = [
  { id: 'REG-001', area: 'Registration', scenario: 'เปิดหน้า Registration', expected: 'ระบบแสดงหน้าลงทะเบียนได้ถูกต้อง ไม่มี Error' },
  { id: 'REG-002', area: 'Registration', scenario: 'เปิด URL ไม่ถูกต้อง', expected: 'ระบบแสดงหน้า 404 หรือข้อความแจ้งเตือนที่เหมาะสม' },
  { id: 'REG-003', area: 'Registration', scenario: 'Submit โดยไม่กรอกข้อมูล', expected: 'ระบบแจ้งเตือน Required Field ทุกช่องที่บังคับ' },
  { id: 'REG-004', area: 'Registration', scenario: 'กรอกชื่อถูกต้อง', expected: 'ระบบรับข้อมูล English เท่านั้น' },
  { id: 'REG-005', area: 'Registration', scenario: 'เว้นว่างชื่อ', expected: 'ระบบแจ้งเตือน Required' },
  { id: 'REG-006', area: 'Registration', scenario: 'กรอกเกินจำนวนตัวอักษร', expected: 'ระบบแจ้งเตือนหรือไม่อนุญาตให้กรอกเกิน' },
  { id: 'REG-007', area: 'Registration', scenario: 'กรอกนามสกุลถูกต้อง', expected: 'ระบบรับข้อมูล English เท่านั้น' },
  { id: 'REG-008', area: 'Registration', scenario: 'กรอก Email ถูกต้อง', expected: 'ระบบรับข้อมูลได้' },
  { id: 'REG-009', area: 'Registration', scenario: 'Email ไม่ถูกต้อง', expected: 'ระบบแจ้ง Invalid Email' },
  { id: 'REG-010', area: 'Registration', scenario: 'Email ซ้ำ', expected: 'ระบบแสดงข้อความ This account already exists.' },
  { id: 'REG-011', area: 'Registration', scenario: 'กรอกเบอร์โทรถูกต้อง', expected: 'ระบบรับข้อมูลได้' },
  { id: 'REG-012', area: 'Registration', scenario: 'กรอกตัวอักษรในเบอร์โทร', expected: 'ระบบแจ้งเตือน' },
  { id: 'REG-013', area: 'Registration', scenario: 'กรอกจำนวนหลักไม่ถูกต้อง', expected: 'ระบบแจ้งเตือน' },
  { id: 'REG-014', area: 'Registration', scenario: 'เลือกข้อมูลจาก Dropdown', expected: 'ระบบแสดงค่าที่เลือก' },
  { id: 'REG-015', area: 'Registration', scenario: 'ไม่เลือกข้อมูล Required', expected: 'ระบบแจ้งเตือน' },
  { id: 'REG-016', area: 'Registration', scenario: 'เลือก Other', expected: 'ระบบแสดง Textbox เพิ่มเติม' },
  { id: 'REG-017', area: 'Registration', scenario: 'ไม่กรอกข้อมูลหลังเลือก Other', expected: 'ระบบแจ้งเตือน Required' },
  { id: 'REG-018', area: 'Registration', scenario: 'Upload ไฟล์ถูกต้อง', expected: 'ระบบ Upload สำเร็จ' },
  { id: 'REG-019', area: 'Registration', scenario: 'Upload ไฟล์ผิดประเภท', expected: 'ระบบแจ้งเตือน' },
  { id: 'REG-020', area: 'Registration', scenario: 'Upload ไฟล์เกินขนาด', expected: 'ระบบแจ้งเตือน' },
  { id: 'REG-021', area: 'Registration', scenario: 'ไม่ติ๊กยอมรับ PDPA', expected: 'ระบบไม่อนุญาตให้ลงทะเบียน' },
  { id: 'REG-022', area: 'Registration', scenario: 'ติ๊กยอมรับ PDPA', expected: 'ระบบดำเนินการต่อได้' },
  { id: 'REG-023', area: 'Registration', scenario: 'กรอกข้อมูลครบถ้วน', expected: 'ลงทะเบียนสำเร็จ พาไปหน้า Questionnaire' },
  { id: 'REG-024', area: 'Registration', scenario: 'กด Submit ซ้ำ', expected: 'ระบบบันทึกข้อมูลเพียงครั้งเดียว' },
  { id: 'REG-025', area: 'Registration', scenario: 'Session Timeout', expected: 'ระบบแจ้ง Session Expired' },
  { id: 'REG-026', area: 'Registration', scenario: 'Refresh ก่อน Submit', expected: 'ระบบทำงานตาม Requirement' },
  { id: 'REG-027', area: 'Registration', scenario: 'Chrome', expected: 'ใช้งานได้ปกติ' },
  { id: 'REG-028', area: 'Registration', scenario: 'Edge', expected: 'ใช้งานได้ปกติ' },
  { id: 'REG-029', area: 'Registration', scenario: 'Firefox', expected: 'ใช้งานได้ปกติ' },
  { id: 'REG-030', area: 'Registration', scenario: 'Safari', expected: 'ใช้งานได้ปกติ' },
  { id: 'REG-031', area: 'Registration', scenario: 'Mobile', expected: 'Layout แสดงผลถูกต้อง' },
  { id: 'REG-032', area: 'Registration', scenario: 'SQL Injection', expected: 'ระบบป้องกันการโจมตีได้' },
  { id: 'REG-033', area: 'Registration', scenario: 'XSS', expected: 'Script ไม่ทำงาน' },
  { id: 'REG-034', area: 'Registration', scenario: 'Submit ข้อมูลภายใน SLA', expected: 'ระบบตอบสนองภายใน SLA' },
  { id: 'REG-035', area: 'Registration', scenario: 'ตรวจสอบการแสดงข้อความ Error ของแต่ละ Field', expected: '' },
  { id: 'REG-036', area: 'Registration', scenario: 'ตรวจสอบ Placeholder และ Label', expected: '' },
  { id: 'REG-037', area: 'Registration', scenario: 'ตรวจสอบการเรียงลำดับ Tab', expected: '' },
  { id: 'REG-038', area: 'Registration', scenario: 'ตรวจสอบการ Copy/Paste ข้อมูล', expected: '' },
  { id: 'REG-039', area: 'Registration', scenario: 'ตรวจสอบภาษาไทย อังกฤษ และอักขระพิเศษ', expected: '' },
  { id: 'REG-040', area: 'Registration', scenario: 'ตรวจสอบ Desktop Tablet Mobile', expected: '' },
  { id: 'REG-041', area: 'Registration', scenario: 'ตรวจสอบอีเมลยืนยันการลงทะเบียน', expected: '' },
  { id: 'REG-042', area: 'Registration', scenario: 'ตรวจสอบข้อมูลในฐานข้อมูล', expected: '' },
  { id: 'REG-043', area: 'Registration', scenario: 'ตรวจสอบ Event ปิดรับสมัคร ยังไม่เปิด หรือ URL หมดอายุ', expected: '' },
];

const questionnaire: WorkbookCase[] = [
  { id: 'QN-001', area: 'Questionnaire', scenario: 'เปิดหน้า Question', expected: 'ระบบแสดงหน้าคำถามครบทุกข้อ' },
  { id: 'QN-002', area: 'Questionnaire', scenario: 'ตรวจสอบจำนวนคำถาม', expected: 'แสดงคำถามครบตามที่กำหนด' },
  { id: 'QN-003', area: 'Questionnaire', scenario: 'Required Question', expected: 'ระบบแจ้ง Required Field' },
  { id: 'QN-004', area: 'Questionnaire', scenario: 'Textbox กรอกข้อความปกติ', expected: 'ระบบรับข้อมูลได้' },
  { id: 'QN-005', area: 'Questionnaire', scenario: 'Textbox เว้นว่าง', expected: 'ระบบแจ้งเตือนกรณี Required' },
  { id: 'QN-006', area: 'Questionnaire', scenario: 'Textbox เกิน Max Length', expected: 'ระบบไม่อนุญาตหรือแจ้งเตือน' },
  { id: 'QN-007', area: 'Questionnaire', scenario: 'Textbox อักขระพิเศษ', expected: 'ระบบทำงานตาม Requirement' },
  { id: 'QN-008', area: 'Questionnaire', scenario: 'Textarea หลายบรรทัด', expected: 'ระบบบันทึกข้อมูลได้' },
  { id: 'QN-009', area: 'Questionnaire', scenario: 'Radio เลือกหนึ่งตัวเลือก', expected: 'ระบบเลือกได้เพียง 1 ค่า' },
  { id: 'QN-010', area: 'Questionnaire', scenario: 'Radio เปลี่ยนตัวเลือก', expected: 'ระบบเลือกเฉพาะค่าล่าสุด' },
  { id: 'QN-011', area: 'Questionnaire', scenario: 'Checkbox เลือกหลายตัวเลือก', expected: 'ระบบบันทึกทุกค่าที่เลือก' },
  { id: 'QN-012', area: 'Questionnaire', scenario: 'Checkbox Required ไม่เลือก', expected: 'ระบบแจ้งเตือน' },
  { id: 'QN-013', area: 'Questionnaire', scenario: 'Dropdown เลือกข้อมูล', expected: 'ระบบแสดงค่าที่เลือก' },
  { id: 'QN-014', area: 'Questionnaire', scenario: 'Dropdown ไม่เลือกค่า', expected: 'ระบบแจ้งเตือน' },
  { id: 'QN-015', area: 'Questionnaire', scenario: 'เลือก Other', expected: 'ระบบแสดง Textbox เพิ่มเติม' },
  { id: 'QN-016', area: 'Questionnaire', scenario: 'เลือก Other แต่ไม่กรอก', expected: 'ระบบแจ้ง Required' },
  { id: 'QN-017', area: 'Questionnaire', scenario: 'เลือก Other และกรอกข้อความ', expected: 'ระบบบันทึกข้อมูล' },
  { id: 'QN-018', area: 'Questionnaire', scenario: 'เลือก Rating 5', expected: 'ระบบบันทึกคะแนน' },
  { id: 'QN-019', area: 'Questionnaire', scenario: 'เลือกวันที่', expected: 'ระบบแสดงวันที่ถูกต้อง' },
  { id: 'QN-020', area: 'Questionnaire', scenario: 'Upload JPG', expected: 'Upload สำเร็จ' },
  { id: 'QN-021', area: 'Questionnaire', scenario: 'Upload EXE', expected: 'ระบบแจ้ง Error' },
  { id: 'QN-022', area: 'Questionnaire', scenario: 'Upload 20 MB', expected: 'ระบบแจ้ง Error' },
  { id: 'QN-023', area: 'Questionnaire', scenario: 'กด Next', expected: 'ไปหน้าถัดไป' },
  { id: 'QN-024', area: 'Questionnaire', scenario: 'กด Previous', expected: 'กลับหน้าก่อนหน้าและข้อมูลยังอยู่' },
  { id: 'QN-025', area: 'Questionnaire', scenario: 'Submit แบบสอบถาม', expected: 'ส่งข้อมูลสำเร็จ' },
  { id: 'QN-026', area: 'Questionnaire', scenario: 'Double Click Submit', expected: 'ระบบบันทึกเพียงครั้งเดียว' },
  { id: 'QN-027', area: 'Questionnaire', scenario: 'Refresh หน้า', expected: 'ระบบทำงานตาม Requirement' },
  { id: 'QN-028', area: 'Questionnaire', scenario: 'Browser Back', expected: 'ไม่เกิดข้อมูลซ้ำ' },
  { id: 'QN-029', area: 'Questionnaire', scenario: 'Session Timeout', expected: 'แจ้ง Session Expired' },
  { id: 'QN-030', area: 'Questionnaire', scenario: 'XSS', expected: 'ระบบไม่ Execute Script' },
  { id: 'QN-031', area: 'Questionnaire', scenario: 'SQL Injection', expected: 'ระบบป้องกัน SQL Injection' },
  { id: 'QN-032', area: 'Questionnaire', scenario: 'Mobile Responsive', expected: 'Layout แสดงผลถูกต้อง' },
  { id: 'QN-033', area: 'Questionnaire', scenario: 'Cross Browser', expected: 'ทำงานเหมือนกันทุก Browser' },
  { id: 'QN-034', area: 'Questionnaire', scenario: 'เลือก Yes แล้วแสดงคำถามเพิ่มเติม', expected: 'ระบบแสดงคำถามที่เกี่ยวข้อง' },
  { id: 'QN-035', area: 'Questionnaire', scenario: 'เปลี่ยน Yes เป็น No', expected: 'ระบบซ่อนคำถามเพิ่มเติมและล้างข้อมูลเดิม' },
  { id: 'QN-036', area: 'Questionnaire', scenario: 'ข้อคำถามที่ถูกซ่อน', expected: 'ไม่ถูก Validate' },
  { id: 'QN-037', area: 'Questionnaire', scenario: 'ข้อคำถามที่ถูกแสดง', expected: 'Required Validation ทำงาน' },
  { id: 'QN-038', area: 'Questionnaire', scenario: 'เปลี่ยนคำตอบหลายครั้ง', expected: 'ระบบแสดงและซ่อนคำถามได้ถูกต้อง' },
  { id: 'QN-039', area: 'Questionnaire', scenario: 'ตัวเลือก 100 รายการขึ้นไป', expected: 'โหลดข้อมูลครบและเลือกได้' },
  { id: 'QN-040', area: 'Questionnaire', scenario: 'Multi-page Questionnaire', expected: 'ข้อมูลหน้าก่อนหน้ายังคงอยู่เมื่อย้อนกลับ' },
];

const complete: WorkbookCase[] = [
  { id: 'CMP-001', area: 'Complete', scenario: 'เปิดหน้า Complete หลัง Submit', expected: 'ระบบแสดงหน้า Complete และได้รับ Email Confirm' },
  { id: 'CMP-002', area: 'Complete', scenario: 'แสดงข้อความสำเร็จ', expected: 'แสดง Registration Completed หรือข้อความที่กำหนด' },
  { id: 'CMP-003', area: 'Complete', scenario: 'แสดงชื่อผู้ลงทะเบียน', expected: 'แสดงชื่อตรงกับข้อมูลที่ลงทะเบียน' },
  { id: 'CMP-004', area: 'Complete', scenario: 'แสดง Registration No.', expected: 'เลขอ้างอิงถูกต้องและไม่ซ้ำ' },
  { id: 'CMP-005', area: 'Complete', scenario: 'แสดง QR Code', expected: 'QR Code แสดงผลและสแกนได้' },
  { id: 'CMP-006', area: 'Complete', scenario: 'แสดง E-Badge', expected: 'Badge แสดงข้อมูลถูกต้อง' },
  { id: 'CMP-007', area: 'Complete', scenario: 'ดาวน์โหลด E-Badge', expected: 'ดาวน์โหลดไฟล์สำเร็จ' },
  { id: 'CMP-008', area: 'Complete', scenario: 'ปุ่ม Print', expected: 'เปิดหน้าพิมพ์ได้ถูกต้อง' },
  { id: 'CMP-009', area: 'Complete', scenario: 'Add to Calendar', expected: 'ดาวน์โหลด .ics หรือเพิ่มลงปฏิทินได้' },
  { id: 'CMP-011', area: 'Complete', scenario: 'ปุ่มกลับหน้า Home', expected: 'กลับหน้าหลักได้' },
  { id: 'CMP-012', area: 'Complete', scenario: 'ปุ่มไปเว็บไซต์งาน', expected: 'เปิดเว็บไซต์งานได้ถูกต้อง' },
  { id: 'CMP-013', area: 'Complete', scenario: 'ตรวจสอบการส่ง Email', expected: 'ระบบส่งอีเมลยืนยันการลงทะเบียน' },
  { id: 'CMP-014', area: 'Complete', scenario: 'ตรวจสอบข้อมูลใน Email', expected: 'ข้อมูลในอีเมลถูกต้องครบถ้วน' },
  { id: 'CMP-015', area: 'Complete', scenario: 'Refresh หน้า Complete', expected: 'ไม่สร้างข้อมูลลงทะเบียนซ้ำ' },
  { id: 'CMP-016', area: 'Complete', scenario: 'Browser Back', expected: 'ไม่สามารถ Submit ซ้ำได้' },
  { id: 'CMP-017', area: 'Complete', scenario: 'เปิด URL Complete โดยตรง', expected: 'ระบบ Redirect หรือแจ้ง Invalid Session' },
  { id: 'CMP-018', area: 'Complete', scenario: 'Session หมดอายุ', expected: 'แจ้ง Session Expired หรือ Redirect ตาม Requirement' },
  { id: 'CMP-019', area: 'Complete', scenario: 'เปิดหลายแท็บ', expected: 'ข้อมูลแสดงเหมือนกันและไม่เกิด Error' },
  { id: 'CMP-020', area: 'Complete', scenario: 'Responsive', expected: 'Layout แสดงผลถูกต้อง' },
  { id: 'CMP-021', area: 'Complete', scenario: 'Cross Browser', expected: 'แสดงผลเหมือนกันทุก Browser' },
  { id: 'CMP-022', area: 'Complete', scenario: 'Performance', expected: 'โหลดหน้าได้ภายใน SLA' },
  { id: 'CMP-023', area: 'Complete', scenario: 'URL Tampering', expected: 'ไม่สามารถเข้าถึงข้อมูลของผู้อื่นได้' },
  { id: 'CMP-024', area: 'Complete', scenario: 'XSS ผ่าน URL Parameter', expected: 'ระบบไม่ Execute Script' },
  { id: 'CMP-025', area: 'Complete', scenario: 'SQL Injection ผ่าน URL', expected: 'ระบบป้องกันการโจมตี' },
  { id: 'CMP-026', area: 'Complete', scenario: 'Database Validation', expected: 'ข้อมูลตรงกับที่กรอกและสถานะ Registered' },
];

const external: WorkbookCase[] = [
  { id: 'CFR-001', area: 'Conference', scenario: 'Login ด้วยบัญชีที่ลงทะเบียน', expected: 'Login สำเร็จ' },
  { id: 'CFR-002', area: 'Conference', scenario: 'เปิด My Profile', expected: 'แสดง My Profile และ My Booking' },
  { id: 'CFR-003', area: 'Conference', scenario: 'เปิด My Profile > My Profile', expected: 'แสดงหน้า My Profile' },
  { id: 'CFR-004', area: 'Conference', scenario: 'เปิด My Profile > My Booking', expected: 'แสดงหน้า My Booking' },
  { id: 'EMF-001', area: 'Email Registration', scenario: 'ตรวจสอบอีเมลยืนยัน', expected: 'Subject, Sender Email และ Sender Name ถูกต้อง' },
  { id: 'INF-001', area: 'Invite Friend', scenario: 'เปิด Tell a friend E-Card', expected: 'ระบบแสดงหน้า Invite Friend' },
];

export const webRegistrationOnlineCases: WorkbookCase[] = [
  ...registration,
  ...questionnaire,
  ...complete,
  ...external,
];

export function casesFor(area: WorkbookArea): WorkbookCase[] {
  return webRegistrationOnlineCases.filter((testCase) => testCase.area === area);
}

export function workbookTitle(testCase: WorkbookCase): string {
  const tag = testCase.area.toLowerCase().replaceAll(' ', '-');
  return `${testCase.id} - ${testCase.scenario} @workbook @${tag}`;
}
