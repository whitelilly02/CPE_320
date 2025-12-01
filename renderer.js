console.log("renderer.js loaded");
window.electronAPI.getUsers()

//
// Global store เก็บข้อมูลจาก Supabase
//
const Store = {
  users: [],

  setUsers(list) {
    this.users = list;
    console.log("📦 Users stored in Store:", this.users);
  },

  getUsers() {
    return this.users;
  }
};

//
// ดึงข้อมูลจาก main.js ผ่าน preload.js
//
async function loadUsers() {
  try {
    const user = await window.electronAPI.getUsers();
    Store.setUsers(user);     // เก็บในตัวแปร
    renderUsers(user);        // แสดงผลในหน้าเว็บ
  } catch (err) {
    console.error("❌ loadUsers Error:", err);
  }
}

//
// ฟังก์ชันแสดงผลในหน้าเว็บ (แก้ตาม UI ของคุณได้เลย)
//
function renderUsers(users) {
  const table = document.getElementById("user-table-body");
  if (!table) return;

  table.innerHTML = "";
  
const accessMap = {
  1: { text: 'Admin', class: 'badge-admin' },
  2: { text: 'User', class: 'badge-user' },
  3: { text: 'Manager', class: 'badge-manager' }
};

const roleMap = {
  1: 'แพทย์',
  2: 'เภสัช',
  3: 'นักเทคนิคการแพทย์',
  4: 'พนักงาน'
};


  users.forEach(u => {
  table.innerHTML += `
    <tr data-id="${u.user_id}">
      <td>${u.first_name} ${u.last_name}</td>
      <td>${u.email}</td>
      <td>${roleMap[u.role_id] || 'ไม่ทราบ'}</td>
      <td><span class="badge ${accessMap[u.access_id]?.class || 'badge-default'}">${accessMap[u.access_id]?.text || 'Unknown'}</span></td>
      <td>${new Date(u.created_at).toISOString().split('T')[0]}</td>

      <td>
        <button class="btn btn-edit" data-id="${u.user_id}">แก้ไข</button>
        <button class="btn btn-delete" data-id="${u.user_id}">ลบ</button>
      </td>
    </tr>
  `;
});
}

//
// โหลดข้อมูลตอนหน้าเว็บเปิด(delete this line if not needed)
//
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎉 DOM loaded — loading users...");
  loadUsers();
});
console.log("renderer.js loaded");


// Global store เก็บข้อมูลผู้ใช้งาน
const Store1 = {
  users: [],
  setUsers(list) {
    this.users = list;
    console.log("📦 Users stored in Store:", this.users);
  },
  getUsers() {
    return this.users;
  }
};

// ฟังก์ชันดึงข้อมูลจาก main process
async function loadUsers() {
  try {
    const user = await window.electronAPI.getUsers();
    Store.setUsers(user);
    renderUsers(user); // <-- เรียก renderUsers ที่เราสร้าง
  } catch (err) {
    console.error("❌ loadUsers Error:", err);
  }
}

// --------------------------------------------------
// ใส่ฟังก์ชัน renderUsers ตรงนี้เลย
// --------------------------------------------------
function renderUsers(users) {
    const table = document.getElementById("user-table-body");
    if (!table) return;

    table.innerHTML = "";

    const accessMap = {
      1: { text: 'Admin', class: 'badge-admin' },
      2: { text: 'User', class: 'badge-user' },
      3: { text: 'Manager', class: 'badge-manager' }
    };

    const roleMap = {
      1: 'แพทย์',
      2: 'เภสัช',
      3: 'นักเทคนิคการแพทย์',
      4: 'พนักงาน'
    };

    users.forEach(u => {
        table.innerHTML += `
        <tr>
            <td>${u.first_name} ${u.last_name}</td>
            <td>${u.email}</td>
            <td>${roleMap[u.role_id] || 'ไม่ทราบ'}</td>
            <td><span class="badge ${accessMap[u.access_id]?.class || 'badge-default'}">${accessMap[u.access_id]?.text || 'Unknown'}</span></td>
            <td>${new Date(u.created_at).toISOString().split('T')[0]}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" data-id="${u.user_id}">แก้ไข</button>
                    <button class="btn btn-delete" data-id="${u.user_id}">ลบ</button>
                </div>
            </td>
        </tr>
        `;
    });

    // เพิ่ม event listener สำหรับปุ่มลบ
    document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const userId = e.target.dataset.id;
        console.log("Clicked delete user ID:", userId); // debug
        if (!confirm("คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?")) return;

        try {
            const response = await window.electronAPI.deleteUser(userId);
            console.log("Delete response:", response); // debug
            if (response.success) {
                alert("ลบผู้ใช้เรียบร้อยแล้ว");
                await loadUsers();
            } else {
                alert(response.message || "ไม่สามารถลบผู้ใช้ได้");
            }
        }   catch (err) {
            console.error("Failed to delete user:", err);
            alert("เกิดข้อผิดพลาดในการลบผู้ใช้");
        }
    });
});

}



// ฟังก์ชันกรองผู้ใช้ตาม role
//
// function filterUsersByRole() {
//   const roleSelect = document.getElementById("role");
//   const selected = roleSelect.value;

//   let filteredUsers = Store.getUsers();

//   if (selected === "admin") {
//     filteredUsers = filteredUsers.filter(u => u.access_id === 1);
//   } 
//   else if (selected === "user") {
//     filteredUsers = filteredUsers.filter(u => u.access_id === 2);
//   }

//   renderUsers(filteredUsers);
// }

// //
// // Event เมื่อมีการเปลี่ยน role ใน select
// //
// document.getElementById("role").addEventListener("change", filterUsersByRole);
//
// ฟังก์ชันค้นหา + กรอง role พร้อมกัน
//
function applyFilters() {
  const roleSelect = document.getElementById("role_id").value;
  const searchText = document.getElementById("first_name").value.toLowerCase().trim();

  let list = Store.getUsers();

  // ------------------ Filter Role ------------------
  if (roleSelect === "admin") {
    list = list.filter(u => u.access_id === 1);
  } else if (roleSelect === "user") {
    list = list.filter(u => u.access_id === 2);
  }

  // ------------------ Search Username ------------------
  if (searchText !== "") {
    list = list.filter(u => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      const email = u.email.toLowerCase();

      return (
        fullName.includes(searchText) ||
        email.includes(searchText)
      );
    });
  }

  // แสดงผลหลังจากกรองเสร็จ
  renderUsers(list);
}
// เมื่อกดปุ่ม Search
// document.getElementById("search-form").addEventListener("submit", function (e) {
//   e.preventDefault();  // กันการ reload หน้า
//   applyFilters();
// });
const searchForm = document.getElementById("search-form");
if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    applyFilters();
  });
}

// document.getElementById("role").addEventListener("change", applyFilters);

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            // login logic
        });
    }

  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    

    if (!email || !password) {
      alert("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      const res = await window.electronAPI.login(email, password);

      
      if (!res.success) {
          alert(res.message);
          return;
      }

      // บันทึกข้อมูล user ลง sessionStorage
      sessionStorage.setItem('currentUser', JSON.stringify(res.user));

      // ✅ ถ้าเป็น admin ให้ไปหน้า admin-manage-user.html
      if (res.isAdmin) {
          window.location.href = "adminManageUser.html";
          return;
      }

      // ถ้าไม่ใช่ admin ใช้ role_id ตัดสินใจ
      switch (res.user.role_id) {
          case 1:
              window.location.href = "doctorReport.html";
              break;
          case 2:
              window.location.href = "pharmacyReport.html";
              break;
          case 3:
              window.location.href = "MedicalTechSend.html";
              break;
          case 4:
              window.location.href = "userDashboard.html";
              break;
          default:
              alert("role_id ไม่ถูกต้อง");
              break;
      }

    } catch (err) {
      console.error("Login failed:", err);
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  });
});
//login section end

//new patient section start
const patientForm = document.getElementById('patientForm');
if (patientForm) {
  patientForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        fname: document.querySelector('[name="firstName"]').value,
        lname: document.querySelector('[name="lastName"]').value,
        age: parseInt(document.querySelector('[name="age"]').value),
        gender: document.querySelector('[name="gender"]:checked')?.value,
        id_number: document.querySelector('[name="Idnumber"]').value,
        phone_number: document.querySelector('[name="phone"]').value,
        physician: document.querySelector('[name="physician"]').value, // ตอนนี้เป็น physician_id แล้ว
        hospital: document.querySelector('[name="hospital"]').value,   // ตอนนี้เป็น hospital_id แล้ว
        request_date: document.querySelector('[name="requestDate"]').value,
        report_date: document.querySelector('[name="reportedDate"]').value,
        weight: parseFloat(document.querySelector('[name="weightKg"]').value),
        height: parseFloat(document.querySelector('[name="heightCm"]').value),
        annotation: document.querySelector('[name="text"]').value
    };

    try {
        const res = await window.electronAPI.createPatient(data);
        if (res.success) {
            alert('บันทึกข้อมูลสำเร็จ');
        } else {
            alert('เกิดข้อผิดพลาด: ' + res.message);
        }
    } catch (err) {
        console.error('Error saving patient:', err);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  });
}

//ดึงข้อมูลแพทย์
document.addEventListener('DOMContentLoaded', async () => {
  // โหลดรายชื่อแพทย์
  const physicianSelect = document.getElementById('physician-select');
  if (physicianSelect) {
    try {
      const physicians = await window.electronAPI.getPhysicians();
      physicians.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.physician_id;
        opt.textContent = p.name;
        physicianSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error loading physicians:', err);
    }
  }

  // โหลดรายชื่อโรงพยาบาล
  const hospitalSelect = document.getElementById('hospital-select');
  if (hospitalSelect) {
    try {
      const hospitals = await window.electronAPI.getHospitals();
      hospitals.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h.hospital_id;
        opt.textContent = h.name;
        hospitalSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error loading hospitals:', err);
    }
  }
});


// โหลดข้อมูลผู้ใช้ตอนหน้าเว็บพร้อม
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎉 DOM loaded — loading users...");
  loadUsers();
});