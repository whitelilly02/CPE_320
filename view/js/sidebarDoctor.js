fetch("sidebarDoctor.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("sidebarDoctor").innerHTML = data;
    });