const user = JSON.parse(localStorage.getItem("pulseUser"));

if (!user) window.location.href = "login.html";

const role = String(user.role || "").toUpperCase();
if (role !== "INSTRUCTOR" && role !== "TRAINER") window.location.href = "login.html";

function showSection(sectionName) {
    document.querySelectorAll(".sidebar-link").forEach(button => {
        button.classList.toggle("active", button.dataset.section === sectionName);
    });

    document.querySelectorAll(".dashboard-section").forEach(section => {
        const allowed = section.dataset.sectionContent || "";
        section.style.display = allowed.split(" ").includes(sectionName) ? "block" : "none";
    });
}

function showTrainerProfileMessage(message, type) {
    const element = document.getElementById("trainerProfileMessage");
    if (!element) return;

    element.textContent = message;
    element.className = "form-message " + type;
}

function renderClasses(sessions) {
    const container = document.getElementById("trainerClassesList");
    document.getElementById("trainerClassesCount").textContent = sessions.length;

    if (!sessions || sessions.length === 0) {
        container.innerHTML = "<p>Nie masz jeszcze żadnych zajęć.</p>";
        return;
    }

    container.innerHTML = sessions.map(item => `
        <div class="class-item">
            <div>
                <strong>${item.title}</strong>
                <p>${item.date} • ${item.time} • ${item.room || "Sala A"} • ${(item.attendeeIds || []).length}/${item.capacity} uczestników</p>
            </div>
            <div class="reservation-actions">
                <span class="status-pill">Aktywne</span>
                <button class="small-btn ghost-btn" type="button">Lista</button>
            </div>
        </div>
    `).join("");
}

async function loadTrainerOverview() {
    try {
        const response = await fetch("/api/trainers/" + user.id + "/overview");
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Nie udało się pobrać danych instruktora.");

        renderClasses(data.sessions || []);
    } catch (error) {
        document.getElementById("trainerClassesList").innerHTML = `<p class="form-message error">${error.message}</p>`;
    }
}

async function saveTrainerProfile(event) {
    event.preventDefault();

    const updatedUser = {
        ...user,
        name: document.getElementById("trainerProfileName").value.trim(),
        email: document.getElementById("trainerProfileEmail").value.trim(),
        specialties: document.getElementById("trainerSpecialties").value.trim(),
        bio: document.getElementById("trainerBio").value.trim()
    };

    try {
        const response = await fetch("/api/users/" + user.id + "/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: updatedUser.name,
                email: updatedUser.email,
                specialties: updatedUser.specialties
            })
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            throw new Error(data.error || data.message || "Nie udało się zapisać profilu.");
        }

        const savedUser = {
            ...data.user,
            bio: updatedUser.bio,
            specialties: updatedUser.specialties
        };

        localStorage.setItem("pulseUser", JSON.stringify(savedUser));

        document.getElementById("trainerWelcome").textContent = "Witaj, " + savedUser.name;
        document.getElementById("trainerName").textContent = savedUser.name;
        document.getElementById("trainerEmail").textContent = savedUser.email;

        showTrainerProfileMessage("Profil instruktora został zapisany poprawnie.", "success");
    } catch (error) {
        showTrainerProfileMessage(error.message, "error");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    window.showSection = showSection;

    document.getElementById("trainerWelcome").textContent = "Witaj, " + user.name;
    document.getElementById("trainerName").textContent = user.name;
    document.getElementById("trainerEmail").textContent = user.email;

    document.getElementById("trainerProfileName").value = user.name || "";
    document.getElementById("trainerProfileEmail").value = user.email || "";
    document.getElementById("trainerSpecialties").value = user.specialties || "Taniec nowoczesny, choreografia";
    document.getElementById("trainerBio").value = user.bio || "Instruktor z doświadczeniem w prowadzeniu zajęć tanecznych dla różnych poziomów zaawansowania. Specjalizuje się w pracy z grupami początkującymi i średniozaawansowanymi.";

    document.querySelectorAll(".sidebar-link").forEach(button => {
        button.addEventListener("click", () => showSection(button.dataset.section));
    });

    document.getElementById("logoutButton").addEventListener("click", function () {
        localStorage.removeItem("pulseUser");
        window.location.href = "index.html";
    });

    document.getElementById("trainerProfileForm").addEventListener("submit", saveTrainerProfile);

    document.getElementById("createClassForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const payload = {
            title: document.getElementById("classTitle").value.trim(),
            category: document.getElementById("classCategory").value,
            level: document.getElementById("classLevel").value,
            date: document.getElementById("classDate").value,
            time: document.getElementById("classTime").value,
            capacity: document.getElementById("classCapacity").value,
            duration: 75,
            room: "Sala A",
            price: 45
        };

        try {
            const response = await fetch("/api/trainers/" + user.id + "/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || data.message || "Nie udało się utworzyć zajęć.");
            }

            document.getElementById("classMessage").textContent = "Zajęcia utworzone poprawnie.";
            document.getElementById("classMessage").className = "form-message success";
            document.getElementById("createClassForm").reset();

            await loadTrainerOverview();
            showSection("classes");
        } catch (error) {
            document.getElementById("classMessage").textContent = error.message;
            document.getElementById("classMessage").className = "form-message error";
        }
    });

    showSection("dashboard");
    loadTrainerOverview();
});
