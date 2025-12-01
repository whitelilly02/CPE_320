// Load patient orders from Supabase via Electron IPC and render table

function mapStatusToText(status) {
	if (!status) return 'รอดำเนินการ';
	const s = String(status).toLowerCase();
	if (['pending', 'รอดำเนินการ'].includes(s)) return 'รอดำเนินการ';
	if (['completed', 'เสร็จสิ้น', 'complete', 'finished'].includes(s)) return 'เสร็จสิ้น';
	if (['processing', 'กำลังดำเนินการ', 'inprogress'].includes(s)) return 'กำลังดำเนินการ';
	return status;
}

// For now, inspection_code does not map to a specific page
function mapInspectionToPage(code = '') {
	const c = code.toUpperCase();
	// Return relative filenames (no leading slash) so they resolve under the current /view directory.
	if (c.includes('2D6')) return 'pharmacyReportCYP2D6.html';
	if (c.includes('2C19')) return 'pharmacyReport2C19.html';
	if (c.includes('3A5')) return 'pharmacyReport3A5.html';
	if (c.includes('VKORC1')) return 'pharmacyReportVKORC1.html';
	if (c.includes('TPMT')) return 'pharmacyReportTPMT.html';
	if (c.includes('HLA')) return 'pharmacyReportHLAgene.html';
	return '';
}

// Fallback mapping by gene name if inspection_code pattern is numeric/non-matching
function mapGeneNameToPage(geneName = '') {
  const g = geneName.toUpperCase();
  if (g.includes('CYP2D6')) return 'pharmacyReportCYP2D6.html';
  if (g.includes('CYP2C19') || g.includes('2C19')) return 'pharmacyReport2C19.html';
  if (g.includes('CYP3A5') || g.includes('3A5')) return 'pharmacyReport3A5.html';
  if (g.includes('VKORC1')) return 'pharmacyReportVKORC1.html';
  if (g.includes('TPMT')) return 'pharmacyReportTPMT.html';
  if (g.includes('HLA')) return 'pharmacyReportHLAgene.html';
  if (g.includes('CYP2C9') || g.includes('2C9')) return 'pharmacyReportCYP2D6.html'; // ใช้หน้า CYP2D6 สำหรับ CYP2C9 ตาม requirement
  return '';
}

function renderOrders(orders) {
	const tbody = document.getElementById('report-body');
	if (!tbody) return;
	tbody.innerHTML = '';

	(orders || []).forEach((o, idx) => {
		const tr = document.createElement('tr');

		const pat = o.patient || {};
		const name = [pat.first_name || pat.firstname || pat.fname, pat.last_name || pat.lastname || pat.lname]
			.filter(Boolean)
			.join(' ');
		const hn = pat.hospital_number || pat.hn || pat.HN || pat.id_number || pat.national_id || '-';
		const inspectionCode = (o.inspection && o.inspection.inspection_code) || o.inspection_code || '';
		const geneName = (o.inspection && o.inspection.gene && o.inspection.gene.gene_name) || '';
		const displayGenotype = inspectionCode || 'ยังไม่มีข้อมูล';
		// ใช้ status_name จาก join ถ้ามี ไม่งั้น fallback map
		const statusText = (o.status && o.status.status_name) ? o.status.status_name : mapStatusToText(o.status_id || 'รอดำเนินการ');
		const goto = mapInspectionToPage(inspectionCode) || mapGeneNameToPage(geneName); // prefer code, fallback gene
		const userId = (o.patient && o.patient.users_id) || '';
		const geneId = (o.inspection && o.inspection.gene && o.inspection.gene.gene_id) || '';

		tr.innerHTML = `
			<td>${idx + 1}</td>
			<td>${name || '-'}</td>
			<td>${hn}</td>
			<td><span class="badge">${statusText}</span></td>
			<td>${displayGenotype}</td>
			<td></td>
		`;

		const actionTd = tr.lastElementChild;
		const btn = document.createElement('button');
		btn.className = 'select-btn';
		btn.type = 'button';
		btn.textContent = 'เลือก';
		// เงื่อนไขใหม่: มี inspection_code ก็ให้กดได้ (แม้ fallback page จะมาจาก gene)
		btn.disabled = !inspectionCode;
		btn.addEventListener('click', () => {
			if (!inspectionCode) return; // safety
			if (!goto) {
				alert('ยังไม่มีหน้ารายงานสำหรับรหัสนี้');
				return;
			}
			// Build URL params (trim to avoid stray spaces becoming + signs)
			const params = new URLSearchParams({
				order_id: String(o.order_id ?? '').trim(),
				inspection_code: String(inspectionCode ?? '').trim(),
				users_id: String(userId ?? '').trim(),
				gene_id: String(geneId ?? '').trim()
			});
			// Since we are already inside /view/, use relative filename (without leading slash)
			const target = `${goto}?${params.toString()}`;
			location.href = target;
		});
		actionTd.appendChild(btn);

		tbody.appendChild(tr);
	});
}

async function loadOrders() {
	try {
		const orders = await window.electronAPI.getPatientOrders();
		renderOrders(orders);
	} catch (err) {
		console.error('โหลดรายการตรวจล้มเหลว:', err);
		renderOrders([]);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	// ตั้งชื่อผู้ใช้งานแบบ dynamic จาก sessionStorage (ตั้งตอน login)
	try {
		const raw = sessionStorage.getItem('currentUser');
		if (raw) {
			const u = JSON.parse(raw);
			const fullName = [u.first_name || u.fname, u.last_name || u.lname].filter(Boolean).join(' ');
			const nameBtn = document.querySelector('.newPatients');
			if (nameBtn && fullName) nameBtn.textContent = fullName;
		}
	} catch (e) {
		console.warn('อ่านข้อมูลผู้ใช้ไม่สำเร็จ:', e);
	}
	loadOrders();
});

