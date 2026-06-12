const user = JSON.parse(localStorage.getItem("pulseUser"));

if (!user) {
    window.location.href = "login.html";
}

const role = String(user.role || "").toUpperCase();

if (role !== "CLIENT") {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("clientWelcome").textContent = "Witaj, " + user.name;
    document.getElementById("clientName").textContent = user.name;
    document.getElementById("clientEmail").textContent = user.email;
    document.getElementById("clientRole").textContent = user.role;

    document.getElementById("logoutButton").addEventListener("click", function () {
        localStorage.removeItem("pulseUser");
        window.location.href = "index.html";
    });
});