/* ==========================================================
   HD Barbearia — screens/dashboard.js
   Tela inicial: card de destaque do dia, status rápido, feed
   de atendimentos, atalhos e navegação para vendas / comissões.
   ========================================================== */

"use strict";

import { formatBRL } from "../utils.js";
import { showToast } from "../components/toast.js";
import { switchScreen } from "../app.js";
import { renderSalesHistory } from "./sales.js";
import { renderCommissionScreen } from "./management.js";
import { openClientModal } from "../components/modal-client.js";

/* ===== CARD DE DESTAQUE DO DIA ===== */
const daySummary = {
  revenue: formatBRL(340.0),
  sub: "14 cortes concluídos · +12% vs ontem",
};

export function renderDaySummary() {
  const revenue = document.getElementById("day-revenue");
  const sub = document.getElementById("day-sub");
  if (revenue) revenue.textContent = daySummary.revenue;
  if (sub) sub.textContent = daySummary.sub;
}

/* ===== FEED DE ATENDIMENTOS ===== */
export const feedData = [
  { name: "Pedro Almeida", service: "Corte + Barba", time: "14:30", initials: "PA", type: "recorrente", value: "R$ 55,00" },
  { name: "João Mendes", service: "Corte", time: "13:15", initials: "JM", type: "novo", value: "R$ 35,00" },
  { name: "Lucas Ferreira", service: "Barba", time: "11:40", initials: "LF", type: "recorrente", value: "R$ 25,00" },
  { name: "Rafael Costa", service: "Pigmentação", time: "10:25", initials: "RC", type: "novo", value: "R$ 70,00" },
];

export function renderFeed() {
  const feedList = document.getElementById("feed-list");
  feedList.innerHTML = feedData
    .map((item) => {
      const typeLabel = item.type === "novo" ? "Novo" : "Recorrente";
      return `
      <div class="feed-item">
        <div class="feed-left">
          <div class="feed-avatar ${item.type}">${item.initials}</div>
          <div class="feed-info">
            <span class="feed-name">${item.name}</span>
            <span class="feed-meta">${item.service} <span class="feed-type-label ${item.type}">&middot; ${typeLabel}</span></span>
          </div>
        </div>
        <span class="feed-value">${item.value}</span>
      </div>`;
    })
    .join("");
}

/* ===== NAVEGAÇÃO DO DASHBOARD (bindings no init) ===== */
export function initDashboard() {
document.getElementById("charts-btn").addEventListener("click", () => {
  switchScreen("sales");
  renderSalesHistory();
});

document.querySelectorAll(".shortcut-card").forEach((card) => {
  card.addEventListener("click", () => {
    if (card.dataset.shortcut === "cliente") {
      openClientModal();
      return;
    }
    if (card.dataset.shortcut === "historico") {
      switchScreen("sales");
      renderSalesHistory();
      return;
    }
    if (card.dataset.shortcut === "comissao" || card.dataset.shortcut === "time") {
      switchScreen("commission");
      renderCommissionScreen();
      return;
    }
    showToast(card.dataset.shortcut + " em breve", "info");
  });
});

document.getElementById("profile-btn").addEventListener("click", () => {
  showToast("Configurações de perfil em breve", "info");
});

document.getElementById("notif-btn").addEventListener("click", () => {
  showToast("Você tem 2 novas notificações", "info");
});

renderDaySummary();
renderFeed();
}