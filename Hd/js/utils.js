/* ==========================================================
   HD Barbearia — utils.js
   Utilidades compartilhadas: formatadores, toast, modais,
   validação de campos e loading de botões.
   ========================================================== */

"use strict";

export function formatBRL(value) {
  return "R$ " + value.toFixed(2).replace(".", ",");
}

export function roundNum(value) {
  return Math.round(value * 100) / 100;
}

export function nowLocalValue() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

/* ===== MODAIS ===== */
export function openModal(id) {
  document.getElementById(id).classList.add("show");
}

export function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeModal(btn.dataset.close);
  });
});

document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", () => {
    closeModal(backdrop.closest(".modal").id);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.show").forEach((modal) => {
      closeModal(modal.id);
    });
  }
});

/* ===== VALIDAÇÃO DE CAMPOS ===== */
export function setFieldError(input, message) {
  const field = input.closest(".field");
  const errorSpan = field.querySelector(".input-error");
  input.classList.add("invalid");
  if (message) {
    errorSpan.textContent = message;
  }
  field.classList.add("invalid");
}

export function clearFieldError(input) {
  const field = input.closest(".field");
  field.classList.remove("invalid");
  input.classList.remove("invalid");
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateRequiredFields(inputs) {
  let valid = true;
  inputs.forEach((input) => {
    if (!input.value.trim()) {
      setFieldError(input, "Preencha este campo");
      valid = false;
    } else {
      clearFieldError(input);
    }
  });
  return valid;
}

/* ===== INDICAÇÃO DE CARREGAMENTO NO BOTÃO ===== */
export function showButtonLoading(button, loadingLabel) {
  const label = button.querySelector(".btn-label");
  const originalText = label.textContent;
  button.classList.add("is-loading");
  button.innerHTML = '<span class="spinner" aria-hidden="true"></span>';
  button.setAttribute("aria-label", loadingLabel);
  return originalText;
}

export function resetButton(button, originalText) {
  button.classList.remove("is-loading");
  button.innerHTML = '<span class="btn-label">' + originalText + "</span>";
  button.removeAttribute("aria-label");
}