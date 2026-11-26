/**
 * room.js — Habitación cartoon dibujada en Canvas 2D
 *           + gata cálica animada (cola y parpadeo)
 *           + cuadros maki/obey con tooltip "acrilico sobre tela"
 *           + contactos en pizarrón
 */
const Room = (() => {
  let cv, cx, W, H;
  let catAnimId = null;

  // Imágenes de los cuadros
  const imgMaki = new Image();
  const imgObey = new Image();
  imgMaki.src = 'assets/maki.jpg';
  imgObey.src = 'assets/obey.jpg';

  // Hotspot de cuadros para click/lightbox
  let paintingHotspots = [];
  // Hotspot de links clickeables en la pizarra
  let linkHotspots = [];

  function init() {
    cv = document.getElementById('roomCanvas');
    cx = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    // Click en canvas → revisar si cayó sobre un cuadro
    cv.addEventListener('click', onCanvasClick);

    // Cursor adaptativo: zoom-in en cuadros, pointer en link del portfolio
    cv.addEventListener('mousemove', e => {
      const rect = cv.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const overPainting = paintingHotspots.some(p =>
        mx >= p.x - 10 && mx <= p.x + p.w + 10 &&
        my >= p.y - 10 && my <= p.y + p.h + 10
      );
      const overLink = linkHotspots.some(l =>
        mx >= l.x && mx <= l.x + l.w &&
        my >= l.y && my <= l.y + l.h
      );

      cv.style.cursor = overPainting ? 'zoom-in' : overLink ? 'pointer' : 'default';
    });
  }

  function resize() {
    W = cv.width  = cv.offsetWidth  || cv.parentElement?.offsetWidth  || window.innerWidth;
    H = cv.height = cv.offsetHeight || cv.parentElement?.offsetHeight || window.innerHeight;
    drawStatic();
  }

  /* ── Draw estático (sin la gata, que se anima sola) ───── */
  function drawStatic() {
    cx.clearRect(0, 0, W, H);
    paintingHotspots = [];   // resetear cada redraw
    linkHotspots     = [];   // ídem para links
    walls();
    floor();
    furniture();
    decor();
    projectGlows();
  }

  /* ── Loop animación gata ─────────────────────────────── */
  function startCatLoop() {
    if (catAnimId) return;
    function loop() {
      drawStatic();
      cat();
      catAnimId = requestAnimationFrame(loop);
    }
    loop();
  }
  function stopCatLoop() {
    if (catAnimId) { cancelAnimationFrame(catAnimId); catAnimId = null; }
  }

  /* ══════════════════════════════════════════════════════
     PAREDES
  ══════════════════════════════════════════════════════ */
  function walls() {
    // Fondo
    cx.fillStyle = '#f5e8cc';
    cx.fillRect(0, 0, W, H * .64);

    // Sócalo
    cx.fillStyle = '#8b6240';
    cx.fillRect(0, H * .63, W, 10);
    cx.fillStyle = 'rgba(255,255,255,.25)';
    cx.fillRect(0, H * .63, W, 3);

    // Sombra esquinas
    const gl = cx.createLinearGradient(0,0, W*.12,0);
    gl.addColorStop(0,'rgba(90,55,20,.28)'); gl.addColorStop(1,'transparent');
    cx.fillStyle = gl; cx.fillRect(0,0, W*.12, H*.64);
    const gr = cx.createLinearGradient(W,0, W*.88,0);
    gr.addColorStop(0,'rgba(90,55,20,.28)'); gr.addColorStop(1,'transparent');
    cx.fillStyle = gr; cx.fillRect(W*.88,0, W*.12, H*.64);

    // Sombra techo
    const gt = cx.createLinearGradient(0,0, 0,70);
    gt.addColorStop(0,'rgba(90,55,20,.15)'); gt.addColorStop(1,'transparent');
    cx.fillStyle = gt; cx.fillRect(0,0,W,70);

    // Líneas de pared
    cx.strokeStyle='rgba(190,155,100,.18)'; cx.lineWidth=1;
    for(let y=50; y<H*.63; y+=45){ line(0,y,W,y); }
  }

  /* ══════════════════════════════════════════════════════
     SUELO
  ══════════════════════════════════════════════════════ */
  function floor() {
    const fy = H*.63;
    cx.fillStyle = '#c8a882';
    cx.fillRect(0, fy, W, H-fy);

    // Tablones perspectivados
    cx.strokeStyle = '#b08060'; cx.lineWidth = 1.5;
    const vx = W/2;
    for(let i=0; i<=8; i++){
      const t = i/8, y = fy + (H-fy)*t;
      cx.globalAlpha = .25 + t*.3;
      line(0,y,W,y);
    }
    for(let i=0; i<=12; i++){
      const bx = (i/12)*W;
      cx.globalAlpha = .18;
      line(vx + (bx-vx)*.04, fy, bx, H);
    }
    cx.globalAlpha = 1;

    // Brillo
    const gf = cx.createLinearGradient(0,fy,0,fy+80);
    gf.addColorStop(0,'rgba(255,235,195,.28)'); gf.addColorStop(1,'transparent');
    cx.fillStyle = gf; cx.fillRect(0,fy,W,80);
  }

  /* ══════════════════════════════════════════════════════
     MUEBLES
  ══════════════════════════════════════════════════════ */
  function furniture() {
    const fy = H*.63;
    shelf(W*.06, H*.28, W*.32, 1);
    shelf(W*.58, H*.26, W*.36, 2);
    board(W*.20, H*.09, W*.18, H*.28);  // Pizarrón con contactos
    desk( W*.12, fy, W*.29);
    chair(W*.21, fy);
    rug(  W*.5, fy+18, W*.52, (H-fy)*.58);
    lamp( W*.38, fy);
    plant(W*.96, fy);

    // Cuadros reemplazando el wallFrame genérico
    paintingFrame(W*.72, H*.08, W*.11, H*.22, imgMaki,  'maki');
    paintingFrame(W*.85, H*.08, W*.10, H*.22, imgObey,  'obey');
  }

  function desk(x, fy, w) {
    const h=90, top=fy-h;
    cx.fillStyle='rgba(90,55,20,.18)';
    ellipse(x+w/2, fy+4, w*.5, 10);
    cx.fillStyle='#c8956c'; rRect(x,top,w,h,6);
    const g=cx.createLinearGradient(x,top,x,top+22);
    g.addColorStop(0,'rgba(255,255,255,.28)'); g.addColorStop(1,'transparent');
    cx.fillStyle=g; rRect(x,top,w,22,6);
    cx.fillStyle='#a07050'; cx.fillRect(x+4,top+h-18,w-8,18);
    cx.fillStyle='#8b6240';
    cx.fillRect(x+10,fy-20,10,20); cx.fillRect(x+w-20,fy-20,10,20);
    laptop(x+w*.3, top-2, w*.35);
    mug(x+w*.7, top);
  }

  function laptop(x, y, w) {
    const h = w*.62;
    cx.fillStyle='#2d3436'; rRect(x,y-h,w,h,4);
    cx.fillStyle='#1e90ff'; rRect(x+4,y-h+4,w-8,h-10,2);
    cx.fillStyle='rgba(255,255,255,.12)'; rRect(x+4,y-h+4,w-8,(h-10)*.4,2);
    cx.fillStyle='#636e72'; rRect(x-4,y,w+8,6,2);
  }

  function mug(x, y) {
    cx.fillStyle='#e17055';
    cx.fillRect(x-9,y-18,18,18);
    cx.fillStyle='rgba(255,255,255,.3)'; cx.fillRect(x-6,y-16,6,3);
    cx.strokeStyle='#c0392b'; cx.lineWidth=3; cx.lineCap='round';
    cx.beginPath(); cx.arc(x+10,y-9,7,Math.PI*.4,Math.PI*1.6); cx.stroke();
  }

  function shelf(x, y, w, v) {
    cx.fillStyle = v===1?'#e8c99a':'#d4b886';
    cx.fillRect(x,y,w,65);
    cx.fillStyle='#c8956c';
    cx.fillRect(x-5,y-9,w+10,12);
    cx.fillRect(x-5,y+65,w+10,10);
    cx.fillStyle='#a07050';
    const divs = 2;
    for(let i=1;i<=divs;i++){
      const dx=x+(w/(divs+1))*i;
      cx.fillRect(dx-3,y,6,65);
    }
    const g=cx.createLinearGradient(x,y+75,x,y+95);
    g.addColorStop(0,'rgba(90,55,20,.18)'); g.addColorStop(1,'transparent');
    cx.fillStyle=g; cx.fillRect(x-5,y+75,w+10,20);
  }

  /* ── Pizarrón con contactos + link portfolio ─────── */
  function board(x, y, w, h) {
    // Marco
    cx.fillStyle='#5c3a1e'; rRect(x-8,y-8,w+16,h+16,4);
    // Superficie
    cx.fillStyle='#2d5a4a'; cx.fillRect(x,y,w,h);
    const g=cx.createLinearGradient(x,y,x,y+h);
    g.addColorStop(0,'rgba(255,255,255,.08)'); g.addColorStop(1,'transparent');
    cx.fillStyle=g; cx.fillRect(x,y,w,h);
    // Tornillos
    cx.fillStyle='#3a2510';
    [[x+6,y+6],[x+w-6,y+6],[x+6,y+h-6],[x+w-6,y+h-6]].forEach(([bx,by])=>{
      cx.beginPath(); cx.arc(bx,by,4,0,Math.PI*2); cx.fill();
    });

    cx.textAlign = 'center';

    // Nombre
    cx.fillStyle = 'rgba(255,255,220,.92)';
    cx.font = `900 ${Math.max(8, w * .1)}px Nunito,sans-serif`;
    cx.fillText('Débora', x + w/2, y + h * .12);

    // Separador
    cx.strokeStyle = 'rgba(255,255,255,.22)'; cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(x + w*.1, y + h * .17);
    cx.lineTo(x + w*.9, y + h * .17);
    cx.stroke();

    const fs = Math.max(6, w * .078);
    cx.fillStyle = 'rgba(255,255,220,.68)';
    cx.font = `${fs}px Nunito,sans-serif`;

    // GitHub
    cx.fillText('⌨ DebSkar', x + w/2, y + h * .28);
    // Instagram
    cx.fillText('📷 debskar_', x + w/2, y + h * .40);
    // Email
    cx.fillText('✉ debora.soto', x + w/2, y + h * .52);
    cx.fillText('@mail.udp.cl', x + w/2, y + h * .62);

    // Separador antes del link
    cx.strokeStyle = 'rgba(255,255,255,.18)'; cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(x + w*.15, y + h * .68);
    cx.lineTo(x + w*.85, y + h * .68);
    cx.stroke();

    // Link del repositorio del portfolio
    cx.fillStyle = 'rgba(100,220,210,.82)';
    cx.font = `bold ${Math.max(5.5, w * .07)}px Nunito,sans-serif`;
    cx.fillText('🔗 portafolio', x + w/2, y + h * .78);
    cx.fillText('DebSkar/Portafolio', x + w/2, y + h * .88);

    // Subrayado del link
    const linkY = y + h * .89;
    const linkW = w * .72;
    cx.strokeStyle = 'rgba(100,220,210,.55)'; cx.lineWidth = 0.8;
    cx.beginPath();
    cx.moveTo(x + w/2 - linkW/2, linkY);
    cx.lineTo(x + w/2 + linkW/2, linkY);
    cx.stroke();

    // Registrar área clickeable del link del portfolio
    linkHotspots.push({
      x: x + w/2 - linkW/2 - 4,
      y: y + h * .68,
      w: linkW + 8,
      h: h * .24,
      url: 'https://github.com/DebSkar/Portafolio'
    });
  }

  /* ── Cuadros con imagen real ─────────────────────── */
  function paintingFrame(x, y, w, h, img, id) {
    // Marco dorado
    cx.fillStyle = '#c8a000';
    rRect(x - 7, y - 7, w + 14, h + 14, 4);

    // Lienzo
    cx.fillStyle = '#f0e6d0';
    cx.fillRect(x, y, w, h);

    // Imagen (si cargó)
    if (img.complete && img.naturalWidth > 0) {
      cx.save();
      cx.beginPath();
      cx.rect(x, y, w, h);
      cx.clip();
      cx.drawImage(img, x, y, w, h);
      cx.restore();
    }

    // Registrar hotspot (sin label visible debajo del cuadro)
    paintingHotspots.push({ x, y, w, h, id,
      src: img.src,
      label: 'Acrílico sobre tela'
    });
  }

  function chair(x,fy) {
    cx.fillStyle='#4a3528'; rRect(x-30,fy-88,42,52,6);
    cx.fillStyle='#6b4c35'; rRect(x-36,fy-40,52,12,4);
    cx.fillStyle='#aaa'; cx.fillRect(x-4,fy-28,8,28);
    cx.strokeStyle='#888'; cx.lineWidth=4; cx.lineCap='round';
    for(let a=0;a<5;a++){
      const ang=(a/5)*Math.PI*2;
      cx.beginPath(); cx.moveTo(x,fy); cx.lineTo(x+Math.cos(ang)*22, fy+Math.sin(ang)*8); cx.stroke();
    }
    for(let a=0;a<5;a++){
      const ang=(a/5)*Math.PI*2;
      cx.fillStyle='#555';
      cx.beginPath(); cx.arc(x+Math.cos(ang)*22,fy+Math.sin(ang)*8,3,0,Math.PI*2); cx.fill();
    }
  }

  function rug(cx2,y,w,h) {
    const tw=w*.62, bw=w;
    cx.save(); cx.globalAlpha=.72;
    cx.beginPath();
    cx.moveTo(cx2-tw/2,y); cx.lineTo(cx2+tw/2,y);
    cx.lineTo(cx2+bw/2,y+h); cx.lineTo(cx2-bw/2,y+h);
    cx.closePath();
    const g=cx.createLinearGradient(cx2,y,cx2,y+h);
    g.addColorStop(0,'#c0392b'); g.addColorStop(.5,'#e74c3c'); g.addColorStop(1,'#c0392b');
    cx.fillStyle=g; cx.fill();
    cx.globalAlpha=.3; cx.strokeStyle='#ffe66d'; cx.lineWidth=2;
    const m=10;
    cx.beginPath();
    cx.moveTo(cx2-tw/2+m,y+m); cx.lineTo(cx2+tw/2-m,y+m);
    cx.lineTo(cx2+bw/2-m,y+h-m); cx.lineTo(cx2-bw/2+m,y+h-m);
    cx.closePath(); cx.stroke();
    cx.restore();
  }

  function lamp(x,fy) {
    cx.strokeStyle='#999'; cx.lineWidth=4; cx.lineCap='round';
    cx.beginPath(); cx.moveTo(x,fy); cx.lineTo(x,fy-105); cx.lineTo(x+28,fy-105); cx.stroke();
    cx.fillStyle='#ffe4a0';
    cx.beginPath(); cx.moveTo(x+13,fy-122); cx.lineTo(x+48,fy-105); cx.lineTo(x+8,fy-105); cx.closePath(); cx.fill();
    const g=cx.createRadialGradient(x+28,fy-95,5,x+28,fy-85,65);
    g.addColorStop(0,'rgba(255,230,100,.22)'); g.addColorStop(1,'transparent');
    cx.fillStyle=g; cx.beginPath(); cx.arc(x+28,fy-85,65,0,Math.PI*2); cx.fill();
  }

  function plant(x,fy) {
    cx.fillStyle='#c0712a';
    cx.beginPath(); cx.moveTo(x-13,fy); cx.lineTo(x+13,fy); cx.lineTo(x+9,fy-24); cx.lineTo(x-9,fy-24); cx.closePath(); cx.fill();
    cx.fillStyle='#5a2f0a'; cx.fillRect(x-9,fy-30,18,8);
    cx.fillStyle='#27ae60';
    [[0,-50],[-14,-64],[14,-64],[-7,-78],[7,-78]].forEach(([dx,dy])=>{
      cx.beginPath(); cx.ellipse(x+dx,fy+dy,10,16,dx*0.05,0,Math.PI*2); cx.fill();
    });
  }

  /* ══════════════════════════════════════════════════════
     DECORACIÓN
  ══════════════════════════════════════════════════════ */
  function decor() {
    stringLights();
    // Póster izquierdo  → eliminado el cuadro con {code}
  }

  function stringLights() {
    cx.strokeStyle='#8b6240'; cx.lineWidth=1.5;
    cx.beginPath(); cx.moveTo(0,22);
    for(let x=0;x<=W;x+=2){
      const sag=Math.sin((x/W)*Math.PI*4)*9+10;
      cx.lineTo(x,22+sag);
    }
    cx.stroke();
    const cols=['#ff6b6b','#ffe66d','#4ecdc4','#a29bfe','#fd79a8'];
    for(let i=0;i<22;i++){
      const t=i/22, x=t*W+(W/22)*.5;
      const sag=Math.sin(t*Math.PI*4)*9+10;
      cx.fillStyle=cols[i%cols.length];
      cx.beginPath(); cx.arc(x,22+sag+5,4,0,Math.PI*2); cx.fill();
      cx.fillStyle='rgba(255,255,255,.65)';
      cx.beginPath(); cx.arc(x-1,22+sag+4,1.5,0,Math.PI*2); cx.fill();
    }
  }

  /* ══════════════════════════════════════════════════════
     GLOW DE PROYECTOS
  ══════════════════════════════════════════════════════ */
  function projectGlows() {
    if(typeof PROJECTS==='undefined') return;
    PROJECTS.forEach(p=>{
      const x=W*p.pos.x, y=H*p.pos.y;
      const g=cx.createRadialGradient(x,y,0,x,y,38);
      g.addColorStop(0,p.color+'55'); g.addColorStop(1,'transparent');
      cx.fillStyle=g; cx.beginPath(); cx.arc(x,y,38,0,Math.PI*2); cx.fill();
    });
  }

  /* ══════════════════════════════════════════════════════
     CLICK EN CANVAS → abrir lightbox de cuadros
  ══════════════════════════════════════════════════════ */
  function onCanvasClick(e) {
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // ¿Click en el link del portfolio (pizarra)?
    for (const l of linkHotspots) {
      if (mx >= l.x && mx <= l.x + l.w &&
          my >= l.y && my <= l.y + l.h) {
        window.open(l.url, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    // ¿Click en un cuadro?
    for (const p of paintingHotspots) {
      if (mx >= p.x - 10 && mx <= p.x + p.w + 10 &&
          my >= p.y - 10 && my <= p.y + p.h + 10) {
        openPaintingLightbox(p.src, p.label, p.id);
        return;
      }
    }
  }

  function openPaintingLightbox(src, label, id) {
    // Reutilizar el lightbox existente con caption
    const lb  = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    let cap = document.getElementById('lightbox-caption');
    if (!cap) {
      cap = document.createElement('div');
      cap.id = 'lightbox-caption';
      lb.appendChild(cap);
    }
    cap.textContent = (id === 'maki' ? 'Maki · ' : 'Obey? · ') + label;

    img.style.animation = 'none';
    img.src = src;
    lb.classList.remove('hidden');
    requestAnimationFrame(() => { img.style.animation = ''; });
  }

  /* ══════════════════════════════════════════════════════
     GATA CÁLICA ANIMADA
  ══════════════════════════════════════════════════════ */
  function cat() {
    const t  = Date.now()/1000;
    const catX = W*.44;
    const catY = H*.695;
    const s  = Math.min(W,H)*.052;

    cx.save();

    // Cola (oscila)
    const sway=Math.sin(t*1.4)*.4;
    cx.strokeStyle='#e8905a'; cx.lineWidth=s*.22; cx.lineCap='round';
    cx.beginPath();
    cx.moveTo(catX-s*.35, catY-s*.15);
    cx.quadraticCurveTo(
      catX-s*1.2+Math.sin(t*1.4)*s*.28, catY-s*.8,
      catX-s*.9+sway*s, catY-s*1.55
    );
    cx.stroke();
    cx.strokeStyle='#f5f4f0'; cx.lineWidth=s*.17;
    cx.beginPath();
    cx.moveTo(catX-s*.9+sway*s-s*.05, catY-s*1.45);
    cx.lineTo(catX-s*.9+sway*s, catY-s*1.6);
    cx.stroke();

    cx.fillStyle='#e8905a';
    cx.beginPath(); cx.ellipse(catX,catY-s*.38,s*.54,s*.68,0,0,Math.PI*2); cx.fill();

    cx.fillStyle='#faf4ee';
    cx.beginPath(); cx.ellipse(catX+s*.07,catY-s*.18,s*.27,s*.44,.1,0,Math.PI*2); cx.fill();

    cx.fillStyle='#2a1a0a'; cx.globalAlpha=.72;
    cx.beginPath(); cx.ellipse(catX-s*.3,catY-s*.68,s*.21,s*.17,-.5,0,Math.PI*2); cx.fill();
    cx.beginPath(); cx.ellipse(catX+s*.24,catY-s*.48,s*.15,s*.13,.4,0,Math.PI*2); cx.fill();
    cx.globalAlpha=1;

    cx.fillStyle='#e8905a';
    cx.beginPath(); cx.ellipse(catX-s*.22,catY+s*.28,s*.14,s*.1,0,0,Math.PI*2); cx.fill();
    cx.fillStyle='#faf4ee';
    cx.beginPath(); cx.ellipse(catX+s*.2,catY+s*.28,s*.14,s*.1,0,0,Math.PI*2); cx.fill();

    const bob=Math.sin(t*.75)*s*.025;
    const hx=catX+s*.04, hy=catY-s*1.08+bob, hr=s*.41;

    cx.fillStyle='#e8905a';
    cx.beginPath(); cx.arc(hx,hy,hr,0,Math.PI*2); cx.fill();

    cx.fillStyle='#faf4ee';
    cx.beginPath(); cx.ellipse(hx+s*.04,hy+s*.07,hr*.44,hr*.49,0,0,Math.PI*2); cx.fill();

    cx.fillStyle='#2a1a0a'; cx.globalAlpha=.68;
    cx.beginPath(); cx.ellipse(hx-hr*.34,hy-hr*.19,hr*.27,hr*.21,-.3,0,Math.PI*2); cx.fill();
    cx.globalAlpha=1;

    cx.fillStyle='#e8905a';
    tri(hx-hr*.6,hy-hr*.6, hx-hr*.85,hy-hr*1.1, hx-hr*.24,hy-hr*.78);
    cx.fillStyle='#f5b8b8';
    tri(hx-hr*.57,hy-hr*.64, hx-hr*.74,hy-hr*1.0, hx-hr*.29,hy-hr*.77);
    cx.fillStyle='#2a1a0a';
    tri(hx+hr*.5,hy-hr*.64, hx+hr*.77,hy-hr*1.1, hx+hr*.2,hy-hr*.77);
    cx.fillStyle='#f5b8b8';
    tri(hx+hr*.5,hy-hr*.67, hx+hr*.67,hy-hr*1.0, hx+hr*.26,hy-hr*.77);

    const blink=(Math.sin(t*.3)>.93)?.07:1;
    cx.fillStyle='#1a7a40';
    cx.beginPath(); cx.ellipse(hx-hr*.28,hy-hr*.04,hr*.14,hr*.17*blink,0,0,Math.PI*2); cx.fill();
    cx.beginPath(); cx.ellipse(hx+hr*.3, hy-hr*.04,hr*.14,hr*.17*blink,0,0,Math.PI*2); cx.fill();
    cx.fillStyle='#080304';
    cx.beginPath(); cx.ellipse(hx-hr*.28,hy-hr*.04,hr*.055,hr*.14*blink,0,0,Math.PI*2); cx.fill();
    cx.beginPath(); cx.ellipse(hx+hr*.3, hy-hr*.04,hr*.055,hr*.14*blink,0,0,Math.PI*2); cx.fill();
    cx.fillStyle='rgba(255,255,255,.88)';
    cx.beginPath(); cx.arc(hx-hr*.24,hy-hr*.09,hr*.04,0,Math.PI*2); cx.fill();
    cx.beginPath(); cx.arc(hx+hr*.34,hy-hr*.09,hr*.04,0,Math.PI*2); cx.fill();

    cx.fillStyle='#e08080';
    cx.beginPath(); cx.arc(hx+s*.02,hy+hr*.14,hr*.1,0,Math.PI*2); cx.fill();

    cx.strokeStyle='rgba(50,25,5,.35)'; cx.lineWidth=.9;
    [[-.88,.07],[-.88,.17],[-.88,.27],  [.9,.07],[.9,.17],[.9,.27]].forEach(([dx,dy])=>{
      cx.beginPath(); cx.moveTo(hx+s*.02,hy+hr*.14); cx.lineTo(hx+hr*dx,hy+hr*dy); cx.stroke();
    });

    cx.restore();
  }

  /* ══════════════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════════════ */
  function rRect(x,y,w,h,r){
    cx.beginPath(); cx.roundRect(x,y,w,h,r); cx.fill();
  }
  function ellipse(x,y,rx,ry){
    cx.beginPath(); cx.ellipse(x,y,rx,ry,0,0,Math.PI*2); cx.fill();
  }
  function tri(x1,y1,x2,y2,x3,y3){
    cx.beginPath(); cx.moveTo(x1,y1); cx.lineTo(x2,y2); cx.lineTo(x3,y3); cx.closePath(); cx.fill();
  }
  function line(x1,y1,x2,y2){
    cx.beginPath(); cx.moveTo(x1,y1); cx.lineTo(x2,y2); cx.stroke();
  }

  function getDims() { return { W, H }; }

  return { init, resize, drawStatic, startCatLoop, stopCatLoop, getDims };
})();
