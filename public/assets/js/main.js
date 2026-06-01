import { guestOnly, loginUser, logoutUser, protectPage, registerUser } from "./auth.js";
import { isFirebaseConfigured } from "./firebase.js";
import {
  changeEventStatus,
  createCategory,
  createEvent,
  deleteCategory,
  deleteEvent,
  deleteRegistration,
  listCollection,
  listRegistrations,
  publicEvents,
  registerAttendee,
  registrationsByEvent,
  updateCategory,
  updateEvent,
  updateRegistrationStatus
} from "./firestore.js";
import { positiveNumber, required, validDate, validEmail, validate, minLength } from "./validators.js";
import { emptyState, escapeHtml, fillSelect, formatDate, qs, qsa, setLoading, showAlert, statusPill } from "./ui.js";

const page = document.body.dataset.page;
let categories = [];
let events = [];
let registrations = [];

function configWarning() {
  if (!isFirebaseConfigured) {
    showAlert("Antes de usar la app, configura Firebase en public/assets/js/firebase.js.", "warning");
  }
}

function wireLogout() {
  qs("#logoutBtn")?.addEventListener("click", logoutUser);
}

function categoryName(id) {
  return categories.find((item) => item.id === id)?.name || "Sin categoria";
}

function eventTitle(id) {
  return events.find((item) => item.id === id)?.title || "Evento eliminado";
}

async function loadBaseData() {
  categories = await listCollection("event_categories", "createdAt");
  events = await listCollection("events", "createdAt");
}

async function initLogin() {
  guestOnly();
  configWarning();
  qs("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    setLoading("#loginBtn", true, "Entrando...");
    try {
      await loginUser(qs("#loginEmail").value, qs("#loginPassword").value);
      window.location.href = "dashboard.html";
    } catch (error) {
      showAlert(error.message, "danger");
    } finally {
      setLoading("#loginBtn", false);
    }
  });
}

async function initRegister() {
  guestOnly();
  configWarning();
  qs("#registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = {
      name: qs("#registerName").value.trim(),
      email: qs("#registerEmail").value.trim(),
      password: qs("#registerPassword").value
    };
    const errors = validate([
      { value: data.name, rule: (v) => minLength(v, 3), message: "El nombre debe tener minimo 3 caracteres." },
      { value: data.email, rule: validEmail, message: "Escribe un correo valido." },
      { value: data.password, rule: (v) => minLength(v, 6), message: "La contraseña debe tener minimo 6 caracteres." }
    ]);
    if (errors.length) return showAlert(errors.join("<br>"), "danger");
    setLoading("#registerBtn", true, "Creando...");
    try {
      await registerUser(data);
      window.location.href = "dashboard.html";
    } catch (error) {
      showAlert(error.message, "danger");
    } finally {
      setLoading("#registerBtn", false);
    }
  });
}

async function initPublic() {
  configWarning();
  categories = await listCollection("event_categories", "createdAt");
  fillSelect(qs("#filterCategory"), categories.filter((item) => item.active), "Todas las categorias");
  events = await publicEvents();
  await renderPublicEvents();
  qs("#filterCategory").addEventListener("change", renderPublicEvents);
  qs("#filterDate").addEventListener("change", renderPublicEvents);
  qs("#registrationForm").addEventListener("submit", savePublicRegistration);
}

async function renderPublicEvents() {
  const category = qs("#filterCategory").value;
  const date = qs("#filterDate").value;
  const container = qs("#publicEvents");
  let filtered = [...events];
  if (category) filtered = filtered.filter((item) => item.categoryId === category);
  if (date) filtered = filtered.filter((item) => item.eventDate === date);
  if (!filtered.length) {
    container.innerHTML = `<div class="col-12">${emptyState("No hay eventos publicados con esos filtros.")}</div>`;
    return;
  }
  const countPairs = await Promise.all(filtered.map(async (item) => [item.id, (await registrationsByEvent(item.id)).filter((reg) => reg.status !== "cancelled").length]));
  const counts = Object.fromEntries(countPairs);
  container.innerHTML = filtered.map((item) => `
    <div class="col-md-6 col-xl-4">
      <article class="event-card">
        <div class="d-flex justify-content-between gap-2 mb-2">
          <span class="badge text-bg-primary">${escapeHtml(categoryName(item.categoryId))}</span>
          ${statusPill(item.status)}
        </div>
        <h3 class="h5">${escapeHtml(item.title)}</h3>
        <p class="muted">${escapeHtml(item.description)}</p>
        <p class="mb-1"><strong>Fecha:</strong> ${formatDate(item.eventDate)} de ${item.startTime} a ${item.endTime}</p>
        <p class="mb-1"><strong>Lugar:</strong> ${escapeHtml(item.location)}</p>
        <p class="mb-3"><strong>Cupo:</strong> ${counts[item.id] || 0}/${item.capacity}</p>
        <button class="btn btn-primary w-100" data-register="${item.id}" ${counts[item.id] >= Number(item.capacity) ? "disabled" : ""}>Registrarme</button>
      </article>
    </div>
  `).join("");
  qsa("[data-register]").forEach((button) => button.addEventListener("click", () => {
    qs("#registrationEventId").value = button.dataset.register;
    bootstrap.Modal.getOrCreateInstance(qs("#registrationModal")).show();
  }));
}

async function savePublicRegistration(event) {
  event.preventDefault();
  const data = {
    eventId: qs("#registrationEventId").value,
    studentName: qs("#studentName").value.trim(),
    studentEmail: qs("#studentEmail").value.trim(),
    studentId: qs("#studentId").value.trim()
  };
  const errors = validate([
    { value: data.studentName, rule: (v) => minLength(v, 3), message: "El nombre debe tener minimo 3 caracteres." },
    { value: data.studentEmail, rule: validEmail, message: "Escribe un correo valido." },
    { value: data.studentId, rule: (v) => minLength(v, 4), message: "La matricula debe tener minimo 4 caracteres." }
  ]);
  if (errors.length) return showAlert(errors.join("<br>"), "danger");
  setLoading("#saveRegistrationBtn", true);
  try {
    await registerAttendee(data);
    bootstrap.Modal.getOrCreateInstance(qs("#registrationModal")).hide();
    qs("#registrationForm").reset();
    events = await publicEvents();
    await renderPublicEvents();
    showAlert("Registro realizado correctamente. Guarda tu codigo de confirmacion en el correo mostrado.");
  } catch (error) {
    showAlert(error.message, "danger");
  } finally {
    setLoading("#saveRegistrationBtn", false);
  }
}

async function initDashboard() {
  await protectPage();
  wireLogout();
  configWarning();
  await loadBaseData();
  registrations = await listRegistrations();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((item) => item.eventDate >= today && item.status === "published").sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  qs("#stats").innerHTML = [
    ["Total de eventos", events.length],
    ["Eventos proximos", upcoming.length],
    ["Eventos cancelados", events.filter((item) => item.status === "cancelled").length],
    ["Total de asistentes", registrations.filter((item) => item.status !== "cancelled").length]
  ].map(([label, value]) => `<div class="col-md-6 col-xl-3"><div class="stat-card"><div class="value">${value}</div><div class="muted">${label}</div></div></div>`).join("");
  qs("#upcomingEvents").innerHTML = upcoming.length ? `
    <div class="table-responsive"><table class="table"><thead><tr><th>Evento</th><th>Categoria</th><th>Fecha</th><th>Lugar</th></tr></thead><tbody>
    ${upcoming.slice(0, 8).map((item) => `<tr><td>${escapeHtml(item.title)}</td><td>${escapeHtml(categoryName(item.categoryId))}</td><td>${formatDate(item.eventDate)}</td><td>${escapeHtml(item.location)}</td></tr>`).join("")}
    </tbody></table></div>` : emptyState("Aun no hay eventos proximos publicados.");
}

async function initCategories() {
  await protectPage();
  wireLogout();
  configWarning();
  await renderCategories();
  qs("#categoryForm").addEventListener("submit", saveCategory);
  qs("#categorySearch").addEventListener("input", renderCategories);
  qs("#clearCategorySearch").addEventListener("click", () => { qs("#categorySearch").value = ""; renderCategories(); });
  qs("#cancelCategoryEdit").addEventListener("click", resetCategoryForm);
}

async function renderCategories() {
  categories = await listCollection("event_categories", "createdAt");
  const search = (qs("#categorySearch")?.value || "").toLowerCase();
  const filtered = categories.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(search));
  qs("#categoriesTable").innerHTML = filtered.length ? filtered.map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.description)}</td><td>${item.active ? "Si" : "No"}</td>
      <td class="text-end"><button class="btn btn-sm btn-outline-primary" data-edit-category="${item.id}">Editar</button> <button class="btn btn-sm btn-outline-danger" data-delete-category="${item.id}">Eliminar</button></td>
    </tr>`).join("") : `<tr><td colspan="4">${emptyState("No hay categorias registradas.")}</td></tr>`;
  qsa("[data-edit-category]").forEach((btn) => btn.addEventListener("click", () => editCategory(btn.dataset.editCategory)));
  qsa("[data-delete-category]").forEach((btn) => btn.addEventListener("click", () => removeCategory(btn.dataset.deleteCategory)));
}

function editCategory(id) {
  const item = categories.find((cat) => cat.id === id);
  qs("#categoryId").value = item.id;
  qs("#categoryName").value = item.name;
  qs("#categoryDescription").value = item.description;
  qs("#categoryActive").checked = Boolean(item.active);
  qs("#categoryFormTitle").textContent = "Editar categoria";
}

function resetCategoryForm() {
  qs("#categoryForm").reset();
  qs("#categoryId").value = "";
  qs("#categoryActive").checked = true;
  qs("#categoryFormTitle").textContent = "Nueva categoria";
}

async function saveCategory(event) {
  event.preventDefault();
  const id = qs("#categoryId").value;
  const data = {
    name: qs("#categoryName").value.trim(),
    description: qs("#categoryDescription").value.trim(),
    active: qs("#categoryActive").checked
  };
  const errors = validate([
    { value: data.name, rule: (v) => minLength(v, 3), message: "El nombre debe tener minimo 3 caracteres." },
    { value: data.description, rule: (v) => minLength(v, 5), message: "La descripcion debe tener minimo 5 caracteres." }
  ]);
  if (errors.length) return showAlert(errors.join("<br>"), "danger");
  setLoading("#saveCategoryBtn", true);
  try {
    if (id) await updateCategory(id, data);
    else await createCategory(data);
    resetCategoryForm();
    await renderCategories();
    showAlert("Categoria guardada correctamente.");
  } catch (error) {
    showAlert(error.message, "danger");
  } finally {
    setLoading("#saveCategoryBtn", false);
  }
}

async function removeCategory(id) {
  if (!confirm("¿Eliminar esta categoria?")) return;
  await deleteCategory(id);
  await renderCategories();
  showAlert("Categoria eliminada.");
}

async function initEvents() {
  await protectPage();
  wireLogout();
  configWarning();
  await renderEventsPage();
  qs("#eventForm").addEventListener("submit", saveEvent);
  qs("#eventSearch").addEventListener("input", renderEventsTable);
  qs("#eventStatusFilter").addEventListener("change", renderEventsTable);
  qs("#cancelEventEdit").addEventListener("click", resetEventForm);
}

async function renderEventsPage() {
  await loadBaseData();
  fillSelect(qs("#eventCategory"), categories.filter((item) => item.active));
  await renderEventsTable();
}

async function renderEventsTable() {
  registrations = await listRegistrations();
  const search = (qs("#eventSearch")?.value || "").toLowerCase();
  const status = qs("#eventStatusFilter")?.value || "";
  let filtered = events.filter((item) => `${item.title} ${item.description} ${item.location}`.toLowerCase().includes(search));
  if (status) filtered = filtered.filter((item) => item.status === status);
  qs("#eventsTable").innerHTML = filtered.length ? filtered.map((item) => {
    const count = registrations.filter((reg) => reg.eventId === item.id && reg.status !== "cancelled").length;
    return `<tr>
      <td>${escapeHtml(item.title)}</td><td>${escapeHtml(categoryName(item.categoryId))}</td><td>${formatDate(item.eventDate)}</td><td>${count}/${item.capacity}</td><td>${statusPill(item.status)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary" data-detail-event="${item.id}">Ver</button>
        <button class="btn btn-sm btn-outline-primary" data-edit-event="${item.id}">Editar</button>
        <button class="btn btn-sm btn-outline-warning" data-cancel-event="${item.id}">Cancelar</button>
        <button class="btn btn-sm btn-outline-danger" data-delete-event="${item.id}">Eliminar</button>
      </td>
    </tr>`;
  }).join("") : `<tr><td colspan="6">${emptyState("No hay eventos registrados.")}</td></tr>`;
  qsa("[data-detail-event]").forEach((btn) => btn.addEventListener("click", () => showEventDetail(btn.dataset.detailEvent)));
  qsa("[data-edit-event]").forEach((btn) => btn.addEventListener("click", () => editEvent(btn.dataset.editEvent)));
  qsa("[data-cancel-event]").forEach((btn) => btn.addEventListener("click", () => cancelEvent(btn.dataset.cancelEvent)));
  qsa("[data-delete-event]").forEach((btn) => btn.addEventListener("click", () => removeEvent(btn.dataset.deleteEvent)));
}

function editEvent(id) {
  const item = events.find((event) => event.id === id);
  qs("#eventId").value = item.id;
  qs("#eventTitle").value = item.title;
  qs("#eventDescription").value = item.description;
  qs("#eventCategory").value = item.categoryId;
  qs("#eventLocation").value = item.location;
  qs("#eventDate").value = item.eventDate;
  qs("#eventStart").value = item.startTime;
  qs("#eventEnd").value = item.endTime;
  qs("#eventCapacity").value = item.capacity;
  qs("#eventStatus").value = item.status;
  qs("#eventFormTitle").textContent = "Editar evento";
  qs("#eventForm").scrollIntoView({ behavior: "smooth" });
}

function resetEventForm() {
  qs("#eventForm").reset();
  qs("#eventId").value = "";
  qs("#eventStatus").value = "draft";
  qs("#eventFormTitle").textContent = "Nuevo evento";
}

async function saveEvent(event) {
  event.preventDefault();
  const id = qs("#eventId").value;
  const data = {
    title: qs("#eventTitle").value.trim(),
    description: qs("#eventDescription").value.trim(),
    categoryId: qs("#eventCategory").value,
    location: qs("#eventLocation").value.trim(),
    eventDate: qs("#eventDate").value,
    startTime: qs("#eventStart").value,
    endTime: qs("#eventEnd").value,
    capacity: qs("#eventCapacity").value,
    status: qs("#eventStatus").value
  };
  const errors = validate([
    { value: data.title, rule: (v) => minLength(v, 4), message: "El titulo debe tener minimo 4 caracteres." },
    { value: data.description, rule: (v) => minLength(v, 10), message: "La descripcion debe tener minimo 10 caracteres." },
    { value: data.categoryId, rule: required, message: "Selecciona una categoria." },
    { value: data.location, rule: (v) => minLength(v, 3), message: "Escribe un lugar valido." },
    { value: data.eventDate, rule: validDate, message: "Selecciona una fecha valida." },
    { value: data.capacity, rule: positiveNumber, message: "El cupo debe ser positivo." }
  ]);
  if (data.endTime <= data.startTime) errors.push("La hora final debe ser mayor que la hora inicial.");
  if (errors.length) return showAlert(errors.join("<br>"), "danger");
  setLoading("#saveEventBtn", true);
  try {
    if (id) await updateEvent(id, data);
    else await createEvent(data);
    resetEventForm();
    await renderEventsPage();
    showAlert("Evento guardado correctamente.");
  } catch (error) {
    showAlert(error.message, "danger");
  } finally {
    setLoading("#saveEventBtn", false);
  }
}

function showEventDetail(id) {
  const item = events.find((event) => event.id === id);
  const count = registrations.filter((reg) => reg.eventId === id && reg.status !== "cancelled").length;
  qs("#eventDetailBody").innerHTML = `
    <h4>${escapeHtml(item.title)}</h4>
    <p>${escapeHtml(item.description)}</p>
    <dl class="row">
      <dt class="col-sm-3">Categoria</dt><dd class="col-sm-9">${escapeHtml(categoryName(item.categoryId))}</dd>
      <dt class="col-sm-3">Fecha</dt><dd class="col-sm-9">${formatDate(item.eventDate)} ${item.startTime}-${item.endTime}</dd>
      <dt class="col-sm-3">Lugar</dt><dd class="col-sm-9">${escapeHtml(item.location)}</dd>
      <dt class="col-sm-3">Cupo</dt><dd class="col-sm-9">${count}/${item.capacity}</dd>
      <dt class="col-sm-3">Estado</dt><dd class="col-sm-9">${statusPill(item.status)}</dd>
    </dl>`;
  bootstrap.Modal.getOrCreateInstance(qs("#eventDetailModal")).show();
}

async function cancelEvent(id) {
  if (!confirm("¿Cancelar este evento?")) return;
  await changeEventStatus(id, "cancelled");
  await renderEventsPage();
  showAlert("Evento cancelado.");
}

async function removeEvent(id) {
  if (!confirm("¿Eliminar este evento definitivamente?")) return;
  await deleteEvent(id);
  await renderEventsPage();
  showAlert("Evento eliminado.");
}

async function initRegistrations() {
  await protectPage();
  wireLogout();
  configWarning();
  await renderRegistrationsPage();
  qs("#registrationEventFilter").addEventListener("change", renderRegistrationsTable);
  qs("#registrationSearch").addEventListener("input", renderRegistrationsTable);
}

async function renderRegistrationsPage() {
  await loadBaseData();
  registrations = await listRegistrations();
  fillSelect(qs("#registrationEventFilter"), events, "Todos los eventos");
  renderRegistrationsTable();
}

function renderRegistrationsTable() {
  const eventId = qs("#registrationEventFilter").value;
  const search = (qs("#registrationSearch").value || "").toLowerCase();
  let filtered = registrations.filter((item) => `${item.studentName} ${item.studentEmail} ${item.studentId}`.toLowerCase().includes(search));
  if (eventId) filtered = filtered.filter((item) => item.eventId === eventId);
  qs("#registrationsTable").innerHTML = filtered.length ? filtered.map((item) => `
    <tr>
      <td>${escapeHtml(item.studentName)}</td><td>${escapeHtml(item.studentEmail)}</td><td>${escapeHtml(item.studentId)}</td><td>${escapeHtml(eventTitle(item.eventId))}</td><td>${statusPill(item.status)}</td><td>${escapeHtml(item.confirmationCode || "-")}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-success" data-attended="${item.id}">Asistio</button>
        <button class="btn btn-sm btn-outline-warning" data-cancel-registration="${item.id}">Cancelar</button>
        <button class="btn btn-sm btn-outline-danger" data-delete-registration="${item.id}">Eliminar</button>
      </td>
    </tr>`).join("") : `<tr><td colspan="7">${emptyState("No hay asistentes registrados.")}</td></tr>`;
  qsa("[data-attended]").forEach((btn) => btn.addEventListener("click", () => changeRegistration(btn.dataset.attended, "attended")));
  qsa("[data-cancel-registration]").forEach((btn) => btn.addEventListener("click", () => changeRegistration(btn.dataset.cancelRegistration, "cancelled")));
  qsa("[data-delete-registration]").forEach((btn) => btn.addEventListener("click", () => removeRegistration(btn.dataset.deleteRegistration)));
}

async function changeRegistration(id, status) {
  await updateRegistrationStatus(id, status);
  await renderRegistrationsPage();
  showAlert("Registro actualizado.");
}

async function removeRegistration(id) {
  if (!confirm("¿Eliminar este registro?")) return;
  await deleteRegistration(id);
  await renderRegistrationsPage();
  showAlert("Registro eliminado.");
}

const initializers = {
  public: initPublic,
  login: initLogin,
  register: initRegister,
  dashboard: initDashboard,
  categories: initCategories,
  events: initEvents,
  registrations: initRegistrations
};

initializers[page]?.().catch((error) => showAlert(error.message, "danger"));
