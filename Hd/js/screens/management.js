/* ==========================================================
   HD Barbearia — screens/management.js
   Tela 7: Gestão & Comissões
   - Resumo: métricas + retenção
   - Equipe: perfil do barbeiro, painel financeiro,
     gráfico comparativo e histórico editável de pagamentos
   - Clientes: busca, filtros e lista ultra compacta
   ========================================================== */

"use strict";

import { APP_CONFIG } from "../config.js";
import {
  formatBRL,
  nowLocalValue,
  openModal,
  closeModal,
} from "../utils.js";
import { showToast } from "../components/toast.js";
import { switchScreen } from "../app.js";
import { getClients } from "../store/clients.js";

/* ===== ESTADO ===== */
const barberState = {
  name: "Pedro",
  email: "pedro@hdbarbearia.com",
  password: "",
  gross: 1260.0,
  cutRate: APP_CONFIG.defaultCutPercentage,
  lastPayment: null,
};

/* ===== CLIENTES: VEM DO STORE GLOBAL (store/clients.js) ===== */
const xrayClients = getClients();

let paymentIdSeq = 2;
const paymentHistory = [
  {
    id: 1,
    month: "2026-06",
    datetime: "2026-06-12 15:00",
    value: 610.0,
    method: "Pix",
  },
  {
    id: 2,
    month: "2026-07",
    datetime: "2026-07-10 18:30",
    value: 665.0,
    method: "Dinheiro",
  },
];

let selectedPayMethod = "Pix";
let selectedPayEditMethod = "Pix";
let activeClientFilter = "todos";
let clientSearch = "";
let editingPaymentId = null;
let editingClientIndex = null;
let pendingDeleteId = null;

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/* ===== HELPERS ===== */
function round2(value) {
  return Math.round(value * 100) / 100;
}

function monthLabel(key) {
  const parts = String(key).split("-");
  if (parts.length < 2) return key;
  const m = parseInt(parts[1], 10) - 1;
  return (MONTH_NAMES[m] || key) + " " + parts[0];
}

function monthKeyOf(datetime) {
  return String(datetime).slice(0, 7);
}

function currentMonthKey() {
  return monthKeyOf(nowLocalValue());
}

function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function commissionOwed() {
  return (barberState.gross * barberState.cutRate) / 100;
}

function currentMonthPayments() {
  const key = currentMonthKey();
  return paymentHistory.filter((p) => p.month === key);
}

function currentMonthPaidSum() {
  return currentMonthPayments().reduce((acc, p) => acc + p.value, 0);
}

function pendingPayable() {
  return Math.max(0, round2(commissionOwed() - currentMonthPaidSum()));
}

function isSettled() {
  return pendingPayable() <= 0.001;
}

function buildFinanceData() {
  const paid = currentMonthPaidSum();
  return [
    { month: "Mar", gross: 1180, commission: 590 },
    { month: "Abr", gross: 1340, commission: 610 },
    { month: "Mai", gross: 1420, commission: 700 },
    { month: "Jun", gross: 1280, commission: 540 },
    { month: "Jul", gross: 1500, commission: 665 },
    { month: "Ago", gross: barberState.gross, commission: round2(paid) },
  ];
}

/* ===== RENDERERS ===== */
function renderRetention() {
  const total = Math.max(xrayClients.length, 1);
  const recorrentes = xrayClients.filter((c) => c.status === "recorrente").length;
  const novos = xrayClients.filter((c) => c.status === "novo").length;
  const recPct = (recorrentes / total) * 100;
  const newPct = (novos / total) * 100;
  document.getElementById("retention-pct").textContent = Math.round(recPct) + "%";
  document.getElementById("ret-rec").style.width = recPct + "%";
  document.getElementById("ret-new").style.width = newPct + "%";
}

function updateBarberStatus() {
  const card = document.getElementById("barber-card");
  const statusTag = document.getElementById("pay-status-tag");
  const statusRow = document.getElementById("barber-status-row");
  const openBtn = document.getElementById("btn-open-pay");
  const stamp = document.getElementById("receipt-stamp");

  if (isSettled()) {
    card.classList.add("settled");
    statusTag.textContent = "QUITADO";
    statusTag.classList.add("status-settled");
    statusRow.classList.add("status-row-settled");
    openBtn.style.display = "none";
    const last = currentMonthPayments().sort(
      (a, b) => b.datetime.localeCompare(a.datetime)
    )[0];
    if (last) {
      stamp.style.display = "block";
      stamp.innerHTML =
        "Pago via " + last.method + " em " + last.datetime + " · " + monthLabel(last.month);
    }
  } else {
    card.classList.remove("settled");
    statusTag.textContent = "A PAGAR";
    statusTag.classList.remove("status-settled");
    statusRow.classList.remove("status-row-settled");
    openBtn.style.display = "";
    stamp.style.display = "none";
  }
}

function renderFinanceChart() {
  const data = buildFinanceData();
  const max = Math.max(...data.map((d) => Math.max(d.gross, d.commission))) || 1;
  document.getElementById("finchart").innerHTML = data
    .map(
      (d) => `
      <div class="fin-col">
        <div class="fin-bars">
          <div class="fin-bar fin-gross" style="height:${(d.gross / max) * 100}%"></div>
          <div class="fin-bar fin-commission" style="height:${(d.commission / max) * 100}%"></div>
        </div>
        <span class="fin-month">${d.month}</span>
      </div>`
    )
    .join("");
}

function renderClosureList() {
  const list = document.getElementById("closure-list");

  if (paymentHistory.length === 0) {
    list.innerHTML = '<div class="sales-empty">Nenhum pagamento registrado ainda.</div>';
    return;
  }

  list.innerHTML = paymentHistory
    .slice()
    .sort((a, b) => b.month.localeCompare(a.month) || b.datetime.localeCompare(a.datetime))
    .map((p) => {
      const isDeleting = p.id === pendingDeleteId;
      const deleteBtn = isDeleting
        ? '<button type="button" class="row-icon-btn confirm" data-action="delete" data-id="' +
          p.id +
          '">Confirmar?</button>'
        : '<button type="button" class="row-icon-btn" data-action="delete" data-id="' +
          p.id +
          '" aria-label="Excluir pagamento">' +
          deleteIcon() +
          "</button>";
      return `
      <div class="closure-item${isDeleting ? " confirm-mode" : ""}">
        <div class="closure-item-info">
          <span class="closure-item-name">${monthLabel(p.month)}</span>
          <span class="closure-item-meta">${p.datetime} · ${p.method}</span>
        </div>
        <div class="closure-item-right">
          <span class="closure-item-value">${formatBRL(p.value)}</span>
          <div class="row-actions">
            <button type="button" class="row-icon-btn" data-action="edit" data-id="${
              p.id
            }" aria-label="Editar pagamento">${editIcon()}</button>
            ${deleteBtn}
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function renderXrayList() {
  const term = clientSearch.trim().toLowerCase();
  const filtered = xrayClients
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => {
      if (activeClientFilter === "recorrentes") return c.status === "recorrente";
      if (activeClientFilter === "novos") return c.status === "novo";
      if (activeClientFilter === "inativos") return c.status === "sumido";
      return true;
    })
    .filter(({ c }) => !term || c.name.toLowerCase().includes(term));

  const list = document.getElementById("client-xray-list");
  if (filtered.length === 0) {
    list.innerHTML = '<div class="sales-empty">Nenhum cliente encontrado.</div>';
    return;
  }

  list.innerHTML = filtered
    .map(({ c, i }) => {
      const statusLabel =
        c.status === "recorrente"
          ? "Recorrente"
          : c.status === "sumido"
          ? "Inativo"
          : "Novo";
      const waMessage = encodeURIComponent(
        "Olá " + c.name + "! Estamos com um convite especial para você na HD Barbearia. Vem cortar com a gente!"
      );
      return `
      <div class="client-ray-item">
        <span class="client-ray-name">${c.name}</span>
        <span class="client-ray-status status-${c.status}">${statusLabel}</span>
        <a class="wa-icon-btn" href="https://wa.me/${
          c.phone
        }?text=${waMessage}" target="_blank" rel="noopener" aria-label="Enviar mensagem por WhatsApp para ${c.name}">
          ${whatsappIcon()}
        </a>
        <button type="button" class="row-icon-btn" data-action="edit-client" data-index="${i}" aria-label="Editar dados de ${c.name}">
          ${editIcon()}
        </button>
      </div>`;
    })
    .join("");
}

/* ===== ÍCONES SVG MINIMALISTAS (16px) ===== */
function editIcon() {
  return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>';
}

function deleteIcon() {
  return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>';
}

function whatsappIcon() {
  return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.18-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.01-.37.11-.5.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.54-.42h-.5c-.16 0-.42.06-.63.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.66 2.53 4.02 3.55.56.24 1 .38 1.34.49.57.18 1.08.16 1.48.1.46-.08 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/></svg>';
}

/* ===== PAINEL PRINCIPAL ===== */
export function renderCommissionScreen() {
  const owed = commissionOwed();
  const payable = pendingPayable();

  document.getElementById("barber-card").classList.add("ios-card-highlight");

  document.getElementById("barber-name").textContent = barberState.name;
  document.getElementById("barber-role").textContent =
    "Barbeiro · Comissão " + round2(barberState.cutRate) + "%";
  document.getElementById("barber-gross").textContent = formatBRL(barberState.gross);
  document.getElementById("barber-commission").textContent = formatBRL(owed);

  document.getElementById("m-new-clients").textContent = xrayClients.filter(
    (c) => c.status === "novo"
  ).length;
  document.getElementById("m-new-pct").textContent =
    Math.round(
      (xrayClients.filter((c) => c.status === "novo").length / Math.max(xrayClients.length, 1)) * 100
    ) + "% do total";
  document.getElementById("m-recurrent").textContent = xrayClients.filter(
    (c) => c.status === "recorrente"
  ).length;
  document.getElementById("m-payable").textContent = formatBRL(payable);

  renderRetention();
  updateBarberStatus();
  renderFinanceChart();
  renderClosureList();
  renderXrayList();
  document.getElementById("pay-datetime").value = nowLocalValue();
}

function switchCommissionView(tab) {
  document.querySelectorAll(".comm-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  document.querySelectorAll(".comm-view").forEach((view) => {
    view.classList.toggle("active", view.id === "tab-" + tab);
  });
}

/* ===== MÉTODOS DE PAGAMENTO (UMA LIGAÇÃO PARA OS DOIS MODAIS) ===== */
function bindPayMethodGroup(groupId, onSelect) {
  const group = document.getElementById(groupId);
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".pay-method");
    if (!btn) return;
    onSelect(btn.dataset.method);
    group.querySelectorAll(".pay-method").forEach((m) => {
      m.classList.toggle("active", m === btn);
    });
  });
}

/* ===== INICIALIZAÇÃO DO MÓDULO (chamada pelo app.js após o DOM) ===== */
export function initManagement() {
bindPayMethodGroup("pay-methods", (method) => {
  selectedPayMethod = method;
});
bindPayMethodGroup("pay-edit-methods", (method) => {
  selectedPayEditMethod = method;
});

/* ===== NAVEGAÇÃO ===== */
document.getElementById("btn-back-commission").addEventListener("click", () => {
  switchScreen("dashboard");
});

document.querySelectorAll(".comm-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchCommissionView(btn.dataset.tab);
  });
});

/* ===== REGISTRAR PAGAMENTO ===== */
document.getElementById("btn-open-pay").addEventListener("click", () => {
  document.getElementById("pay-amount").textContent = formatBRL(commissionOwed());
  document.getElementById("pay-datetime").value = nowLocalValue();
  openModal("pay-modal");
});

document.getElementById("btn-confirm-pay").addEventListener("click", () => {
  const raw = document.getElementById("pay-datetime").value || nowLocalValue();
  const datetimeFmt = raw.replace("T", " ");
  paymentHistory.push({
    id: ++paymentIdSeq,
    month: monthKeyOf(datetimeFmt),
    datetime: datetimeFmt,
    value: round2(commissionOwed()),
    method: selectedPayMethod,
  });
  closeModal("pay-modal");
  renderCommissionScreen();
  switchCommissionView("team");
  showToast("Pagamento registrado com sucesso!", "success");
});

/* ===== EDITAÇÕES DO BARBEIRO ===== */
document.getElementById("barber-edit-btn").addEventListener("click", () => {
  document.getElementById("barber-edit-name").value = barberState.name;
  document.getElementById("barber-edit-email").value = barberState.email;
  document.getElementById("barber-edit-password").value = barberState.password;
  document.getElementById("barber-edit-cut").value = barberState.cutRate;
  openModal("barber-edit-modal");
});

document.getElementById("barber-edit-save").addEventListener("click", () => {
  const name = document.getElementById("barber-edit-name").value.trim();
  const cutRaw = parseFloat(document.getElementById("barber-edit-cut").value);

  if (!name) {
    showToast("Informe o nome do barbeiro", "warning");
    return;
  }
  if (isNaN(cutRaw) || cutRaw < 0 || cutRaw > 100) {
    showToast("Percentual de comissão inválido (0 a 100)", "warning");
    return;
  }

  barberState.name = name;
  barberState.email = document.getElementById("barber-edit-email").value.trim();
  barberState.password = document.getElementById("barber-edit-password").value;
  barberState.cutRate = round2(cutRaw);

  document.getElementById("barber-avatar").textContent = initialsOf(name);
  closeModal("barber-edit-modal");
  renderCommissionScreen();
  showToast("Perfil do barbeiro atualizado!", "success");
});

/* ===== HISTÓRICO: EDITAR / EXCLUIR PAGAMENTO ===== */
document.getElementById("closure-list").addEventListener("click", (e) => {
  const edit = e.target.closest('[data-action="edit"]');
  if (edit) {
    openEditPayment(edit.dataset.id);
    return;
  }

  const del = e.target.closest('[data-action="delete"]');
  if (!del) return;
  const id = Number(del.dataset.id);

  if (pendingDeleteId === id) {
    pendingDeleteId = null;
    const index = paymentHistory.findIndex((p) => p.id === id);
    if (index > -1) {
      paymentHistory.splice(index, 1);
    }
    renderCommissionScreen();
    showToast("Pagamento excluído.", "info");
  } else {
    pendingDeleteId = id;
    renderClosureList();
    showToast("Clique novamente para confirmar exclusão", "warning");
  }
});

function openEditPayment(id) {
  const p = paymentHistory.find((item) => String(item.id) === String(id));
  if (!p) return;
  editingPaymentId = id;
  document.getElementById("pay-edit-datetime").value = p.datetime.replace(" ", "T");
  document.getElementById("pay-edit-value").value = p.value === 0 ? "" : p.value;
  selectedPayEditMethod = p.method;
  document
    .querySelectorAll("#pay-edit-methods .pay-method")
    .forEach((m) => m.classList.toggle("active", m.dataset.method === p.method));
  openModal("pay-edit-modal");
}

document.getElementById("pay-edit-save").addEventListener("click", () => {
  const p = paymentHistory.find((item) => String(item.id) === editingPaymentId);
  if (!p) return;
  const value = parseFloat(document.getElementById("pay-edit-value").value);
  if (isNaN(value) || value < 0) {
    showToast("Informe um valor válido", "warning");
    return;
  }

  const raw = document.getElementById("pay-edit-datetime").value || nowLocalValue();
  const datetimeFmt = raw.replace("T", " ");
  p.value = round2(value);
  p.datetime = datetimeFmt;
  p.month = monthKeyOf(datetimeFmt);
  p.method = selectedPayEditMethod;

  editingPaymentId = null;
  closeModal("pay-edit-modal");
  renderCommissionScreen();
  showToast("Pagamento atualizado!", "success");
});

document.addEventListener("click", (e) => {
  if (pendingDeleteId && !e.target.closest(".closure-item")) {
    pendingDeleteId = null;
    renderClosureList();
  }
});

/* ===== CLIENTES: BUSCA, FILTROS E EDIÇÃO ===== */
document.getElementById("client-search").addEventListener("input", (e) => {
  clientSearch = e.target.value;
  renderXrayList();
});

document.querySelectorAll(".ret-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeClientFilter = btn.dataset.filter;
    document.querySelectorAll(".ret-tab").forEach((r) => {
      r.classList.toggle("active", r === btn);
    });
    renderXrayList();
  });
});

document.getElementById("client-xray-list").addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="edit-client"]');
  if (!btn) return;
  const index = parseInt(btn.dataset.index, 10);
  if (isNaN(index) || !xrayClients[index]) return;
  editingClientIndex = index;

  const c = xrayClients[index];
  document.getElementById("client-edit-name").value = c.name;
  document.getElementById("client-edit-phone").value = c.phone;
  document.getElementById("client-edit-notes").value = c.notes || "";
  openModal("client-edit-modal");
});

document.getElementById("client-edit-save").addEventListener("click", () => {
  if (editingClientIndex === null || !xrayClients[editingClientIndex]) return;
  const c = xrayClients[editingClientIndex];
  const name = document.getElementById("client-edit-name").value.trim();
  if (!name) {
    showToast("Informe o nome do cliente", "warning");
    return;
  }

  c.name = name;
  c.phone = document.getElementById("client-edit-phone").value.replace(/\D/g, "");
  c.notes = document.getElementById("client-edit-notes").value.trim();
  c.initials = initialsOf(name);

  editingClientIndex = null;
  closeModal("client-edit-modal");
  renderCommissionScreen();
  showToast("Dados do cliente atualizados!", "success");
});

renderCommissionScreen();
}