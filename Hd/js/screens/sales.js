/* ==========================================================
   HD Barbearia — screens/sales.js
   Tela: Histórico de Vendas e Comissões (fluxo de caixa,
   segmented control de períodos, filtros avançados e gráfico).
   ========================================================== */

"use strict";

import { APP_CONFIG } from "../config.js";
import { formatBRL, roundNum, openModal } from "../utils.js";
import { switchScreen } from "../app.js";

const COMMISSION_RATE = APP_CONFIG.defaultCutPercentage / 100;
const CARD_FEE_RATE = APP_CONFIG.cardFeePercentage / 100;

function cardFee(item) {
  return item.payment === "Cartão" ? item.value * CARD_FEE_RATE : 0;
}

function itemNet(item) {
  return item.value - cardFee(item);
}

const salesData = [
  {
    client: "Rafael Lima",
    avatar: "RL",
    services: ["Corte", "Pigmentação"],
    barber: "gabriel",
    payment: "Pix",
    time: "14h30",
    date: "2026-08-14",
    value: 60.0,
  },
  {
    client: "Bruno Souza",
    avatar: "BS",
    services: ["Barba"],
    barber: "gabriel",
    payment: "Cartão",
    time: "13h05",
    date: "2026-08-14",
    value: 30.0,
  },
  {
    client: "Lucas Ferreira",
    avatar: "LF",
    services: ["Combo"],
    barber: "lucas",
    payment: "Dinheiro",
    time: "11h40",
    date: "2026-08-14",
    value: 55.0,
  },
  {
    client: "Diego Martins",
    avatar: "DM",
    services: ["Corte"],
    barber: "gabriel",
    payment: "Pix",
    time: "10h15",
    date: "2026-08-13",
    value: 35.0,
  },
  {
    client: "Thiago Alves",
    avatar: "TA",
    services: ["Corte", "Barba", "Pigmentação"],
    barber: "lucas",
    payment: "Cartão",
    time: "09h20",
    date: "2026-08-12",
    value: 85.0,
  },
  {
    client: "Marcos Vinícius",
    avatar: "MV",
    services: ["Barba"],
    barber: "gabriel",
    payment: "Dinheiro",
    time: "08h10",
    date: "2026-08-11",
    value: 25.0,
  },
  {
    client: "André Santos",
    avatar: "AS",
    services: ["Combo"],
    barber: "lucas",
    payment: "Pix",
    time: "17h45",
    date: "2026-08-08",
    value: 50.0,
  },
];

const periodFilters = {
  hoje: 3,
  semana: 6,
  mes: 7,
};

const SERVICE_TAGS = {
  corte: ["Corte"],
  barba: ["Barba"],
  combo: ["Combo"],
  pigmentacao: ["Pigmentação"],
};

let activePeriod = "hoje";

const filterState = {
  barber: "",
  client: "",
  service: "",
  dateStart: "",
  dateEnd: "",
};

const barberLabels = {
  "": "Todos",
  meu: "Meu Histórico",
  gabriel: "Gabriel",
  lucas: "Lucas",
};

const serviceLabels = {
  "": "Todos",
  corte: "Corte",
  barba: "Barba",
  combo: "Combo",
  pigmentacao: "Pigmentação",
};

function matchingServices(item, service) {
  if (!service) return true;
  const tags = SERVICE_TAGS[service] || [];
  return item.services.some((s) => tags.includes(s));
}

function getFilteredSales() {
  return salesData.filter((item) => {
    if (filterState.client) {
      if (
        !item.client.toLowerCase().includes(filterState.client.trim().toLowerCase())
      ) {
        return false;
      }
    }
    if (filterState.barber && item.barber !== filterState.barber) {
      return false;
    }
    if (filterState.service && !matchingServices(item, filterState.service)) {
      return false;
    }
    if (filterState.dateStart && item.date < filterState.dateStart) {
      return false;
    }
    if (filterState.dateEnd && item.date > filterState.dateEnd) {
      return false;
    }
    return true;
  });
}

function applyPeriodLimit(items) {
  const count = periodFilters[activePeriod] || items.length;
  return items.slice(0, Math.min(count, items.length));
}

export function renderSalesHistory() {
  let items = applyPeriodLimit(getFilteredSales());
  const list = document.getElementById("sales-list");

  const gross = items.reduce((acc, s) => acc + s.value, 0);
  const cardFees = items.reduce((acc, s) => acc + cardFee(s), 0);
  const afterFees = gross - cardFees;
  const commission = afterFees * COMMISSION_RATE;
  const net = afterFees - commission;

  document.getElementById("summary-total").textContent = formatBRL(gross);
  document.getElementById("summary-fees").textContent = "-" + formatBRL(cardFees);
  document.getElementById("summary-cut-rate").textContent =
    "(" + roundNum(APP_CONFIG.defaultCutPercentage) + "%)";
  document.getElementById("summary-commission").textContent =
    "-" + formatBRL(commission);
  document.getElementById("summary-net").textContent = formatBRL(net);
  document.getElementById("summary-sub").textContent =
    "Total de " + items.length + " atendimento(s) realizados no período";

  if (items.length === 0) {
    list.innerHTML =
      '<div class="sales-empty">Nenhum atendimento encontrado para os filtros aplicados.</div>';
    return;
  }

  list.innerHTML = items
    .map((s) => {
      const isCard = s.payment === "Cartão";
      const fee = isCard ? CARD_FEE_RATE * 100 : 0;
      const netValue = itemNet(s);
      const feeTag = isCard
        ? '<span class="sale-fee-tag">Cartão -' + roundNum(fee) + "%</span>"
        : '<span class="sale-fee-tag fee-zero">Sem taxa</span>';
      return `
      <div class="sale-item">
        <div class="sale-left">
          <div class="sale-avatar">${s.avatar}</div>
          <div class="sale-info">
            <span class="sale-name">${s.client}</span>
            <span class="sale-services">${s.services.join(" + ")}</span>
            <span class="sale-fee-line">${feeTag}</span>
          </div>
        </div>
        <div class="sale-mid">
          <span class="payment-badge">${s.payment}</span>
          <span class="sale-time">${s.time}</span>
        </div>
        <div class="sale-right">
          <span class="sale-total">${formatBRL(s.value)}</span>
          <span class="sale-commission">Líquido ${formatBRL(netValue)}</span>
        </div>
      </div>`;
    })
    .join("");
}

export function switchPeriod(period) {
  activePeriod = period;
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.period === period);
  });
  renderSalesHistory();
}

/* ===== GRÁFICO SEMANAL ===== */
const weeklyData = [
  { day: "S", value: 120 },
  { day: "T", value: 90 },
  { day: "Q", value: 150 },
  { day: "Q", value: 110 },
  { day: "S", value: 180 },
  { day: "S", value: 95 },
  { day: "D", value: 60 },
];

function renderChart() {
  const chartBars = document.getElementById("chart-bars");
  const max = Math.max(...weeklyData.map((d) => d.value));
  chartBars.innerHTML = weeklyData
    .map(
      (d) => `
      <div class="chart-col">
        <span class="chart-val">R$${d.value}</span>
        <div class="chart-bar" style="height: ${(d.value / max) * 100}%"></div>
        <span class="chart-day">${d.day}</span>
      </div>`
    )
    .join("");
}

/* ===== NAVEGAÇÃO E FILTROS (bindings no init) ===== */
export function initSales() {
document.getElementById("btn-back-sales").addEventListener("click", () => {
  switchScreen("dashboard");
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchPeriod(btn.dataset.period);
  });
});

document.getElementById("export-btn").addEventListener("click", () => {
  renderChart();
  openModal("charts-modal");
});

/* ===== FILTROS AVANÇADOS DO HISTÓRICO ===== */
const filtersToggle = document.getElementById("filters-toggle");
const filtersBody = document.getElementById("filters-body");

filtersToggle.addEventListener("click", () => {
  filtersToggle.classList.toggle("active");
  filtersBody.classList.toggle("open");
});

function updateLandingSelects() {
  document.querySelectorAll(".select-pill").forEach((pill) => {
    const key = pill.dataset.select;
    const input = pill.querySelector(".filter-input");
    const current = key === "barber" ? filterState.barber : filterState.service;
    const labels = key === "barber" ? barberLabels : serviceLabels;
    input.value = labels[current] || labels[""];
    input.classList.toggle("active", current !== "");
  });
}

function syncDropdownSelection(key) {
  const current = key === "barber" ? filterState.barber : filterState.service;
  document
    .querySelectorAll('.select-dropdown[data-dropdown="' + key + '"] .select-option')
    .forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.value === current);
    });
}

document.querySelectorAll(".select-pill").forEach((pill) => {
  pill.addEventListener("click", (e) => {
    const key = pill.dataset.select;
    const dropdown = document.querySelectorAll(
      '.select-dropdown[data-dropdown="' + key + '"]'
    )[0];
    const isOpen = dropdown.classList.contains("open");
    closeAllSelectDropdowns();
    if (!isOpen) {
      dropdown.classList.add("open");
      syncDropdownSelection(key);
    }
  });
});

document.querySelectorAll(".select-dropdown .select-option").forEach((opt) => {
  opt.addEventListener("click", () => {
    const dropdown = opt.closest(".select-dropdown");
    const key = dropdown.dataset.dropdown;
    if (key === "barber") {
      filterState.barber = opt.dataset.value;
    } else {
      filterState.service = opt.dataset.value;
    }
    dropdown.classList.remove("open");
    updateLandingSelects();
    renderSalesHistory();
  });
});

function closeAllSelectDropdowns() {
  document.querySelectorAll(".select-dropdown.open").forEach((d) => {
    d.classList.remove("open");
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".select-pill") && !e.target.closest(".select-dropdown")) {
    closeAllSelectDropdowns();
  }
});

const clientFilter = document.getElementById("filter-client");
clientFilter.addEventListener("input", () => {
  filterState.client = clientFilter.value;
  clientFilter.classList.toggle("active", clientFilter.value.trim() !== "");
  renderSalesHistory();
});

const dateStartInput = document.getElementById("filter-date-start");
const dateEndInput = document.getElementById("filter-date-end");
dateStartInput.addEventListener("change", () => {
  filterState.dateStart = dateStartInput.value;
  dateStartInput.classList.toggle("active", dateStartInput.value !== "");
  renderSalesHistory();
});
dateEndInput.addEventListener("change", () => {
  filterState.dateEnd = dateEndInput.value;
  dateEndInput.classList.toggle("active", dateEndInput.value !== "");
  renderSalesHistory();
});

document.getElementById("clear-filters").addEventListener("click", () => {
  filterState.barber = "";
  filterState.client = "";
  filterState.service = "";
  filterState.dateStart = "";
  filterState.dateEnd = "";
  updateLandingSelects();
  clientFilter.value = "";
  clientFilter.classList.remove("active");
  dateStartInput.value = "";
  dateStartInput.classList.remove("active");
  dateEndInput.value = "";
  dateEndInput.classList.remove("active");
  closeAllSelectDropdowns();
  renderSalesHistory();
});
}