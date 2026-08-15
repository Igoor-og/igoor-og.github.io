"use strict";

const APP_CONFIG = {
  cardFeePercentage: 3.0, // 3% de taxa de cartão (modificável futuramente)
  defaultCutPercentage: 50.0, // % de comissão/corte (modificável futuramente)
};

const screens = {
  welcome: document.getElementById("welcome-screen"),
  login: document.getElementById("login-screen"),
  register: document.getElementById("register-screen"),
  forgot: document.getElementById("forgot-screen"),
  dashboard: document.getElementById("dashboard-screen"),
  sales: document.getElementById("sales-history-screen"),
  commission: document.getElementById("commission-screen"),
};

function switchScreen(name) {
  Object.keys(screens).forEach((key) => {
    screens[key].classList.remove("active");
  });
  screens[name].classList.add("active");
}

/* ===== NAVEGAÇÃO ENTRE TELAS ===== */
document.getElementById("btn-next").addEventListener("click", () => {
  switchScreen("login");
});

document.getElementById("btn-back-login").addEventListener("click", () => {
  switchScreen("welcome");
});

document.getElementById("link-register").addEventListener("click", (event) => {
  event.preventDefault();
  switchScreen("register");
});

document.getElementById("btn-back-register").addEventListener("click", () => {
  switchScreen("login");
});

document.getElementById("link-forgot").addEventListener("click", (event) => {
  event.preventDefault();
  switchScreen("forgot");
});

document.getElementById("btn-back-forgot").addEventListener("click", () => {
  switchScreen("login");
});

/* ===== ALTERNAR VISIBILIDADE DA SENHA ===== */
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("login-password");
let passwordVisible = false;

togglePassword.addEventListener("click", () => {
  passwordVisible = !passwordVisible;
  passwordInput.type = passwordVisible ? "text" : "password";
  togglePassword.classList.toggle("showing", passwordVisible);
  togglePassword.setAttribute(
    "aria-label",
    passwordVisible ? "Ocultar senha" : "Mostrar senha"
  );
});

/* ===== ACESSO RÁPIDO / BIOMETRIA ===== */
document.getElementById("biometric-btn").addEventListener("click", () => {
  showToast("Biometria não disponível nesta demonstração", "warning");
});

/* ===== SUPORTE ===== */
document.getElementById("link-support").addEventListener("click", (event) => {
  event.preventDefault();
  showToast("Suporte: suporte@hdbarbearia.com", "info");
});

/* ===== TOAST NOTIFICATION ===== */
const toast = document.getElementById("toast");
const toastText = document.getElementById("toast-text");
let toastTimer = null;

function showToast(message, type) {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toast.className = "toast";
  toast.classList.add(type);
  toastText.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ===== VALIDAÇÃO DE CAMPOS ===== */
function setFieldError(input, message) {
  const field = input.closest(".field");
  const errorSpan = field.querySelector(".input-error");
  input.classList.add("invalid");
  if (message) {
    errorSpan.textContent = message;
  }
  field.classList.add("invalid");
}

function clearFieldError(input) {
  const field = input.closest(".field");
  field.classList.remove("invalid");
  input.classList.remove("invalid");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateRequiredFields(inputs) {
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

/* ===== SUBMITS: PREVENÇÃO DE RECARGA + VALIDAÇÃO SIMULADA ===== */

/* Login */
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("login-email");
  const password = document.getElementById("login-password");

  if (!validateRequiredFields([email, password])) {
    showToast("Preencha todos os campos", "warning");
    return;
  }

  if (!isValidEmail(email.value)) {
    setFieldError(email, "Formato de e-mail inválido");
    showToast("E-mail inválido. Verifique o formato.", "warning");
    return;
  }

  if (password.value.length < 6) {
    setFieldError(password, "A senha deve ter no mínimo 6 caracteres");
    showToast("Senha incorreta ou muito curta", "error");
    return;
  }

  const original = showButtonLoading(
    document.getElementById("login-submit"),
    "Entrando..."
  );
  setTimeout(() => {
    resetButton(document.getElementById("login-submit"), original);
    showToast("Login realizado com sucesso!", "success");
    switchScreen("dashboard");
  }, 1200);
});

/* Registrar */
document.getElementById("register-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const inputs = [
    document.getElementById("register-name"),
    document.getElementById("register-phone"),
    document.getElementById("register-email"),
    document.getElementById("register-password"),
  ];

  if (!validateRequiredFields(inputs)) {
    showToast("Preencha todos os campos", "warning");
    return;
  }

  const email = document.getElementById("register-email");
  const password = document.getElementById("register-password");

  if (!isValidEmail(email.value)) {
    setFieldError(email, "Formato de e-mail inválido");
    showToast("E-mail inválido. Verifique o formato.", "warning");
    return;
  }

  if (password.value.length < 6) {
    setFieldError(password, "A senha deve ter no mínimo 6 caracteres");
    showToast("Senha incorreta ou muito curta", "error");
    return;
  }

  const original = showButtonLoading(
    document.getElementById("register-submit"),
    "Cadastrando..."
  );
  setTimeout(() => {
    resetButton(document.getElementById("register-submit"), original);
    showToast("Conta criada com sucesso!", "success");
  }, 1200);
});

/* Esqueceu a senha */
document.getElementById("forgot-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("forgot-email");

  if (!validateRequiredFields([email])) {
    showToast("Preencha todos os campos", "warning");
    return;
  }

  if (!isValidEmail(email.value)) {
    setFieldError(email, "Formato de e-mail inválido");
    showToast("E-mail inválido. Verifique o formato.", "warning");
    return;
  }

  const original = showButtonLoading(
    document.getElementById("forgot-submit"),
    "Enviando..."
  );
  setTimeout(() => {
    resetButton(document.getElementById("forgot-submit"), original);
    showToast("Instruções enviadas com sucesso!", "success");
  }, 1200);
});

/* Limpa erros ao digitar */
["login-email", "login-password", "register-email", "register-password", "forgot-email"].forEach((id) => {
  document.getElementById(id).addEventListener("input", (event) => {
    clearFieldError(event.target);
  });
});

/* ===== MÁSCARA DE WHATSAPP (XX) XXXXX-XXXX ===== */
const phoneInput = document.getElementById("register-phone");
phoneInput.addEventListener("input", () => {
  let digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
  let formatted = "";

  if (digits.length > 0) {
    formatted = "(" + digits.slice(0, 2);
  }
  if (digits.length >= 3) {
    formatted += ") ";
  }
  if (digits.length > 2) {
    if (digits.length <= 10) {
      formatted += digits.slice(2, 6);
    } else {
      formatted += digits.slice(2, 7);
    }
  }
  if (digits.length === 9) {
    formatted += "-" + digits.slice(6, 9);
  } else if (digits.length > 6) {
    if (digits.length <= 10) {
      formatted += "-" + digits.slice(6, 10);
    } else {
      formatted += "-" + digits.slice(7, 11);
    }
  }

  phoneInput.value = formatted;
});

/* ===== INDICAÇÃO DE CARREGAMENTO NO BOTÃO ===== */
function showButtonLoading(button, loadingLabel) {
  const label = button.querySelector(".btn-label");
  const originalText = label.textContent;
  button.classList.add("is-loading");
  button.innerHTML = '<span class="spinner" aria-hidden="true"></span>';
  button.setAttribute("aria-label", loadingLabel);
  return originalText;
}

function resetButton(button, originalText) {
  button.classList.remove("is-loading");
  button.innerHTML = '<span class="btn-label">' + originalText + "</span>";
  button.removeAttribute("aria-label");
}

/* ===== DASHBOARD: FEED DE ATENDIMENTOS ===== */
const feedData = [
  { name: "Pedro Almeida", service: "Corte + Barba", time: "14:30", initials: "PA", type: "recorrente", value: "R$ 55,00" },
  { name: "João Mendes", service: "Corte", time: "13:15", initials: "JM", type: "novo", value: "R$ 35,00" },
  { name: "Lucas Ferreira", service: "Barba", time: "11:40", initials: "LF", type: "recorrente", value: "R$ 25,00" },
  { name: "Rafael Costa", service: "Pigmentação", time: "10:25", initials: "RC", type: "novo", value: "R$ 70,00" },
];

function renderFeed() {
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

/* ===== DASHBOARD: GRÁFICO SEMANAL ===== */
const weeklyData = [
  { day: "S", value: 120 },
  { day: "T", value: 90 },
  { day: "Q", value: 150 },
  { day: "Q", value: 110 },
  { day: "S", value: 180 },
  { day: "S", value: 95 },
  { day: "D", value: 60 },
];

/* ===== TELA: HISTÓRICO DE VENDAS E COMISSÕES ===== */
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
      if (!item.client.toLowerCase().includes(filterState.client.trim().toLowerCase())) {
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

function renderSalesHistory() {
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
  document.getElementById("summary-commission").textContent = "-" + formatBRL(commission);
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

function switchPeriod(period) {
  activePeriod = period;
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.period === period);
  });
  renderSalesHistory();
}

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

/* ===== MODAIS ===== */
function openModal(id) {
  document.getElementById(id).classList.add("show");
}

function closeModal(id) {
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

/* ===== TELA 7: GESTÃO & COMISSÕES ===== */
const barberState = {
  name: "Pedro",
  gross: 1260.0,
  paid: false,
  cutRate: APP_CONFIG.defaultCutPercentage,
  lastPayment: null,
};

let selectedPayMethod = "Pix";
let activeClientFilter = "todos";

const xrayClients = [
  { name: "Rafael Lima", initials: "RL", cuts: 3, status: "recorrente", phone: "5511999990001" },
  { name: "Bruno Souza", initials: "BS", cuts: 2, status: "recorrente", phone: "5511999990002" },
  { name: "Diego Martins", initials: "DM", cuts: 1, status: "novo", phone: "5511999990003" },
  { name: "André Santos", initials: "AS", cuts: 1, status: "novo", phone: "5511999990004" },
  { name: "Lucas Ferreira", initials: "LF", cuts: 4, status: "recorrente", phone: "5511999990005" },
  { name: "Tiago Mendes", initials: "TM", cuts: 0, status: "sumido", phone: "5511999990006" },
  { name: "Caio Rocha", initials: "CR", cuts: 0, status: "sumido", phone: "5511999990007" },
];

const paymentHistory = [];

function commissionCommission() {
  return (barberState.gross * barberState.cutRate) / 100;
}

function renderCommissionScreen() {
  const commission = commissionCommission();
  const novos = xrayClients.filter((c) => c.status === "novo").length;
  const recessivos = xrayClients.filter((c) => c.status === "recorrente").length;
  const sumidos = xrayClients.filter((c) => c.status === "sumido").length;
  const total = Math.max(xrayClients.length, 1);
  document.getElementById("m-new-clients").textContent = novos;
  document.getElementById("m-new-pct").textContent = Math.round((novos / total) * 100) + "% do total";
  document.getElementById("m-recurrent").textContent = recessivos;
  document.getElementById("m-payable").textContent = formatBRL(commission);
  document.getElementById("barber-gross").textContent = formatBRL(barberState.gross);
  document.getElementById("barber-commission").textContent = formatBRL(commission);
  document.getElementById("kpi-gross").textContent = formatBRL(barberState.gross);
  document.getElementById("kpi-commission").textContent = formatBRL(commission);
  renderRetention(xrayClients.length, recessivos, novos);
  renderClientSplit(recessivos, novos, sumidos, total);
  updateBarberBadge();
  renderClosureList();
  renderXrayList();
  document.getElementById("pay-datetime").value = nowLocalValue();
}

function renderRetention(total, recorrentes, novos) {
  const safe = Math.max(total, 1);
  const recPct = (recorrentes / safe) * 100;
  const newPct = (novos / safe) * 100;
  document.getElementById("retention-pct").textContent = Math.round(recPct) + "%";
  document.getElementById("ret-rec").style.width = recPct + "%";
  document.getElementById("ret-new").style.width = newPct + "%";
}

function renderClientSplit(recorrentes, novos, sumidos, total) {
  const safe = Math.max(total, 1);
  document.getElementById("split-rec").style.width = (recorrentes / safe) * 100 + "%";
  document.getElementById("split-new").style.width = (novos / safe) * 100 + "%";
  document.getElementById("split-miss").style.width = (sumidos / safe) * 100 + "%";
  document.getElementById("legend-rec").textContent = recorrentes;
  document.getElementById("legend-new").textContent = novos;
  document.getElementById("legend-miss").textContent = sumidos;
}

function updateBarberBadge() {
  const badge = document.getElementById("pay-badge");
  const card = document.getElementById("barber-card");
  const statusTag = document.getElementById("pay-status-tag");
  const statusRow = document.getElementById("barber-status-row");
  const openBtn = document.getElementById("btn-open-pay");
  const stamp = document.getElementById("receipt-stamp");
  if (barberState.paid) {
    badge.textContent = "QUITADO";
    badge.classList.add("paid");
    card.classList.add("settled");
    statusTag.textContent = "QUITADO";
    statusTag.classList.add("status-settled");
    statusRow.classList.add("status-row-settled");
    openBtn.style.display = "none";
    if (barberState.lastPayment) {
      stamp.style.display = "block";
      stamp.innerHTML =
        'Pago via ' +
        barberState.lastPayment.method +
        " em " +
        barberState.lastPayment.datetime;
    }
  } else {
    badge.textContent = "PENDENTE DE PAGAMENTO";
    badge.classList.remove("paid");
    card.classList.remove("settled");
    statusTag.textContent = "A PAGAR";
    statusTag.classList.remove("status-settled");
    statusRow.classList.remove("status-row-settled");
    openBtn.style.display = "";
    stamp.style.display = "none";
  }
}

function renderClosureList() {
  const list = document.getElementById("closure-list");
  if (paymentHistory.length === 0) {
    list.innerHTML = '<div class="sales-empty">Nenhum pagamento registrado ainda.</div>';
    return;
  }
  list.innerHTML = paymentHistory
    .map(
      (p, i) => `
      <div class="closure-item">
        <div class="closure-item-info">
          <span class="closure-item-name">${p.barber} · ${p.method}</span>
          <span class="closure-item-meta">${p.datetime} · Recibo #${i + 1}</span>
        </div>
        <div class="closure-item-right">
          <span class="closure-item-value">${formatBRL(p.value)}</span>
          <span class="closure-item-status">PAGO</span>
        </div>
      </div>`
    )
    .join("");
}

function renderXrayList() {
  const filtered = xrayClients.filter((c) => {
    if (activeClientFilter === "novos") return c.status === "novo";
    if (activeClientFilter === "recorrentes") return c.status === "recorrente";
    if (activeClientFilter === "sumidos") return c.status === "sumido";
    return true;
  });
  const list = document.getElementById("client-xray-list");
  if (filtered.length === 0) {
    list.innerHTML = '<div class="sales-empty">Nenhum cliente neste filtro.</div>';
    return;
  }
  list.innerHTML = filtered
    .map((c) => {
      const tagClass =
        c.status === "recorrente"
          ? "tag-rec"
          : c.status === "sumido"
          ? "tag-miss"
          : "tag-new";
      const tagText =
        c.status === "recorrente"
          ? "Recorrente"
          : c.status === "sumido"
          ? "Sumido · Oferta"
          : "Novo";
      const tag = '<span class="client-ray-tag ' + tagClass + '">' + tagText + '</span>';
      const meta =
        c.status === "sumido"
          ? "sem cortes há 30+ dias"
          : c.cuts + " corte(s) este mês";
      const waMessage = encodeURIComponent(
        c.status === "sumido"
          ? "Olá " + c.name + "! Sentimos sua falta na HD Barbearia. Estamos com uma oferta especial pra você voltar. Vem cortar com a gente!"
          : "Olá " + c.name + "! Estamos com um convite especial para você na HD Barbearia. Vem cortar com a gente!"
      );
      return `
      <div class="client-ray-item">
        <div class="client-ray-avatar">${c.initials}</div>
        <div class="client-ray-info">
          <span class="client-ray-name">${c.name}</span>
          <span class="client-ray-meta">${meta}</span>
          ${tag}
        </div>
        <a href="https://wa.me/${c.phone}?text=${waMessage}" target="_blank" rel="noopener" class="wa-btn" aria-label="Enviar mensagem por WhatsApp para ${c.name}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.18-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.01-.37.11-.5.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.54-.42h-.5c-.16 0-.42.06-.63.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.66 2.53 4.02 3.55.56.24 1 .38 1.34.49.57.18 1.08.16 1.48.1.46-.08 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
          </svg>
          <span class="wa-label">${c.status === "sumido" ? "Enviar Oferta" : "WhatsApp"}</span>
        </a>
      </div>`;
    })
    .join("");
}

function switchCommissionView(view) {
  document.querySelectorAll(".comm-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  document.querySelectorAll(".comm-view").forEach((v) => {
    v.classList.toggle("active", v.id === "view-" + view);
  });
}

function nowLocalValue() {
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

/* ===== NAVEGAÇÃO DO DASHBOARD ===== */
document.getElementById("new-attend-btn").addEventListener("click", () => {
  resetAttendModal();
  openModal("attend-modal");
});

document.getElementById("charts-btn").addEventListener("click", () => {
  switchScreen("sales");
  renderSalesHistory();
});

document.getElementById("btn-back-sales").addEventListener("click", () => {
  switchScreen("dashboard");
});

/* ===== GESTÃO & COMISSÕES ===== */
document.getElementById("btn-back-commission").addEventListener("click", () => {
  switchScreen("dashboard");
});

document.querySelectorAll(".comm-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchCommissionView(btn.dataset.view);
  });
});

document.getElementById("btn-open-pay").addEventListener("click", () => {
  document.getElementById("pay-amount").textContent = formatBRL(commissionCommission());
  document.getElementById("pay-datetime").value = nowLocalValue();
  openModal("pay-modal");
});

document.querySelectorAll(".pay-method").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedPayMethod = btn.dataset.method;
    document.querySelectorAll(".pay-method").forEach((m) => {
      m.classList.toggle("active", m === btn);
    });
  });
});

document.getElementById("btn-confirm-pay").addEventListener("click", () => {
  const raw = document.getElementById("pay-datetime").value || nowLocalValue();
  const datetimeFmt = raw.replace("T", " ");
  paymentHistory.unshift({
    barber: "Pedro",
    method: selectedPayMethod,
    datetime: datetimeFmt,
    value: commissionCommission(),
  });
  barberState.paid = true;
  barberState.lastPayment = {
    method: selectedPayMethod,
    datetime: datetimeFmt,
  };
  updateBarberBadge();
  renderClosureList();
  document.getElementById("m-payable").textContent = "R$ 0,00";
  closeModal("pay-modal");
  switchCommissionView("closure");
  showToast("Pagamento do Pedro quitado com sucesso!", "success");
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
  const btn = e.target.closest(".wa-btn");
  if (!btn) return;
  showToast("Abrindo WhatsApp...", "info");
});

document.getElementById("export-btn").addEventListener("click", () => {
  renderChart();
  openModal("charts-modal");
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchPeriod(btn.dataset.period);
  });
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
  document.querySelectorAll('.select-dropdown[data-dropdown="' + key + '"] .select-option').forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.value === current);
  });
}

document.querySelectorAll(".select-pill").forEach((pill) => {
  pill.addEventListener("click", (e) => {
    const key = pill.dataset.select;
    const dropdown = document.querySelectorAll('.select-dropdown[data-dropdown="' + key + '"]')[0];
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

document.querySelectorAll(".shortcut-card").forEach((card) => {
  card.addEventListener("click", () => {
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

/* ===== MODAL: NOVO ATENDIMENTO (CLIENTE + SERVIÇOS) ===== */
const SERVICES = [
  { name: "Corte de Cabelo", value: 45 },
  { name: "Barba Completa", value: 35 },
  { name: "Combo Corte + Barba", value: 70 },
  { name: "Pigmentação", value: 25 },
  { name: "Sobrancelha", value: 15 },
];

const CLIENTS = [
  { name: "Pedro Almeida", frequent: true },
  { name: "João Mendes", frequent: false },
  { name: "Lucas Ferreira", frequent: true },
  { name: "Rafael Costa", frequent: false },
  { name: "Bruno Souza", frequent: true },
  { name: "Felipe Lima", frequent: false },
  { name: "Gustavo Rocha", frequent: false },
  { name: "Thiago Nunes", frequent: false },
];

const attendState = {
  client: null,
  services: [],
};

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

function formatBRL(value) {
  return "R$ " + value.toFixed(2).replace(".", ",");
}

function roundNum(value) {
  return Math.round(value * 100) / 100;
}

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
    (s) => `
    <button type="button" class="service-option" data-name="${s.name}" data-value="${s.value}">
      <span>${s.name}</span>
      <span class="service-price">${formatBRL(s.value)}</span>
    </button>`
  ).join("");
}

function renderSelectedServices() {
  servicePills.innerHTML = attendState.services
    .map((s, i) => {
      return `
      <span class="service-pill">
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
  clearServiceError();
}

function clearServiceError() {
  const err = document.getElementById("service-error");
  err.textContent = "";
  err.parentElement.classList.remove("invalid");
}

serviceTrigger.addEventListener("click", () => {
  const isOpen = serviceMenu.classList.contains("open");
  serviceMenu.classList.toggle("open", !isOpen);
  serviceTrigger.classList.toggle("open", !isOpen);
});

serviceMenu.addEventListener("click", (e) => {
  const option = e.target.closest(".service-option");
  if (!option) return;
  const name = option.dataset.name;
  const value = parseFloat(option.dataset.value);
  if (!attendState.services.some((s) => s.name === name)) {
    attendState.services.push({ name, value });
  }
  renderSelectedServices();
  serviceMenu.classList.remove("open");
  serviceTrigger.classList.remove("open");
});

addServiceBtn.addEventListener("click", () => {
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
  const initials = attendState.client
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const isRecorrente = CLIENTS.some((c) => c.name === attendState.client && c.frequent);
  const type = isRecorrente ? "recorrente" : "novo";

  feedData.unshift({
    name: attendState.client,
    service: serviceNames,
    time: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    initials,
    type,
    value: formatBRL(total),
  });

  renderFeed();
  closeModal("attend-modal");
  resetAttendModal();
  showToast("Atendimento registrado e carimbo enviado!", "success");
});

/* ===== INICIALIZAÇÃO ===== */
renderFeed();
renderClientLists();
renderServiceMenu();
renderSelectedServices();
