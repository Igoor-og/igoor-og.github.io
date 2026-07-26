/* ═══════════════════════════════════════
   IGOR ALMEIDA — script.js v5.0
   ✅ Fixes: Swipe touch, Abas do Dashboard, Vídeo Scroll Scrubbing, FAQ estruturado
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

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
    initUnderline();
    
    // Novas funcionalidades
    initVideoScroll();
    initDashboard();
    initFAQStructured();

    // rAF garante que o layout foi calculado antes de medir os cards
    requestAnimationFrame(() => {
      initSwiperDep();
      initSwiperPort();
    });
    initFAQ();
  }

  /* ══ VIDEO DE FUNDO INTERATIVO (SCROLL SCRUBBING) ══ */
  function initVideoScroll() {
    const video = document.getElementById('bgVideo');
    if (!video) return;

    // Garante que o vídeo está carregado e pronto para scrub
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = 0;
    });

    let targetTime = 0;
    let isScrolling = false;

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollPos / (docHeight || 1);

      if (video.duration) {
        // Scrub suave: mapeia o scroll para o tempo do vídeo (limitado a 90% para não travar no fim)
        targetTime = scrollPercent * video.duration * 0.9;
        if (!isScrolling) {
          isScrolling = true;
          requestAnimationFrame(updateVideoTime);
        }
      }
    }, { passive: true });

    function updateVideoTime() {
      if (Math.abs(video.currentTime - targetTime) > 0.05) {
        // Interpolação linear para suavidade
        video.currentTime += (targetTime - video.currentTime) * 0.1;
        requestAnimationFrame(updateVideoTime);
      } else {
        isScrolling = false;
      }
    }
  }

  /* ══ INTERACTIVE DASHBOARD ══ */
  function initDashboard() {
    const dashboard = document.getElementById('interactive-dashboard');
    if (!dashboard) return;

    // Scroll Effect (Glassmorphism Reveal)
    window.addEventListener('scroll', () => {
      const rect = dashboard.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      // Quando entra na viewport, rotaciona levemente em 3D conforme o scroll
      if (rect.top < viewHeight && rect.bottom > 0) {
        const scrolled = (viewHeight - rect.top) / viewHeight;
        const rotateX = Math.max(0, 15 - scrolled * 15); // de 15deg a 0deg
        const translateZ = Math.min(0, -50 + scrolled * 50); // de -50px a 0
        dashboard.style.transform = `rotateX(${rotateX}deg) translateZ(${translateZ}px)`;
      }
    }, { passive: true });

    // Tabs Manager
    const tabs = dashboard.querySelectorAll('.tab-btn');
    const panes = dashboard.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const activePane = document.getElementById(`tab-${target}`);
        if (activePane) {
          activePane.classList.add('active');
          if (target === 'performance') {
            runPerformanceGauge();
          }
        }
      });
    });

    // ABA 1: Simulador de Vendas
    const trafficInput = document.getElementById('sim-traffic');
    const conversionInput = document.getElementById('sim-conversion');
    const ticketInput = document.getElementById('sim-ticket');

    const valTraffic = document.getElementById('val-traffic');
    const valConversion = document.getElementById('val-conversion');
    const valTicket = document.getElementById('val-ticket');

    const kpiOrders = document.getElementById('kpi-orders');
    const kpiRevenue = document.getElementById('kpi-revenue');

    const barSim = document.getElementById('bar-sim');
    const numSim = document.getElementById('num-sim');
    const numLow = document.getElementById('num-low');
    const numHigh = document.getElementById('num-high');

    function updateSimulation() {
      const traffic = parseInt(trafficInput.value);
      const conversion = parseFloat(conversionInput.value) / 100;
      const ticket = parseInt(ticketInput.value);

      valTraffic.textContent = traffic.toLocaleString('pt-BR');
      valConversion.textContent = `${conversionInput.value}%`;
      valTicket.textContent = `R$ ${ticket}`;

      const orders = Math.round(traffic * conversion);
      const revenue = orders * ticket;

      kpiOrders.textContent = orders.toLocaleString('pt-BR');
      kpiRevenue.textContent = `R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      // Gráficos
      const lowRevenue = Math.round(traffic * 0.005 * ticket);
      const highRevenue = Math.round(traffic * 0.03 * ticket);

      numLow.textContent = `R$ ${lowRevenue.toLocaleString('pt-BR')}`;
      numSim.textContent = `R$ ${revenue.toLocaleString('pt-BR')}`;
      numHigh.textContent = `R$ ${highRevenue.toLocaleString('pt-BR')}`;

      // Altura/Largura barras
      const maxVal = Math.max(highRevenue, revenue);
      const simPercent = (revenue / maxVal) * 80 + 10;
      const lowPercent = (lowRevenue / maxVal) * 80 + 10;
      const highPercent = (highRevenue / maxVal) * 80 + 10;

      barSim.style.width = `${simPercent}%`;
      document.getElementById('bar-low').style.width = `${lowPercent}%`;
      document.getElementById('bar-high').style.width = `${highPercent}%`;
    }

    if (trafficInput) {
      trafficInput.addEventListener('input', updateSimulation);
      conversionInput.addEventListener('input', updateSimulation);
      ticketInput.addEventListener('input', updateSimulation);
      updateSimulation();
    }

    // ABA 2: Automação N8N
    const runBtn = document.getElementById('run-n8n-flow');
    const logOutput = document.getElementById('n8n-log-output');
    const nodes = [
      document.getElementById('node-webhook'),
      document.getElementById('node-gpt'),
      document.getElementById('node-crm'),
      document.getElementById('node-whatsapp')
    ];
    const connectors = dashboard.querySelectorAll('.n8n-connector');

    if (runBtn) {
      runBtn.addEventListener('click', () => {
        runBtn.disabled = true;
        logOutput.textContent = '[$] Webhook disparado! Recebendo requisição...';
        
        // Reset nodes
        nodes.forEach(n => { n.classList.remove('active'); n.querySelector('.node-status').textContent = 'Pronto'; });
        connectors.forEach(c => c.classList.remove('running'));

        // Step 1: Webhook
        nodes[0].classList.add('active');
        nodes[0].querySelector('.node-status').textContent = 'Ativo';
        
        setTimeout(() => {
          logOutput.textContent = '[$] Webhook recebido. Enviando payload para ChatGPT API...';
          connectors[0].classList.add('running');
          
          setTimeout(() => {
            connectors[0].classList.remove('running');
            nodes[0].classList.remove('active');
            nodes[0].querySelector('.node-status').textContent = 'Sucesso';
            nodes[1].classList.add('active');
            nodes[1].querySelector('.node-status').textContent = 'Analisando...';
            logOutput.textContent = '[$] IA processando leads e gerando resposta personalizada...';

            setTimeout(() => {
              nodes[1].classList.remove('active');
              nodes[1].querySelector('.node-status').textContent = 'Sucesso';
              nodes[2].classList.add('active');
              nodes[2].querySelector('.node-status').textContent = 'Gravando...';
              connectors[1].classList.add('running');
              logOutput.textContent = '[$] Resposta gerada. Salvando lead qualificado no CRM...';

              setTimeout(() => {
                connectors[1].classList.remove('running');
                nodes[2].classList.remove('active');
                nodes[2].querySelector('.node-status').textContent = 'Salvo';
                nodes[3].classList.add('active');
                nodes[3].querySelector('.node-status').textContent = 'Enviando...';
                connectors[2].classList.add('running');
                logOutput.textContent = '[$] Lead salvo. Disparando notificação WhatsApp...';

                setTimeout(() => {
                  connectors[2].classList.remove('running');
                  nodes[3].classList.remove('active');
                  nodes[3].querySelector('.node-status').textContent = 'Enviado';
                  logOutput.textContent = '[$] Fluxo finalizado com 100% de sucesso!';
                  runBtn.disabled = false;
                }, 1000);
              }, 1000);
            }, 1200);
          }, 800);
        }, 800);
      });
    }

    // ABA 3: Performance
    function runPerformanceGauge() {
      const gauge = document.getElementById('perf-gauge');
      const valueText = document.getElementById('perf-value');
      if (!gauge) return;

      let score = 0;
      valueText.textContent = '0';
      
      const interval = setInterval(() => {
        score += 2;
        if (score > 100) {
          score = 100;
          clearInterval(interval);
        }
        valueText.textContent = score;
        // Desenha conic gradient verde conforme sobe
        const color = score > 89 ? '#27c93f' : (score > 49 ? '#ffbd2e' : '#ff5f56');
        gauge.style.background = `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`;
      }, 15);
    }
  }

  /* ══ FAQ ESTRUTURADO DE SEO ══ */
  function initFAQStructured() {
    const items = document.querySelectorAll('.faq-structured-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-structured-q');
      const answer = item.querySelector('.faq-structured-answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        
        // Fecha outros
        items.forEach(other => {
          other.querySelector('.faq-structured-q')?.setAttribute('aria-expanded', 'false');
          const otherAns = other.querySelector('.faq-structured-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        });

        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          // Define a altura máxima dinamicamente baseada no scrollHeight do filho
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        }
      });
    });
  }

  /* ══ 1. NAVBAR ══ */
  function initNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', scrollY > 40);
    }, { passive: true });
  }

  /* ══ 2. HERO — entra da esquerda com blur ══ */
  function initHeroAnim() {
    const els = document.querySelectorAll('.hero-anim');
    requestAnimationFrame(() => {
      setTimeout(() => els.forEach(el => el.classList.add('on')), 80);
    });
  }

  /* ══ 3. SCROLL REVEAL ══ */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.anim-el, .anim-scale');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(el => obs.observe(el));
  }

  /* ══ 5. SUBLINHADO DESENHADO ══ */
  function initUnderline() {
    const el = document.querySelector('.u-draw');
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setTimeout(() => el.classList.add('drawn'), 350);
      else el.classList.remove('drawn');
    }, { threshold: 0.5 });
    obs.observe(el);
  }

  /* ══ 6. SWIPER DEPOIMENTOS ══ */
  function initSwiperDep() {
    buildSwiper({
      trackId: 'depTrack', viewportId: 'depViewport',
      prevId: 'depPrev', nextId: 'depNext', dotsId: 'depDots',
      cardSel: '.dep-card'
    });
  }

  /* ══ 7.5. SWIPER PORTFÓLIO ══ */
  function initSwiperPort() {
    buildSwiper({
      trackId: 'portTrack', viewportId: 'portViewport',
      prevId: 'portPrev', nextId: 'portNext', dotsId: 'portDots',
      cardSel: '.port-card'
    });
  }

  /* ── Swiper reutilizável com touch e suporte mobile robusto ── */
  function buildSwiper({ trackId, viewportId, prevId, nextId, dotsId, cardSel }) {
    const track = document.getElementById(trackId);
    const viewport = document.getElementById(viewportId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dotsWrap = document.getElementById(dotsId);
    if (!track || !viewport) return;

    const cards = track.querySelectorAll(cardSel);
    let current = 0;

    function gap() { return parseFloat(getComputedStyle(track).gap) || 19; }

    function cardW() {
      if (!cards[0]) return 0;
      return cards[0].getBoundingClientRect().width + gap();
    }

    function maxSlide() {
      const maxTx = Math.max(0, track.scrollWidth - viewport.clientWidth);
      if (cardW() === 0) return 0;
      return Math.ceil(maxTx / cardW());
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxSlide()));
      let tx = current * cardW();
      const maxTx = Math.max(0, track.scrollWidth - viewport.clientWidth);
      if (tx > maxTx) tx = maxTx;
      track.style.transform = `translateX(-${tx}px)`;
      updateDots();
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      const total = maxSlide() + 1;
      if (total <= 1) return; // Não precisa de dots se cabe tudo
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

    let autoplayTimer;
    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        if (current >= maxSlide()) goTo(0);
        else goTo(current + 1);
      }, 3500); // 3.5s autoplay para não ser irritante
    }
    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }
    function resetAutoplay() {
      startAutoplay();
    }

    prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Touch swipe robusto
    let startX = 0;
    let startY = 0;
    let isThreshold = false;

    track.addEventListener('touchstart', e => { 
      startX = e.touches[0].clientX; 
      startY = e.touches[0].clientY;
      isThreshold = false;
      stopAutoplay(); 
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      const diffX = startX - e.touches[0].clientX;
      const diffY = startY - e.touches[0].clientY;
      
      // Se mover horizontalmente mais do que verticalmente, previne o scroll da página
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        isThreshold = true;
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    track.addEventListener('touchend', e => {
      if (isThreshold) {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? goTo(current + 1) : goTo(current - 1);
        }
      }
      startAutoplay();
    }, { passive: true });

    buildDots();
    goTo(0);
    startAutoplay();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { buildDots(); goTo(current); }, 150);
    });
  }

  /* ══ 8. FAQ COMUM ══ */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-q');
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

  /* ══ 9. BOTÃO MAGNÉTICO ══ */
  function initMagnetic() {
    const btn = document.getElementById('magneticBtn');
    if (!btn || !window.matchMedia('(hover: hover)').matches) return;
    const wrap = btn.parentElement;
    wrap.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - (r.left + r.width / 2)) * 0.32,
        y: (e.clientY - (r.top + r.height / 2)) * 0.32,
        duration: .4, ease: 'power2.out'
      });
    });
    wrap.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' });
    });
  }

});