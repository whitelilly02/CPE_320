fetch("sidebarMedicaltech.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("sidebarMedicaltech").innerHTML = data;
    });