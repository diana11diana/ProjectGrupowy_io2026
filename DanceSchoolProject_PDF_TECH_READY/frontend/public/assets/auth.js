const API_URL = "";

function saveUser(user) {
    localStorage.setItem("pulseUser", JSON.stringify(user));
}

function getDashboardUrl(role) {
    const normalizedRole = String(role || "").toUpperCase();

    if (normalizedRole === "CLIENT") return "client.html";
    if (normalizedRole === "INSTRUCTOR") return "trainer.html";
    if (normalizedRole === "TRAINER") return "trainer.html";
    if (normalizedRole === "ADMIN") return "admin.html";

    return "index.html";
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.className = "form-message " + type;
}

async function readJsonResponse(response) {
    const text = await response.text();

    try {
        return JSON.parse(text);
    } catch (error) {
        throw new Error("Backend zwrócił niepoprawną odpowiedź.");
    }
}

async function registerUser(event) {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const birthDate = document.getElementById("birthDate").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const payload = {
        role: role,
        name: firstName + " " + lastName,
        firstName: firstName,
        lastName: lastName,
        birthDate: birthDate,
        email: email,
        password: password
    };

    try {
        const response = await fetch(API_URL + "/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await readJsonResponse(response);

        if (!response.ok || !data.ok) {
            throw new Error(data.error || data.message || "Nie udało się utworzyć konta.");
        }

        saveUser(data.user);

        const dashboardUrl = getDashboardUrl(data.user.role);

        showMessage("registerMessage", "Konto utworzone poprawnie. Przekierowanie...", "success");

        setTimeout(function () {
            window.location.href = dashboardUrl;
        }, 700);
    } catch (error) {
        showMessage("registerMessage", error.message, "error");
    }
}

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const payload = {
        email: email,
        password: password
    };

    try {
        const response = await fetch(API_URL + "/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await readJsonResponse(response);

        if (!response.ok || !data.ok) {
            throw new Error(data.error || data.message || "Nie udało się zalogować.");
        }

        saveUser(data.user);

        const dashboardUrl = getDashboardUrl(data.user.role);

        showMessage("loginMessage", "Zalogowano poprawnie. Przekierowanie...", "success");

        setTimeout(function () {
            window.location.href = dashboardUrl;
        }, 700);
    } catch (error) {
        showMessage("loginMessage", error.message, "error");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }
});