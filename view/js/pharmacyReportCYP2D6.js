// Dynamic logic for CYP2C9 variant lookup on CYP2D6 page reuse
document.addEventListener('DOMContentLoaded', () => {
	// Set user name chip
	try {
		const raw = sessionStorage.getItem('currentUser');
		if (raw) {
			const u = JSON.parse(raw);
			const chip = document.querySelector('.patient2-header-chip');
			if (chip) chip.textContent = [u.first_name || u.fname, u.last_name || u.lname].filter(Boolean).join(' ');
		}
	} catch (e) {
		console.warn('Cannot parse currentUser:', e);
	}

	const allele2Input = document.getElementById('allele2');
	const allele3Input = document.getElementById('allele3');
	const btn = null; // button removed
	const predictedGenotypeEl = document.getElementById('predictedGenotype');
	const predictedPhenotypeEl = document.getElementById('predictedPhenotype');
	const therapeuticRecEl = document.getElementById('therapeuticRec');
	let lastFetchedKey = '';
	let debounceTimer = null;

	// Modal logic moved from inline script (CSP compliant)
	(function initModal(){
		const openBtn   = document.querySelector('.btn-revise');
		const modal     = document.getElementById('revise-modal');
		if (!modal) return;
		const textarea  = modal.querySelector('.modal-textarea');
		const closeBtns = modal.querySelectorAll('.modal-close, .modal-btn.cancel');
		if (openBtn) {
			openBtn.addEventListener('click', () => {
				modal.classList.add('show');
				if (textarea){ textarea.value=''; textarea.focus(); }
			});
		}
		closeBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.remove('show')));
		modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
		const submitBtn = modal.querySelector('.modal-btn.submit');
		if (submitBtn) {
			submitBtn.addEventListener('click', () => {
				const message = (textarea?.value || '').trim();
				if (!message){ alert('กรุณากรอกรายละเอียดที่ต้องการให้แก้ไข'); return; }
				console.log('ส่งคำขอแก้ไขผลตรวจ:', message);
				modal.classList.remove('show');
			});
		}
	})();

	async function fetchResult() {
		// Read raw inputs
		let var2 = (allele2Input?.value || '').trim();
		let var3 = (allele3Input?.value || '').trim();

		// Normalize allele formats: allow CC -> C/C, CT -> C/T, etc.
		function normalizeAllele(a){
			if(!a) return '';
			// Remove whitespace
			a = a.toUpperCase().replace(/\s+/g,'');
			// If already X/Y pattern, ensure capitals
			if(/^[ACGT]\/[ACGT]$/.test(a)) return a;
			// If user types two letters (e.g. CC), convert to C/C
			if(/^[ACGT]{2}$/.test(a)) return a[0] + '/' + a[1];
			// If user accidentally typed with other separators, strip and reformat
			const letters = a.replace(/[^ACGT]/g,'');
			if(letters.length === 2) return letters[0] + '/' + letters[1];
			return a; // fallback (may not match DB)
		}

		var2 = normalizeAllele(var2);
		var3 = normalizeAllele(var3);

		if (!var2 || !var3) {
			predictedGenotypeEl.textContent = '';
			predictedPhenotypeEl.textContent = '';
			therapeuticRecEl.textContent = '';
			return; // รอให้กรอกครบ
		}
		predictedGenotypeEl.textContent = 'กำลังดึง...';
		try {
			const res = await window.electronAPI.getCyp2c9Result({ var2, var3 });
			console.log('[fetchResult] query alleles ->', var2, var3, 'success:', res.success);
			if (!res.success) {
				predictedGenotypeEl.textContent = '-';
				predictedPhenotypeEl.textContent = '-';
				therapeuticRecEl.textContent = '-';
				alert(res.message || 'ไม่พบข้อมูล');
				return;
			}
			const { predicted_genotype, predicted_phenotype, therapeutic_recommendation } = res.data;
			predictedGenotypeEl.textContent = predicted_genotype || '-';
			predictedPhenotypeEl.textContent = predicted_phenotype || '-';
			therapeuticRecEl.textContent = therapeutic_recommendation || '-';
		} catch (err) {
			console.error('Fetch CYP2C9 result failed:', err);
			alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
		} finally {
			// no button; keep displayed values
		}
	}

	// auto fetch only (button removed)

	function scheduleAutoFetch() {
		const var2 = (allele2Input?.value || '').trim();
		const var3 = (allele3Input?.value || '').trim();
		// เงื่อนไข: ต้องมีค่าและเป็นตัวอักษร A/C/G/T เท่านั้น
		const validPattern = /^[ACGT]+$/i;
		if (!var2 || !var3 || !validPattern.test(var2) || !validPattern.test(var3)) {
			predictedGenotypeEl.textContent = '';
			predictedPhenotypeEl.textContent = '';
			therapeuticRecEl.textContent = '';
			return;
		}
		const key = var2 + '|' + var3;
		if (key === lastFetchedKey) return; // ไม่ต้องดึงซ้ำ
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			lastFetchedKey = key;
			fetchResult();
		}, 400); // หน่วงเล็กน้อยให้พิมพ์เสร็จ
	}

	allele2Input?.addEventListener('input', scheduleAutoFetch);
	allele3Input?.addEventListener('input', scheduleAutoFetch);
});
