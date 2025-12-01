// รอให้หน้าเว็บโหลดเสร็จก่อน
document.addEventListener('DOMContentLoaded', () => {

    // ===== 1. ส่วนควบคุม POPUP (Modal) =====

    // --- ดึงองค์ประกอบหลัก ---
    const modal = document.getElementById('add-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('btn-cancel-modal');
    
    // --- ดึงฟอร์มและปุ่ม ---
    const modalForm = document.getElementById('modal-form');
    const modalTitle = document.getElementById('modal-title');
    const qcTypeInput = document.getElementById('modal-qc-type');
    const btnDelete = document.getElementById('btn-delete-modal');
    
    // --- ดึงช่องไฟล์ ---
    const fileInput = document.getElementById('modal-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    
    // --- ดึงช่องที่สลับกัน ---
    const iqcField = document.getElementById('iqc-field-group');
    const eqaInterlabField = document.getElementById('eqa-interlab-field-group');
    
    // --- ดึงปุ่มทริกเกอร์ (เพิ่ม) ---
    const btnIQC = document.getElementById('btnAddIQC');
    const btnEQA = document.getElementById('btnAddEQA');
    const btnInterLab = document.getElementById('btnAddInterLab');
    
    // --- ดึงลิงก์ทริกเกอร์ (แก้ไข) ---
    const editTriggerLinks = document.querySelectorAll('.edit-trigger');


    // --- ฟังก์ชันสำหรับเปิด Popup (รองรับ "เพิ่ม" และ "แก้ไข") ---
    const openModal = (title, qcType, editData = null) => {
        // ล้างฟอร์มทุกครั้งที่เปิด
        modalForm.reset(); 
        fileNameDisplay.textContent = ''; 

        if (editData) {
            // ======================
            //      โหมดแก้ไข
            // ======================
            modalTitle.textContent = title;
            // ตั้งค่า ID ที่ซ่อนไว้
            document.getElementById('modal-edit-id').value = editData.id; 
            
            // เติมข้อมูลลงในฟอร์ม
            document.getElementById('modal-test-number').value = editData.id;
            document.getElementById('modal-instrument').value = editData.instrument;
            document.getElementById('modal-date').value = editData.date;
            document.getElementById('modal-qc-type').value = editData.type;
            document.getElementById('modal-status').value = editData.status;
            document.getElementById('modal-notes').value = editData.notes;
            
            // เติมช่องที่สลับกัน
            document.getElementById('modal-value').value = editData.value;
            document.getElementById('modal-lab').value = editData.lab;

            // เติมชื่อไฟล์เดิม
            fileNameDisplay.textContent = editData.filename; 

            // ล็อกช่อง "ชนิดการตรวจ"
            qcTypeInput.readOnly = true;
            qcTypeInput.style.backgroundColor = "#f0f0f0";
            
            // แสดงปุ่ม "ลบ"
            btnDelete.classList.remove('hidden');

        } else {
            // ======================
            //      โหมดเพิ่ม
            // ======================
            modalTitle.textContent = title;
            qcTypeInput.value = qcType;
            
            // ล้าง ID ที่ซ่อนไว้
            document.getElementById('modal-edit-id').value = ''; 
            
            // ล็อกช่อง "ชนิดการตรวจ"
            qcTypeInput.readOnly = true;
            qcTypeInput.style.backgroundColor = "#f0f0f0";
            
            // ซ่อนปุ่ม "ลบ"
            btnDelete.classList.add('hidden');
        }

        // --- สลับช่อง (ทำงานทั้ง 2 โหมด) ---
        if (qcType === 'IQC') {
            iqcField.classList.remove('hidden');
            eqaInterlabField.classList.add('hidden');
        } else { // EQA หรือ Inter-Lab
            iqcField.classList.add('hidden');
            eqaInterlabField.classList.remove('hidden');
        }

        // --- แสดง Popup ---
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    };


    // --- ฟังก์ชันสำหรับปิด Popup ---
    const closeModal = () => {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
        modalForm.reset(); 
        fileNameDisplay.textContent = '';
        
        // ล้าง ID ที่ซ่อนไว้ด้วย
        const hiddenId = document.getElementById('modal-edit-id');
        if (hiddenId) {
            hiddenId.value = '';
        }
    };


    // ===== 2. กำหนด Event Listeners =====

    // --- ทริกเกอร์ "เพิ่ม" ---
    if (btnIQC) btnIQC.addEventListener('click', () => openModal('เพิ่มข้อมูล IQC', 'IQC'));
    if (btnEQA) btnEQA.addEventListener('click', () => openModal('เพิ่มข้อมูล EQA', 'EQA'));
    if (btnInterLab) btnInterLab.addEventListener('click', () => openModal('เพิ่มข้อมูล Inter-Lab', 'Inter-Lab'));

    // --- ทริกเกอร์ "แก้ไข" ---
    editTriggerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // ป้องกันลิงก์กระโดด
            
            // ใช้ .closest() เพื่อให้แน่ใจว่าได้ <a> แม้จะคลิกโดนไอคอน
            const triggerLink = e.target.closest('.edit-trigger');
            if (!triggerLink) return;
            
            const data = triggerLink.dataset; // ดึงข้อมูลจาก data-* ทั้งหมด
            openModal(`แก้ไขข้อมูล ${data.type}`, data.type, data); // ส่ง data เข้าฟังก์ชัน
        });
    });

    // --- ทริกเกอร์ "ปิด" ---
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // --- ทริกเกอร์ "ปุ่มลบ" (ใน Popup) ---
    if (btnDelete) {
        btnDelete.addEventListener('click', () => {
            const editId = document.getElementById('modal-edit-id').value;
            if (editId && confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล ${editId}?`)) {
                
                console.log(`--- กำลังลบข้อมูล ID: ${editId} ---`);
                // (ในอนาคต ตรงนี้คือส่วนที่ส่งคำสั่งลบไปที่ Server)

                alert(`ลบข้อมูล ${editId} เรียบร้อย!`);
                closeModal();
            }
        });
    }

    // --- จัดการการ "Submit" ฟอร์ม (ปุ่มยืนยัน) ---
    if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const editId = formData.get('edit-id'); // ดึง ID ที่ซ่อนไว้

            if (editId) {
                // ถ้ามี ID = โหมดแก้ไข
                console.log(`--- กำลังอัปเดตข้อมูล ID: ${editId} ---`);
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
                alert('อัปเดตข้อมูลเรียบร้อย! (ดูใน Console)');

            } else {
                // ถ้าไม่มี ID = โหมดเพิ่ม
                console.log('--- ข้อมูลในฟอร์ม (โหมดเพิ่ม) ---');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
                alert('บันทึกข้อมูลเรียบร้อย! (ดูใน Console)');
            }
            
            closeModal(); // ปิด Popup เมื่อเสร็จ
        });
    }

    // --- จัดการการแสดงชื่อไฟล์เมื่ออัปโหลด ---
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                // ถ้าผู้ใช้เลือกไฟล์ใหม่ ให้แสดงชื่อไฟล์ใหม่
                fileNameDisplay.textContent = fileInput.files[0].name;
            } else {
                // ถ้าผู้ใช้กด Cancel, ไม่ต้องทำอะไร
                // (ปล่อยให้ชื่อไฟล์เดิม (ในโหมดแก้ไข) หรือค่าว่าง (ในโหมดเพิ่ม) แสดงต่อไป)
            }
        });
    }

}); // <-- จบ DOMContentLoaded