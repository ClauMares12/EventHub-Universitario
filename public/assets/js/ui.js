export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function showAlert(message, type = "success") {
  const area = qs("#alertArea");
  if (!area) return;
  area.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
}

export function setLoading(target, loading, text = "Guardando...") {
  const button = typeof target === "string" ? qs(target) : target;
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>${text}`;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

export function statusPill(status) {
  const labels = {
    draft: "Borrador",
    published: "Publicado",
    cancelled: "Cancelado",
    finished: "Finalizado",
    registered: "Registrado",
    attended: "Asistio"
  };
  return `<span class="status-pill status-${status}">${labels[status] || status}</span>`;
}

export function formatDate(value) {
  if (!value) return "-";
  const date = value.toDate ? value.toDate() : new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
}

export function emptyState(text) {
  return `<div class="empty-state">${text}</div>`;
}

export function fillSelect(select, items, placeholder = "Selecciona una opcion") {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach((item) => {
    select.insertAdjacentHTML("beforeend", `<option value="${item.id}">${item.name || item.title}</option>`);
  });
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
