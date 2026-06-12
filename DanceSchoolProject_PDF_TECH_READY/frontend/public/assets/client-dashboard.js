const user = JSON.parse(localStorage.getItem("pulseUser"));

if (!user) {
    window.location.href = "login.html";
}

const role = String(user.role || "").toUpperCase();

if (role !== "CLIENT") {
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

function renderNextBooking(bookings) {
    const box = document.getElementById("nextBookingBox");

    if (!bookings || bookings.length === 0) {
        box.innerHTML = `
            <p>Nie masz jeszcze aktywnych rezerwacji.</p>
            <button class="btn primary" type="button" onclick="showSection('schedule')">Znajdź zajęcia</button>
        `;
        return;
    }

    const next = bookings[0];

    box.innerHTML = `
        <div class="next-booking">
            <strong>${next.title}</strong>
            <p>${next.date} • ${next.time}</p>
            <p>${next.room || "Sala A"}</p>
            <span class="status-pill">Zarezerwowano</span>
        </div>
    `;
}

function renderRecommendedClasses(sessions) {
    const container = document.getElementById("recommendedClassesList");

    if (!sessions || sessions.length === 0) {
        container.innerHTML = "<p>Brak rekomendowanych zajęć.</p>";
        return;
    }

    container.innerHTML = sessions.slice(0, 3).map(item => `
        <div class="class-item">
            <div>
                <strong>${item.title}</strong>
                <p>${item.date} • ${item.time}</p>
            </div>
            <button class="small-btn" type="button" onclick="showSection('schedule')">Zobacz</button>
        </div>
    `).join("");
}

function renderClasses(sessions) {
    const container = document.getElementById("clientClassesList");
    document.getElementById("classesCount").textContent = sessions.length;

    if (!sessions || sessions.length === 0) {
        container.innerHTML = "<p>Brak dostępnych zajęć.</p>";
        return;
    }

    container.innerHTML = sessions.map(item => {
        const taken = item.attendeeIds ? item.attendeeIds.length : 0;

        return `
            <div class="class-item">
                <div>
                    <strong>${item.title}</strong>
                    <p>${item.date} • ${item.time} • ${item.room || "Sala A"} • ${taken}/${item.capacity} miejsc</p>
                </div>
                <button class="small-btn reserve-btn" data-session-id="${item.id}" type="button">Zarezerwuj</button>
            </div>
        `;
    }).join("");

    document.querySelectorAll(".reserve-btn").forEach(button => {
        button.addEventListener("click", () => reserveClass(button.dataset.sessionId));
    });
}

function renderBookings(bookings) {
    const container = document.getElementById("clientBookingsList");
    document.getElementById("bookingCount").textContent = bookings.length;

    if (!bookings || bookings.length === 0) {
        container.innerHTML = "<p>Nie masz jeszcze żadnych rezerwacji.</p>";
        return;
    }

    container.innerHTML = bookings.map(item => `
        <div class="class-item reservation-item">
            <div>
                <strong>${item.title}</strong>
                <p>${item.date} • ${item.time}</p>
                <p>${item.room || "Sala A"}</p>
            </div>
            <div class="reservation-actions">
                <span class="status-pill">Zarezerwowano</span>
                <button class="small-btn ghost-btn" type="button" onclick="showSection('schedule')">Przenieś</button>
                <button class="small-btn ghost-btn" type="button" onclick="alert('Szczegóły rezerwacji zostaną dodane w kolejnej wersji.')">Szczegóły</button>
            </div>
        </div>
    `).join("");
}

async function loadClientOverview() {
    try {
        const response = await fetch("/api/clients/" + user.id + "/overview");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Nie udało się pobrać danych klienta.");
        }

        const sessions = data.sessions || [];
        const bookings = data.bookings || [];

        renderNextBooking(bookings);
        renderRecommendedClasses(sessions);
        renderClasses(sessions);
        renderBookings(bookings);
    } catch (error) {
        document.getElementById("clientClassesList").innerHTML =
            `<p class="form-message error">${error.message}</p>`;
    }
}

async function reserveClass(sessionId) {
    try {
        const response = await fetch("/api/clients/" + user.id + "/reservations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId })
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            throw new Error(data.error || data.message || "Nie udało się zarezerwować zajęć.");
        }

        await loadClientOverview();
        showSection("bookings");
    } catch (error) {
        alert(error.message);
    }
}

function showProfileMessage(message, type) {
    const element = document.getElementById("profileMessage");
    if (!element) return;

    element.textContent = message;
    element.className = "form-message " + type;
}

document.addEventListener("DOMContentLoaded", function () {
    window.showSection = showSection;

    document.getElementById("clientWelcome").textContent = "Witaj, " + user.name;
    document.getElementById("clientName").textContent = user.name;
    document.getElementById("clientEmail").textContent = user.email;

    document.getElementById("profileNameInput").value = user.name || "";
    document.getElementById("profileEmailInput").value = user.email || "";
    document.getElementById("profilePaymentInput").value = user.defaultPaymentMethod || "BLIK";

    document.querySelectorAll(".sidebar-link").forEach(button => {
        button.addEventListener("click", () => showSection(button.dataset.section));
    });

    document.getElementById("logoutButton").addEventListener("click", function () {
        localStorage.removeItem("pulseUser");
        window.location.href = "index.html";
    });

    document.getElementById("clientProfileForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const payload = {
            name: document.getElementById("profileNameInput").value.trim(),
            email: document.getElementById("profileEmailInput").value.trim(),
            defaultPaymentMethod: document.getElementById("profilePaymentInput").value
        };

        try {
            const response = await fetch("/api/users/" + user.id + "/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || data.message || "Nie udało się zapisać profilu.");
            }

            localStorage.setItem("pulseUser", JSON.stringify(data.user));

            document.getElementById("clientName").textContent = data.user.name;
            document.getElementById("clientEmail").textContent = data.user.email;
            document.getElementById("clientWelcome").textContent = "Witaj, " + data.user.name;

            showProfileMessage("Profil zapisany poprawnie.", "success");
        } catch (error) {
            showProfileMessage(error.message, "error");
        }
    });

    showSection("dashboard");
    loadClientOverview();
});
