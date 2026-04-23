/* ═══════════════════════════════════════
   IGOR ALMEIDA — script.js v3 (Optimized)
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  function waitGSAP(cb) {
    if (typeof gsap !== 'undefined') cb();
    else setTimeout(() => waitGSAP(cb), 100);
  }
  waitGSAP(init);

  function init() {
    initNavbar();
    initHamburger();
    initHeroAnim();
    initScrollReveal();
    initSkewSections();
    initUnderline();
    initSwiperDep();
    initSwiperBen();
    initFAQ();
    initMagnetic();
  }

  /* ══ 1. NAVBAR ══ */
  function initNavbar() {
    const nav = document.getElementById('navbar');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ══ 2. HAMBÚRGUER ══ */
  function initHamburger() {
    const btn      = document.getElementById('hamburger');
    const menu     = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('mobClose');
    if(!btn || !menu) return;

    function toggle(open) {
      btn.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden',  String(!open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
      document.body.style.overflow = open ? 'hidden' : '';
    }

    btn.addEventListener('click', () => toggle(true));
    closeBtn?.addEventListener('click', () => toggle(false));
    const links = menu.querySelectorAll('.mob-link');
    links.forEach(l => l.addEventListener('click', () => toggle(false)));
  }

  /* ══ 3. HERO — animação inicial ══ */
  function initHeroAnim() {
    const els = document.querySelectorAll('.hero-anim');
    setTimeout(() => {
      requestAnimationFrame(() => {
        els.forEach(el => el.classList.add('on'));
      });
    }, 120);
  }

  /* ══ 4. SCROLL REVEAL ══ */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.anim-el, .anim-scale');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
        } else if (entry.boundingClientRect.top > 0) {
          entry.target.classList.remove('on');
        }
      });
    }, { threshold: 0.1 });
    targets.forEach(el => obs.observe(el));
  }

  /* ══ 5. TELA INCLINADA ══ */
  function initSkewSections() {
    const sections = document.querySelectorAll('.tela-inclinada');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('ativa');
        else entry.target.classList.remove('ativa');
      });
    }, { threshold: 0.15 });
    sections.forEach(s => obs.observe(s));
  }

  /* ══ 6. SUBLINHADO ══ */
  function initUnderline() {
    const el = document.querySelector('.u-draw');
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setTimeout(() => el.classList.add('drawn'), 300);
      else el.classList.remove('drawn');
    }, { threshold: 0.7 });
    obs.observe(el);
  }

  /* ══ 7 & 8. SWIPERS ══ */
  function initSwiperDep() {
    buildSwiper({
      trackId: 'depTrack', viewportId: 'depViewport', prevId: 'depPrev', nextId: 'depNext', dotsId: 'depDots', cardSel: '.dep-card',
      getVisible: () => (window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3)
    });
  }
  function initSwiperBen() {
    buildSwiper({
      trackId: 'benTrack', viewportId: 'benViewport', prevId: 'benPrev', nextId: 'benNext', dotsId: 'benDots', cardSel: '.ben-card',
      getVisible: () => (window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3)
    });
  }

  function buildSwiper({ trackId, viewportId, prevId, nextId, dotsId, cardSel, getVisible }) {
    const track = document.getElementById(trackId), viewport = document.getElementById(viewportId);
    if (!track) return;
    const prevBtn = document.getElementById(prevId), nextBtn = document.getElementById(nextId), dotsWrap = document.getElementById(dotsId);

    const cards = track.querySelectorAll(cardSel);
    let current = 0;
    const gap = 20;

    function getCardW() {
      const vW = viewport.offsetWidth;
      return getVisible() === 1 ? vW + gap : cards[0].offsetWidth + gap;
    }

    function goTo(idx) {
      const max = Math.max(0, cards.length - getVisible());
      current = Math.max(0, Math.min(idx, max));
      track.style.transform = `translate3d(-${current * getCardW()}px, 0, 0)`;
      updateDots();
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      const total = Math.max(0, cards.length - getVisible()) + 1;
      for (let i = 0; i < total; i++) {
        const d = document.createElement('button');
        d.className = 'dot';
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
      if (getVisible() === 1) {
        const vW = viewport.offsetWidth;
        cards.forEach(c => { c.style.width = vW + 'px'; c.style.minWidth = vW + 'px'; });
      } else {
        cards.forEach(c => { c.style.width = ''; c.style.minWidth = ''; });
      }
      updateDots();
    }

    function updateDots() {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    let sX = 0;
    track.addEventListener('touchstart', e => { sX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const move = sX - e.changedTouches[0].clientX;
      if (Math.abs(move) > 50) goTo(move > 0 ? current + 1 : current - 1);
    }, { passive: true });

    buildDots();
    window.addEventListener('resize', () => { buildDots(); goTo(0); }, { passive: true });
  }

  /* ══ 9. FAQ ══ */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const btn = item.querySelector('.faq-q'), body = item.querySelector('.faq-body');
      btn?.addEventListener('click', () => {
        const isOp = btn.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.faq-q').forEach(b => b.setAttribute('aria-expanded', 'false'));
        document.querySelectorAll('.faq-body').forEach(d => d.classList.remove('faq-body-open'));
        if (!isOp) {
          btn.setAttribute('aria-expanded', 'true');
          body.classList.add('faq-body-open');
        }
      });
    });
  }

  /* ══ 10. MAGNETIC ══ */
  function initMagnetic() {
    const btn = document.getElementById('magneticBtn');
    if (!btn || window.innerWidth < 1024) return;
    const wrap = btn.parentElement;
    wrap.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width/2)) * 0.3;
      const y = (e.clientY - (r.top + r.height/2)) * 0.3;
      gsap.to(btn, { x, y, duration: 0.3, overwrite: 'auto' });
    }, { passive: true });
    wrap.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
    }, { passive: true });
  }

}); // fim DOMContentLoaded
