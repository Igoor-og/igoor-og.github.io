/* ==========================================================
   HD Barbearia — app.js (ENTRY POINT)
   Router de telas, navegação de autenticação, formulários e
   composição dos módulos (dashboard, vendas, comissões).
   ========================================================== */

"use strict";

import {
  setFieldError,
  clearFieldError,
  isValidEmail,
  validateRequiredFields,
  showButtonLoading,
  resetButton,
} from "./utils.js";

import { showToast } from "./components/toast.js";

import { initDashboard } from "./screens/dashboard.js";
import { initSales } from "./screens/sales.js";
import { initManagement } from "./screens/management.js";
import { initAttendModal } from "./components/modal-attendance.js";
import { initClientModal } from "./components/modal-client.js";

/* ===== ROUTER DE TELAS ===== */
const screens = {
  welcome: document.getElementById("welcome-screen"),
  login: document.getElementById("login-screen"),
  register: document.getElementById("register-screen"),
  forgot: document.getElementById("forgot-screen"),
  dashboard: document.getElementById("dashboard-screen"),
  sales: document.getElementById("sales-history-screen"),
  commission: document.getElementById("commission-screen"),
};

export function switchScreen(name) {
  const target = screens[name];
  if (!target) {
    console.error("[hd] tela inexistente:", name);
    return;
  }
  Object.keys(screens).forEach((key) => {
    if (screens[key]) screens[key].classList.remove("active");
  });
  target.classList.add("active");
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
[
  "login-email",
  "login-password",
  "register-email",
  "register-password",
  "forgot-email",
].forEach((id) => {
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

/* ===== BOOTSTRAP: init por módulo, isolado e diagnosticado ===== */
(function initApp() {
  const instance = (name) => () => console.log("[hd] " + name + " inicializado");

  const safeInit = (label, fn) => {
    try {
      fn();
      instance(label)();
    } catch (err) {
      console.error("[hd] falha ao inicializar " + label + ":", err);
    }
  };

  safeInit("dashboard", initDashboard);
  safeInit("sales", initSales);
  safeInit("management", initManagement);
  safeInit("modal-atendimento", initAttendModal);
  safeInit("modal-cliente", initClientModal);

  console.log("[hd] app pronto — navegação por clique habilitada");
})();