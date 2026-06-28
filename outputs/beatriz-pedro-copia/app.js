const PASSWORD = "PRETOEBRANCOCOMBINA";
const ACCESS_KEY = "bp-wedding-access";
const RSVP_KEY = "bp-wedding-rsvp";
const WEDDING_DATE = new Date("2027-07-17T16:00:00-03:00");
const ADDRESS = "Praça Belmiro Ribeiro, 1 — Vila Matias — Santos/SP";
const RSVP_CONFIG = window.BP_RSVP_CONFIG || {};

const body = document.body;
const gate = document.getElementById("gate");
const gateForm = document.getElementById("gateForm");
const passwordInput = document.getElementById("passwordInput");
const gateError = document.getElementById("gateError");
const site = document.getElementById("site");
const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

let selectedPresence = "Sim";

function hasAccess() {
  try {
    return localStorage.getItem(ACCESS_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberAccess() {
  try {
    localStorage.setItem(ACCESS_KEY, "true");
  } catch {
    /* A copia ainda funciona sem armazenamento local. */
  }
}

function unlockSite(options = {}) {
  site.setAttribute("aria-hidden", "false");
  body.classList.remove("locked");

  if (options.instant) {
    gate.classList.add("hidden");
    gate.style.display = "none";
  } else {
    gate.classList.add("hidden");
    window.setTimeout(() => {
      gate.style.display = "none";
    }, 700);
  }

  updateHeader();
}

function revealPassword() {
  gateForm.classList.add("revealed");
  passwordInput.focus();
}

gateForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!gateForm.classList.contains("revealed") && !passwordInput.value) {
    revealPassword();
    return;
  }

  if (passwordInput.value.trim().toUpperCase() === PASSWORD) {
    rememberAccess();
    unlockSite();
    return;
  }

  gateError.textContent = "Senha incorreta.";
  revealPassword();
  passwordInput.select();
});

passwordInput.addEventListener("input", () => {
  gateError.textContent = "";
});

function updateHeader() {
  const solid = window.scrollY > 80 || mobileMenu.classList.contains("open");
  header.classList.toggle("solid", solid);
}

function closeMobileMenu() {
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  header.classList.remove("menu-open");
  updateHeader();
}

function scrollToTarget(id) {
  const target = document.getElementById(id);
  if (!target) return;

  const top = id === "hero" ? 0 : target.getBoundingClientRect().top + window.scrollY - 65;
  window.scrollTo({ top, behavior: "smooth" });
  closeMobileMenu();
}

document.querySelectorAll("[data-target]").forEach((control) => {
  control.addEventListener("click", () => scrollToTarget(control.dataset.target));
});

menuToggle.addEventListener("click", () => {
  const open = !mobileMenu.classList.contains("open");
  mobileMenu.classList.toggle("open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  header.classList.toggle("menu-open", open);
  updateHeader();
});

window.addEventListener("scroll", updateHeader, { passive: true });

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const total = Math.max(0, WEDDING_DATE.getTime() - Date.now());
  const secondsTotal = Math.floor(total / 1000);
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal % 86400) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;

  document.getElementById("days").textContent = String(days);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

document.querySelectorAll(".presence").forEach((button) => {
  button.addEventListener("click", () => {
    selectedPresence = button.dataset.presence;
    document.querySelectorAll(".presence").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

const rsvpForm = document.getElementById("rsvpForm");
const formMessage = document.getElementById("formMessage");

async function saveRsvpToSheet(payload) {
  const endpoint = RSVP_CONFIG.googleAppsScriptUrl || "";
  if (!endpoint || endpoint.includes("COLE_AQUI")) {
    return { savedOnline: false };
  }

  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      ...payload,
      token: RSVP_CONFIG.token || ""
    })
  });

  return { savedOnline: true };
}

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!rsvpForm.reportValidity()) return;

  const data = Object.fromEntries(new FormData(rsvpForm).entries());
  data.presenca = selectedPresence;
  data.enviadoEm = new Date().toISOString();
  data.origem = window.location.href;

  try {
    localStorage.setItem(RSVP_KEY, JSON.stringify(data));
  } catch {
    /* O feedback visual e mantido mesmo se o navegador bloquear o armazenamento. */
  }

  const submitButton = rsvpForm.querySelector(".submit-rsvp");
  submitButton.disabled = true;
  submitButton.style.opacity = "0.55";
  formMessage.textContent = "Enviando resposta...";

  try {
    const result = await saveRsvpToSheet(data);
    if (result.savedOnline) {
      formMessage.textContent = selectedPresence === "Sim"
        ? "Presença registrada com carinho."
        : "Resposta registrada. Obrigado por avisar.";
      rsvpForm.reset();
      selectedPresence = "Sim";
      document.querySelectorAll(".presence").forEach((item) => item.classList.remove("active"));
      document.querySelector(".presence[data-presence='Sim']").classList.add("active");
    } else {
      formMessage.textContent = "Resposta salva neste navegador. Configure a planilha para receber online.";
    }
  } catch {
    formMessage.textContent = "Não consegui enviar agora. A resposta ficou salva neste navegador.";
  } finally {
    submitButton.disabled = false;
    submitButton.style.opacity = "";
  }
});

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

document.getElementById("copyAddress").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const original = button.innerHTML;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(ADDRESS);
    } else {
      fallbackCopy(ADDRESS);
    }
    button.textContent = "Endereço copiado";
  } catch {
    button.textContent = "Copie: " + ADDRESS;
  }

  window.setTimeout(() => {
    button.innerHTML = original;
  }, 1800);
});

if (hasAccess()) {
  unlockSite({ instant: true });
} else {
  site.setAttribute("aria-hidden", "true");
}
