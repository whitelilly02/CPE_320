const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
console.log("กำลังแก้ไขผู้ป่วยหมายเลข:", id);