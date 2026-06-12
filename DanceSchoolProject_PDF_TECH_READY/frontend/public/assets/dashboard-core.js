function initDashboard(requiredRole) {
    const user = JSON.parse(localStorage.getItem("pulseUser"));

    if (!user) {
        window.location.href = "login.html";
        return null;
    }

    const role = String(user.role || "").toUpperCase();

    if (requiredRole && role !== requiredRole && !(requiredRole === "INSTRUCTOR" && role === "TRAINER")) {
        window.location.href = "login.html";
        return null;
    }

    window.showSection = function (sectionName) {
        document.querySelectorAll(".sidebar-link").forEach(button => {
            button.classList.toggle("active", button.dataset.section === sectionName);
        });

        document.querySelectorAll(".dashboard-section").forEach(section => {
            const allowed = section.dataset.sectionContent || "";
            section.style.display = allowed.split(" ").includes(sectionName) ? "block" : "none";
        });
    };

    document.querySelectorAll(".sidebar-link").forEach(button => {
        button.addEventListener("click", () => window.showSection(button.dataset.section));
    });

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("pulseUser");
            window.location.href = "index.html";
        });
    }

    window.showSection("dashboard");
    return user;
}
