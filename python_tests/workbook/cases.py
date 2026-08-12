from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WorkbookCase:
    id: str
    area: str
    scenario: str


def _numbered(prefix: str, area: str, scenarios: list[str], start: int = 1) -> list[WorkbookCase]:
    return [
        WorkbookCase(f"{prefix}-{number:03d}", area, scenario)
        for number, scenario in enumerate(scenarios, start=start)
    ]


REGISTRATION_CASES = _numbered(
    "REG",
    "Registration",
    [
        "เปิดหน้า Registration",
        "เปิด URL ไม่ถูกต้อง",
        "Submit โดยไม่กรอกข้อมูล",
        "กรอกชื่อถูกต้อง",
        "เว้นว่างชื่อ",
        "กรอกเกินจำนวนตัวอักษร",
        "กรอกนามสกุลถูกต้อง",
        "กรอก Email ถูกต้อง",
        "Email ไม่ถูกต้อง",
        "Email ซ้ำ",
        "กรอกเบอร์โทรถูกต้อง",
        "กรอกตัวอักษรในเบอร์โทร",
        "กรอกจำนวนหลักไม่ถูกต้อง",
        "เลือกข้อมูลจาก Dropdown",
        "ไม่เลือกข้อมูล Required",
        "เลือก Other",
        "ไม่กรอกข้อมูลหลังเลือก Other",
        "Upload ไฟล์ถูกต้อง",
        "Upload ไฟล์ผิดประเภท",
        "Upload ไฟล์เกินขนาด",
        "ไม่ติ๊กยอมรับ PDPA",
        "ติ๊กยอมรับ PDPA",
        "กรอกข้อมูลครบถ้วน",
        "กด Submit ซ้ำ",
        "Session Timeout",
        "Refresh ก่อน Submit",
        "Chrome",
        "Edge",
        "Firefox",
        "Safari",
        "Mobile",
        "SQL Injection",
        "XSS",
        "Submit ข้อมูลภายใน SLA",
        "ตรวจสอบการแสดงข้อความ Error ของแต่ละ Field",
        "ตรวจสอบ Placeholder และ Label",
        "ตรวจสอบการเรียงลำดับ Tab",
        "ตรวจสอบการ Copy/Paste ข้อมูล",
        "ตรวจสอบภาษาไทย อังกฤษ และอักขระพิเศษ",
        "ตรวจสอบ Desktop Tablet Mobile",
        "ตรวจสอบอีเมลยืนยันการลงทะเบียน",
        "ตรวจสอบข้อมูลในฐานข้อมูล",
        "ตรวจสอบ Event ปิดรับสมัคร ยังไม่เปิด หรือ URL หมดอายุ",
    ],
)

QUESTIONNAIRE_CASES = _numbered(
    "QN",
    "Questionnaire",
    [
        "เปิดหน้า Question",
        "ตรวจสอบจำนวนคำถาม",
        "Required Question",
        "Textbox กรอกข้อความปกติ",
        "Textbox เว้นว่าง",
        "Textbox เกิน Max Length",
        "Textbox อักขระพิเศษ",
        "Textarea หลายบรรทัด",
        "Radio เลือกหนึ่งตัวเลือก",
        "Radio เปลี่ยนตัวเลือก",
        "Checkbox เลือกหลายตัวเลือก",
        "Checkbox Required ไม่เลือก",
        "Dropdown เลือกข้อมูล",
        "Dropdown ไม่เลือกค่า",
        "เลือก Other",
        "เลือก Other แต่ไม่กรอก",
        "เลือก Other และกรอกข้อความ",
        "เลือก Rating 5",
        "เลือกวันที่",
        "Upload JPG",
        "Upload EXE",
        "Upload 20 MB",
        "กด Next",
        "กด Previous",
        "Submit แบบสอบถาม",
        "Double Click Submit",
        "Refresh หน้า",
        "Browser Back",
        "Session Timeout",
        "XSS",
        "SQL Injection",
        "Mobile Responsive",
        "Cross Browser",
        "เลือก Yes แล้วแสดงคำถามเพิ่มเติม",
        "เปลี่ยน Yes เป็น No",
        "ข้อคำถามที่ถูกซ่อน",
        "ข้อคำถามที่ถูกแสดง",
        "เปลี่ยนคำตอบหลายครั้ง",
        "ตัวเลือก 100 รายการขึ้นไป",
        "Multi-page Questionnaire",
    ],
)

COMPLETE_IDS = [
    *[f"CMP-{number:03d}" for number in range(1, 10)],
    *[f"CMP-{number:03d}" for number in range(11, 27)],
]
COMPLETE_SCENARIOS = [
    "เปิดหน้า Complete หลัง Submit",
    "แสดงข้อความสำเร็จ",
    "แสดงชื่อผู้ลงทะเบียน",
    "แสดง Registration No.",
    "แสดง QR Code",
    "แสดง E-Badge",
    "ดาวน์โหลด E-Badge",
    "ปุ่ม Print",
    "Add to Calendar",
    "ปุ่มกลับหน้า Home",
    "ปุ่มไปเว็บไซต์งาน",
    "ตรวจสอบการส่ง Email",
    "ตรวจสอบข้อมูลใน Email",
    "Refresh หน้า Complete",
    "Browser Back",
    "เปิด URL Complete โดยตรง",
    "Session หมดอายุ",
    "เปิดหลายแท็บ",
    "Responsive",
    "Cross Browser",
    "Performance",
    "URL Tampering",
    "XSS ผ่าน URL Parameter",
    "SQL Injection ผ่าน URL",
    "Database Validation",
]
COMPLETE_CASES = [
    WorkbookCase(case_id, "Complete", scenario)
    for case_id, scenario in zip(COMPLETE_IDS, COMPLETE_SCENARIOS, strict=True)
]

CONFERENCE_CASES = [
    WorkbookCase("CFR-001", "Conference", "Login ด้วยบัญชีที่ลงทะเบียน"),
    WorkbookCase("CFR-002", "Conference", "เปิด My Profile"),
    WorkbookCase("CFR-003", "Conference", "เปิด My Profile > My Profile"),
    WorkbookCase("CFR-004", "Conference", "เปิด My Profile > My Booking"),
]
EMAIL_CASES = [WorkbookCase("EMF-001", "Email Registration", "ตรวจสอบอีเมลยืนยัน")]
INVITE_CASES = [WorkbookCase("INF-001", "Invite Friend", "เปิด Tell a friend E-Card")]

ALL_CASES = [
    *REGISTRATION_CASES,
    *QUESTIONNAIRE_CASES,
    *COMPLETE_CASES,
    *CONFERENCE_CASES,
    *EMAIL_CASES,
    *INVITE_CASES,
]

assert len(REGISTRATION_CASES) == 43
assert len(QUESTIONNAIRE_CASES) == 40
assert len(COMPLETE_CASES) == 25
assert len(ALL_CASES) == 114
assert len({case.id for case in ALL_CASES}) == 114
