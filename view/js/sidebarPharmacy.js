fetch("sidebarPharmacy.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("sidebarPharmacy").innerHTML = data;
    });