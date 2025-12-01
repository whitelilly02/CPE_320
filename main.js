// โหลดค่า .env
require('dotenv').config()


// Modules ที่ต้องใช้
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcrypt')

// import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  app.quit()
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// สร้างหน้าต่างหลัก

let win; // ประกาศตัวแปรใน scope ระดับ global

function createWindow() {
  // ถ้ามีหน้าต่างอยู่แล้ว ไม่ต้องสร้างใหม่
  if (BrowserWindow.getAllWindows().length > 0) {
    return;
  }

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // โหลดไฟล์ HTML
  win.loadFile(path.join(__dirname, 'view', 'loginMain.html'))
    .catch((err) => {
      console.error('Failed to load admin-manage-user.html:', err);
    });

  

  // CSP header configuration (extended for Google Fonts) + debug output
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const csp = [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline';",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
      "style-src-elem 'self' https://fonts.googleapis.com 'unsafe-inline';",
      "font-src 'self' https://fonts.gstatic.com data:;",
      "connect-src 'self' https://*.supabase.co;",
      "img-src 'self' data:;",
      "object-src 'none';"
    ].join(' ');
    console.log('[CSP Applied]', csp);
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
          "style-src-elem 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
          "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; " +
          "img-src 'self' data:; " +
          "connect-src 'self' https://*.supabase.co; " +
          "object-src 'none';"
        ]
      }
    });
  });

  // เมื่อปิดหน้าต่าง ให้รีเซ็ตตัวแปร
  win.on('closed', () => {
    win = null;
  });
}

// เรียกเมื่อแอปพร้อม
app.whenReady().then(createWindow);

// ปิดแอปเมื่อปิดทุกหน้าต่าง (ยกเว้น macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// สำหรับ macOS: สร้างหน้าต่างใหม่เมื่อคลิกไอคอนแอป
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// Event: สร้างผู้ใช้ใหม่
ipcMain.handle('create-user', async (event, userData) => {
  const { firstname, lastname, email, password, job_role, access_level } = userData

  console.log('📥 Received userData:', userData);
  console.log('📝 job_role:', job_role, 'type:', typeof job_role);
  console.log('📝 access_level:', access_level, 'type:', typeof access_level);

  // เข้ารหัสรหัสผ่าน
  const hashedPassword = await bcrypt.hash(password, 10)

  // Frontend ส่งตัวเลขมาแล้ว ไม่ต้องแปลง
  const selectedRoleId = job_role;
  const selectedAccessId = access_level;

  console.log('✅ Using role_id:', selectedRoleId);
  console.log('✅ Using access_id:', selectedAccessId);

  // บันทึกลง Supabase
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        first_name: firstname,
        last_name: lastname,
        email: email,
        password_hash: hashedPassword,
        role_id: selectedRoleId,
        access_id: selectedAccessId,
        created_at: new Date(),
      },
    ])

  if (error) {
    console.error('Supabase Error:', error)
    return { success: false, message: error.message }
  }

  return { success: true, message: 'User added successfully', data }
})

// Event: ดึงรายชื่อผู้ใช้งานทั้งหมด
ipcMain.handle('get-users', async () => {
  const { data, error } = await supabase
    .from('users')
    .select('user_id,first_name, last_name, email, role_id, access_id, created_at')
    .order('user_id', { ascending: true })
    

  if (error) {
    console.error('Supabase get-users Error:', error)
    throw new Error(error.message)
  }

  return data ?? []
})
// App พร้อมใช้งาน
ipcMain.handle('update-user', async (event, updatedUser) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      role_id: updatedUser.role_id,
      access_id: updatedUser.access_id
    })
    .eq('user_id', updatedUser.user_id);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
});
// Event: ลบผู้ใช้งาน
ipcMain.handle('delete-user', async (event, userId) => {
  console.log("Deleting user ID:", userId);

  if (!userId) {
    return { success: false, message: "userId ไม่ถูกต้อง" };
  }

  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error("Supabase delete-user error:", error);
    return { success: false, message: error.message };
  }

  console.log("Deleted user:", data);
  return { success: true, data };
  });

  //login event
 ipcMain.handle('login', async (event, { email, password }) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .single();

    if (error || !user) {
        return { success: false, message: "Email ไม่ถูกต้อง" };
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return { success: false, message: "รหัสผ่านไม่ถูกต้อง" };
    }

    // ✅ เพิ่ม flag สำหรับ admin
    const isAdmin = email.toLowerCase() === 'admin@gmail.com';

    return {
        success: true,
        isAdmin, // ส่งไปให้ renderer
        user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            role_id: user.role_id,
            access_id: user.access_id
        }
    };
});

//new patient section start
ipcMain.handle('create-patient', async (event, patientData) => {
    try {
        const { data, error } = await supabase
            .from('patients')
            .insert([{
                hospital_number: patientData.id_number,
                fname: patientData.fname,
                lname: patientData.lname,
                age: patientData.age,
                gender: patientData.gender,
                id_number: patientData.id_number,
                phone_number: patientData.phone_number,
                physician_id: parseInt(patientData.physician) || null,
                hospital_id: parseInt(patientData.hospital) || null,
                request_date: patientData.request_date,
                report_date: patientData.report_date,
                weight: patientData.weight,
                height: patientData.height,
                annotation: patientData.annotation
            }]);

        if (error) {
            console.error('Insert error:', error);
            return { success: false, message: error.message };
        }

        return { success: true, message: 'Patient added successfully', data };
    } catch (err) {
        console.error('Create patient error:', err);
        return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
    }
});

// Event: ดึงรายชื่อแพทย์
ipcMain.handle('get-physicians', async () => {
  const { data, error } = await supabase
    .from('physicians')
    .select('physician_id,physician_name')
    .order('physician_name', { ascending: true });

  if (error) {
    console.error('Supabase get-physicians Error:', error);
    throw new Error(error.message);
  }

  return data ?? [];
});
// Event: ดึงรายการตรวจพร้อมข้อมูลผู้ป่วยและ gene
ipcMain.handle('get-patient-orders', async () => {
  console.log('[IPC] get-patient-orders invoked');
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        inspection_code,
        status_id,
        status:status_id (
          status_name
        ),
        order_date,
        patient:users_id (
          users_id,
          hospital_number,
          fname,
          lname
        ),
        inspection:inspection_code (
          inspection_code,
          inspection_name,
          gene:gene_id (
            gene_id,
            gene_name
          )
        )
      `)
      .order('order_date', { ascending: false })

    if (error) {
      console.error('Supabase get-patient-orders Error:', error)
      throw new Error(error.message)
    }
    console.log('[IPC] get-patient-orders rows:', (data || []).length)
    return data ?? []
  } catch (err) {
    console.error('get-patient-orders failed:', err)
    throw err
  }
})

// Event: ดึงรายละเอียดใบสั่งตรวจ (Single Order)
ipcMain.handle('get-order-detail', async (event, orderId) => {
  console.log('[IPC] get-order-detail invoked for:', orderId);
  try {
    if (!orderId) return null;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        status:status_id (status_name),
        patient:users_id (
          users_id,
          hospital_number,
          fname,
          lname
        ),
        inspection:inspection_code (
          inspection_code,
          inspection_name,
          gene:gene_id (
            gene_id,
            gene_name
          )
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('Supabase get-order-detail Error:', error);
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    console.error('get-order-detail failed:', err);
    throw err;
  }
});

// Event: ดึงผล CYP2C9/CYP2D6 ตามค่า allele ที่ป้อน (ใช้ตาราง cyp2d6 ตาม schema ที่ให้มา)
ipcMain.handle('get-cyp2c9-result', async (event, { var2, var3 }) => {
  try {
    if (!var2 || !var3) {
      return { success: false, message: 'ต้องระบุค่า CYP2C9*2 และ CYP2C9*3 ทั้งคู่' }
    }

    // Column names มีตัวพิเศษ ต้องใส่ในเครื่องหมายคำพูดคู่เพื่อให้ PostgREST ประมวลผลถูกต้อง
    const col2 = '"CYP2C9*2(430C>T)"'
    const col3 = '"CYP2C9*3(1075A>C)"'
    console.log('[IPC] get-cyp2c9-result alleles:', var2, var3)

    const { data, error } = await supabase
      .from('cyp2d6')
      .select(`predicted_genotype,predicted_phenotype,therapeutic_recommendation,${col2},${col3}`)
      .eq(col2, var2)
      .eq(col3, var3)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Supabase get-cyp2c9-result Error:', error)
      let msg = error.message
      if (/does not exist/i.test(msg)) {
        msg += '\nตรวจสอบชื่อคอลัมน์ในตาราง cyp2d6 ว่าตรงกับ schema และต้องมีเครื่องหมายคำพูดคู่.'
      }
      return { success: false, message: msg }
    }
    if (!data) {
      return { success: false, message: 'ไม่พบข้อมูลที่ตรงกับค่า allele ที่ระบุ' }
    }
    const { predicted_genotype, predicted_phenotype, therapeutic_recommendation } = data
    return { success: true, data: { predicted_genotype, predicted_phenotype, therapeutic_recommendation } }
  } catch (err) {
    console.error('get-cyp2c9-result failed:', err)
    return { success: false, message: 'เกิดข้อผิดพลาด' }
  }
})

// Event: ดึงรายชื่อโรงพยาบาล
ipcMain.handle('get-hospitals', async () => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('hospital_id, hospital_name')
    .order('hospital_name', { ascending: true });

  if (error) {
    console.error('Supabase get-hospitals Error:', error);
    throw new Error(error.message);
  }

  return data ?? [];
});

// Event: ดึงสถิติ dashboard
ipcMain.handle('get-dashboard-stats', async () => {
  try {
    const { count: totalPatients, error: patientsError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    if (patientsError) throw patientsError;

    return {
      success: true,
      stats: {
        totalPatients: totalPatients || 0,
        // เพิ่ม stats อื่น ๆ ได้ที่นี่
      }
    };
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    return { success: false, message: err.message };
  }
});

// // Event: ดึงสถิติผู้ป่วยรายเดือน
// ipcMain.handle('get-monthly-patients', async () => {
//   try {
//     console.log('📊 Fetching monthly patient stats...');
    
//     const { data, error } = await supabase
//       .from('patients')
//       .select('request_date');

//     if (error) {
//       console.error('❌ Supabase error:', error);
//       throw error;
//     }

//     if (!data || data.length === 0) {
//       console.log('⚠️ No patient data found');
//       return [];
//     }

//     // นับจำนวนผู้ป่วยแยกตามเดือน
//     const monthlyCounts = {};
//     data.forEach(patient => {
//       if (patient.request_date) {
//         try {
//           const date = new Date(patient.request_date);
//           if (!isNaN(date.getTime())) { // ตรวจสอบว่าเป็นวันที่ที่ถูกต้อง
//             const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
//             monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
//           }
//         } catch (parseError) {
//           console.error('❌ Invalid date:', patient.request_date);
//         }
//       }
//     });

//     // แปลงเป็น array และเรียงตามวันที่
//     const sortedData = Object.entries(monthlyCounts)
//       .map(([monthYear, count]) => {
//         const [month, year] = monthYear.split('/');
//         return { month: parseInt(month), year: parseInt(year), count };
//       })
//       .sort((a, b) => {
//         if (a.year !== b.year) return a.year - b.year;
//         return a.month - b.month;
//       });

//     console.log('✅ Monthly data:', sortedData.length, 'months');
//     return sortedData;
//   } catch (err) {
//     console.error('❌ Get monthly patients error:', err);
//     return []; // ส่ง array ว่างแทนการ throw error
//   }
// });

// Handler: ดึงรายงานผู้ป่วย
ipcMain.handle('get-patient-reports', async () => {
  try {
    // ดึงข้อมูลผู้ป่วย
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('users_id, fname, lname, hospital_number');

    if (patientsError) throw patientsError;

    // ดึงข้อมูล orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('users_id, status_id, operation_id, inspection_code');

    if (ordersError) throw ordersError;

    const { data: geneData, error: geneError } = await supabase
      .from('genotype')
      .select('gene_id, gene_name');

    if (geneError) throw geneError;

    // JOIN แบบ JS
    const reports = patientsData.map((pt, index) => {
      const order = ordersData.find(o => o.users_id === pt.users_id);

      // Debug log
      if (index === 0) {
        console.log('🔍 Sample patient:', pt);
        console.log('🔍 Patient users_id:', pt.users_id);
        console.log('🔍 Order found:', order);
        console.log('🔍 Order status_id:', order?.status_id);
        console.log('🔍 All orders:', ordersData);
        console.log('🔍 All genes:', geneData);
      }

      // แปลง status_id → ข้อความ
      const statusText =
        order?.status_id === 1 ? "รอดำเนินการ" :
        order?.status_id === 2 ? "สำเร็จ" :
        "ไม่มีข้อมูล";
      const geneName =
       order ? geneData.find(g => g.gene_id === order.inspection_code)?.gene_name || "N/A" : "N/A";

      return {
        no: index + 1,
        fullName: `${pt.fname} ${pt.lname}`,
        hn: pt.hospital_number,
        status: statusText,              // ← ใช้ statusText แทน status_id
        operation: order?.operation_id ?? "N/A",
        genotype: order?.inspection_code ?? "N/A",
        patientId: pt.users_id
      };
    });

    return reports;

  } catch (err) {
    console.error("Get patient reports error:", err);
    throw err;
  }
});

// Handler: ดึงรายการใบสั่งตรวจ
ipcMain.handle('get-orders', async () => {
  try {
    console.log('🔄 Fetching orders...');
    
    // ดึงข้อมูล orders ทั้งหมดก่อน
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('order_id', { ascending: true });

    if (ordersError) throw ordersError;
    
    console.log('📋 Orders columns:', ordersData[0] ? Object.keys(ordersData[0]) : 'No data');

    // ดึงข้อมูล patients พร้อมชื่อ-นามสกุล
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('users_id, hospital_number, fname, lname');

    if (patientsError) throw patientsError;
    
    console.log('👤 Patients sample:', patientsData[0]);

    // ดึงข้อมูล physicians ทั้งหมด
    const { data: physiciansData, error: physiciansError } = await supabase
      .from('physicians')
      .select('*');

    if (physiciansError) throw physiciansError;
    
    console.log('👨‍⚕️ Physicians columns:', physiciansData[0] ? Object.keys(physiciansData[0]) : 'No data');

    // JOIN ข้อมูล
    const orders = ordersData.map((order, index) => {
      const patient = patientsData.find(p => p.users_id === order.users_id);
      
      // ลองหาว่า physician เชื่อมด้วย column อะไร
      const physician = physiciansData[0]; // ใช้แพทย์คนแรกชั่วคราว

      return {
        no: index + 1,
        orderId: order.order_id,
        hospitalNumber: patient?.hospital_number || 'N/A',
        patientName: patient ? `${patient.fname} ${patient.lname}` : 'ไม่ระบุ',
        inspectionCode: order.inspection_code || 'N/A',
        physicianName: physician?.physician_name || 'ไม่ระบุ',
        orderDate: order.order_date ? new Date(order.order_date).toLocaleDateString('th-TH') : 'N/A',
        _debugOrder: order,  // ดูข้อมูลเต็มของ order
        _debugPhysician: physician  // ดูข้อมูลเต็มของ physician
      };
    });

    console.log('✅ Orders loaded:', orders.length, 'records');
    return orders;

  } catch (err) {
    console.error('❌ Get orders error:', err);
    throw err;
  }
});

// Event: ดึงรายชื่อผู้ป่วยทั้งหมด
ipcMain.handle('get-patients', async () => {
  try {
    // ดึงข้อมูลผู้ป่วย
    const { data, error } = await supabase
      .from('patients')
      .select('*') // เลือกทุกคอลัมน์เพื่อตรวจ schema ได้ง่าย
        .order('hospital_number', { ascending: true });
      
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('get-patients failed:', err);
    throw new Error(err.message || 'get-patients failed');
  }
});

// ===== Helper: สร้างรหัส order_id ใหม่ (รูปแบบ TRO0001 ... ) =====
async function generateNextOrderId() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('order_id')
      .order('order_id', { ascending: false })
      .limit(1);
    if (error) {
      console.warn('Cannot fetch last order_id:', error.message);
      return 'TRO0001';
    }
    const last = (data && data[0] && data[0].order_id) || '';
    const m = /TRO(\d{4})/i.exec(last);
    let num = m ? parseInt(m[1], 10) + 1 : 1;
    if (num > 9999) num = 1; // rollover (simple)
    return 'TRO' + String(num).padStart(4, '0');
  } catch (e) {
    console.warn('generateNextOrderId fallback:', e.message);
    return 'TRO0001';
  }
}

// ===== Helper: upsert inspections_code (หากยังไม่มี) =====
async function upsertInspectionCode(code, name, geneId = null) {
  if (!code) return { success: false, message: 'No code provided' };
  try {
    // Primary attempt using inspection_code
    // Try with gene_id first
    let { error } = await supabase
      .from('inspections_code')
      .upsert({
        inspection_code: code,
        inspection_name: name || code,
        gene_id: geneId
      }, { onConflict: 'inspection_code' });
    
    if (error) {
      console.warn('upsertInspectionCode with gene_id failed:', code, error.message);
      // Fallback: try without gene_id (set to null) to avoid FK issues if gene_id is invalid
      if (geneId !== null) {
         const { error: err2 } = await supabase
            .from('inspections_code')
            .upsert({
                inspection_code: code,
                inspection_name: name || code,
                gene_id: null
            }, { onConflict: 'inspection_code' });
         if (err2) {
             console.error('upsertInspectionCode fallback failed:', err2.message);
             return { success: false, message: err2.message };
         }
      } else {
          return { success: false, message: error.message };
      }
    }
    return { success: true };
  } catch (e) {
    console.warn('upsertInspectionCode exception:', code, e.message);
    return { success: false, message: e.message };
  }
}

// Gene mapping เบื้องต้นจากชื่อ (สามารถปรับภายหลัง)
function inferGeneIdFromName(name = '') {
  const n = name.toUpperCase();
  // ควรแม็ปกับตาราง genes จริง (query) แต่ใช้ hardcode ชั่วคราว
  const map = {
    'CYP2D6': 1,
    'CYP2C19': 2,
    'CYP3A5': 3,
    'VKORC1': 4,
    'TPMT': 5,
    'HLA': 6,
    'DPYD': 7,
    'CYP2C9': 8
  };
  for (const key of Object.keys(map)) {
    if (n.includes(key)) return map[key];
  }
  return null;
}

// ===== IPC: create-order (หลายรายการตรวจในครั้งเดียว) =====
ipcMain.handle('create-order', async (event, payload) => {
  // NOTE: ตารางอาจใช้ชื่อคอลัมน์ users_id (ตามโค้ด get-patient-orders เดิม) หรือ user_id ตามภาพ
  // เราจะรับทั้งสองและใช้ users_id เป็นคีย์หลักในการ insert
  const { user_id, users_id, physician_order, patient_medication, drug_name, tests } = payload || {};
  const actorId = users_id || user_id; // เลือกค่าที่มี
  if (!actorId) return { success: false, message: 'missing users_id' };
  if (!Array.isArray(tests) || tests.length === 0) return { success: false, message: 'ไม่พบรายการตรวจที่เลือก' };

  const createdIds = [];
  for (const t of tests) {
    const code = t.inspection_code || t.code;
    const name = t.inspection_name || t.name || code;
    // upsert master
    const upsertRes = await upsertInspectionCode(code, name, inferGeneIdFromName(name));
    if (!upsertRes.success) {
        console.warn(`Skipping order for ${code} due to upsert failure: ${upsertRes.message}`);
        // Optional: return error or continue? Let's return error to alert user.
        return { success: false, message: `Failed to register inspection code ${code}: ${upsertRes.message}` };
    }

    // gen order id
    const order_id = await generateNextOrderId();
    const insertObj = {
      order_id,
      // Use users_id only as user_id caused schema error
      users_id: actorId,
      physician_order: physician_order || '',
      inspection_code: code,
      drug_name: drug_name || '',
      patient_medication: patient_medication || '',
      status_id: 1, // pending
      operation_id: 1, // Default operation (Gene Test)
      order_date: new Date().toISOString()
    };
    try {
      const { error } = await supabase.from('orders').insert([insertObj]);
      if (error) {
        console.error('Insert order failed:', error.message);
        return { success: false, message: error.message };
      }
      createdIds.push(order_id);
    } catch (e) {
      console.error('Insert order exception:', e.message);
      return { success: false, message: e.message };
    }
  }
  return { success: true, order_ids: createdIds };
});

// Event: สั่งพิมพ์หน้าต่าง
ipcMain.handle('print-window', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    // silent: false -> เปิด dialog print ของระบบ
    // printBackground: true -> พิมพ์พื้นหลังด้วย (สี/รูปภาพ)
    win.webContents.print({ silent: false, printBackground: true }, (success, errorType) => {
      if (!success) console.log("Print failed:", errorType);
    });
  }
});

app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication');



app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
