/* ═══════════════════════════════════════════
   SCRIPT.JS — Igor Almeida Landing Page
═══════════════════════════════════════════ */

/* ── Navbar scroll ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Hamburger menu ── */
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('navMobile');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  // Fecha ao clicar em link
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

/* ── Intersection Observer (animações de entrada) ── */
const animEls = document.querySelectorAll('.anim-el, .anim-scale, .hero-anim');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
animEls.forEach(el => io.observe(el));

/* ── FAQ Accordion ── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    // Fecha todos
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      const body = b.nextElementSibling;
      if (body) body.classList.remove('faq-body-open');
    });
    // Abre o clicado se estava fechado
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      const body = btn.nextElementSibling;
      if (body) body.classList.add('faq-body-open');
    }
  });
});

/* ── Portfólio Carousel ── */
(function initPortCarousel() {
  const track = document.getElementById('portTrack');
  const viewport = document.getElementById('portViewport');
  const prevBtn = document.getElementById('portPrev');
  const nextBtn = document.getElementById('portNext');
  const dotsWrap = document.getElementById('portDots');
  if (!track || !viewport || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.querySelectorAll('.port-card'));
  let current = 0;

  function getVisible() {
    const vw = viewport.offsetWidth;
    const cardW = cards[0] ? cards[0].offsetWidth + 19 : 392; // card + gap
    return Math.max(1, Math.floor(vw / cardW));
  }

  function getMax() { return Math.max(0, cards.length - getVisible()); }

  // Cria dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const max = getMax();
    for (let i = 0; i <= max; i++) {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Slide ${i + 1}`);
      btn.addEventListener('click', () => go(i));
      dotsWrap.appendChild(btn);
    }
    updateDots();
  }

  function updateDots() {
    const btns = dotsWrap.querySelectorAll('button');
    btns.forEach((b, i) => b.classList.toggle('active', i === current));
  }

  function go(idx) {
    current = Math.max(0, Math.min(idx, getMax()));
    const cardW = cards[0] ? cards[0].offsetWidth + 19 : 392;
    track.style.transform = `translateX(-${current * cardW}px)`;
    updateDots();
  }

  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current + 1));

  buildDots();
  window.addEventListener('resize', () => { go(0); buildDots(); });
})();

/* ── Depoimentos Carousel ── */
(function initDepCarousel() {
  const track = document.getElementById('depTrack');
  const viewport = document.getElementById('depViewport');
  const prevBtn = document.getElementById('depPrev');
  const nextBtn = document.getElementById('depNext');
  const dotsWrap = document.getElementById('depDots');
  if (!track || !viewport || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.querySelectorAll('.dep-card'));
  let current = 0;

  // Usa a mesma lógica responsiva
  function getVisible() {
    const vw = viewport.offsetWidth;
    const cardW = cards[0] ? cards[0].offsetWidth + 19 : 392; // card + gap
    return Math.max(1, Math.floor(vw / cardW));
  }

  function getMax() { return Math.max(0, cards.length - getVisible()); }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const max = getMax();
    for (let i = 0; i <= max; i++) {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Slide ${i + 1}`);
      btn.addEventListener('click', () => go(i));
      dotsWrap.appendChild(btn);
    }
    updateDots();
  }

  function updateDots() {
    if (!dotsWrap) return;
    const btns = dotsWrap.querySelectorAll('button');
    btns.forEach((b, i) => b.classList.toggle('active', i === current));
  }

  function go(idx) {
    current = Math.max(0, Math.min(idx, getMax()));
    const cardW = cards[0] ? cards[0].offsetWidth + 19 : 392;
    track.style.transform = `translateX(-${current * cardW}px)`;
    updateDots();
  }

  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current + 1));

  buildDots();
  window.addEventListener('resize', () => { go(0); buildDots(); });
})();

/* ── Video BG play on visibility ── */
const bgVideo = document.getElementById('bgVideo');
if (bgVideo) {
  bgVideo.play().catch(() => {});
}

/* ── Smooth anchor scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});