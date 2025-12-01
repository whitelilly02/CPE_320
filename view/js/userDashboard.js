document.addEventListener('DOMContentLoaded', async () => {
  // โหลดชื่อผู้ใช้จาก sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const userNameBtn = document.querySelector('.newPatients');
  
  if (userNameBtn && currentUser.first_name) {
    userNameBtn.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
  }

  // โหลดสถิติ dashboard
  try {
    const result = await window.electronAPI.getDashboardStats();
    if (result.success) {
      const totalPatientsEl = document.querySelector('.stat-card.card-white .stat-value');
      if (totalPatientsEl) {
        totalPatientsEl.textContent = result.stats.totalPatients;
      }
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  }

  // โหลดแผนภูมิแท่ง
  try {
    console.log('🔄 Loading monthly patients...');
    const monthlyData = await window.electronAPI.getMonthlyPatients();
    console.log('📊 Monthly data:', monthlyData);
    
    if (!monthlyData || monthlyData.length === 0) {
      console.warn('⚠️ No monthly data available');
      return;
    }

    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    const labels = monthlyData.map(d => `${monthNames[d.month - 1]} ${d.year + 543}`);
    const counts = monthlyData.map(d => d.count);
    
    console.log('📈 Labels:', labels);
    console.log('📈 Counts:', counts);

    // รอให้ Chart.js โหลด
    if (typeof Chart === 'undefined') {
      console.error('❌ Chart.js not loaded');
      return;
    }

    const ctx = document.getElementById('barChart');
    console.log('🎨 Canvas element:', ctx);
    
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'ผู้ป่วยใหม่',
            data: counts,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { 
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
      console.log('✅ Chart created successfully');
    } else {
      console.error('❌ Canvas element not found');
    }
  } catch (err) {
    console.error('❌ Error loading bar chart:', err);
  }
});
