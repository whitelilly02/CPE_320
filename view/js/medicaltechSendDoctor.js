// ===== Pre-Doctor.js =====
document.addEventListener('DOMContentLoaded', () => {
    // แสดงชื่อผู้ใช้ที่ login
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const userNameBtn = document.querySelector('.newPatients');
    
    if (userNameBtn && currentUser.first_name) {
        userNameBtn.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    }

    const qp = new URLSearchParams(window.location.search);

    // อ่านค่าที่ส่งมาจากหน้า Send.html
    const patientName = qp.get('patientName') || 'ไม่ระบุ';
    const hn = qp.get('hn') || '-';
    const doctor = qp.get('doctor') || '-';
    const orderId = qp.get('orderId') || '-';
    const orderName = qp.get('orderName') || '-';
    const orderNo = qp.get('orderNo') || 'TR0000';
    const orderDate = qp.get('orderDate') || '30/10/2025';
    const specimenType = qp.get('specimenType') || 'Blood/EDTA';
    const container = qp.get('container') || 'TUBE000000';
    const collectedAt = qp.get('collectedAt') || '29/10/2023 10:30';
    const collector = qp.get('collector') || 'คุณสมชาย ทดสอบ';

    // ฟังก์ชันใส่ค่าใน DOM
    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    // ✅ ใส่ค่าลง DOM
    setText('patient-name', patientName);
    setText('patient-hn', hn);
    setText('physician', doctor);
    setText('collected-at', collectedAt);
    setText('collector', collector);
    setText('specimen-type', specimenType);
    setText('container-no', container);
    setText('order-no', orderNo);
    setText('order-date', orderDate);

    // ✅ เติมข้อมูลในตารางตรวจ
    const tbody = document.getElementById('order-rows');
    if (tbody) {
        tbody.innerHTML = `
      <div class="tr">
        <div class="td code">${orderId}</div>
        <div class="td name">${orderName}</div>
      </div>
    `;
    }
});
