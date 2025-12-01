let selectedPatientId = null; // Global variable to share state

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

    // ----- Load Patients & Physicians -----
    let allPatients = [];
    // selectedPatientId is now global

    const loadData = async () => {
        try {
            // Load Physicians
            const physicians = await window.electronAPI.getPhysicians();
            const docSelect = document.getElementById('physician-select');
            if (docSelect) {
                docSelect.innerHTML = '<option value="">-- เลือกแพทย์ --</option>';
                physicians.forEach(doc => {
                    const opt = document.createElement('option');
                    opt.value = doc.physician_id; // Assuming ID is needed, or name?
                    // If the order needs physician name text, we can store it.
                    // But usually we store ID. The current create-order doesn't seem to take physician_id, only physician_order (text).
                    // Wait, create-patient takes physician_id.
                    // create-order schema in main.js: users_id, physician_order, inspection_code...
                    // It doesn't seem to save the "Treating Physician" for the order itself, unless it's 'physician_order' (which is reason).
                    // The UI has "Physician" in patient info. This might be the patient's primary doctor.
                    // If so, it should be auto-filled from patient data, OR selected for this specific order.
                    // The user request says: "ชื่อรายการแพทย์ดึงมาจาก table physicians ... มันlink กับ physician_id"
                    // So I should probably allow selecting it.
                    opt.textContent = doc.physician_name;
                    docSelect.appendChild(opt);
                });
            }

            // Load Patients
            allPatients = await window.electronAPI.getPatients();
            const patSelect = document.getElementById('patient-select');
            if (patSelect) {
                patSelect.innerHTML = '<option value="">-- เลือกผู้ป่วย --</option>';
                allPatients.forEach(p => {
                    const opt = document.createElement('option');
                    const fullName = [p.fname, p.lname].filter(Boolean).join(' ');
                    const hn = p.hospital_number || '';
                    // Use users_id as value (fallback to id if users_id is missing)
                    opt.value = p.users_id || p.id || p.patient_id; 
                    opt.textContent = `${fullName}`;
                    patSelect.appendChild(opt);
                });
            }
        } catch (err) {
            console.error('Failed to load initial data:', err);
        }
    };
    loadData();

    // Handle Patient Selection
    const patSelect = document.getElementById('patient-select');
    const hnSpan = document.getElementById('patient-hn');
    const docSelect = document.getElementById('physician-select');
    
    if (patSelect) {
        patSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const found = allPatients.find(p => (p.users_id || p.id || p.patient_id) == val);

            if (found) {
                hnSpan.textContent = found.hospital_number || '-';
                selectedPatientId = val;
                
                // Auto-select physician if patient has one
                if (found.physician_id && docSelect) {
                    docSelect.value = found.physician_id;
                }
            } else {
                hnSpan.textContent = '-';
                selectedPatientId = null;
                if (docSelect) docSelect.value = "";
            }
        });
    }
});

// เมื่อกดปุ่มแท็บ เลือกรายการตรวจวินิจฉัย
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        // เอาคลาส active ออกจากทุกปุ่ม
        tabButtons.forEach((b) => b.classList.remove("active"));
        // ใส่คลาส active ให้ปุ่มที่ถูกคลิก
        btn.classList.add("active");

        // ซ่อนทุกแท็บ
        tabPanels.forEach((panel) => (panel.style.display = "none"));

        // แสดงเฉพาะแท็บที่เลือก
        const target = btn.getAttribute("data-tab");
        const panelsToShow = document.querySelectorAll(`#${target}, #${target}-2`);
        panelsToShow.forEach((p) => (p.style.display = "block"));
    });
});

// แสดงแท็บแรกตอนโหลด
document.addEventListener("DOMContentLoaded", () => {
    const defaultPanels = document.querySelectorAll("#tab-snp, #tab-snp-2");
    defaultPanels.forEach((p) => (p.style.display = "block"));
});

// แสดงรายการวินิจฉัย
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('selected-tests-body');
    const boxes = document.querySelectorAll('.chk input[type="checkbox"]');

    // เก็บรายการที่เลือก (key = code หรือ name)
    const selected = new Map();

    const escapeHtml = (s) =>
        String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

    const getKey = (el) => el.dataset.code || el.dataset.name;

    const addItem = (el) => {
        const code = el.dataset.code || '';
        const name = el.dataset.name || el.parentElement.textContent.trim();
        selected.set(getKey(el), { code, name });
    };

    const removeItem = (el) => {
        selected.delete(getKey(el));
    };

    const render = () => {
        const rows = Array.from(selected.values());

        // จัดเรียง: มี code มาก่อน -> เรียงตาม code (เลข/ตัวอักษร) -> ไม่มีก็เรียงตามชื่อ
        rows.sort((a, b) => {
            const aHas = !!a.code, bHas = !!b.code;
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;

            if (aHas && bHas) {
                const an = parseInt(a.code, 10), bn = parseInt(b.code, 10);
                if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
                return a.code.localeCompare(b.code, 'th');
            }
            return a.name.localeCompare(b.name, 'th');
        });

        tbody.innerHTML = rows.map(r =>
            `<tr>
         <td>${escapeHtml(r.code || '')}</td>
         <td>${escapeHtml(r.name)}</td>
       </tr>`
        ).join('');
    };

    // ผูก event และ preload รายการที่ถูกเช็คไว้แล้ว
    boxes.forEach(box => {
        if (box.checked) addItem(box);
        box.addEventListener('change', (e) => {
            if (e.target.checked) addItem(e.target);
            else removeItem(e.target);
            render();
        });
    });

    // แสดงผลครั้งแรก (กรณีมีค่าเช็คไว้ใน HTML)
    render();

    // ---- Submit Order Handler ----
    const submitBtn = document.getElementById('submit-order-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            try {
                const physician_order = document.getElementById('physician_order_input')?.value?.trim() || '';
                const patient_medication = document.getElementById('patient_medication_input')?.value?.trim() || '';
                const drug_name = document.getElementById('drug_name_input')?.value?.trim() || '';

                const testRows = Array.from(document.querySelectorAll('#selected-tests-body tr'));
                const tests = testRows.map(r => {
                    const cells = r.querySelectorAll('td');
                    return {
                        inspection_code: (cells[0]?.textContent || '').trim(),
                        inspection_name: (cells[1]?.textContent || '').trim()
                    };
                }).filter(t => t.inspection_code);

                if (tests.length === 0) {
                    alert('กรุณาเลือกรายการตรวจอย่างน้อย 1 รายการ');
                    return;
                }

                // ใช้ selectedPatientId ที่ได้จากการเลือกผู้ป่วย
                if (!selectedPatientId) {
                    alert('กรุณาเลือกผู้ป่วยจากรายการ (ค้นหาและเลือก)');
                    return;
                }
                const users_id = selectedPatientId;

                const createPayload = {
                    users_id,
                    physician_order,
                    patient_medication,
                    drug_name,
                    tests
                };
                submitBtn.disabled = true;
                submitBtn.textContent = 'กำลังบันทึก...';
                const res = await window.electronAPI.createOrder(createPayload);
                submitBtn.disabled = false;
                submitBtn.textContent = 'บันทึกการส่งตรวจ';
                if (!res.success) {
                    alert('บันทึกใบสั่งตรวจไม่สำเร็จ: ' + (res.message || 'ไม่ทราบสาเหตุ'));
                    return;
                }

                const now = new Date();
                const order_date = now.toISOString();
                const order_date_display = now.toLocaleString('th-TH', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                }).replace(',', '');

                // Get Physician Name
                const docSelect = document.getElementById('physician-select');
                const docName = docSelect && docSelect.selectedIndex >= 0 ? docSelect.options[docSelect.selectedIndex].text : '';

                const orderDraft = {
                    patient: {
                        name: document.getElementById('patient-select')?.options[document.getElementById('patient-select').selectedIndex]?.text?.trim() || '',
                        hospital_number: document.getElementById('patient-hn')?.textContent?.trim() || '',
                        physician_name: docName
                    },
                    physician_order,
                    patient_medication,
                    drug_name,
                    tests,
                    order_ids: res.order_ids || [],
                    order_date,
                    order_date_display,
                    created_at: order_date
                };
                localStorage.setItem('pgxOrderDraft', JSON.stringify(orderDraft));

                // เส้นทาง relative ไม่ใช้ /view/ เพื่อลด error Not allowed to load local resource
                window.location.href = 'userDoctorPre.html';
            } catch (err) {
                console.error('Failed to create order', err);
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลใบสั่งตรวจ');
                submitBtn.disabled = false;
                submitBtn.textContent = 'บันทึกการส่งตรวจ';
            }
        });
    }
});