/**
 * avatar.js — Débora: pelo castaño ondulado, polera azul oversized,
 *             pantalón café palazzo, zapatos azules, pecas.
 *
 * FIX v3:
 * - El cabello se dibuja ANTES de la cara (no encima)
 * - Avatar más grande (s mínimo 70px en vez de 44px)
 * - Sin cx.scale(dir,1) en ningún momento — la cara siempre al frente
 * - La dirección se indica solo con la inclinación de brazos/piernas
 */
const AvatarCtrl = (() => {
  let cv, cx;
  let ax, ay, tx, ty;
  let state = 'idle';   // 'idle' | 'walk' | 'throw'
  let dir   = 1;        // 1=derecha  -1=izquierda  (solo afecta animación swing)
  let frame = 0, ft = 0;
  let onArrive = null;

  const SPEED      = 3.8;
  const FRAME_SKIP = 7;

  /* ── Inicializar ─────────────────────────────────── */
  function init() {
    cv = document.getElementById('avatarCanvas');
    cx = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    const { W, H } = Room.getDims();
    ax = tx = W * .44;
    ay = ty = H * .77;

    requestAnimationFrame(loop);
  }

  function resize() {
    const w = cv.offsetWidth  || cv.parentElement?.offsetWidth  || window.innerWidth;
    const h = cv.offsetHeight || cv.parentElement?.offsetHeight || window.innerHeight;
    cv.width  = w;
    cv.height = h;
    if (!ax || ax > w || !ay || ay > h) {
      ax = tx = w * .44;
      ay = ty = h * .77;
    }
  }

  /* ── Loop principal ──────────────────────────────── */
  function loop() {
    if (state === 'walk') {
      const dx = tx - ax, dy = ty - ay;
      const dist = Math.hypot(dx, dy);
      if (dist < SPEED + 1) {
        ax = tx; ay = ty;
        state = 'idle';
        if (onArrive) { const cb = onArrive; onArrive = null; setTimeout(cb, 80); }
      } else {
        ax += (dx/dist)*SPEED;
        ay += (dy/dist)*SPEED;
        dir = dx > 0 ? 1 : -1;
      }
    }
    ft++;
    if (ft >= FRAME_SKIP) { ft = 0; frame = (frame+1)%4; }

    cx.clearRect(0, 0, cv.width, cv.height);
    draw();
    requestAnimationFrame(loop);
  }

  /* ══════════════════════════════════════════════════
     DIBUJO DEL AVATAR
     Orden de capas (de atrás a adelante):
     1. Sombra
     2. Pantalón + zapatos
     3. Polera
     4. Brazos (atrás)
     5. CABELLO (detrás de la cara)
     6. Cuello
     7. CARA + rasgos (encima del cabello)
     8. Flecos delanteros del cabello (solo la parte superior de la frente)
  ══════════════════════════════════════════════════ */
  function draw() {
    cx.save();
    cx.translate(ax, ay);

    /* Escala adaptativa — mínimo 70 para que la cara sea visible */
    const sc  = (cv.height / 850) * .9;
    const s   = Math.max(70, 80 * sc);

    /* Animación caminado */
    const bob   = state==='walk' ? Math.sin(frame*Math.PI/2)*3   : 0;
    const swing = state==='walk' ? Math.sin(frame*Math.PI/2)*18  : 0;

    cx.translate(0, -bob);

    /* ── 1. Sombra ─────────────────────────────────── */
    cx.globalAlpha=.15; cx.fillStyle='#2a1000';
    cx.beginPath(); cx.ellipse(0, s*.05, s*.3, s*.07, 0, 0, Math.PI*2); cx.fill();
    cx.globalAlpha=1;

    const pY = -s*.17;   // top de las piernas
    const pH = s*.72;    // largo de piernas
    const bY = -s*.72;   // top de la polera
    const bW = s*.7, bH = s*.54;
    const hR = s*.30;    // radio cabeza (más grande)
    const hY = bY - hR - s*.02;  // centro cabeza

    /* ── 2. Pantalón café palazzo ──────────────────── */
    // Pierna trasera (siempre la más oscura, detrás)
    cx.save();
    cx.translate(s*.1 * dir, pY);
    cx.rotate(swing * dir * Math.PI/180);
    cx.fillStyle='#5e3e1e';
    cx.beginPath(); cx.moveTo(-s*.08,0); cx.lineTo(s*.08,0); cx.lineTo(s*.16,pH); cx.lineTo(-s*.16,pH); cx.closePath(); cx.fill();
    cx.fillStyle='#3d6fcc';
    cx.beginPath(); cx.ellipse(0, pH+s*.04, s*.13, s*.05, 0, 0, Math.PI*2); cx.fill();
    cx.restore();

    // Pierna delantera
    cx.save();
    cx.translate(-s*.1 * dir, pY);
    cx.rotate(-swing * dir * Math.PI/180);
    cx.fillStyle='#7a5230';
    cx.beginPath(); cx.moveTo(-s*.08,0); cx.lineTo(s*.08,0); cx.lineTo(s*.16,pH); cx.lineTo(-s*.16,pH); cx.closePath(); cx.fill();
    cx.fillStyle='#4a7fe0';
    cx.beginPath(); cx.ellipse(0, pH+s*.04, s*.13, s*.05, 0, 0, Math.PI*2); cx.fill();
    cx.restore();

    /* ── 3. Polera azul oversized ──────────────────── */
    const blue = '#3c6dd1';
    cx.fillStyle=blue;
    cx.beginPath(); cx.roundRect(-bW/2,bY,bW,bH,[s*.06,s*.06,s*.12,s*.12]); cx.fill();
    // Degradado de sombra lateral
    const bg=cx.createLinearGradient(-bW/2,bY,bW/2,bY);
    bg.addColorStop(0,'rgba(0,0,80,.18)'); bg.addColorStop(.3,'transparent');
    bg.addColorStop(.7,'transparent');    bg.addColorStop(1,'rgba(0,0,80,.14)');
    cx.fillStyle=bg;
    cx.beginPath(); cx.roundRect(-bW/2,bY,bW,bH,[s*.06,s*.06,s*.12,s*.12]); cx.fill();

    /* ── 4. Brazos ──────────────────────────────────── */
    const aW=s*.22, aH=s*.42;

    // Brazo trasero (en la dirección de dir, más oscuro)
    cx.save();
    cx.translate((bW/2-s*.03)*dir, bY+s*.05);
    cx.rotate( (state==='throw' ? -65*dir : 10) * Math.PI/180 );
    cx.fillStyle='#2a52a8';
    cx.beginPath(); cx.roundRect(-aW/2,0,aW,aH,aW/2); cx.fill();
    cx.fillStyle='#e8b090';
    cx.beginPath(); cx.ellipse(0,aH,aW*.4,aW*.35,0,0,Math.PI*2); cx.fill();
    cx.restore();

    // Brazo delantero
    cx.save();
    cx.translate((-bW/2+s*.03)*dir, bY+s*.05);
    cx.rotate( 10 * Math.PI/180 );
    cx.fillStyle=blue;
    cx.beginPath(); cx.roundRect(-aW/2,0,aW,aH,aW/2); cx.fill();
    cx.fillStyle='#f5c5a0';
    cx.beginPath(); cx.ellipse(0,aH,aW*.4,aW*.35,0,0,Math.PI*2); cx.fill();
    cx.restore();

    /* ── 5. CABELLO — detrás de la cara ───────────────
       Se dibuja aquí para que la cara quede encima       */
    const hcol='#5a2d0c';

    // Pelo de fondo / volumen trasero
    cx.fillStyle=hcol;
    cx.beginPath(); cx.arc(0, hY, hR*1.12, 0, Math.PI*2); cx.fill();

    // Mechón que cae por el lado derecho (siempre igual, sin escala)
    cx.fillStyle=hcol;
    cx.beginPath();
    cx.moveTo(hR*.55, hY-hR*.1);
    cx.bezierCurveTo(hR*1.25, hY+hR*.35, hR*1.05, hY+hR*1.1, hR*.45, hY+hR*1.45);
    cx.bezierCurveTo(hR*.15, hY+hR*1.45, 0, hY+hR*.85, hR*.5, hY+hR*.25);
    cx.closePath(); cx.fill();

    // Mechón que cae por el lado izquierdo
    cx.beginPath();
    cx.moveTo(-hR*.55, hY-hR*.1);
    cx.bezierCurveTo(-hR*1.15, hY+hR*.25, -hR*1.05, hY+hR*.95, -hR*.55, hY+hR*1.38);
    cx.bezierCurveTo(-hR*.25, hY+hR*1.45, -hR*.05, hY+hR*.75, -hR*.48, hY+hR*.15);
    cx.closePath(); cx.fill();

    /* ── 6. Cuello ─────────────────────────────────── */
    cx.fillStyle='#f5c5a0';
    cx.fillRect(-s*.08, bY-s*.07, s*.16, s*.12);
    // Cuello V de la polera
    cx.fillStyle='#2a52a8';
    cx.beginPath();
    cx.moveTo(-s*.1, bY+s*.04); cx.lineTo(0, bY+s*.17); cx.lineTo(s*.1, bY+s*.04);
    cx.closePath(); cx.fill();

    /* ── 7. CARA — siempre al frente, encima del cabello */

    // Cara base (piel)
    cx.fillStyle='#f5c5a0';
    cx.beginPath(); cx.arc(0, hY, hR, 0, Math.PI*2); cx.fill();

    // Mejillas rosadas
    cx.fillStyle='rgba(255,170,145,.4)';
    cx.beginPath(); cx.ellipse(-hR*.5, hY+hR*.18, hR*.24, hR*.16, 0, 0, Math.PI*2); cx.fill();
    cx.beginPath(); cx.ellipse( hR*.5, hY+hR*.18, hR*.24, hR*.16, 0, 0, Math.PI*2); cx.fill();

    // Pecas
    cx.fillStyle='rgba(140,80,40,.55)';
    [
      [-hR*.52, hY+hR*.07], [-hR*.40, hY+hR*.15], [-hR*.58, hY+hR*.18],
      [-hR*.45, hY+hR*.23], [-hR*.33, hY+hR*.10],
      [ hR*.52, hY+hR*.07], [ hR*.40, hY+hR*.15], [ hR*.58, hY+hR*.18],
      [ hR*.45, hY+hR*.23], [ hR*.33, hY+hR*.10]
    ].forEach(([fx,fy]) => {
      cx.beginPath(); cx.arc(fx, fy, Math.max(1.5, hR*.028), 0, Math.PI*2); cx.fill();
    });

    // Cejas marcadas
    cx.strokeStyle='#3a1800';
    cx.lineWidth = Math.max(1.5, s*.04);
    cx.lineCap='round';
    cx.beginPath(); cx.moveTo(-hR*.52,hY-hR*.28); cx.quadraticCurveTo(-hR*.28,hY-hR*.38,-hR*.07,hY-hR*.3); cx.stroke();
    cx.beginPath(); cx.moveTo( hR*.07,hY-hR*.3);  cx.quadraticCurveTo( hR*.28,hY-hR*.38, hR*.52,hY-hR*.28); cx.stroke();

    // Ojos — más grandes para que se vean bien
    const blink = frame===3 ? .07 : 1;
    // Iris
    cx.fillStyle='#2a1a0a';
    cx.beginPath(); cx.ellipse(-hR*.3, hY-hR*.07, hR*.14, hR*.17*blink, 0, 0, Math.PI*2); cx.fill();
    cx.beginPath(); cx.ellipse( hR*.3, hY-hR*.07, hR*.14, hR*.17*blink, 0, 0, Math.PI*2); cx.fill();
    // Brillo
    cx.fillStyle='rgba(255,255,255,.92)';
    cx.beginPath(); cx.arc(-hR*.25, hY-hR*.13, Math.max(1.5, hR*.05), 0, Math.PI*2); cx.fill();
    cx.beginPath(); cx.arc( hR*.35, hY-hR*.13, Math.max(1.5, hR*.05), 0, Math.PI*2); cx.fill();

    // Nariz
    cx.strokeStyle='rgba(140,75,35,.5)';
    cx.lineWidth=Math.max(1, s*.026);
    cx.beginPath(); cx.arc(0, hY+hR*.12, hR*.09, .2, Math.PI-.2); cx.stroke();

    // Boca
    cx.strokeStyle='#8a4030';
    cx.lineWidth=Math.max(1.5, s*.032);
    if (state==='throw') {
      cx.fillStyle='#8a3020';
      cx.beginPath(); cx.ellipse(0, hY+hR*.33, hR*.12, hR*.09, 0, 0, Math.PI*2); cx.fill();
    } else {
      cx.beginPath(); cx.arc(0, hY+hR*.2, hR*.16, .2, Math.PI-.2); cx.stroke();
    }

    /* ── 8. Fleco delantero del cabello (SOLO la franja superior de la frente)
       Dibujado al final para que tape solo la parte de arriba de la cara,
       no los ojos ni la boca                                               */
    cx.fillStyle=hcol;
    // Semicírculo superior (copa del cabello)
    cx.beginPath(); cx.arc(0, hY-hR*.05, hR*.98, Math.PI, Math.PI*2); cx.fill();

    // Mechoncito frontal asimétrico — solo hasta la ceja, NO tapa los ojos
    cx.beginPath();
    cx.moveTo(-hR*.22, hY-hR*.82);
    cx.bezierCurveTo(-hR*.55, hY-hR*.65, -hR*.48, hY-hR*.38, -hR*.18, hY-hR*.30);
    cx.bezierCurveTo(-hR*.03, hY-hR*.30,  hR*.03, hY-hR*.52, -hR*.08, hY-hR*.82);
    cx.closePath(); cx.fill();

    // Rayita de luz en el cabello
    cx.strokeStyle='#7a4a1e';
    cx.lineWidth=Math.max(1, s*.022);
    cx.beginPath();
    cx.moveTo(-hR*.04, hY-hR*.95);
    cx.quadraticCurveTo(-hR*.18, hY-hR*.6, -hR*.12, hY-hR*.38);
    cx.stroke();

    cx.restore();
  }

  /* ── API pública ─────────────────────────────────── */
  function walkTo(px, py, cb) {
    tx = px; ty = py;
    state = 'walk';
    onArrive = cb;
  }

  function throwAnim(icon, fromX, fromY, cb) {
    state = 'throw'; frame = 0; ft = 0;
    const el = document.createElement('div');
    el.className = 'throw-obj';
    el.style.left = fromX+'px'; el.style.top = fromY+'px';
    el.textContent = icon;
    document.body.appendChild(el);
    setTimeout(()=>{ el.remove(); state='idle'; if(cb) cb(); }, 700);
  }

  function getPos() { return { x: ax, y: ay }; }

  return { init, resize, walkTo, throwAnim, getPos };
})();
