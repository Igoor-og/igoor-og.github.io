/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   IGOR ALMEIDA ÔÇö script.js v4.2
   Ô£à Fixes: init sem GSAP, swiper via CSS width, sem overflow lateral
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */

document.addEventListener('DOMContentLoaded', () => {

  // Ô£à Roda tudo imediatamente ÔÇö GSAP s├│ ├® necess├írio para o bot├úo magn├®tico
  init();
  waitGSAP(initMagnetic);

  function waitGSAP(cb) {
    if (typeof gsap !== 'undefined') cb();
    else setTimeout(() => waitGSAP(cb), 80);
  }

  function init() {
    initNavbar();
    initHeroAnim();
    initScrollReveal();
    initSkewSections();
    initUnderline();
    // Ô£à rAF garante que o layout foi calculado antes de medir os cards
    requestAnimationFrame(() => {
      initSwiperDep();
      initSwiperBen();
    });
    initFAQ();
  }

  /* ÔòÉÔòÉ 1. NAVBAR ÔòÉÔòÉ */
  function initNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', scrollY > 40);
    }, { passive: true });
  }

  /* ÔòÉÔòÉ 2. HERO ÔÇö entra da esquerda com blur ÔòÉÔòÉ */
  function initHeroAnim() {
    const els = document.querySelectorAll('.hero-anim');
    requestAnimationFrame(() => {
      setTimeout(() => els.forEach(el => el.classList.add('on')), 80);
    });
  }

  /* ÔòÉÔòÉ 3. SCROLL REVEAL ÔòÉÔòÉ */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.anim-el, .anim-scale');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('on', entry.isIntersecting);
      });
    }, { threshold: 0.15, rootMargin: '-5% 0px -5% 0px' });
    targets.forEach(el => obs.observe(el));
  }

  /* ÔòÉÔòÉ 4. TELA INCLINADA ÔòÉÔòÉ */
  function initSkewSections() {
    const sections = document.querySelectorAll('.tela-inclinada');
    sections.forEach(el => {
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio >= 0.3) el.classList.add('ativa');
        else if (entry.intersectionRatio < 0.05) el.classList.remove('ativa');
      }, { threshold: [0, 0.05, 0.3, 0.6, 1.0] });
      obs.observe(el);
    });
  }

  /* ÔòÉÔòÉ 5. SUBLINHADO DESENHADO ÔòÉÔòÉ */
  function initUnderline() {
    const el = document.querySelector('.u-draw');
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setTimeout(() => el.classList.add('drawn'), 350);
      else el.classList.remove('drawn');
    }, { threshold: 0.5 });
    obs.observe(el);
  }

  /* ÔòÉÔòÉ 6. SWIPER DEPOIMENTOS ÔòÉÔòÉ */
  function initSwiperDep() {
    buildSwiper({
      trackId: 'depTrack', viewportId: 'depViewport',
      prevId: 'depPrev', nextId: 'depNext', dotsId: 'depDots',
      cardSel: '.dep-card',
      getVisible: () => window.innerWidth < 600 ? 1 : window.innerWidth < 960 ? 2 : 3
    });
  }

  /* ÔòÉÔòÉ 7. SWIPER BENEF├ìCIOS ÔòÉÔòÉ */
  function initSwiperBen() {
    buildSwiper({
      trackId: 'benTrack', viewportId: 'benViewport',
      prevId: 'benPrev', nextId: 'benNext', dotsId: 'benDots',
      cardSel: '.ben-card',
      getVisible: () => window.innerWidth < 600 ? 1 : window.innerWidth < 960 ? 2 : 3
    });
  }

  /* ÔöÇÔöÇ Swiper reutiliz├ível ÔöÇÔöÇ */
  function buildSwiper({ trackId, viewportId, prevId, nextId, dotsId, cardSel, getVisible }) {
    const track    = document.getElementById(trackId);
    const viewport = document.getElementById(viewportId);
    const prevBtn  = document.getElementById(prevId);
    const nextBtn  = document.getElementById(nextId);
    const dotsWrap = document.getElementById(dotsId);
    if (!track) return;

    const cards = track.querySelectorAll(cardSel);
    let current = 0;

    // Ô£à Sempre usa a largura real do card renderizado pelo CSS
    // N├úo precisa mais sobrescrever min/max-width via JS no mobile
    function gap() { return parseFloat(getComputedStyle(track).gap) || 19; }

    function cardW() {
      if (!cards[0]) return 0;
      return cards[0].getBoundingClientRect().width + gap();
    }

    function maxSlide() {
      return Math.max(0, cards.length - getVisible());
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxSlide()));
      track.style.transform = `translateX(-${current * cardW()}px)`;
      updateDots();
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      const total = maxSlide() + 1;
      for (let i = 0; i < total; i++) {
        const btn = document.createElement('button');
        btn.className = 'dot';
        btn.setAttribute('aria-label', `Slide ${i + 1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      }
      updateDots();
    }

    function updateDots() {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    // Touch swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }, { passive: true });

    buildDots();
    goTo(0);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { buildDots(); goTo(0); }, 200);
    });
  }

  /* ÔòÉÔòÉ 8. FAQ ÔòÉÔòÉ */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const btn  = item.querySelector('.faq-q');
      const body = item.querySelector('.faq-body');
      if (!btn || !body) return;
      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        items.forEach(other => {
          other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-body')?.classList.remove('faq-body-open');
        });
        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          body.classList.add('faq-body-open');
        }
      });
    });
  }

  /* ÔòÉÔòÉ 9. BOT├âO MAGN├ëTICO ÔÇö s├│ roda se GSAP dispon├¡vel ÔòÉÔòÉ */
  function initMagnetic() {
    const btn = document.getElementById('magneticBtn');
    if (!btn || !window.matchMedia('(hover: hover)').matches) return;
    const wrap = btn.parentElement;
    wrap.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - (r.left + r.width  / 2)) * 0.32,
        y: (e.clientY - (r.top  + r.height / 2)) * 0.32,
        duration: .4, ease: 'power2.out'
      });
    });
    wrap.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' });
    });
  }

});
