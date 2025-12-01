fetch("sidebarAdmin.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("sidebarAdmin").innerHTML = data;
    });