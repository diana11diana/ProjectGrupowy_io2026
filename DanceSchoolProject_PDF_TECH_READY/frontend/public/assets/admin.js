import {
  api,
  createStatCard,
  escapeHtml,
  formatDate,
  formatDateTime,
  renderEmpty,
  setOptions,
  showToast,
  requireRole,
  renderUserBar,
} from "/assets/shared.js";

const currentUser = requireRole("ADMIN");
renderUserBar(currentUser);

const state = {
  reference: null,
  overview: null,
};

const nodes = {
  eventForm: document.querySelector("#event-form"),
  eventCategory: document.querySelector("#event-category"),
  eventLevel: document.querySelector("#event-level"),
  eventInstructor: document.querySelector("#event-instructor"),
  eventDate: document.querySelector("#event-date"),
  adminStats: document.querySelector("#admin-stats"),
  adminEvents: document.querySelector("#admin-events"),
  topClasses: document.querySelector("#top-classes"),
  trainerLoad: document.querySelector("#trainer-load"),
  paymentFeed: document.querySelector("#payment-feed"),
};

await init();

async function init() {
  state.reference = await api("/api/reference");
  setOptions(nodes.eventCategory, state.reference.categories, state.reference.categories[0]);
  setOptions(nodes.eventLevel, state.reference.levels, state.reference.levels[0]);
  setOptions(
    nodes.eventInstructor,
    state.reference.instructors.map((item) => ({ value: item.id, label: item.name })),
    state.reference.instructors[0]?.id || ""
  );
  nodes.eventDate.value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  nodes.eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      title: document.querySelector("#event-title").value.trim(),
      category: nodes.eventCategory.value,
      level: nodes.eventLevel.value,
      instructorId: nodes.eventInstructor.value,
      date: nodes.eventDate.value,
      time: document.querySelector("#event-time").value,
      capacity: Number(document.querySelector("#event-capacity").value),
      price: Number(document.querySelector("#event-price").value),
      room: document.querySelector("#event-room").value.trim(),
    };

    try {
      const result = await api("/api/admin/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      state.overview = result.overview;
      nodes.eventForm.reset();
      nodes.eventDate.value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      document.querySelector("#event-capacity").value = 16;
      document.querySelector("#event-price").value = 69;
      document.querySelector("#event-room").value = "Event Loft";
      showToast("Wydarzenie dodane", "Nowa pozycja trafila do harmonogramu.");
      render();
    } catch (error) {
      showToast("Nie udalo sie", error.message);
    }
  });

  await loadOverview();
}

async function loadOverview() {
  state.overview = await api("/api/admin/overview");
  render();
}

function render() {
  const { stats } = state.overview;
  nodes.adminStats.innerHTML = [
    createStatCard("Regularne zajecia", stats.classes, "aktywne w grafiku"),
    createStatCard("Wydarzenia specjalne", stats.events, "warsztaty i masterclassy"),
    createStatCard("Lista rezerwowa", stats.waitlists, "oczekujace osoby"),
    createStatCard("Srednie oblozenie", `${stats.occupancy}%`, "we wszystkich sesjach"),
    createStatCard("Srednia ocen", stats.averageRating, "na podstawie opinii klientow"),
  ].join("");

  nodes.adminEvents.innerHTML = state.overview.sessions.length
    ? state.overview.sessions
        .map(
          (session) => `
            <article class="list-card">
              <div class="list-card__head">
                <div>
                  <p><strong>${escapeHtml(session.title)}</strong></p>
                  <p>${formatDate(session.date)} • ${session.time} • ${escapeHtml(session.instructorName)}</p>
                </div>
                <span class="status-pill ${session.isSpecialEvent ? "status-pill--event" : ""}">
                  ${session.isSpecialEvent ? "Specjalne" : "Regularne"}
                </span>
              </div>
              <div class="list-card__meta">
                <span>${escapeHtml(session.category)}</span>
                <span>${escapeHtml(session.level)}</span>
                <span>${escapeHtml(session.room)}</span>
                <span>${session.price} zl</span>
                <span>${session.attendeeIds.length}/${session.capacity} zapisanych</span>
              </div>
            </article>
          `
        )
        .join("")
    : renderEmpty("Brak zajec w systemie.");

  nodes.topClasses.innerHTML = state.overview.topClasses.length
    ? state.overview.topClasses
        .map(
          (item) => `
            <article class="list-card">
              <p><strong>${escapeHtml(item.title)}</strong></p>
              <p>${item.detail}</p>
              <div class="analytics-bar"><span style="width:${item.fillRate}%"></span></div>
            </article>
          `
        )
        .join("")
    : renderEmpty("Brak danych o popularnosci zajec.");

  nodes.trainerLoad.innerHTML = state.overview.trainerLoad.length
    ? state.overview.trainerLoad
        .map(
          (item) => `
            <article class="list-card">
              <p><strong>${escapeHtml(item.name)}</strong></p>
              <p>${escapeHtml(item.detail)}</p>
              <div class="analytics-bar"><span style="width:${item.percent}%"></span></div>
            </article>
          `
        )
        .join("")
    : renderEmpty("Brak danych o trenerach.");

  nodes.paymentFeed.innerHTML = state.overview.payments.length
    ? state.overview.payments
        .map(
          (payment) => `
            <article class="list-card">
              <p><strong>${payment.amount} zl</strong> • ${escapeHtml(payment.status)}</p>
              <p>${escapeHtml(payment.description)}</p>
              <small>${escapeHtml(payment.clientName)} • ${escapeHtml(payment.method)} • ${formatDateTime(payment.date)}</small>
            </article>
          `
        )
        .join("")
    : renderEmpty("Brak platnosci w historii.");
}
