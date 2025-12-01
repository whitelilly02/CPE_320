// รอให้ HTML โหลดเสร็จก่อน
document.addEventListener('DOMContentLoaded', () => {

    // --- เลือกปุ่มและหน้าต่างที่ต้องใช้ ---
    const overlay = document.getElementById('modal-overlay');

    // ป๊อปอัป "เพิ่ม"
    const openAddModalBtn = document.getElementById('open-add-modal-btn');
    const addModal = document.getElementById('add-modal');

    // ป๊อปอัป "แก้ไข"
    const openEditModalBtns = document.querySelectorAll('.edit-trigger');
    const editModal = document.getElementById('edit-modal');

    // --- [อัปเดต] ---
    // ปุ่มปิด (ปุ่ม X และ ปุ่มยกเลิก)
    // เปลี่ยนตัวเลือก (selector) ให้ตรงกับคลาสใหม่
    const closeBtns = document.querySelectorAll('.modal-close-btn-circle');
    const cancelBtns = document.querySelectorAll('.btn-cancel-outline');
    // --- [จบ อัปเดต] ---


    // --- ฟังก์ชันเปิด-ปิด ---
    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        overlay.classList.add('active');
    }

    function closeModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
        }
        overlay.classList.remove('active');
    }

    // --- การทำงานเมื่อคลิก ---

    // 1. คลิกปุ่ม "+ เพิ่มเอกสารใหม่"
    openAddModalBtn.addEventListener('click', () => {
        openModal(addModal);
    });

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
    overlay.addEventListener('click', closeModal);

});