/* ==========================================================
   HD Barbearia — components/modal-client.js
   Modal "Cadastrar Cliente":
   - Nome completo obrigatório
   - Telefone/WhatsApp com máscara automática
   - E-mail opcional (validado quando preenchido)
   - Observações / Preferências de corte
   Ao salvar: adiciona à lista global (store/clients.js),
   exibe toast, fecha o modal e limpa o formulário.
   ========================================================== */

"use strict";

import { showToast } from "../components/toast.js";
import {
  openModal,
  closeModal,
  setFieldError,
  clearFieldError,
  isValidEmail,
} from "../utils.js";
import { addClient } from "../store/clients.js";
import { renderCommissionScreen } from "../screens/management.js";

/* ===== MÁSCARA DE WHATSAPP (XX) XXXXX-XXXX ===== */
function applyPhoneMask(input) {
  let digits = input.value.replace(/\D/g, "").slice(0, 11);
  let formatted = "";

  if (digits.length > 0) {
    formatted = "(" + digits.slice(0, 2);
  }
  if (digits.length >= 3) {
    formatted += ") ";
  }
  if (digits.length > 2) {
    formatted += digits.length <= 10 ? digits.slice(2, 6) : digits.slice(2, 7);
  }
  if (digits.length === 9) {
    formatted += "-" + digits.slice(6, 9);
  } else if (digits.length > 6) {
    formatted += digits.length <= 10 ? "-" + digits.slice(6, 10) : "-" + digits.slice(7, 11);
  }

  input.value = formatted;
}

function resetClientForm() {
  const fields = ["client-name", "client-phone", "client-email", "client-notes"];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["client-name", "client-email"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) clearFieldError(el);
  });
}

export function openClientModal() {
  resetClientForm();
  openModal("client-modal");
}

export function initClientModal() {
  const nameInput = document.getElementById("client-name");
  const phoneInput = document.getElementById("client-phone");
  const emailInput = document.getElementById("client-email");
  const notesInput = document.getElementById("client-notes");
  const saveBtn = document.getElementById("client-save");

  phoneInput.addEventListener("input", () => applyPhoneMask(phoneInput));

  [nameInput, emailInput].forEach((input) => {
    input.addEventListener("input", () => clearFieldError(input));
  });

  saveBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name) {
      setFieldError(nameInput, "Preencha este campo");
      showToast("Informe o nome do cliente", "warning");
      return;
    }

    if (email && !isValidEmail(email)) {
      setFieldError(emailInput, "Formato de e-mail inválido");
      showToast("E-mail inválido. Verifique o formato.", "warning");
      return;
    }

    addClient({
      name,
      phone: phoneInput.value,
      email,
      notes: notesInput.value,
    });

    renderCommissionScreen();
    closeModal("client-modal");
    resetClientForm();
    showToast("Cliente cadastrado com sucesso!", "success");
  });

  document.getElementById("btn-new-client").addEventListener("click", openClientModal);
}