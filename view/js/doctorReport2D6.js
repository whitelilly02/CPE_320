document.addEventListener('DOMContentLoaded', async () => {
    // Set user chip name if available
    try {
        const raw = sessionStorage.getItem('currentUser');
        if (raw) {
            const u = JSON.parse(raw);
            const chip = document.querySelector('.patient2-header-chip');
            if (chip) chip.textContent = [u.first_name || u.fname, u.last_name || u.lname].filter(Boolean).join(' ');
        }
    } catch {}

    // Print button handler
    const printBtn = document.querySelector('.print-button');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }

    // ----- Fetch Order Details -----
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');

    if (orderId) {
        try {
            const order = await window.electronAPI.getOrderDetail(orderId);
            if (order) {
                // Fill Header Info
                const orderIdEl = document.querySelector('.result-meta .value');
                if (orderIdEl) orderIdEl.textContent = order.order_id || '-';

                // Fill Patient Info
                const pat = order.patient || {};
                const fullName = [pat.first_name || pat.fname, pat.last_name || pat.lname].filter(Boolean).join(' ');
                document.getElementById('pt-name').value = fullName || '-';
                document.getElementById('pt-hn').value = pat.hospital_number || pat.hn || '-';

                // Fill Inspection Info
                const insp = order.inspection || {};
                document.getElementById('insp-code').value = order.inspection_code || insp.inspection_code || '-';
                document.getElementById('insp-name').value = insp.inspection_name || '-';

                // Fill Drug/Medication Info
                document.getElementById('drug-name').value = order.drug_name || '-';
                document.getElementById('pt-med').value = order.patient_medication || '-';
                
                // Update Gene Name in Genotype Block if available
                const geneNameEl = document.querySelector('.geno-section .first-row .geno-text');
                if (geneNameEl && insp.gene) {
                    geneNameEl.textContent = insp.gene.gene_name || '2D6 new';
                }
            } else {
                alert('ไม่พบข้อมูลใบสั่งตรวจ');
            }
        } catch (err) {
            console.error('Failed to load order detail:', err);
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
    }
});
