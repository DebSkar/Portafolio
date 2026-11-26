/**
 * app.js — Orquestador principal
 *
 * FIXES v2:
 * 1. Scroll/wheel capturado correctamente (passive:false en body)
 * 2. Canvas se redimensiona con doble rAF para garantizar visibilidad
 * 3. Lightbox: cursor zoom-in funcional + stopPropagation correcto
 * 4. Efecto 3D Card (Aceternity UI traducido a vanilla JS/CSS)
 *    aplicado al modal cuando se expande la info del proyecto
 */

/* ═══════════════════════════════════════════════════
   ESTADO
═══════════════════════════════════════════════════ */
let phase = 'hero';   // 'hero' | 'door' | 'room'
let busy  = false;

/* ═══════════════════════════════════════════════════
   ARRANQUE
═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Room.init();
  AvatarCtrl.init();

  buildHotspots();
  initModal();
  initLightbox();
  initScroll();
  initHint();
  initHomeBtn();

  console.log('Portfolio listo ✓');
});

/* ═══════════════════════════════════════════════════
   SCROLL / TOUCH → PUERTA
═══════════════════════════════════════════════════ */
function initScroll() {
  // Capturar wheel en document (no en window, más fiable cross-browser)
  document.addEventListener('wheel', onWheel, { passive: false });

  // Touch
  let ty0 = 0;
  document.addEventListener('touchstart', e => { ty0 = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (phase !== 'hero' || busy) return;
    if ((ty0 - e.touches[0].clientY) > 30) {
      e.preventDefault();
      triggerDoor();
    }
  }, { passive: false });

  // Flecha abajo / espacio también funcionan
  document.addEventListener('keydown', e => {
    if (phase !== 'hero' || busy) return;
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      triggerDoor();
    }
  });
}

function onWheel(e) {
  if (phase !== 'hero' || busy) return;
  if (e.deltaY > 0) {
    e.preventDefault();
    triggerDoor();
  }
}

/* ── Disparar secuencia puerta ──────────────────── */
function triggerDoor() {
  busy = true;

  // 1. Fade out del hero
  const hero = document.getElementById('hero');
  hero.classList.add('hidden');

  // 2. Mostrar sección puerta tras el fade
  setTimeout(() => {
    document.getElementById('door-section').classList.add('show');
    phase = 'door';

    // 3. Abrir la puerta
    setTimeout(() => {
      document.getElementById('doorFrame').classList.add('open');
    }, 400);

    // 4. Entrar a la habitación
    setTimeout(enterRoom, 1900);
  }, 400);
}

/* ── Entrar a la habitación ─────────────────────── */
function enterRoom() {
  const doorSec = document.getElementById('door-section');
  const roomSec = document.getElementById('room-section');

  // Fade out puerta
  doorSec.style.transition = 'opacity .6s';
  doorSec.style.opacity = '0';

  setTimeout(() => {
    // Ocultar puerta
    doorSec.classList.remove('show');
    doorSec.style.cssText = '';

    // Mostrar habitación
    roomSec.classList.add('show');

    // ⚡ CRÍTICO: doble rAF para garantizar que el layout ya aplicó
    // el display:block y que offsetWidth/offsetHeight son > 0
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Room.resize();
        AvatarCtrl.resize();

        // Iniciar animación de la gata
        Room.startCatLoop();

        // Mostrar botón home
        document.getElementById('btn-home').classList.remove('hidden');

        phase = 'room';
        busy  = false;
      });
    });
  }, 650);
}

/* ═══════════════════════════════════════════════════
   HOTSPOTS DE PROYECTOS
═══════════════════════════════════════════════════ */
function buildHotspots() {
  const container = document.getElementById('hotspots');
  container.innerHTML = '';

  PROJECTS.forEach((p, i) => {
    const el = document.createElement('div');
    el.className  = 'hotspot';
    el.dataset.id = p.id;
    el.style.left = (p.pos.x * 100) + '%';
    el.style.top  = (p.pos.y * 100) + '%';
    el.innerHTML  = `
      <div class="hotspot-label">${p.short}</div>
      <div class="hotspot-icon" style="animation-delay:${i * .14}s">${p.icon}</div>
    `;
    el.addEventListener('click', () => onHotspotClick(p));
    container.appendChild(el);
  });
}

function setHotspotsEnabled(enabled) {
  document.querySelectorAll('.hotspot').forEach(h => {
    h.style.pointerEvents = enabled ? '' : 'none';
  });
}

/* ── Click en un proyecto ───────────────────────── */
function onHotspotClick(proj) {
  setHotspotsEnabled(false);

  const { W, H } = Room.getDims();

  // Destino del avatar: coordenadas del hotspot
  const tX = proj.pos.x * W;
  const tY = proj.pos.y * H;

  // 1. Avatar camina hacia el proyecto
  AvatarCtrl.walkTo(tX, tY, () => {
    // 2. Avatar lanza el objeto
    const pos = AvatarCtrl.getPos();
    AvatarCtrl.throwAnim(proj.icon, pos.x, pos.y - 50, () => {
      // 3. Modal se abre
      openModal(proj);
    });
  });
}

/* ═══════════════════════════════════════════════════
   MODAL — Efecto 3D Card (Aceternity UI · vanilla JS)
   
   El efecto se activa al hacer hover sobre el modal-card.
   Cada "CardItem" (título, imagen galería, etc.) tiene su
   propio translateZ que crea profundidad al inclinar la tarjeta.
═══════════════════════════════════════════════════ */
let modalOpen = false;
let tiltRaf   = null;
let mX = 0, mY = 0, rX = 0, rY = 0;
let cardHovered = false;  // ← nuevo: saber si el mouse está sobre la card

function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBg').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!document.getElementById('lightbox').classList.contains('hidden')) {
        closeLightbox();
      } else {
        closeModal();
      }
    }
  });

  const card = document.getElementById('modalCard');

  /* ── Aceternity 3D Card: mousemove en la card ── */
  card.addEventListener('mousemove', e => {
    if (!modalOpen) return;
    const r = card.getBoundingClientRect();
    // Coordenadas normalizadas [-1, 1]
    mX = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
    mY = (e.clientY - r.top   - r.height / 2) / (r.height / 2);

    // Brillo holográfico (efecto 3d-card de Aceternity)
    const sx = 50 + mX * 30;
    const sy = 50 + mY * 30;
    document.getElementById('cardShine').style.cssText =
      `opacity:1; background: radial-gradient(circle at ${sx}% ${sy}%,
       rgba(255,255,255,.24) 0%, rgba(255,255,255,.07) 40%, transparent 70%)`;

    // Actualizar translateZ de los CardItems según posición del mouse
    updateCardItems(mX, mY);
  });

  card.addEventListener('mouseenter', () => {
    cardHovered = true;
  });

  card.addEventListener('mouseleave', () => {
    cardHovered = false;
    mX = mY = 0;
    document.getElementById('cardShine').style.opacity = '0';
    // Resetear CardItems
    updateCardItems(0, 0, true);
  });

  // Capturar mousemove en el overlay para el tilt de la card
  const modalEl = document.getElementById('modal');
  modalEl.addEventListener('mousemove', e => {
    if (!modalOpen || cardHovered) return;
    // Si el mouse está fuera de la card, suavizar el retorno
    mX *= 0.85;
    mY *= 0.85;
  });
}

/* ── Actualiza la profundidad 3D de los items (Aceternity CardItem) ── */
function updateCardItems(nx, ny, reset = false) {
  const card = document.getElementById('modalCard');
  if (!card) return;

  // Cada elemento con data-tz tiene su propio translateZ configurado
  card.querySelectorAll('[data-tz]').forEach(el => {
    const tz = reset ? 0 : parseFloat(el.dataset.tz) || 0;
    if (reset) {
      el.style.transform = 'translateZ(0px)';
    } else {
      el.style.transform = `translateZ(${tz}px)`;
    }
  });
}

/* ── Loop de tilt 3D suavizado ──────────────────── */
function tiltLoop() {
  // Suavizado tipo spring (igual que Aceternity)
  rX += (-mY * 10 - rX) * .08;
  rY += ( mX * 10 - rY) * .08;

  const card = document.getElementById('modalCard');
  if (card && modalOpen) {
    card.style.transform =
      `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(1.015,1.015,1.015)`;
  }
  if (modalOpen) tiltRaf = requestAnimationFrame(tiltLoop);
}

function openModal(proj) {
  modalOpen = true;
  cardHovered = false;
  mX = mY = rX = rY = 0;

  const card = document.getElementById('modalCard');
  card.style.setProperty('--proj-color', proj.color || '#4ecdc4');
  card.style.transform = '';

  // Categoría
  document.getElementById('modalCategory').textContent = proj.category || '';

  // Título (con data-tz para efecto 3D)
  const titleEl = document.getElementById('modalTitle');
  titleEl.textContent = proj.name;
  titleEl.dataset.tz = '50';  // translateZ alto → flota más

  // Tags
  const tagsEl = document.getElementById('modalTags');
  tagsEl.innerHTML = '';
  tagsEl.dataset.tz = '30';
  (proj.tech || []).forEach(t => {
    const sp = document.createElement('span');
    sp.className = 'tag'; sp.textContent = t;
    tagsEl.appendChild(sp);
  });

  // Galería con lightbox
  const galEl = document.getElementById('modalGallery');
  galEl.innerHTML = '';
  galEl.dataset.tz = '60';  // la galería flota más arriba

  if (proj.images && proj.images.length) {
    proj.images.forEach((src, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'gal-item';
      wrap.style.setProperty('--i', i);
      const img = document.createElement('img');
      img.src = src;
      img.alt = proj.name;
      img.loading = 'lazy';
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', e => {
        e.stopPropagation();
        openLightbox(src);
      });
      wrap.appendChild(img);
      galEl.appendChild(wrap);
    });
  } else {
    const ph = document.createElement('div');
    ph.className = 'gal-placeholder';
    ph.style.background = `linear-gradient(135deg, ${proj.color}99, ${proj.color}33)`;
    ph.textContent = proj.icon;
    galEl.appendChild(ph);
  }

  // Descripción
  const descEl = document.getElementById('modalDesc');
  descEl.textContent = proj.desc;
  descEl.dataset.tz = '20';

  // Links
  const linksEl = document.getElementById('modalLinks');
  linksEl.innerHTML = '';
  linksEl.dataset.tz = '25';
  if (proj.github) linksEl.appendChild(mkLink(proj.github, '🐙 Ver en GitHub',    'github'));
  if (proj.demo)   linksEl.appendChild(mkLink(proj.demo,   '🔗 Ver Experiencia',  'demo'));
  if (proj.live)   linksEl.appendChild(mkLink(proj.live,   '🌐 Sitio en vivo',    'live'));

  // Mostrar modal
  const modal = document.getElementById('modal');
  modal.classList.remove('hidden');
  document.body.style.overflow = '';

  // Animación de entrada
  card.style.animation = 'none';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.style.animation = 'cardIn .55s cubic-bezier(.34,1.56,.64,1) both';
    });
  });

  // Iniciar tilt
  if (tiltRaf) cancelAnimationFrame(tiltRaf);
  tiltRaf = requestAnimationFrame(tiltLoop);
}

function closeModal() {
  if (!modalOpen) return;
  modalOpen = false;
  mX = mY = 0;
  if (tiltRaf) { cancelAnimationFrame(tiltRaf); tiltRaf = null; }

  const card  = document.getElementById('modalCard');
  const modal = document.getElementById('modal');

  card.style.animation = 'cardOut .3s ease forwards';
  setTimeout(() => {
    modal.classList.add('hidden');
    card.style.animation  = '';
    card.style.transform  = '';
    setHotspotsEnabled(true);
  }, 320);
}

function mkLink(href, text, cls) {
  const a = document.createElement('a');
  a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.className = `proj-link ${cls}`; a.textContent = text;
  return a;
}

/* ═══════════════════════════════════════════════════
   LIGHTBOX DE FOTOS
═══════════════════════════════════════════════════ */
function initLightbox() {
  const lb = document.getElementById('lightbox');

  document.getElementById('lightbox-close').addEventListener('click', e => {
    e.stopPropagation();
    closeLightbox();
  });

  // Cerrar al hacer click en el fondo (pero NO en la imagen)
  lb.addEventListener('click', e => {
    if (e.target === lb) closeLightbox();
  });
}

function openLightbox(src) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');

  img.style.animation = 'none';
  img.src = src;
  lb.classList.remove('hidden');

  requestAnimationFrame(() => {
    img.style.animation = '';
  });
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.getElementById('lightbox-img').src = '';
  const cap = document.getElementById('lightbox-caption');
  if (cap) cap.textContent = '';
}

/* ═══════════════════════════════════════════════════
   HINT DE INSTRUCCIÓN
═══════════════════════════════════════════════════ */
function initHint() {
  const observer = new MutationObserver(() => {
    const roomSec = document.getElementById('room-section');
    if (roomSec.classList.contains('show')) {
      setTimeout(() => {
        const h = document.getElementById('room-hint');
        if (h) { h.classList.add('fade'); setTimeout(() => h.remove(), 900); }
      }, 7000);
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('room-section'), { attributes: true });
}

/* ═══════════════════════════════════════════════════
   BOTÓN VOLVER AL INICIO
═══════════════════════════════════════════════════ */
function initHomeBtn() {
  document.getElementById('btn-home').addEventListener('click', goHome);
}

function goHome() {
  if (busy) return;
  busy = true;

  // Cerrar modal si está abierto
  closeModal();

  const roomSec = document.getElementById('room-section');
  const hero    = document.getElementById('hero');
  const btn     = document.getElementById('btn-home');

  // Fade out de la habitación
  roomSec.style.transition = 'opacity .5s';
  roomSec.style.opacity = '0';
  btn.style.opacity = '0';
  btn.style.transition = 'opacity .4s';

  setTimeout(() => {
    // Ocultar habitación
    roomSec.classList.remove('show');
    roomSec.style.cssText = '';
    btn.classList.add('hidden');
    btn.style.cssText = '';

    // Parar gata
    Room.stopCatLoop();

    // Mostrar hero
    hero.classList.remove('hidden');

    phase = 'hero';
    busy  = false;
  }, 520);
}
