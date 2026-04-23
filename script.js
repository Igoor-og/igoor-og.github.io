/* ═══════════════════════════════════════
   IGOR ALMEIDA — script.js v4
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  function waitGSAP(cb) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') cb();
    else setTimeout(() => waitGSAP(cb), 80);
  }
  waitGSAP(init);

  function init() {
    gsap.registerPlugin(ScrollTrigger);
    initNavbar();
    // ✅ initHamburger() removido — menu hambúrguer excluído
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
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', scrollY > 40);
    }, { passive: true });
  }

  /* ══ 2. HERO — elementos entram da esquerda com blur ══ */
  function initHeroAnim() {
    const els = document.querySelectorAll('.hero-anim');
    requestAnimationFrame(() => {
      setTimeout(() => {
        els.forEach(el => el.classList.add('on'));
      }, 80);
    });
  }

  /* ══ 3. SCROLL REVEAL — reinicia ao sair da viewport ══ */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.anim-el, .anim-scale');

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
        } else {
          entry.target.classList.remove('on');
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '-5% 0px -5% 0px'
    });

    targets.forEach(el => obs.observe(el));
  }

  /* ══ 4. TELA INCLINADA — skewY com IntersectionObserver ══ */
  function initSkewSections() {
    const sections = document.querySelectorAll('.tela-inclinada');

    sections.forEach(elemento => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio >= 0.3) {
            elemento.classList.add('ativa');
          } else if (entry.intersectionRatio < 0.05) {
            elemento.classList.remove('ativa');
          }
        },
        {
          threshold: [0, 0.05, 0.3, 0.6, 1.0]
        }
      );
      observer.observe(elemento);
    });
  }

  /* ══ 5. SUBLINHADO DESENHADO ══ */
  function initUnderline() {
    const el = document.querySelector('.u-draw');
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => el.classList.add('drawn'), 350);
      } else {
        el.classList.remove('drawn');
      }
    }, { threshold: 0.5 });

    obs.observe(el);
  }

  /* ══ 6. SWIPER DEPOIMENTOS ══ */
  function initSwiperDep() {
    buildSwiper({
      trackId:    'depTrack',
      viewportId: 'depViewport',
      prevId:     'depPrev',
      nextId:     'depNext',
      dotsId:     'depDots',
      cardSel:    '.dep-card',
      getVisible: () => {
        if (window.innerWidth < 600) return 1;
        if (window.innerWidth < 960) return 2;
        return 3;
      }
    });
  }

  /* ══ 7. SWIPER BENEFÍCIOS ══ */
  function initSwiperBen() {
    buildSwiper({
      trackId:    'benTrack',
      viewportId: 'benViewport',
      prevId:     'benPrev',
      nextId:     'benNext',
      dotsId:     'benDots',
      cardSel:    '.ben-card',
      getVisible: () => {
        if (window.innerWidth < 600) return 1;
        if (window.innerWidth < 960) return 2;
        return 3;
      }
    });
  }

  /* ── Swiper reutilizável ── */
  function buildSwiper({ trackId, viewportId, prevId, nextId, dotsId, cardSel, getVisible }) {
    const track    = document.getElementById(trackId);
    const viewport = document.getElementById(viewportId);
    const prevBtn  = document.getElementById(prevId);
    const nextBtn  = document.getElementById(nextId);
    const dotsWrap = document.getElementById(dotsId);
    if (!track) return;

    const cards = track.querySelectorAll(cardSel);
    let current = 0;

    function gap() { return 19; }

    function cardW() {
      if (!cards[0]) return 0;
      const vp = viewport.getBoundingClientRect().width;
      const visible = getVisible();
      if (visible === 1) {
        return vp + gap();
      }
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
        btn.setAttribute('aria-label', `Ir para slide ${i + 1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      }
      updateDots();

      const visible = getVisible();
      if (visible === 1) {
        const vp = viewport.getBoundingClientRect().width;
        cards.forEach(c => { c.style.minWidth = vp + 'px'; c.style.maxWidth = vp + 'px'; });
      } else {
        cards.forEach(c => { c.style.minWidth = ''; c.style.maxWidth = ''; });
      }
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
    track.addEventListener('touchend',   e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }, { passive: true });

    buildDots();

    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { buildDots(); goTo(0); }, 200);
    });
  }

  /* ══ 8. FAQ ACCORDION ══ */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach(item => {
      const btn  = item.querySelector('.faq-q');
      const body = item.querySelector('.faq-body');
      if (!btn || !body) return;

      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        // Fecha todos
        items.forEach(other => {
          const ob = other.querySelector('.faq-q');
          const od = other.querySelector('.faq-body');
          if (ob && od) {
            ob.setAttribute('aria-expanded', 'false');
            od.classList.remove('faq-body-open');
          }
        });

        // Alterna este
        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          body.classList.add('faq-body-open');
        }
      });
    });
  }

  /* ══ 9. BOTÃO MAGNÉTICO ══ */
  function initMagnetic() {
    const btn = document.getElementById('magneticBtn');
    if (!btn) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    const wrap = btn.parentElement;

    wrap.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.32;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.32;
      gsap.to(btn, { x: dx, y: dy, duration: .4, ease: 'power2.out' });
    });

    wrap.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' });
    });
  }

}); // fim DOMContentLoaded
