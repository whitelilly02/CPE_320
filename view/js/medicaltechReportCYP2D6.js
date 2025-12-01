const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
console.log("กำลังแก้ไขผู้ป่วยหมายเลข:", id);

// เมื่อ DOM โหลดเสร็จ
document.addEventListener("DOMContentLoaded", () => {

    // ปุ่มบันทึกผลการส่งตรวจ (บันทึก genotype → ไปหน้า detail)
    const saveButton = document.querySelector(".btn-secondary");

    saveButton.addEventListener("click", () => {

        // ดึงค่า allele จาก select ทั้งสองอัน
        const selects = document.querySelectorAll(".genotype-item select");

        const allele1 = selects[0].value;  // CYP2C9*2
        const allele2 = selects[1].value;  // CYP2C9*3

        // เก็บข้อมูล genotype
        const data = {
            gene: "CYP2D6",
            allele1: allele1,
            allele2: allele2
        };

        // save ลง localStorage
        localStorage.setItem("selectedGenotype_CYP2D6", JSON.stringify(data));

        console.log("บันทึก genotype แล้ว:", data);

        // ไปหน้า detail
        window.location.href = "medicaltechReportCYP2D6Detail.html";
    });
});