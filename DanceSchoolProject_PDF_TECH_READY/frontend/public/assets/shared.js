export async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Wystapil blad serwera.");
  }

  return data;
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function setOptions(select, items, selectedValue) {
  select.innerHTML = items
    .map((item) => {
      const option = typeof item === "string" ? { value: item, label: item } : item;
      const selected = option.value === selectedValue ? "selected" : "";
      return `<option value="${option.value}" ${selected}>${option.label}</option>`;
    })
    .join("");
}

export function ensureToastStack() {
  let stack = document.querySelector(".toast-stack");

  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.append(stack);
  }

  return stack;
}

export function showToast(title, body) {
  const stack = ensureToastStack();
  const toast = document.createElement("div");

  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><p>${body}</p>`;
  stack.append(toast);

  window.setTimeout(() => toast.remove(), 3200);
}

export function renderEmpty(message) {
  return `<article class="empty-state"><p>${message}</p></article>`;
}

export function createStatCard(label, value, note = "") {
  return `
    <article class="stat-card">
      <small>${label}</small>
      <span class="stat-card__value">${value}</span>
      <small>${note}</small>
    </article>
  `;
}

export function sessionStatus(session, activeClientId = null) {
  const remaining = session.capacity - session.attendeeIds.length;
  const booked = activeClientId ? session.attendeeIds.includes(activeClientId) : false;
  const waitlisted = activeClientId ? session.waitlistIds.includes(activeClientId) : false;

  if (booked) {
    return { text: "Zapisano", modifier: "" };
  }

  if (waitlisted) {
    return { text: "Lista rezerwowa", modifier: "status-pill--danger" };
  }

  if (session.isSpecialEvent) {
    return { text: "Wydarzenie", modifier: "status-pill--event" };
  }

  if (remaining <= 0) {
    return { text: "Pelna grupa", modifier: "status-pill--danger" };
  }

  return { text: `${remaining} wolnych miejsc`, modifier: "" };
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const CURRENT_USER_KEY = "pulseUser";

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

export function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function requireRole(role) {
  const user = getCurrentUser();
  const expectedRole = String(role || "").toUpperCase();
  const actualRole = String(user?.role || "").toUpperCase();

  if (!user || actualRole !== expectedRole) {
    window.location.href = "login.html";
    throw new Error("Unauthorized");
  }

  return user;
}

export function renderUserBar(user) {
  const nav = document.querySelector(".topnav");

  if (!nav || document.querySelector("#logout-button")) {
    return;
  }

  const wrapper = document.createElement("span");
  wrapper.className = "user-chip";
  wrapper.innerHTML = `
    <span>${escapeHtml(user.name)}</span>
    <button id="logout-button" class="button button--ghost" type="button">Wyloguj</button>
  `;

  nav.append(wrapper);

  wrapper.querySelector("#logout-button").addEventListener("click", () => {
    clearCurrentUser();
    window.location.href = "index.html";
  });
}