// ---------------------------------------------
// GLOBAL VARIABLE
// ---------------------------------------------
let editingUserId = null;

// ---------------------------------------------
// 1. เลือกองค์ประกอบ (Element) ที่ต้องใช้
// ---------------------------------------------
const modalOverlay = document.getElementById('user-modal-overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalTitle = document.getElementById('modal-title');

const createUserBtn = document.querySelector('.add-user-button');
const confirmBtn = document.querySelector('.confirm-btn');

const modalFirstname = document.getElementById('modal-firstname');
const modalLastname = document.getElementById('modal-lastname');
const modalEmail = document.getElementById('modal-email');
const modalPassword = document.getElementById('modal-password');
const modalJobRole = document.getElementById('modal-job-role');
const modalAccessLevel = document.getElementById('modal-access-level');
const modalConfirmPassword = document.getElementById('modal-confirm-password');

// ---------------------------------------------
// ฟังก์ชันปิด Modal
// ---------------------------------------------
function closeTheModal() {
    modalOverlay.style.display = "none";
    editingUserId = null; // reset โหมดแก้ไข
}

// ---------------------------------------------
// 2. เปิด Modal เพื่อ "เพิ่มผู้ใช้ใหม่"
// ---------------------------------------------
createUserBtn.addEventListener("click", function () {

    modalOverlay.classList.remove("modal-is-editing");
    modalTitle.textContent = "เพิ่มข้อมูลผู้ใช้งาน";

    modalFirstname.value = "";
    modalLastname.value = "";
    modalEmail.value = "";
    modalPassword.value = "";
    modalConfirmPassword.value = "";
    modalJobRole.value = "";
    modalAccessLevel.value = "";

    editingUserId = null;

    modalOverlay.style.display = "flex";
});

// ---------------------------------------------
// 3. เปิด Modal เพื่อ "แก้ไขผู้ใช้"
// (ใช้ Event Delegation เพราะปุ่มถูกสร้าง dynamic)
// ---------------------------------------------
document.addEventListener("click", function (e) {
    if (!e.target.classList.contains("btn-edit")) return;

    const userId = e.target.getAttribute("data-id");
    editingUserId = userId;

    modalOverlay.classList.add("modal-is-editing");
    modalTitle.textContent = "แก้ไขข้อมูลผู้ใช้งาน";

    // ดึงข้อมูล user จาก Store (มาจาก renderer.js)
    const user = Store.users.find(u => u.user_id == userId);

    modalFirstname.value = user.first_name;
    modalLastname.value = user.last_name;
    modalEmail.value = user.email;

    modalJobRole.value = user.role_id;
    modalAccessLevel.value = user.access_id;

    modalPassword.value = "";
    modalConfirmPassword.value = "";

    modalOverlay.style.display = "flex";
});

// ---------------------------------------------
// 4. ปิด Modal
// ---------------------------------------------
closeModalBtn.addEventListener('click', closeTheModal);

window.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
        closeTheModal();
    }
});

// ---------------------------------------------
// 5. ปุ่ม "ยืนยัน"
// ---------------------------------------------
confirmBtn.addEventListener('click', async function (event) {
    event.preventDefault();
    
    // ดึงค่าจาก input ก่อนทุกอย่าง
    const firstname = modalFirstname.value.trim();
    const lastname = modalLastname.value.trim();
    const email = modalEmail.value.trim();
    const password = modalPassword.value.trim();
    const confirmPassword = modalConfirmPassword.value.trim();
    const jobRole = modalJobRole.value;
    const accessLevel = modalAccessLevel.value;

    const roleMap = { 
        'doctor': 1,           // แพทย์
        'pharmacist': 2,       // เภสัช
        'medical-staff': 3,    // นักเทคนิคการแพทย์
        'staff': 4             // พนักงาน
    };
    const accessMap = { 'admin': 1, 'user': 2 };

    // const selectedRole = roleMap[jobRole] ?? 4;       // default = พนักงาน
    // const selectedAccess = accessMap[accessLevel.toLowerCase()] ?? 2; // default = User
    // Validate inputs
    if (!firstname || !lastname || !email || !jobRole || !accessLevel) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }


    // ---------------------------------------------
    // MODE : EDIT USER
    // ---------------------------------------------
    if (modalOverlay.classList.contains('modal-is-editing')) {
    const updatedUser = {
        user_id: editingUserId,
        first_name: firstname,
        last_name: lastname,
        email: email,
        role_id: roleMap[jobRole],
        access_id: accessMap[accessLevel],
    };

    const response = await window.electronAPI.updateUser(updatedUser);
    if (response.success) {
        alert("แก้ไขข้อมูลผู้ใช้งานสำเร็จ");
        closeTheModal();
        await loadUsers();
    } else {
        alert(response.error || "ไม่สามารถแก้ไขข้อมูลผู้ใช้ได้");
    }

    return;
}


    // ---------------------------------------------
    // MODE : CREATE USER
    // ---------------------------------------------
    if (!password || !confirmPassword) {
        alert("กรุณากรอกรหัสผ่าน");
        return;
    }

    if (password !== confirmPassword) {
        alert("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
        return;
    }

    const response = await window.electronAPI.createUser({
        firstname,
        lastname,
        email,
        password,
        job_role: roleMap[jobRole],
        access_level: accessMap[accessLevel.toLowerCase()]
    });

    if (response.success) {
        alert("เพิ่มผู้ใช้เรียบร้อยแล้ว");
        closeTheModal();
        await loadUsers();
    } else {
        alert(response.message || "ไม่สามารถเพิ่มผู้ใช้ได้");
    }
});

document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault(); // ป้องกัน reload หน้า
  
  const username = document.getElementById('username').value.toLowerCase();
  const role = document.getElementById('role').value;
  
  const allUsers = Store.users; // ดึงจาก Store
  
  let filtered = allUsers.filter(u => {
    const nameMatch = username === '' || 
                      `${u.first_name} ${u.last_name}`.toLowerCase().includes(username);
    const roleMatch = role === 'all' || 
                      (role === 'admin' && u.access_id === 1) || 
                      (role === 'user' && u.access_id === 2);
    return nameMatch && roleMatch;
  });
  
  renderUsers(filtered);
});

