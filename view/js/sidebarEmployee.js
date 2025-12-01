fetch("sidebarEmployee.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("sidebarEmployee").innerHTML = data;
    });