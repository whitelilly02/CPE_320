// รอให้ DOM โหลดเสร็จก่อน
document.addEventListener("DOMContentLoaded", function () {

    // ดึงปุ่มและ modal
    const modal = document.getElementById("editModal");   // id ของ modal
    const openBtn = document.querySelector(".btn-cancel"); // ปุ่ม "ส่งแก้ไขผลตรวจ"
    const closeBtn = document.querySelector(".close-btn"); // ปุ่มกากบาท
    const cancelBtn = document.querySelector(".btn-close"); // ปุ่มยกเลิก (ใน modal)

    // ซ่อน modal ตอนเริ่มต้น
    modal.style.display = "none";

    // เปิด modal เมื่อกดปุ่ม “ส่งแก้ไขผลตรวจ”
    openBtn.addEventListener("click", function () {
        modal.style.display = "flex";
    });

    // ปิด modal เมื่อกดปุ่มกากบาท
    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // ปิด modal เมื่อกดยกเลิก
    cancelBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // ปิด modal ถ้าคลิกตรงนอกกล่อง
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});