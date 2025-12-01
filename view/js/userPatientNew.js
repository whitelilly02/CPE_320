document.addEventListener('DOMContentLoaded', async () => {
  // โหลดชื่อผู้ใช้จาก sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const userNameBtn = document.querySelector('.newPatients');
  if (userNameBtn && currentUser.first_name) {
    userNameBtn.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
  }

  // โหลดรายชื่อแพทย์
  try {
    const physicians = await window.electronAPI.getPhysicians();
    console.log('📋 Physicians loaded:', physicians);
    
    const physicianSelect = document.getElementById('physician-select');
    physicians.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.physician_id;
      opt.textContent = p.physician_name || `Physician ID: ${p.physician_id}`;
      physicianSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('❌ Error loading physicians:', err);
  }

  // โหลดรายชื่อโรงพยาบาล
  try {
    const hospitals = await window.electronAPI.getHospitals();
    console.log('🏥 Hospitals loaded:', hospitals);
    
    const hospitalSelect = document.getElementById('hospital-select');
    hospitals.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.hospital_id;
      opt.textContent = h.hospital_name || `Hospital ID: ${h.hospital_id}`;
      hospitalSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('❌ Error loading hospitals:', err);
  }
});
