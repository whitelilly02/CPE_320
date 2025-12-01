// BarcodePatient.js
window.addEventListener('DOMContentLoaded', () => {
    const raw = sessionStorage.getItem('selectedOrder');
    if (!raw) return;

    const o = JSON.parse(raw);

    const setText = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.textContent = v ?? '';
    };

    // ส่วนหัว
    setText('order-date', o.date);
    setText('order-no', o.orderNo);

    // ข้อมูลผู้ป่วย
    setText('patient-name', o.patientName);
    setText('patient-hn', o.hn);
    setText('physician', o.doctor);

    // กล่องบาร์โค้ด
    setText('barcode-specimen', o.specimenType);
    setText('barcode-info', `${o.orderId} ${o.orderName}`);
    setText('barcode-patient', `${o.patientName}  ${o.hn}`);

    // ข้อมูลเพิ่มเติม
    setText('specimen-type', o.specimenType);
    setText('container-no', o.container);

    setText('collected-at', '29/10/2023 10:30');
    setText('collector', 'คุณสมชาย ทดสอบ');

    // (ถ้ามีค่าจริง ในอนาคตค่อยใส่ collected-at / collector)
});