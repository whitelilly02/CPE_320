fetch("sidebarUser.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("sidebarUser").innerHTML = data;
    });