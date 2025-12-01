// ===== Mock data (รอเชื่อม backend) =====
const ORDERS = [
    {
        orderNo: "TOR0011",
        hn: "HN00001",
        patientName: "นายเทส ทดสอบ",
        testCode: "400094",
        doctor: "อิสราพงษ์ ซุ่นฮ้อ",
        date: "30/10/2025",

        orderId: "400094",
        orderName: "Genomic DNA Extraction",
        specimenType: "Blood/EDTA",
        minVolume: "3–6 mL, 1–2 หลอด",
        container: "TUBE123456",
        transportTemp: "20–25 องศา",
        reason: "*เหตุผลตรวจ*",
        regimen: "*ระบุยาใช้ในการรักษา*",
        currentMeds: "*ระบุที่ผู้ป่วยได้รับ*"
    },
    {
        orderNo: "TOR0012",
        hn: "HN00002",
        patientName: "นายราม บัวเอี่ยม",
        testCode: "410028",
        doctor: "สุภาวรรรณ แก้วมณี",
        date: "30/10/2025",

        orderId: "410028",
        orderName: "Genomic DNA Extraction",
        specimenType: "Blood/EDTA",
        minVolume: "3–6 mL, 1–2 หลอด",
        container: "TUBE987654",
        transportTemp: "2–8 องศา",
        reason: "*สงสัยภาวะทางพันธุกรรม*",
        regimen: "*จะใช้ยาตามแนวทาง*",
        currentMeds: "*ASA 81 mg*"
    }
];

// โหลดชื่อผู้ใช้และข้อมูลใบสั่งตรวจจาก database
document.addEventListener('DOMContentLoaded', async () => {
    // แสดงชื่อผู้ใช้
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const userNameBtn = document.querySelector('.newPatients');
    
    if (userNameBtn && currentUser.first_name) {
        userNameBtn.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    }

    // โหลดข้อมูลใบสั่งตรวจ
    try {
        console.log('🔄 Loading orders...');
        const orders = await window.electronAPI.getOrders();
        console.log('📊 Orders data:', orders);
        renderOrdersTable(orders);
    } catch (err) {
        console.error('❌ Error loading orders:', err);
        renderOrdersTable([]);
    }
});

// ===== DOM refs =====
const tbody = document.getElementById('orderTbody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.querySelector('.search-button');

// ฟอร์มด้านขวา
const $ = (id) => document.getElementById(id);
const fields = {
    orderId: $('orderId'),
    orderName: $('orderName'),
    specimenType: $('specimenType'),
    minVolume: $('minVolume'),
    container: $('container'),
    transportTemp: $('transportTemp'),
    reason: $('reason'),
    regimen: $('regimen'),
    currentMeds: $('currentMeds'),
};

// ปุ่ม
const btnViewOrder = document.getElementById('btnViewOrder');
const btnAccept = document.getElementById('btnAccept');
const btnReject = document.getElementById('btnReject');
const btnPrint = document.getElementById('btnPrint');

// ===== state =====
let ordersData = [];
let selectedIndex = -1;

// ===== ฟังก์ชันแสดงตาราง =====
function renderOrdersTable(orders) {
    ordersData = orders;
    const tbody = document.getElementById('orderTbody');
    tbody.innerHTML = '';

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">ไม่มีข้อมูล</td></tr>';
        return;
    }

    orders.forEach((order, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.hospitalNumber}</td>
            <td>${order.inspectionCode}</td>
            <td>${order.physicianName}</td>
            <td>${order.orderDate}</td>
        `;
        
        // เมื่อคลิกแถว
        tr.addEventListener('click', () => {
            document.querySelectorAll('#orderTbody tr').forEach(r => r.classList.remove('active-row'));
            tr.classList.add('active-row');
            selectedIndex = idx;
            showOrderDetail(order);
        });

        tbody.appendChild(tr);
    });
}

// ===== แสดงรายละเอียด =====
function showOrderDetail(order) {
    // เติมข้อมูลลงฟอร์ม
    document.getElementById('orderId').value = order.orderId || '';
    document.getElementById('orderName').value = 'Genomic DNA Extraction'; // ค่าเริ่มต้น
    document.getElementById('specimenType').value = 'Blood/EDTA';
    document.getElementById('minVolume').value = '3–6 mL';
    document.getElementById('container').value = '';
    document.getElementById('transportTemp').value = '20–25 องศา';
    document.getElementById('reason').value = '';
    document.getElementById('regimen').value = '';
    document.getElementById('currentMeds').value = '';
    
    // แสดงปุ่มโดยเพิ่ม class active
    const panelDetail = document.querySelector('.panel-detail');
    if (panelDetail) {
        panelDetail.classList.add('active');
    }
}

// ===== ฟังก์ชันค้นหา =====
document.querySelector('.search-button')?.addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = ordersData.filter(order => 
        order.hospitalNumber.toLowerCase().includes(searchTerm) ||
        order.physicianName.toLowerCase().includes(searchTerm) ||
        order.inspectionCode.toLowerCase().includes(searchTerm)
    );
    renderOrdersTable(filtered);
    
    // ซ่อนปุ่มเมื่อค้นหาใหม่
    selectedIndex = -1;
    const panelDetail = document.querySelector('.panel-detail');
    if (panelDetail) {
        panelDetail.classList.remove('active');
    }
});

// ===== ปุ่มต่างๆ =====
document.getElementById('btnAccept')?.addEventListener('click', () => {
    if (selectedIndex === -1) {
        alert('กรุณาเลือกใบสั่งตรวจก่อน');
        return;
    }
    alert('ยืนยันสิ่งส่งตรวจสำเร็จ');
});

document.getElementById('btnReject')?.addEventListener('click', () => {
    if (selectedIndex === -1) {
        alert('กรุณาเลือกใบสั่งตรวจก่อน');
        return;
    }
    alert('ปฏิเสธสิ่งส่งตรวจ');
});

document.getElementById('btnPrint')?.addEventListener('click', () => {
    if (selectedIndex === -1) {
        alert('กรุณาเลือกใบสั่งตรวจก่อน');
        return;
    }
    // ส่งข้อมูลไปยังหน้า BarcodePatient.html
    const selectedOrder = ordersData[selectedIndex];
    sessionStorage.setItem('selectedOrder', JSON.stringify(selectedOrder));
    window.location.href = 'medicaltechSendBarcode.html';
});


document.getElementById('btnViewOrder')?.addEventListener('click', () => {
    if (selectedIndex === -1) {
        alert('กรุณาเลือกใบสั่งตรวจก่อน');
        return;
    }
    
    const selectedOrder = ordersData[selectedIndex];
    const params = new URLSearchParams({
        orderId: selectedOrder.orderId || '',
        orderName: 'Genomic DNA Extraction',
        patientName: selectedOrder.patientName || 'ไม่ระบุ',
        hn: selectedOrder.hospitalNumber || '',
        doctor: selectedOrder.physicianName || '',
        collectedAt: new Date().toLocaleString('th-TH'),
        collector: 'เจ้าหน้าที่'
    });

    window.location.href = `medicaltechSendDoctor.html?${params.toString()}`;
});