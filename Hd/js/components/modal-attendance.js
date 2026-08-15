/* ==========================================================
   HD Barbearia — components/modal-attendance.js
   Modal "Novo Atendimento" (iOS Top Sheet):
   - Busca de cliente com dropdown custom
   - Seleção múltipla de serviços via pílulas ativadas
   - Notificação via toast modular (components/toast.js)
   ========================================================== */

"use strict";

import { showToast } from "../components/toast.js";
import {
  formatBRL,
  setFieldError,
  clearFieldError,
  openModal,
  closeModal,
} from "../utils.js";
import { renderFeed, feedData } from "../screens/dashboard.js";
import { getClients, isFrequent } from "../store/clients.js";

const SERVICES = [
  { name: "Corte de Cabelo", value: 45 },
  { name: "Barba Completa", value: 35 },
  { name: "Combo Corte + Barba", value: 70 },
  { name: "Pigmentação", value: 25 },
  { name: "Sobrancelha", value: 15 },
];

const attendState = {
  client: null,
  services: [],
};

/* ===== HELPERS DE SELEÇÃO DE SERVIÇOS ===== */
function toggleService(service) {
  const idx = attendState.services.findIndex((s) => s.name === service.name);
  if (idx > -1) {
    attendState.services.splice(idx, 1);
  } else {
    attendState.services.push({ ...service });
  }
}

function selectedServiceNames() {
  return attendState.services.map((s) => s.name);
}

function clientInitials(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isRecorrente(name) {
  return isFrequent(name);
}

/* ===== VINCULAÇÃO DE ELEMENTOS DO MODAL (dentro do init) ===== */
export function initAttendModal() {
const clientInput = document.getElementById("attend-client");
const clientDropdown = document.getElementById("client-dropdown");
const recurrentList = document.getElementById("recurrent-list");
const allClientsList = document.getElementById("all-clients-list");
const dropdownEmpty = document.getElementById("dropdown-empty");
const clientDivider = document.getElementById("divider");

const serviceTrigger = document.getElementById("service-trigger");
const serviceTriggerText = document.getElementById("service-trigger-text");
const serviceMenu = document.getElementById("service-menu");
const servicePills = document.getElementById("service-pills");
const addServiceBtn = document.getElementById("add-service");
const attendTotalValue = document.getElementById("attend-total-value");
const submitBtn = document.getElementById("attend-submit");

const CLIENTS = getClients();

function clientOptionHtml(c, isRecorrente) {
  const starBadge = isRecorrente
    ? `
      <span class="client-badge">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z"></path>
        </svg>
        Recorrente
      </span>`
    : "";
  return `
    <button type="button" class="client-option${attendState.client === c.name ? " selected" : ""}" data-client="${c.name}">
      <span class="client-name">${c.name}</span>
      ${starBadge}
    </button>`;
}

function renderClientLists(query) {
  const term = (query || "").trim().toLowerCase();
  const recurrent = CLIENTS.filter((c) => c.frequent)
    .filter((c) => c.name.toLowerCase().includes(term))
    .slice(0, 3);
  const others = CLIENTS.filter((c) => !c.frequent)
    .filter((c) => c.name.toLowerCase().includes(term))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  recurrentList.innerHTML = recurrent.map((c) => clientOptionHtml(c, true)).join("");
  allClientsList.innerHTML = others.map((c) => clientOptionHtml(c, false)).join("");

  const hasAny = recurrent.length + others.length > 0;
  dropdownEmpty.style.display = hasAny ? "none" : "block";
  recurrentList.closest(".dropdown-section").style.display = recurrent.length > 0 ? "block" : "none";
  allClientsList.closest(".dropdown-section").style.display = others.length > 0 ? "block" : "none";
  clientDivider.style.display = hasAny ? "block" : "none";
}

clientInput.addEventListener("focus", () => {
  renderClientLists(clientInput.value);
  clientDropdown.classList.add("open");
  clientDivider.style.display = "block";
});

clientInput.addEventListener("input", () => {
  if (attendState.client && clientInput.value.trim().toLowerCase() !== attendState.client.toLowerCase()) {
    attendState.client = null;
  }
  renderClientLists(clientInput.value);
  clientDropdown.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".client-dropdown") && e.target !== clientInput) {
    clientDropdown.classList.remove("open");
  }
});

clientDropdown.addEventListener("click", (e) => {
  const option = e.target.closest(".client-option");
  if (!option) return;
  attendState.client = option.dataset.client;
  clientInput.value = attendState.client;
  clientDropdown.classList.remove("open");
  clearFieldError(clientInput);
});

function renderServiceMenu() {
  serviceMenu.innerHTML = SERVICES.map(
    (s) => {
      const active = selectedServiceNames().includes(s.name);
      return `
      <button type="button" class="service-option${active ? " selected" : ""}" data-name="${s.name}" data-value="${s.value}">
        <span>${s.name}</span>
        <span class="service-price">${formatBRL(s.value)}</span>
      </button>`;
    }
  ).join("");
}

function renderSelectedServices() {
  servicePills.innerHTML = attendState.services
    .map((s, i) => {
      return `
      <span class="service-pill selected">
        <span>${s.name}</span>
        <span class="pill-price">${formatBRL(s.value)}</span>
        <button type="button" class="pill-remove" data-index="${i}" aria-label="Remover serviço">&times;</button>
      </span>`;
    })
    .join("");

  const total = attendState.services.reduce((acc, s) => acc + s.value, 0);
  attendTotalValue.textContent = formatBRL(total);

  serviceTriggerText.textContent =
    attendState.services.length === 0
      ? "Selecione um serviço"
      : attendState.services.length + " serviço(s)";
  serviceTriggerText.style.color = attendState.services.length === 0 ? "" : "var(--white)";
  renderServiceMenu();
  clearServiceError();
}

function clearServiceError() {
  const err = document.getElementById("service-error");
  err.textContent = "";
  err.parentElement.classList.remove("invalid");
}

serviceTrigger.addEventListener("click", () => {
  renderServiceMenu();
  const isOpen = serviceMenu.classList.contains("open");
  serviceMenu.classList.toggle("open", !isOpen);
  serviceTrigger.classList.toggle("open", !isOpen);
});

serviceMenu.addEventListener("click", (e) => {
  const option = e.target.closest(".service-option");
  if (!option) return;
  toggleService({
    name: option.dataset.name,
    value: parseFloat(option.dataset.value),
  });
  renderSelectedServices();
});

addServiceBtn.addEventListener("click", () => {
  renderServiceMenu();
  serviceMenu.classList.add("open");
  serviceTrigger.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (
    !e.target.closest("#service-menu") &&
    !e.target.closest("#service-trigger") &&
    !e.target.closest("#add-service")
  ) {
    serviceMenu.classList.remove("open");
    serviceTrigger.classList.remove("open");
  }
});

servicePills.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill-remove");
  if (!btn) return;
  attendState.services.splice(parseInt(btn.dataset.index, 10), 1);
  renderSelectedServices();
});

function resetAttendModal() {
  attendState.client = null;
  attendState.services = [];
  clientInput.value = "";
  clientDropdown.classList.remove("open");
  clearFieldError(clientInput);
  renderClientLists();
  renderSelectedServices();
  renderServiceMenu();
  serviceMenu.classList.remove("open");
  serviceTrigger.classList.remove("open");
}

submitBtn.addEventListener("click", () => {
  let valid = true;

  if (!attendState.client) {
    if (!clientInput.value.trim()) {
      setFieldError(clientInput, "Selecione ou informe o cliente");
    } else {
      setFieldError(clientInput, "Escolha o cliente na lista");
    }
    valid = false;
  }

  if (attendState.services.length === 0) {
    const field = serviceTrigger.closest(".field");
    const err = document.getElementById("service-error");
    err.textContent = "Selecione pelo menos 1 serviço";
    field.classList.add("invalid");
    valid = false;
  }

  if (!valid) {
    showToast("Preencha os campos obrigatórios", "warning");
    return;
  }

  const total = attendState.services.reduce((acc, s) => acc + s.value, 0);
  const serviceNames = attendState.services.map((s) => s.name).join(" + ");
  const type = isRecorrente(attendState.client) ? "recorrente" : "novo";

  feedData.unshift({
    name: attendState.client,
    service: serviceNames,
    time: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    initials: clientInitials(attendState.client),
    type,
    value: formatBRL(total),
  });

  renderFeed();
  closeModal("attend-modal");
  resetAttendModal();
  showToast("Atendimento registrado e carimbo enviado!", "success");
});

/* ===== ABERTURA PELO BOTÃO DO DASHBOARD ===== */
document.getElementById("new-attend-btn").addEventListener("click", () => {
  resetAttendModal();
  openModal("attend-modal");
});

renderClientLists();
renderServiceMenu();
renderSelectedServices();
}