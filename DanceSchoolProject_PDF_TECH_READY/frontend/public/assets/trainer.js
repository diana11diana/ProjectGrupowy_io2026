import { api, createStatCard, escapeHtml, formatDate, renderEmpty, setOptions, showToast, requireRole, renderUserBar, saveCurrentUser } from "/assets/shared.js";

let currentUser = requireRole("INSTRUCTOR");
renderUserBar(currentUser);

const state = { reference: null, overview: null };
const nodes = {
  stats: document.querySelector("#trainer-stats"),
  sessions: document.querySelector("#trainer-sessions"),
  form: document.querySelector("#class-form"),
  profileForm: document.querySelector("#trainer-profile-form"),
  categorySelect: document.querySelector("#category-select"),
  levelSelect: document.querySelector("#level-select"),
  resetForm: document.querySelector("#reset-class-form"),
};

await init();

async function init() {
  state.reference = await api("/api/reference");
  setOptions(nodes.categorySelect, state.reference.categories);
  setOptions(nodes.levelSelect, state.reference.levels);
  nodes.form.addEventListener("submit", saveClass);
  nodes.resetForm.addEventListener("click", resetClassForm);
  nodes.profileForm.addEventListener("submit", saveProfile);
  await loadOverview();
}

async function loadOverview() {
  state.overview = await api(`/api/trainers/${currentUser.id}/overview`);
  fillProfile();
  render();
}

function fillProfile() {
  const trainer = state.overview.trainer;
  nodes.profileForm.name.value = trainer.name || "";
  nodes.profileForm.email.value = trainer.email || "";
  nodes.profileForm.specialties.value = trainer.specialties || "";
}

function render() {
  const { stats } = state.overview;
  nodes.stats.innerHTML = [
    createStatCard("Moje sesje", stats.totalSessions, "opublikowane w grafiku"),
    createStatCard("Uczestnicy", stats.totalAttendees, "lacznie zapisanych osob"),
    createStatCard("Obecnosci", stats.checkedAttendance, "potwierdzone wejscia"),
  ].join("");

  nodes.sessions.innerHTML = state.overview.sessions.length ? state.overview.sessions.map(renderSession).join("") : renderEmpty("Nie masz jeszcze zajec. Dodaj pierwsza propozycje po lewej stronie.");
  nodes.sessions.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => editClass(button.dataset.edit)));
  nodes.sessions.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => deleteClass(button.dataset.delete)));
  nodes.sessions.querySelectorAll("[data-attendance]").forEach((input) => input.addEventListener("change", () => markAttendance(input)));
}

function renderSession(session) {
  return `<article class="list-card"><div class="list-card__head"><div><p><strong>${escapeHtml(session.title)}</strong></p><p>${formatDate(session.date)} • ${session.time} • ${escapeHtml(session.room)}</p></div><span class="status-pill">${session.attendeeIds.length}/${session.capacity}</span></div><div class="list-card__meta"><span>${escapeHtml(session.category)}</span><span>${escapeHtml(session.level)}</span><span>${session.price} PLN</span><span>${session.isSpecialEvent ? "Warsztat" : "Regularne"}</span></div><div class="action-row"><button class="button button--secondary" data-edit="${session.id}">Edytuj</button><button class="button button--ghost" data-delete="${session.id}">Usun</button></div><div class="attendee-list">${session.attendees.length ? session.attendees.map((attendee) => `<label class="attendee"><span class="attendee__meta"><strong>${escapeHtml(attendee.name)}</strong><small>${attendee.present ? "Obecnosc potwierdzona" : "Czeka na oznaczenie"}</small></span><span><input type="checkbox" data-attendance="${session.id}:${attendee.id}" ${attendee.present ? "checked" : ""} /> Obecny</span></label>`).join("") : renderEmpty("Brak zapisanych uczestnikow.")}</div></article>`;
}

async function saveClass(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(nodes.form).entries());
  payload.specialEvent = nodes.form.specialEvent.checked;
  const sessionId = payload.sessionId;
  delete payload.sessionId;
  try {
    const result = await api(sessionId ? `/api/trainers/${currentUser.id}/classes/${sessionId}` : `/api/trainers/${currentUser.id}/classes`, { method: sessionId ? "PATCH" : "POST", body: JSON.stringify(payload) });
    state.overview = result.overview;
    resetClassForm();
    render();
    showToast("Zapisano", "Oferta trenera zostala zaktualizowana.");
  } catch (error) { showToast("Blad", error.message); }
}

function editClass(sessionId) {
  const session = state.overview.sessions.find((item) => item.id === sessionId);
  if (!session) return;
  nodes.form.sessionId.value = session.id;
  nodes.form.title.value = session.title;
  nodes.form.category.value = session.category;
  nodes.form.level.value = session.level;
  nodes.form.date.value = session.date;
  nodes.form.time.value = session.time;
  nodes.form.duration.value = session.duration;
  nodes.form.capacity.value = session.capacity;
  nodes.form.room.value = session.room;
  nodes.form.price.value = session.price;
  nodes.form.specialEvent.checked = Boolean(session.isSpecialEvent);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteClass(sessionId) {
  if (!confirm("Usunac te zajecia z grafiku?")) return;
  try {
    const result = await api(`/api/trainers/${currentUser.id}/classes/${sessionId}`, { method: "DELETE" });
    state.overview = result.overview;
    render();
    showToast("Usunieto", "Zajecia zostaly usuniete.");
  } catch (error) { showToast("Blad", error.message); }
}

async function markAttendance(input) {
  const [sessionId, memberId] = input.dataset.attendance.split(":");
  try {
    const result = await api(`/api/trainers/${currentUser.id}/attendance`, { method: "PATCH", body: JSON.stringify({ sessionId, memberId, present: input.checked }) });
    state.overview = result.overview;
    render();
  } catch (error) { showToast("Nie udalo sie", error.message); }
}

async function saveProfile(event) {
  event.preventDefault();
  try {
    const payload = Object.fromEntries(new FormData(nodes.profileForm).entries());
    const result = await api(`/api/users/${currentUser.id}/profile`, { method: "PATCH", body: JSON.stringify(payload) });
    currentUser = result.user;
    saveCurrentUser(currentUser);
    showToast("Profil zapisany", "Dane trenera zostaly zaktualizowane.");
  } catch (error) { showToast("Blad profilu", error.message); }
}

function resetClassForm() { nodes.form.reset(); nodes.form.sessionId.value = ""; nodes.form.duration.value = 75; nodes.form.capacity.value = 14; nodes.form.price.value = 39; }
