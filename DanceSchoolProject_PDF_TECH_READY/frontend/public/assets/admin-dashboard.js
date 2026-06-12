const user = JSON.parse(localStorage.getItem("pulseUser"));

if (!user) {
    window.location.href = "login.html";
}

const role = String(user.role || "").toUpperCase();

if (role !== "ADMIN") {
    window.location.href = "login.html";
}

function showSection(sectionName) {
    document.querySelectorAll(".sidebar-link").forEach(button => {
        button.classList.toggle("active", button.dataset.section === sectionName);
    });

    document.querySelectorAll(".dashboard-section").forEach(section => {
        const allowed = section.dataset.sectionContent || "";
        section.style.display = allowed.split(" ").includes(sectionName) ? "block" : "none";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".sidebar-link").forEach(button => {
        button.addEventListener("click", () => showSection(button.dataset.section));
    });

    document.getElementById("logoutButton").addEventListener("click", function () {
        localStorage.removeItem("pulseUser");
        window.location.href = "index.html";
    });

    showSection("dashboard");
});
