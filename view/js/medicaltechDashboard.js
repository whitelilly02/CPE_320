document.addEventListener('DOMContentLoaded', async () => {
  // โหลดชื่อผู้ใช้จาก sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const userNameBtn = document.querySelector('.newPatients');
  
  if (userNameBtn && currentUser.first_name) {
    userNameBtn.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
  }

  // โหลดสถิติจาก database
  try {
    const result = await window.electronAPI.getDashboardStats();
    if (result.success) {
      // แสดงจำนวนผู้ตรวจทั้งหมด
      const totalPatientsElement = document.querySelector('.stat-card.card-white .stat-value');
      if (totalPatientsElement) {
        totalPatientsElement.textContent = result.stats.totalPatients;
      }
    }
  } catch (err) {
    console.error('❌ Error loading dashboard stats:', err);
  }
});
