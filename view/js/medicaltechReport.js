// โหลดชื่อผู้ใช้จาก sessionStorage และโหลดข้อมูลรายงาน
document.addEventListener('DOMContentLoaded', async () => {
  // แสดงชื่อผู้ใช้
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const userNameBtn = document.querySelector('.newPatients');
  
  if (userNameBtn && currentUser.first_name) {
    userNameBtn.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
  }

  // โหลดข้อมูลรายงานจาก database
  try {
    console.log('🔄 Loading patient reports...');
    const reportData = await window.electronAPI.getPatientReports();
    console.log('📊 Report data:', reportData);
    renderReportTable(reportData);
  } catch (err) {
    console.error('❌ Error loading reports:', err);
    // แสดงข้อมูลตัวอย่างถ้า error
    renderReportTable([]);
  }
});

// ฟังก์ชันแสดงข้อมูลในตาราง
function renderReportTable(data) {
  const tbody = document.getElementById("report-body");
  tbody.innerHTML = ""; // เคลียร์ของเก่าออก

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">ไม่มีข้อมูล</td></tr>';
    return;
  }
  
  data.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.no}</td>
      <td>${item.fullName}</td>
      <td>${item.hn}</td>
      <td><span class="badge">${item.status}</span></td>
      <td>${item.genotype}</td>
      <td><button class="muted-btn" onclick="editRow(${item.patientId})">แก้ไข</button></td>
      <td><button class="select-btn" onclick="viewResult(${item.patientId})">เลือก</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ✅ ฟังก์ชันเมื่อกดปุ่ม "แก้ไข"
function editRow(patientId) {
  // ส่ง patient_id ไปยังหน้ารายละเอียด
  window.location.href = `medicaltechReportCYP2D6.html?id=${patientId}`;
}

// เมื่อกดปุ่ม "เลือก"
function viewResult(patientId) {
  // ส่ง patient_id ไปยังหน้าผลตรวจ
  window.location.href = `medicaltechReportCYP2D6Detail.html?id=${patientId}`;
}

//ปุ่ม 3 ปุ่ม ใน menu
document.addEventListener("DOMContentLoaded", () => {
  // ดึงชื่อไฟล์ปัจจุบัน เช่น "Report.html"
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();

  // ดึงปุ่มทั้งหมดในเมนู
  const menuItems = document.querySelectorAll(".menu-item");

  // วนเช็กแต่ละปุ่ม
  menuItems.forEach((item) => {
    const text = item.textContent.trim().toLowerCase();

    if (
      (currentPage.includes("dashboard") && text === "dashboard") ||
      (currentPage.includes("patients") && text === "patients") ||
      (currentPage.includes("report") && text === "report")
    ) {
      item.classList.add("active");
    }
  });
});
