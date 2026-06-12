import {
  api,
  createStatCard,
  escapeHtml,
  formatDate,
  formatDateTime,
  renderEmpty,
  sessionStatus,
  setOptions,
  showToast,
  requireRole,
  renderUserBar,
  saveCurrentUser,
} from "/assets/shared.js";

const currentUser = requireRole("CLIENT");
renderUserBar(currentUser);

const state = {
  reference: null,
  overview: null,
  activeClientId: "",
  filters: {
    category: "all",
    level: "all",
    instructorId: "all",
    date: "",
    search: "",
  },
};

const nodes = {
  clientSelect: document.querySelector("#client-select"),
  clientStats: document.querySelector("#client-stats"),
  passStore: document.querySelector("#pass-store"),
  notificationList: document.querySelector("#notification-list"),
  sessionGrid: document.querySelector("#session-grid"),
  bookingList: document.querySelector("#booking-list"),
  reviewSession: document.querySelector("#review-session"),
  reviewForm: document.querySelector("#review-form"),
  reviewText: document.querySelector("#review-text"),
  reviewRating: document.querySelector("#review-rating"),
  reviewList: document.querySelector("#review-list"),
  profileForm: document.querySelector("#profile-form"),
  profileName: document.querySelector("#profile-name"),
  profileEmail: document.querySelector("#profile-email"),
  profilePayment: document.querySelector("#profile-payment"),
  profilePassword: document.querySelector("#profile-password"),
  filterCategory: document.querySelector("#filter-category"),
  filterLevel: document.querySelector("#filter-level"),
  filterInstructor: document.querySelector("#filter-instructor"),
  filterDate: document.querySelector("#filter-date"),
  filterSearch: document.querySelector("#filter-search"),
};

await init();

async function init() {
  state.reference = await api("/api/reference");
  state.activeClientId = currentUser.id;
  bindEvents();
  populateStaticFilters();
  await loadOverview();
}

function bindEvents() {
  nodes.clientSelect.addEventListener("change", async () => {
    state.activeClientId = currentUser.id;
    await loadOverview();
  });

  nodes.filterCategory.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    renderSessions();
  });
  nodes.filterLevel.addEventListener("change", (event) => {
    state.filters.level = event.target.value;
    renderSessions();
  });
  nodes.filterInstructor.addEventListener("change", (event) => {
    state.filters.instructorId = event.target.value;
    renderSessions();
  });
  nodes.filterDate.addEventListener("change", (event) => {
    state.filters.date = event.target.value;
    renderSessions();
  });
  nodes.filterSearch.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    renderSessions();
  });

  nodes.reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const sessionId = nodes.reviewSession.value;
      const rating = Number(nodes.reviewRating.value);
      const text = nodes.reviewText.value.trim();
      if (!sessionId || !text) {
        throw new Error("Wybierz zajecia i wpisz tresc opinii.");
      }
      const result = await api(`/api/clients/${state.activeClientId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ sessionId, rating, text }),
      });
      state.overview = result.overview;
      nodes.reviewText.value = "";
      showToast("Opinia zapisana", "Dziekujemy za przeslanie recenzji.");
      render();
    } catch (error) {
      showToast("Nie udalo sie", error.message);
    }
  });


  nodes.profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = {
        name: nodes.profileName.value.trim(),
        email: nodes.profileEmail.value.trim(),
        defaultPaymentMethod: nodes.profilePayment.value,
        password: nodes.profilePassword.value,
      };
      const result = await api(`/api/users/${state.activeClientId}/profile`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      saveCurrentUser(result.user);
      Object.assign(currentUser, result.user);
      nodes.profilePassword.value = "";
      showToast("Profil zapisany", "Dane konta zostaly zaktualizowane.");
      await loadOverview();
    } catch (error) {
      showToast("Nie udalo sie", error.message);
    }
  });
}

function populateStaticFilters() {
  setOptions(nodes.filterCategory, [{ value: "all", label: "Wszystkie" }, ...state.reference.categories], "all");
  setOptions(nodes.filterLevel, [{ value: "all", label: "Wszystkie" }, ...state.reference.levels], "all");
  setOptions(
    nodes.filterInstructor,
    [{ value: "all", label: "Wszyscy" }].concat(
      state.reference.instructors.map((item) => ({ value: item.id, label: item.name }))
    ),
    "all"
  );
}

async function loadOverview() {
  if (!state.activeClientId) return;
  state.overview = await api(`/api/clients/${state.activeClientId}/overview`);
  render();
}

function render() {
  setOptions(
    nodes.clientSelect,
    [{ id: state.overview.client.id, name: state.overview.client.name }].map((client) => ({ value: client.id, label: client.name })),
    state.activeClientId
  );
  renderProfile();
  renderClientStats();
  renderPassStore();
  renderNotifications();
  renderSessions();
  renderBookings();
  renderReviewTargets();
  renderReviews();
}

function renderProfile() {
  const client = state.overview.client;
  nodes.profileName.value = client.name || "";
  nodes.profileEmail.value = client.email || "";
  nodes.profilePayment.value = client.defaultPaymentMethod || "BLIK";
}

function renderClientStats() {
  const { stats, client } = state.overview;
  nodes.clientStats.innerHTML = [
    createStatCard("Aktywne rezerwacje", stats.upcomingBookings, "zajecia przed klientem"),
    createStatCard("Wejscia w pakietach", stats.remainingCredits, "pozostale wejscia"),
    createStatCard("Open pass", stats.openPassActive ? "Aktywny" : "Brak", stats.openPassActive ? "regularne zajecia bez limitu" : "mozna dokupic karnet"),
    createStatCard("Listy rezerwowe", stats.waitlists, client.email),
  ].join("");
}

function renderPassStore() {
  nodes.passStore.innerHTML = state.overview.passCatalog
    .map(
      (pass) => `
        <article class="list-card">
          <p><strong>${escapeHtml(pass.name)}</strong></p>
          <p>${escapeHtml(pass.description)}</p>
          <p>${pass.price} zl</p>
          <button class="button button--secondary" data-buy-pass="${pass.id}">Kup karnet</button>
        </article>
      `
    )
    .join("");

  nodes.passStore.querySelectorAll("[data-buy-pass]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const result = await api(`/api/clients/${state.activeClientId}/passes`, {
          method: "POST",
          body: JSON.stringify({ passId: button.dataset.buyPass }),
        });
        state.overview = result.overview;
        showToast("Karnet aktywny", "Nowy pakiet zostal dodany do profilu klienta.");
        render();
      } catch (error) {
        showToast("Nie udalo sie", error.message);
      }
    });
  });
}

function renderNotifications() {
  const items = state.overview.notifications;
  nodes.notificationList.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="list-card">
              <p><strong>${escapeHtml(item.title)}</strong></p>
              <p>${escapeHtml(item.body)}</p>
              <small>${formatDateTime(item.createdAt)}</small>
            </article>
          `
        )
        .join("")
    : renderEmpty("Brak powiadomien dla wybranego klienta.");
}

function renderSessions() {
  const sessions = state.overview.sessions.filter((session) => {
    if (new Date(`${session.date}T${session.time}:00`) < new Date()) return false;
    if (state.filters.category !== "all" && session.category !== state.filters.category) return false;
    if (state.filters.level !== "all" && session.level !== state.filters.level) return false;
    if (state.filters.instructorId !== "all" && session.instructorId !== state.filters.instructorId) return false;
    if (state.filters.date && session.date !== state.filters.date) return false;
    if (state.filters.search) {
      const haystack = `${session.title} ${session.category} ${session.level} ${session.instructorName}`.toLowerCase();
      if (!haystack.includes(state.filters.search)) return false;
    }
    return true;
  });

  nodes.sessionGrid.innerHTML = sessions.length
    ? sessions.map(renderSessionCard).join("")
    : renderEmpty("Brak zajec pasujacych do wybranych filtrow.");

  nodes.sessionGrid.querySelectorAll("[data-reserve]").forEach((button) => {
    button.addEventListener("click", async () => {
      const sessionId = button.dataset.reserve;
      try {
        const result = await api(`/api/clients/${state.activeClientId}/reservations`, {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });
        state.overview = result.overview;
        showToast("Rezerwacja gotowa", "Miejsce zostalo potwierdzone.");
        render();
      } catch (error) {
        showToast("Nie udalo sie", error.message);
      }
    });
  });

  nodes.sessionGrid.querySelectorAll("[data-waitlist]").forEach((button) => {
    button.addEventListener("click", async () => {
      const sessionId = button.dataset.waitlist;
      try {
        const result = await api(`/api/clients/${state.activeClientId}/waitlist`, {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });
        state.overview = result.overview;
        showToast("Lista rezerwowa", "Klient zostal dopisany do kolejki.");
        render();
      } catch (error) {
        showToast("Nie udalo sie", error.message);
      }
    });
  });
}

function renderSessionCard(session) {
  const status = sessionStatus(session, state.activeClientId);
  const remaining = session.capacity - session.attendeeIds.length;
  const isBooked = session.attendeeIds.includes(state.activeClientId);
  const isWaitlisted = session.waitlistIds.includes(state.activeClientId);
  const button = isBooked
    ? `<button class="button button--ghost" disabled>Zapisano</button>`
    : isWaitlisted
      ? `<button class="button button--ghost" disabled>Na liscie rezerwowej</button>`
      : remaining > 0
        ? `<button class="button button--primary" data-reserve="${session.id}">Rezerwuj</button>`
        : `<button class="button button--secondary" data-waitlist="${session.id}">Dolacz do listy</button>`;

  return `
    <article class="session-card">
      <div class="session-card__head">
        <div>
          <small>${formatDate(session.date)} • ${session.time} • ${session.duration} min</small>
          <h3 class="session-card__title">${escapeHtml(session.title)}</h3>
        </div>
        <span class="status-pill ${status.modifier}">${status.text}</span>
      </div>
      <div class="session-card__meta">
        <span>${escapeHtml(session.category)}</span>
        <span>${escapeHtml(session.level)}</span>
        <span>${escapeHtml(session.instructorName)}</span>
        <span>${escapeHtml(session.room)}</span>
        <span>${session.price} zl</span>
      </div>
      <div class="availability">
        <div class="availability__bar">
          <span style="width:${Math.min((session.attendeeIds.length / session.capacity) * 100, 100)}%"></span>
        </div>
        <small>${session.attendeeIds.length}/${session.capacity} zapisanych • ${Math.max(remaining, 0)} wolnych miejsc</small>
      </div>
      <div class="tag-row">
        <span class="tag">${session.isSpecialEvent ? "Wydarzenie specjalne" : "Regularne zajecia"}</span>
        <span class="tag">${session.waitlistIds.length} na liscie rezerwowej</span>
      </div>
      <div style="margin-top:1rem;">${button}</div>
    </article>
  `;
}

function renderBookings() {
  const bookings = state.overview.bookings;
  nodes.bookingList.innerHTML = bookings.length
    ? bookings
        .map(
          (session) => `
            <article class="list-card">
              <div class="list-card__head">
                <div>
                  <p><strong>${escapeHtml(session.title)}</strong></p>
                  <p>${formatDate(session.date)} • ${session.time} • ${escapeHtml(session.instructorName)}</p>
                </div>
                <span class="status-pill ${new Date(`${session.date}T${session.time}:00`) < new Date() ? "status-pill--event" : ""}">
                  ${new Date(`${session.date}T${session.time}:00`) < new Date() ? "Zakonczone" : "Potwierdzone"}
                </span>
              </div>
              <div class="list-card__meta">
                <span>${escapeHtml(session.category)}</span>
                <span>${escapeHtml(session.room)}</span>
              </div>
              ${
                new Date(`${session.date}T${session.time}:00`) < new Date()
                  ? ""
                  : `<div style="margin-top:0.85rem;"><button class="button button--ghost" data-cancel="${session.id}">Anuluj rezerwacje</button></div>`
              }
            </article>
          `
        )
        .join("")
    : renderEmpty("Ten klient nie ma jeszcze aktywnych rezerwacji.");

  nodes.bookingList.querySelectorAll("[data-cancel]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const result = await api(`/api/clients/${state.activeClientId}/reservations/${button.dataset.cancel}`, {
          method: "DELETE",
        });
        state.overview = result.overview;
        showToast("Anulowano", "Rezerwacja zostala usunieta.");
        render();
      } catch (error) {
        showToast("Nie udalo sie", error.message);
      }
    });
  });
}

function renderReviewTargets() {
  const items = state.overview.reviewTargets;
  setOptions(
    nodes.reviewSession,
    items.length
      ? items.map((session) => ({ value: session.id, label: `${session.title} • ${formatDate(session.date)}` }))
      : [{ value: "", label: "Brak zajec do oceny" }],
    items[0]?.id || ""
  );
}

function renderReviews() {
  const reviews = state.overview.reviews;
  nodes.reviewList.innerHTML = reviews.length
    ? reviews
        .map(
          (review) => `
            <article class="list-card">
              <p><strong>${escapeHtml(review.sessionTitle)}</strong></p>
              <p>${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</p>
              <p>${escapeHtml(review.text)}</p>
              <small>${formatDateTime(review.createdAt)}</small>
            </article>
          `
        )
        .join("")
    : renderEmpty("Brak dodanych opinii dla tego klienta.");
}
