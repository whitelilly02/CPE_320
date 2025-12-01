// รอให้หน้าเว็บโหลดเสร็จก่อนเริ่มทำงาน
document.addEventListener("DOMContentLoaded", () => {

    // ดึงองค์ประกอบ (elements) ที่จำเป็นทั้งหมด
    const modalOverlay = document.getElementById("modal-overlay");

    // Pop-up 1: ตำแหน่ง (Position)
    const positionModal = document.getElementById("position-modal");
    const positionModalTitle = document.getElementById("position-modal-title");
    const positionForm = document.getElementById("position-form");
    const btnAddPosition = document.getElementById("add-position-btn");
    const editPositionButtons = document.querySelectorAll(".edit-position-btn"); // เปลี่ยนเป็น querySelectorAll เพื่อดึงทุกปุ่มแก้ไข
    const deletePositionBtn = document.getElementById("delete-position-btn"); // ดึงปุ่มลบสำหรับตำแหน่ง

    // Pop-up 2: ใบรับรอง (ISO)
    const isoModal = document.getElementById("iso-modal");
    const isoModalTitle = document.getElementById("iso-modal-title");
    const isoForm = document.getElementById("iso-form");
    const btnAddISO = document.getElementById("add-iso-btn");
    const editIsoButtons = document.querySelectorAll(".edit-iso-btn"); // เปลี่ยนเป็น querySelectorAll
    const deleteIsoBtn = document.getElementById("delete-iso-btn"); // ดึงปุ่มลบสำหรับ ISO

    // ปุ่มปิด/ยกเลิก ทั้งหมด
    const closeButtons = document.querySelectorAll(".modal-close-btn");
    const cancelButtons = document.querySelectorAll(".btn-cancel");

    // --- ฟังก์ชันสำหรับเปิด/ปิด Modal ---

    // ฟังก์ชันเปิด Modal
    function openModal(modal) {
        modalOverlay.classList.remove("hidden");
        modal.classList.remove("hidden");
    }

    // ฟังก์ชันปิด Modal
    function closeModal() {
        modalOverlay.classList.add("hidden");
        // ซ่อน modal ทั้งหมด (เผื่อไว้)
        positionModal.classList.add("hidden");
        isoModal.classList.add("hidden");
    }

    // --- กำหนด Event Listeners ---

    // 1. ปุ่ม "เพิ่มตำแหน่ง"
    btnAddPosition.addEventListener("click", () => {
        positionModalTitle.textContent = "เพิ่มตำแหน่งใหม่";
        positionForm.reset(); // ล้างฟอร์มให้ว่าง
        deletePositionBtn.classList.add("hidden"); // ซ่อนปุ่มลบเมื่อเป็นการเพิ่ม
        openModal(positionModal);
    });

    // 2. ปุ่ม "แก้ไขตำแหน่ง" (วน loop เพื่อดักจับทุกปุ่ม)
    editPositionButtons.forEach(button => {
        button.addEventListener("click", () => {
            positionModalTitle.textContent = "แก้ไขตำแหน่ง";
            positionForm.reset(); // ล้างฟอร์มก่อน (เผื่อ)
            deletePositionBtn.classList.remove("hidden"); // แสดงปุ่มลบเมื่อเป็นการแก้ไข
            
            // --- ส่วนจำลองการเติมข้อมูลเดิม ---
            // ในระบบจริง คุณจะดึงข้อมูลนี้มาจากฐานข้อมูล
            // อาจจะดึงข้อมูลจาก Row ที่ถูกคลิก (ต้องมีการส่ง ID ของ Row เข้ามา)
            document.getElementById("role-name").value = "แพทย์";
            document.getElementById("perm-add-user").checked = true;
            document.getElementById("perm-check").checked = true;
            // -----------------------------------

            openModal(positionModal);
        });
    });

    // 3. ปุ่ม "ลบตำแหน่ง"
    deletePositionBtn.addEventListener("click", () => {
        const roleName = document.getElementById("role-name").value;
        if (confirm(`คุณแน่ใจหรือไม่ที่จะลบตำแหน่ง "${roleName}"?`)) {
            alert(`กำลังลบตำแหน่ง: ${roleName}`);
            // TODO: เพิ่มโค้ดสำหรับส่งคำขอลบไปยัง Server ที่นี่
            closeModal();
        }
    });


    // 4. ปุ่ม "เพิ่มมาตรฐาน ISO"
    btnAddISO.addEventListener("click", () => {
        isoModalTitle.textContent = "เพิ่มใบรับรอง";
        isoForm.reset(); // ล้างฟอร์ม
        deleteIsoBtn.classList.add("hidden"); // ซ่อนปุ่มลบเมื่อเป็นการเพิ่ม
        openModal(isoModal);
    });

    // 5. ปุ่ม "แก้ไขมาตรฐาน ISO" (วน loop)
    editIsoButtons.forEach(button => {
        button.addEventListener("click", () => {
            isoModalTitle.textContent = "แก้ไขใบรับรอง";
            isoForm.reset();
            deleteIsoBtn.classList.remove("hidden"); // แสดงปุ่มลบเมื่อเป็นการแก้ไข
            
            // --- ส่วนจำลองการเติมข้อมูลเดิม ---
            document.getElementById("iso-standard").value = "ISO 27001";
            document.getElementById("iso-number").value = "ISO-123456";
            document.getElementById("iso-issuer").value = "TUV NORD";
            document.getElementById("iso-issue-date").value = "2024-10-20";
            document.getElementById("iso-expiry-date").value = "2025-10-19";
            // -----------------------------------

            openModal(isoModal);
        });
    });

    // 6. ปุ่ม "ลบใบรับรอง"
    deleteIsoBtn.addEventListener("click", () => {
        const isoStandard = document.getElementById("iso-standard").value;
        if (confirm(`คุณแน่ใจหรือไม่ที่จะลบใบรับรอง "${isoStandard}"?`)) {
            alert(`กำลังลบใบรับรอง: ${isoStandard}`);
            // TODO: เพิ่มโค้ดสำหรับส่งคำขอลบไปยัง Server ที่นี่
            closeModal();
        }
    });


    // 7. ปุ่มปิด (X) และปุ่มยกเลิก
    closeButtons.forEach(button => {
        button.addEventListener("click", closeModal);
    });

    cancelButtons.forEach(button => {
        button.addEventListener("click", closeModal);
    });

    // 8. คลิกที่พื้นหลังสีเทาเพื่อปิด
    modalOverlay.addEventListener("click", closeModal);

});