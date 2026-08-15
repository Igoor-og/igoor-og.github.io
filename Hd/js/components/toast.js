/* ==========================================================
   HD Barbearia — components/toast.js
   Sistema de Notificação iOS (Dynamic Island / Top Banner).
   Substitui alert() nativo por um toast modular:
   pílula de vidro escuro fixa no topo central, entrada com
   leve elasticidade e fade-out automático após 2.5s.
   ========================================================== */

"use strict";

const TOAST_DURATION = 2500;

let toastEl = null;
let hideTimer = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function ensureToastElement() {
  if (toastEl) return toastEl;

  toastEl = document.getElementById("toast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "toast";
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
  }
  return toastEl;
}

export function showToast(message, type = "info") {
  if (hideTimer) {
    clearTimeout(hideTimer);
  }

  const el = ensureToastElement();
  el.className = "toast";
  el.classList.add(type);
  el.innerHTML = '<span class="toast-text">' + escapeHtml(message) + "</span>";

  void el.offsetWidth; // reinicia a animação caso já esteja visível
  el.classList.add("show");

  hideTimer = setTimeout(() => {
    el.classList.remove("show");
  }, TOAST_DURATION);
}

export default { showToast };