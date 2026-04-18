/* ═══════════════════════════════════════════════
   IGOR ALMEIDA — LANDING PAGE PREMIUM
   script.js — Interações, GSAP e animações
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════
     AGUARDA O GSAP CARREGAR (pode estar em defer)
     ══════════════════════════════════════════════ */
  function waitForGSAP(callback) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      callback();
    } else {
      setTimeout(() => waitForGSAP(callback), 100);
    }
  }

  waitForGSAP(initAll);

  function initAll() {
    gsap.registerPlugin(ScrollTrigger);

    initCursor();
    initNavbar();
    initHamburger();
    initHeroAnimations();
    initScrollAnimations();
    initCardTilt();
    initMagneticButton();
    initMobileMarquee();
  }

  /* ══════════════════════════════════════════════
     1. CURSOR PERSONALIZADO
        — Segue o mouse com suavidade
     ══════════════════════════════════════════════ */
  function initCursor() {
    const cursor         = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');

    // Só ativa em dispositivos com hover real (desktop)
    if (!window.matchMedia('(hover: hover)').matches) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    // Atualiza posição do cursor instantaneamente
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    });

    // Follower segue com lag suave via requestAnimationFrame
    function animateFollower() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      cursorFollower.style.left = followerX + 'px';
      cursorFollower.style.top  = followerY + 'px';
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Expande o follower ao passar em links e botões
    const interactives = document.querySelectorAll('a, button, [data-tilt]');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => cursorFollower.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hovered'));
    });
  }

  /* ══════════════════════════════════════════════
     2. NAVBAR — Adiciona classe "scrolled" ao rolar
     ══════════════════════════════════════════════ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════
     3. MENU HAMBÚRGUER — Abre/fecha menu mobile
     ══════════════════════════════════════════════ */
  function initHamburger() {
    const btn        = document.getElementById('hamburger');
    const menu       = document.getElementById('mobileMenu');
    const mobLinks   = document.querySelectorAll('.mob-link');

    function toggleMenu(open) {
      btn.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      // Bloqueia scroll do body quando menu está aberto
      document.body.style.overflow = open ? 'hidden' : '';
    }

    btn.addEventListener('click', () => {
      const isOpen = menu.classList.contains('open');
      toggleMenu(!isOpen);
    });

    // Fecha ao clicar em qualquer link do menu mobile
    mobLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Fecha ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        toggleMenu(false);
      }
    });
  }

  /* ══════════════════════════════════════════════
     4. HERO — Animações de entrada com GSAP
        — Elementos surgem de baixo para cima (fade-up)
     ══════════════════════════════════════════════ */
  function initHeroAnimations() {
    const heroElements = document.querySelectorAll('.hero [data-gsap="fade-up"]');

    // Linha do tempo sequencial para os elementos do hero
    const tl = gsap.timeline({ delay: 0.1 });

    tl.from(heroElements, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.15,  // Cada elemento aparece 0.15s após o anterior
      ease: 'power3.out',
    });

    // Animação flutuante suave do container Spline
    gsap.to('#spline-container', {
      y: -12,
      duration: 4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }

  /* ══════════════════════════════════════════════
     5. SCROLL ANIMATIONS — Elementos entram ao rolar
        — Parallax stagger nos cards (velocidades diferentes)
     ══════════════════════════════════════════════ */
  function initScrollAnimations() {

    /* ── Elementos fade-up genéricos ── */
    gsap.utils.toArray('[data-gsap="fade-up"]').forEach((el) => {
      // Pula elementos do hero (já animados na entrada)
      if (el.closest('.hero')) return;

      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    });

    /* ── Cards com stagger/parallax ──
       Cada card entra com velocidade ligeiramente diferente,
       criando o efeito de profundidade/parallax */
    const staggerGroups = document.querySelectorAll('.services-grid, .plans-grid');

    staggerGroups.forEach((group) => {
      const cards = group.querySelectorAll('[data-gsap="stagger"]');

      gsap.from(cards, {
        scrollTrigger: {
          trigger: group,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        y: (i) => 50 + i * 15,  // Cada card começa um pouco mais abaixo
        opacity: 0,
        duration: 0.85,
        stagger: {
          amount: 0.4,           // Distribui o stagger ao longo de 0.4s
          from: 'start',
        },
        ease: 'power3.out',
      });
    });

    /* ── Planos extras ── */
    gsap.utils.toArray('[data-gsap="stagger"]').forEach((el) => {
      if (el.closest('.services-grid') || el.closest('.plans-grid')) return;

      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
    });
  }

  /* ══════════════════════════════════════════════
     6. TILT 3D — Efeito de inclinação nos cards
        — Responde ao movimento do mouse
     ══════════════════════════════════════════════ */
  function initCardTilt() {
    // Não aplica tilt em touch devices
    if (!window.matchMedia('(hover: hover)').matches) return;

    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect    = card.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;

        // Normaliza posição do mouse (-1 a 1)
        const deltaX  = (e.clientX - centerX) / (rect.width  / 2);
        const deltaY  = (e.clientY - centerY) / (rect.height / 2);

        // Intensidade máxima de inclinação em graus
        const maxTilt = 8;
        const rotateX = -deltaY * maxTilt;
        const rotateY =  deltaX * maxTilt;

        // Aplica via GSAP para suavidade
        gsap.to(card, {
          rotateX,
          rotateY,
          scale: 1.02,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800,
        });
      });

      // Reseta ao sair
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  /* ══════════════════════════════════════════════
     7. BOTÃO MAGNÉTICO — Atrai em direção ao mouse
        — O botão se desloca suavemente para o cursor
     ══════════════════════════════════════════════ */
  function initMagneticButton() {
    const wrap = document.querySelector('.magnetic-wrap');
    const btn  = document.getElementById('magneticBtn');
    if (!wrap || !btn) return;

    // Só ativa em desktop
    if (!window.matchMedia('(hover: hover)').matches) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect    = wrap.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;

      // Força de atração (quanto o botão se move)
      const magnetStrength = 0.35;
      const deltaX = (e.clientX - centerX) * magnetStrength;
      const deltaY = (e.clientY - centerY) * magnetStrength;

      gsap.to(btn, {
        x: deltaX,
        y: deltaY,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    wrap.addEventListener('mouseleave', () => {
      // Retorna ao centro com efeito elástico
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      });
    });
  }

  /* ══════════════════════════════════════════════
     8. MARQUEE — Pausa no toque mobile
        — CSS já pausa no :hover
        — Aqui adicionamos suporte a touchstart/touchend
     ══════════════════════════════════════════════ */
  function initMobileMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;

    // Toque inicia → pausa animação
    track.addEventListener('touchstart', () => {
      track.style.animationPlayState = 'paused';
    }, { passive: true });

    // Toque termina → retoma animação
    track.addEventListener('touchend', () => {
      track.style.animationPlayState = 'running';
    }, { passive: true });
  }

}); // fim DOMContentLoaded
