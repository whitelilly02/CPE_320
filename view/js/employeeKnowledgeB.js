// รอให้ HTML โหลดเสร็จก่อน
document.addEventListener('DOMContentLoaded', () => {

    // --- เลือกปุ่มและหน้าต่างที่ต้องใช้ (เฉพาะของหน้า 2) ---
    // สังเกตว่าเราใช้ ID ที่ลงท้ายด้วย -p2

    const overlay = document.getElementById('modal-overlay-p2');

    // ป๊อปอัป "เพิ่ม"
    const openAddModalBtn = document.getElementById('open-add-modal-btn-p2');
    const addModal = document.getElementById('add-modal-p2');

    // ป๊อปอัป "แก้ไข"
    const openEditModalBtns = document.querySelectorAll('.edit-trigger-p2');
    const editModal = document.getElementById('edit-modal-p2');

    // ปุ่มปิด (ใช้คลาสเดิมจาก CSS)
    // เราต้องเลือกปุ่มปิดที่อยู่ในป๊อปอัปของหน้า 2 เท่านั้น
    const closeBtns = document.querySelectorAll('#add-modal-p2 .modal-close-btn-circle, #edit-modal-p2 .modal-close-btn-circle');
    const cancelBtns = document.querySelectorAll('#add-modal-p2 .btn-cancel-outline, #edit-modal-p2 .btn-cancel-outline');

    // --- ฟังก์ชันเปิด-ปิด (เหมือนเดิม) ---

    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        overlay.classList.add('active');
    }

    function closeModal() {
        // หาป๊อปอัปที่เปิดอยู่ (เฉพาะของหน้า 2)
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
        }
        overlay.classList.remove('active');
    }

    // --- การทำงานเมื่อคลิก (เฉพาะของหน้า 2) ---

    // 1. คลิกปุ่ม "+ เพิ่มเอกสารใหม่"
    if (openAddModalBtn) {
        openAddModalBtn.addEventListener('click', () => {
            openModal(addModal);
        });
    }

    // 2. คลิกที่รายการดาวน์โหลด (ปุ่มแก้ไข)
    openEditModalBtns.forEach(button => {
        button.addEventListener('click', () => {
            // (ในโค้ดจริง คุณจะต้องดึงข้อมูลของรายการที่คลิกมาใส่ในฟอร์มก่อน)
            openModal(editModal);
        });
    });

    // 3. คลิกปุ่ม X (ปิด)
    closeBtns.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // 4. คลิกปุ่ม "ยกเลิก"
    cancelBtns.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // 5. คลิกที่พื้นหลังสีเทา (ปิด)
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

});