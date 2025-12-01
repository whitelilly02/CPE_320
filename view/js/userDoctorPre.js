// ----- Load order from previous page or fallback to mock -----
function loadOrder() {
    try {
        const raw = localStorage.getItem('pgxOrderDraft');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed parsing pgxOrderDraft', e);
        return null;
    }
}

const fallbackMock = {
    patient: { name: 'N/A', hospital_number: 'N/A', physician_name: 'N/A' },
    tests: [],
    physician_order: '',
    patient_medication: '',
    drug_name: '',
    created_at: '',
    extra: { collectedAt: '', collector: '', specimenType: '', containerNo: '' }
};

// ----- RENDER FUNCTIONS -----
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? '';
}

function renderOrder(order) {
    // ชื่อ-เลข HN-แพทย์
    // Backward compatibility for old keys (hn, physician)
    setText('patient-name', order?.patient?.name);
    setText('patient-hn', order?.patient?.hospital_number || order?.patient?.hn);
    setText('physician', order?.patient?.physician_name || order?.patient?.physician);

    // ตารางรายการตรวจ
    const rowsHost = document.getElementById('order-rows');
    if (rowsHost) {
                rowsHost.innerHTML = (order?.tests ?? [])
                        .map(t => `
                    <div class="tr">
                        <div class="td code">${t.inspection_code ?? t.code ?? ''}</div>
                        <div class="td name">${t.inspection_name ?? t.name ?? ''}</div>
                    </div>
                `).join('');
    }

    // ข้อมูลเพิ่มเติม
    // Reason
    setText('physician_order', order?.physician_order || order?.reason);
    // Order date (prefer display format, else derive from ISO)
    let displayDate = order?.order_date_display;
    if (!displayDate && order?.order_date) {
        try {
            const d = new Date(order.order_date);
            displayDate = d.toLocaleString('th-TH', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            }).replace(',', '');
        } catch {}
    }
    setText('order-date', displayDate || '');
    // Order ID placeholder (will be replaced after DB insert if integrated)
    // ถ้ามี order_ids (array) ให้แสดงตัวแรก หรือ join
    let oid = order?.order_id || order?.id;
    if (!oid && Array.isArray(order?.order_ids) && order.order_ids.length > 0) {
        oid = order.order_ids[0]; // หรือ order.order_ids.join(', ')
    }
    setText('order-id', oid || '(รอสร้าง)');

    // Fill medicine note inputs if present
    // Note: In HTML, inputs are:
    // 1. name="drug_name" placeholder="รายละเอียด" (under "ชนิดของยาที่จะใช้ในการรักษา")
    // 2. name="patient_medication" placeholder="รายละเอียด" (under "ยาที่ผู้ป่วยได้รับในปัจจุบัน")
    
    const drugNameInput = document.querySelector('input[name="drug_name"]');
    if (drugNameInput) drugNameInput.value = order?.drug_name || order?.treatmentDrug || '';

    const medInput = document.querySelector('input[name="patient_medication"]');
    if (medInput) medInput.value = order?.patient_medication || order?.currentMeds || '';

    // Extra info (if later provided)
    setText('collected-at', order?.extra?.collectedAt);
    setText('collector', order?.extra?.collector);
    setText('specimen-type', order?.extra?.specimenType);
    setText('container-no', order?.extra?.containerNo);
}

// Attempt load and render
const loaded = loadOrder() || fallbackMock;
renderOrder(loaded);

document.addEventListener('DOMContentLoaded', () => {
    // ----- Update User Name in Header (Sync with Login) -----
    try {
        const raw = sessionStorage.getItem('currentUser');
        if (raw) {
            const u = JSON.parse(raw);
            const fullName = [u.first_name || u.fname, u.last_name || u.lname].filter(Boolean).join(' ');
            const nameBtn = document.querySelector('.newPatients');
            if (nameBtn && fullName) nameBtn.textContent = fullName;
        }
    } catch (e) {
        console.warn('Failed to load user info:', e);
    }
});

// ----- ตัวอย่างการเรียกใช้เมื่อได้ข้อมูลจาก backend -----
// Example future integration (replace localStorage):
// fetch('/api/orders/123')
//   .then(res => res.json())
//   .then(order => { renderOrder(order); localStorage.removeItem('pgxOrderDraft'); })
//   .catch(console.error);