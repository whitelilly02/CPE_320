# SWU-PGx Digital Platform (PGxSystem)

สรุปสถานะโค้ดปัจจุบันของ "PGxSystem" (Desktop Electron app)

**Overview**: ระบบเดสก์ท็อปสำหรับเวิร์กโฟลว์เภสัชพันธุศาสตร์ (PGx) สร้างด้วย `Electron` และเชื่อมต่อฐานข้อมูลผ่าน `Supabase` (client ใน `supabase.js`) — ข้อมูลใน README นี้สรุปจากโค้ดปัจจุบันในสาขา `backend_admin_page` ณ เวลานี้

**Tech Stack**
- **Electron**: `main.js`, `preload.js`, `renderer.js` (หน้าต่างหลัก, CSP, IPC handlers และ context-bridging)
- **Supabase JS v2**: ใช้เชื่อมต่อฐานข้อมูล/สตอเรจ (`@supabase/supabase-js`) ผ่าน `supabase.js`
- **Node.js libs**: `bcrypt` (แฮชรหัสผ่าน), `dotenv` (อ่าน `.env`) — มี `express` ใน `package.json` แต่ยังไม่ถูกใช้งานในโค้ดหลัก
- **Frontend**: ไฟล์ HTML แบบ multi-page อยู่ใน `view/` (ไม่มี SPA framework)

**Quick Start**
- **Prereq**: Node.js 18+ และค่า Supabase URL/Anon Key
- ตั้งค่า `.env` ที่รากโปรเจกต์:

	- `NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>`

- ติดตั้งและรัน (PowerShell):

	```pwsh
	npm install
	npm start
	```

**Environment Variables**
- `NEXT_PUBLIC_SUPABASE_URL`: URL ของโปรเจกต์ Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key สำหรับ client

**Project Structure (สำคัญ)**
- `package.json`: สคริปต์ `start` รัน Electron
- `main.js`: สร้างหน้าต่าง Electron, ตั้งค่า CSP, ลงทะเบียน IPC handlers
- `preload.js`: เปิดเผย API ปลอดภัยให้ renderer ผ่าน `window.electronAPI`
- `renderer.js`: โค้ดฝั่ง UI ที่เรียก `window.electronAPI`
- `supabase.js`: ตัวช่วยสร้าง Supabase client (อ่านจาก `.env`)
- `view/`: หน้า HTML ทั้งหมด แยกตามบทบาท (ตัวอย่างในโฟลเดอร์)

ตัวอย่างหน้าใน `view/` (ไม่ใช่รายการสมบูรณ์):
- Admin: `adminManageUser.html`, `adminManageRole.html`, `adminGeneralSetting.html`, `adminLogUsage.html`, `adminManagePDPA1.html` ... `adminManagePDPA5.html`
- MedicalTech: `MedicalTechSend.html`, `medicaltechSendBarcode.html`, `medicaltechDashboard*.html`, `medicaltechNewPatient*.html`, `medicaltechReport*`
- Doctor: `doctorReport*.html`
- Pharmacy: `pharmacyReport*.html`
- Employee/User: `employeeDashboard*.html`, `employeeReport*.html`, `userDashboard.html`, `userPatient*.html`, `userKnowledge*.html`
- Auth: `loginMain.html`, `loginForget*.html`

**Roles & Access (จากโค้ดปัจจุบัน)**
- **Role mapping (`role_id`)**: แพทย์=1, เภสัช=2, นักเทคนิคการแพทย์=3, พนักงาน=4 (แมปตามที่โค้ดใช้)
- **Access mapping (`access_id`)**: admin=1, user=2
- **Hardcoded admin**: ผู้ใช้ `admin@gmail.com` ได้รับ `isAdmin=true` ใน `main.js` (มีการตั้งค่านี้แบบคงที่)

**Login redirect (จาก `renderer.js`)**
- Admin → `adminManageUser.html`
- Doctor → `doctorReport.html`
- Pharmacy → `pharmacyReport.html`
- Medical Tech → `MedicalTechSend.html`
- Staff/User → `userDashboard.html`

**IPC API (ที่พบใน `main.js` และถูกเปิดทาง `preload.js`)**
- `login({ email, password })` — ตรวจสอบผู้ใช้โดยเทียบ `bcrypt` กับ `users.password_hash`
- `create-user(userData)` — สร้างผู้ใช้ใหม่ (map `role_id`, `access_id`, แฮชรหัสผ่าน)
- `get-users()` — ดึงรายชื่อผู้ใช้
- `update-user(updatedUser)` — อัปเดตผู้ใช้ตาม `user_id`
- `delete-user(userId)` — ลบผู้ใช้ตาม `user_id`
- `create-patient(patientData)` — บันทึกผู้ป่วยใหม่ลง `patients`
- `get-physicians()` / `get-hospitals()` — ดึงรายการจากตารางที่เกี่ยวข้อง
- `get-dashboard-stats()` — จำนวนผู้ป่วยรวม (count จาก `patients`)
- `get-monthly-patients()` — จำนวนผู้ป่วยตามเดือน (aggregate จาก `request_date`)

**Feature Map (จากโค้ดจริง) — สรุปสภาพปัจจุบัน**
- 1) Dashboard / Homepage
	- Quick Access: ปุ่ม/ลิงก์ในไฟล์ `view/*Dashboard*.html` มีอยู่แล้ว (UI)
	- Dashboard Stats: IPC `get-dashboard-stats` และ `get-monthly-patients` มีอยู่แล้ว
	- ขาด: การคำนวณ/วิดเจ็ต TAT & KPI, การแจ้งเตือน/Tasks แบบ real-time ยังไม่ได้ถูกพัฒนาขึ้น

- 2) Case Management
	- รายการผู้ป่วย/เคส: หน้าหลายหน้า (`userPatient*.html`, `employeePatient*.html`) มี UI
	- ฟังก์ชันเพิ่มผู้ป่วย: `create-patient` IPC มี
	- รายงานผล/genotype: หน้า HTML แยกตามยีนและบทบาทมีอยู่ แต่ตรรกะแปลผลเชิงลึก (CDS) ยังไม่พบ

- 3) Specimen Accessioning
	- หน้าส่ง/สแกน: `MedicalTechSend.html`, `medicaltechSendBarcode.html` มี UI
	- ขาด: ตาราง/ตรรกะ Chain-of-custody, Rejection Criteria, Accession catalog

- 6) Reports & Analytics
	- หลายหน้ารายงานมีอยู่ (`doctorReport*.html`, `pharmacyReport*.html`, `employeeReportAndStatistics.html`)
	- ขาด: API/ตรรกะสำหรับ TAT Real-time, KPI, Adoption Metrics (ต้องออกแบบสคีมา/คิวรีเพิ่มเติม)

- 7) Admin Panel / Settings
	- User Management CRUD: IPCs `create-user`, `get-users`, `update-user`, `delete-user` ถูกนิยาม
	- Role Management: หน้า `adminManageRole.html` มี UI แต่ตรรกะ backend สำหรับการจัดการสิทธิยังจำกัด
	- PDPA: หน้า `adminManagePDPA1-5.html` มี แต่ยังไม่พบการเก็บ/จัดการ e-Consent/DPIA ในฐานข้อมูล

**Database Tables / Expected Columns (ตามโค้ด)**
- `users`: `user_id`, `first_name`, `last_name`, `email`, `password_hash`, `role_id`, `access_id`, `created_at`
- `patients`: `hospital_number`, `fname`, `lname`, `age`, `gender`, `id_number`, `phone_number`, `physician_id`, `hospital_id`, `request_date`, `report_date`, `weight`, `height`, `annotation`
- `physicians`: `physician_id`, `physician_name`
- `hospitals`: `hospital_id`, `hospital_name`

**Security (ที่แสดงในโค้ด)**
- `contextIsolation: true`, `nodeIntegration: false`, ใช้ `preload.js` เปิดเฉพาะ API ที่จำเป็น
- CSP ถูกตั้งค่าใน `main.js` (`onHeadersReceived`) จำกัด `connect-src` ให้กับ `*.supabase.co`
- รหัสผ่านถูกแฮชด้วย `bcrypt` ก่อนบันทึก

**Gaps / ข้อจำกัด (สิ่งที่ยังขาดจากสเปก)**
- TAT Tracking / KPI / Real-time Notifications: ยังไม่มีสคีมา/ตรรกะ
- e-Consent / DPIA / ROP: หน้า UI มีแต่ยังไม่พบการเชื่อมฐานข้อมูลหรือ IPC สำหรับจัดการ
- Integration (HIS/EMR FHIR, Analyzer ASTM/HL7): ยังไม่มี
- PDF generation / export / barcode printing: ยังไม่มีการสร้างไฟล์ PDF หรือพิมพ์ฉลากจากโค้ดหลัก (ปัจจุบันเป็น HTML view)
- Audit Log แบบศูนย์กลาง: หน้า `adminLogUsage.html` มี แต่ยังไม่พบระบบเก็บ log ครบวงจรใน `main.js`
- `express` อยู่ใน dependencies แต่ยังไม่ถูกใช้งาน

**Notes / Recommendations (Next Steps)**
- สร้างสคีมาฐานข้อมูลเพิ่มเติม: `TAT`, `KPI`, `eConsent`, `Specimen`, `AuditLog`
- เพิ่ม IPC/API สำหรับการรายงานและ export (CSV/PDF)
- พัฒนา CDS engine/logic สำหรับการแปลผล genotype (อาจแยกเป็นบริการย่อย)
- พิจารณาใช้ `express` หรือ service layer สำหรับ API ที่ต้องการให้ renderer เรียกผ่าน HTTP (ถ้าต้องการแยกความรับผิดชอบ)
- ปรับปรุงการจัดการ roles/permissions ให้ละเอียดขึ้น และลบการ hardcode `admin@gmail.com`

**คำสั่งที่ใช้บ่อย**

```pwsh
npm install
npm start
```

