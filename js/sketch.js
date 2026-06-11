// ─── Estado global ─────────────────────────────────────────────────────────
let molecules = [];
let reactionFlashes = []; // { x, y, age, maxAge }
let totalReactions = 0;
let frameCount60 = 0;        // frames totales desde reset
let reactionTimestamps = [];  // frames en que ocurrió cada reacción
let rateHistory = [];         // reacciones/s muestreados cada segundo
let currentRate = 0;

// ─── Geometría del canvas ──────────────────────────────────────────────────
let camX, camY, camW, camH;   // cámara de reacción
let grX, grY, grW, grH;       // gráfico de tasa
const PAD = 16;

// ─── Parámetros de la simulación ──────────────────────────────────────────
// T_IDX: valor del slider 1–10, usado como índice de temperatura
// sigma de velocidades escala con sqrt(T_IDX)
const BASE_SIGMA  = 2.0;      // px/frame @ T_IDX = 1
const EA_NO_CAT   = 5.8;      // umbral de velocidad relativa sin catalizador
const EA_CAT      = 2.6;      // umbral con catalizador
const RATE_WINDOW = 120;      // frames para rolling rate (2 s a 60 fps)

let themeMode = "dark";

// ─── Helpers ──────────────────────────────────────────────────────────────
function gaussianRandom() {
  let u, v;
  do { u = Math.random(); } while (u === 0);
  do { v = Math.random(); } while (v === 0);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function getTIdx() {
  let s = document.getElementById("ui-temp-slider");
  return s ? parseInt(s.value) : 4;
}

function hasCatalyst() {
  let btn = document.getElementById("ui-btn-catalyst");
  return btn ? btn.classList.contains("is-on") : false;
}

function getSigma() { return BASE_SIGMA * Math.sqrt(getTIdx()); }
function getEa()    { return hasCatalyst() ? EA_CAT : EA_NO_CAT; }

function randomVel() {
  let s = getSigma();
  let vx = s * gaussianRandom();
  let vy = s * gaussianRandom();
  let spd = Math.sqrt(vx*vx + vy*vy);
  let lo = s * 0.3, hi = s * 2.8;
  if (spd < lo) { vx *= lo/spd; vy *= lo/spd; spd = lo; }
  if (spd > hi) { vx *= hi/spd; vy *= hi/spd; }
  return { vx, vy };
}

// ─── Setup / resize ───────────────────────────────────────────────────────
function setup() {
  let holder = document.getElementById("canvas-holder");
  let w = holder ? holder.offsetWidth  : 900;
  let h = holder ? holder.offsetHeight : 680;
  createCanvas(w, h).parent("canvas-holder");
  computeLayout();
  setupEventListeners();
  syncTheme();
  initSim();
}

function windowResized() {
  let holder = document.getElementById("canvas-holder");
  if (!holder) return;
  resizeCanvas(holder.offsetWidth, holder.offsetHeight);
  computeLayout();
  for (let m of molecules) {
    m.pos.x = constrain(m.pos.x, camX + m.radius, camX + camW - m.radius);
    m.pos.y = constrain(m.pos.y, camY + m.radius, camY + camH - m.radius);
  }
}

function computeLayout() {
  grH = max(85, Math.floor(height * 0.20));
  camX = PAD;  camY = PAD;
  camW = width - 2*PAD;
  camH = height - grH - 3*PAD;
  grX = PAD;   grY = camY + camH + PAD;
  grW = camW;
}

// ─── Inicialización ────────────────────────────────────────────────────────
function initSim() {
  molecules = []; reactionFlashes = [];
  totalReactions = 0; frameCount60 = 0;
  reactionTimestamps = []; rateHistory = []; currentRate = 0;

  let nA = parseInt(document.getElementById("ui-na-slider")?.value || 20);
  let nB = parseInt(document.getElementById("ui-nb-slider")?.value || 20);
  for (let i = 0; i < nA; i++) spawnMolecule('A');
  for (let i = 0; i < nB; i++) spawnMolecule('B');
  updateCounters();
}

function spawnMolecule(type, px, py) {
  let r = type === 'C' ? 9 : 7;
  if (px === undefined) {
    let ok = false, tries = 0;
    while (!ok && tries < 40) {
      px = random(camX + r + 2, camX + camW - r - 2);
      py = random(camY + r + 2, camY + camH - r - 2);
      ok = true;
      for (let m of molecules) {
        let dx = px - m.pos.x, dy = py - m.pos.y;
        if (Math.sqrt(dx*dx + dy*dy) < r + m.radius + 3) { ok = false; break; }
      }
      tries++;
    }
  }
  let { vx, vy } = randomVel();
  molecules.push(new Molecule(px, py, vx, vy, type));
}

// ─── Bucle principal ───────────────────────────────────────────────────────
function draw() {
  background(themeMode === "light" ? [215, 222, 232] :
             themeMode === "high-contrast" ? [0, 0, 0] : [11, 12, 16]);
  frameCount60++;

  // Rescale speeds if temperature changed (smooth transition)
  rescaleSpeedsIfNeeded();

  // Physics
  for (let m of molecules) {
    m.update();
    m.bounceWalls(camX, camY, camX + camW, camY + camH);
  }
  processCollisionsAndReactions();

  // Rate sample each second (60 frames)
  if (frameCount60 % 60 === 0) {
    let cutoff = frameCount60 - 60;
    reactionTimestamps = reactionTimestamps.filter(f => f > cutoff);
    currentRate = reactionTimestamps.length;
    rateHistory.push(currentRate);
    if (rateHistory.length > 90) rateHistory.shift();
  }

  // Draw scene
  drawChamber();
  drawMBInset();

  // Flashes
  for (let i = reactionFlashes.length - 1; i >= 0; i--) {
    let f = reactionFlashes[i];
    f.age++;
    if (f.age > f.maxAge) { reactionFlashes.splice(i, 1); continue; }
    let t = f.age / f.maxAge;
    let a = map(t, 0, 1, 220, 0);
    let rr = map(t, 0, 1, 14, 30);
    noStroke();
    fill(255, 240, 80, a);
    ellipse(f.x, f.y, rr * 2);
  }

  for (let m of molecules) m.display(themeMode);
  drawStatsOverlay();
  drawRateGraph();
  updateCounters();
}

// ─── Física ────────────────────────────────────────────────────────────────
let prevTIdx = -1;

function rescaleSpeedsIfNeeded() {
  let t = getTIdx();
  if (prevTIdx > 0 && t !== prevTIdx) {
    let factor = Math.sqrt(t / prevTIdx);
    for (let m of molecules) {
      m.vel.x *= factor;
      m.vel.y *= factor;
    }
  }
  prevTIdx = t;
}

function processCollisionsAndReactions() {
  let reactPairs = []; // [i, j] parejas que reaccionan
  let reacted = new Set();

  for (let i = 0; i < molecules.length; i++) {
    for (let j = i + 1; j < molecules.length; j++) {
      let a = molecules[i], b = molecules[j];
      let dx = b.pos.x - a.pos.x, dy = b.pos.y - a.pos.y;
      let distSq = dx*dx + dy*dy;
      let minD = a.radius + b.radius;
      if (distSq >= minD * minD || distSq <= 0) continue;

      let dist = Math.sqrt(distSq);
      let nx = dx/dist, ny = dy/dist;

      // Separar solapamiento
      let ov = (minD - dist) * 0.5;
      a.pos.x -= nx * ov; a.pos.y -= ny * ov;
      b.pos.x += nx * ov; b.pos.y += ny * ov;

      // ¿Colisión reactiva A–B?
      let isReactive = (a.type === 'A' && b.type === 'B') ||
                       (a.type === 'B' && b.type === 'A');
      if (isReactive && !reacted.has(i) && !reacted.has(j)) {
        let dvx = a.vel.x - b.vel.x, dvy = a.vel.y - b.vel.y;
        let relSpd = Math.sqrt(dvx*dvx + dvy*dvy);
        if (relSpd >= getEa()) {
          reactPairs.push([i, j]);
          reacted.add(i); reacted.add(j);
          continue;
        }
      }

      // Colisión elástica (masas iguales)
      let dvx = a.vel.x - b.vel.x, dvy = a.vel.y - b.vel.y;
      let dot = dvx * nx + dvy * ny;
      if (dot > 0) {
        a.vel.x -= dot * nx; a.vel.y -= dot * ny;
        b.vel.x += dot * nx; b.vel.y += dot * ny;
      }
    }
  }

  // Procesar reacciones (en orden inverso para mantener índices)
  let sorted = [...reacted].sort((a, b) => b - a);
  let newC = [];
  for (let [i, j] of reactPairs) {
    let ma = molecules[i], mb = molecules[j];
    let cx = (ma.pos.x + mb.pos.x) * 0.5;
    let cy = (ma.pos.y + mb.pos.y) * 0.5;
    let pvx = (ma.vel.x + mb.vel.x) * 0.5;
    let pvy = (ma.vel.y + mb.vel.y) * 0.5;
    newC.push({ x: cx, y: cy, vx: pvx, vy: pvy });
    reactionFlashes.push({ x: cx, y: cy, age: 0, maxAge: 22 });
    totalReactions++;
    reactionTimestamps.push(frameCount60);
  }
  for (let idx of sorted) molecules.splice(idx, 1);
  for (let c of newC) {
    let m = new Molecule(c.x, c.y, c.vx, c.vy, 'C');
    m.flash = 18;
    molecules.push(m);
  }
}

// ─── Dibujo ────────────────────────────────────────────────────────────────
function drawChamber() {
  let dark = themeMode !== "light";
  let hc   = themeMode === "high-contrast";

  // Fondo de la cámara
  noStroke();
  fill(dark ? (hc ? color(0,0,0) : color(17, 20, 32)) : color(195, 204, 216));
  rect(camX, camY, camW, camH, 10);

  // Marco
  noFill();
  stroke(dark ? (hc ? color(255,255,0) : color(55, 70, 110)) : color(100, 120, 155));
  strokeWeight(hc ? 2 : 1.5);
  rect(camX, camY, camW, camH, 10);

  // Etiqueta superior izquierda
  noStroke();
  fill(dark ? color(80, 95, 130) : color(100, 120, 150));
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  textSize(10);
  text("CÁMARA DE REACCIÓN", camX + 10, camY + 7);
}

// Curva de Maxwell-Boltzmann (inset esquina superior derecha de la cámara)
function drawMBInset() {
  let dark = themeMode !== "light";
  let hc   = themeMode === "high-contrast";
  let bW = 140, bH = 75;
  let bX = camX + camW - bW - 12, bY = camY + 10;

  // Fondo
  noStroke();
  fill(dark ? (hc ? color(20,20,20,230) : color(12, 15, 26, 210)) : color(175, 185, 200, 210));
  rect(bX, bY, bW, bH, 6);

  let padL = 8, padR = 6, padT = 18, padB = 12;
  let aX = bX + padL, aY = bY + padT;
  let aW = bW - padL - padR, aH = bH - padT - padB;

  // Título
  noStroke();
  fill(dark ? color(100, 120, 160) : color(70, 90, 120));
  textAlign(LEFT, TOP);
  textSize(8);
  text("Distribución de velocidades", bX + 5, bY + 5);

  let sigma = getSigma();
  let ea    = getEa();
  let vMax  = sigma * 4.5;
  let N     = 120;

  // Calcular máximo de la distribución para normalizar
  let fMax = 0;
  for (let k = 0; k <= N; k++) {
    let v = (k / N) * vMax;
    let f = (v / (sigma*sigma)) * Math.exp(-(v*v) / (2*sigma*sigma));
    if (f > fMax) fMax = f;
  }
  if (fMax === 0) return;

  // Área sombreada: velocidades > Ea (moléculas reactivas)
  beginShape();
  noStroke();
  fill(hc ? color(255,255,0,80) : color(52,199,130,70));
  let eaPixel = map(ea, 0, vMax, aX, aX + aW);
  vertex(max(eaPixel, aX), aY + aH);
  for (let k = 0; k <= N; k++) {
    let v = (k / N) * vMax;
    if (v < ea) continue;
    let f = (v / (sigma*sigma)) * Math.exp(-(v*v) / (2*sigma*sigma));
    let px = map(v, 0, vMax, aX, aX + aW);
    let py = map(f, 0, fMax, aY + aH, aY);
    vertex(px, py);
  }
  vertex(aX + aW, aY + aH);
  endShape(CLOSE);

  // Curva principal
  noFill();
  stroke(dark ? (hc ? color(255,255,0) : color(120,160,255)) : color(60, 100, 200));
  strokeWeight(1.5);
  beginShape();
  for (let k = 0; k <= N; k++) {
    let v = (k / N) * vMax;
    let f = (v / (sigma*sigma)) * Math.exp(-(v*v) / (2*sigma*sigma));
    let px = map(v, 0, vMax, aX, aX + aW);
    let py = map(f, 0, fMax, aY + aH, aY);
    vertex(px, py);
  }
  endShape();

  // Línea de Ea
  let eaX = constrain(map(ea, 0, vMax, aX, aX + aW), aX, aX + aW);
  stroke(hc ? color(255,255,0) : color(220,80,80));
  strokeWeight(1.2);
  drawingContext.save();
  drawingContext.setLineDash([3, 3]);
  line(eaX, aY, eaX, aY + aH);
  drawingContext.restore();

  // Eje X base
  stroke(dark ? color(60,70,100) : color(120,140,170));
  strokeWeight(0.8);
  noFill();
  line(aX, aY + aH, aX + aW, aY + aH);

  // Etiquetas
  noStroke();
  fill(dark ? color(100,115,155) : color(70,90,120));
  textAlign(LEFT,  BOTTOM); textSize(7); text("0", aX, aY + aH - 1);
  textAlign(RIGHT, BOTTOM);             text("v", aX + aW, aY + aH - 1);
  fill(hc ? color(255,255,0) : color(220,80,80));
  textAlign(CENTER, BOTTOM); textSize(7);
  text("Ea", eaX, aY - 1);
}

function drawStatsOverlay() {
  let dark = themeMode !== "light";
  let hc   = themeMode === "high-contrast";

  let nA = molecules.filter(m => m.type === 'A').length;
  let nB = molecules.filter(m => m.type === 'B').length;
  let nC = molecules.filter(m => m.type === 'C').length;

  let items = [
    { label: "A", count: nA, c: color(79,142,247) },
    { label: "B", count: nB, c: color(247,130, 60) },
    { label: "C (producto)", count: nC, c: color(52,199,130) },
  ];

  let bX = camX + 10, bY = camY + camH - 14 - items.length * 18 - 6;
  let bW = 150, bH = items.length * 18 + 10;

  noStroke();
  fill(dark ? (hc ? color(20,20,20,210) : color(12,15,26,200)) : color(175,185,200,200));
  rect(bX, bY, bW, bH, 5);

  textSize(11); textStyle(NORMAL);
  for (let i = 0; i < items.length; i++) {
    let it = items[i];
    let y = bY + 8 + i * 18;
    noStroke();
    fill(it.c); ellipse(bX + 10, y + 5, 9, 9);
    fill(it.count === 0 ? (dark ? color(80,90,110) : color(130,140,160)) :
         (dark ? color(200,210,230) : color(20,30,50)));
    textAlign(LEFT, TOP);
    text(it.label + ": " + it.count, bX + 20, y);
  }

  // Reacciones totales + tasa
  let rateStr = rateHistory.length > 0 ? currentRate.toFixed(0) + " /s" : "—";
  noStroke();
  fill(dark ? color(100,115,155) : color(70,90,120));
  textAlign(LEFT, TOP); textSize(10);
  text("Reacciones totales: " + totalReactions, camX + 10, camY + camH - 14);

  fill(hc ? color(255,255,0) : (dark ? color(120,200,160) : color(20,120,70)));
  textAlign(RIGHT, TOP);
  text("Tasa: " + rateStr, camX + camW - 10, camY + camH - 14);
}

// Gráfico de tasa de reacción (reacciones/s vs tiempo)
function drawRateGraph() {
  let dark = themeMode !== "light";
  let hc   = themeMode === "high-contrast";

  // Fondo
  noStroke();
  fill(dark ? (hc ? color(0,0,0) : color(14,17,28)) : color(195,204,216));
  rect(grX, grY, grW, grH, 8);
  noFill();
  stroke(dark ? (hc ? color(255,255,0) : color(50,60,95)) : color(100,120,155));
  strokeWeight(hc ? 1.5 : 1);
  rect(grX, grY, grW, grH, 8);

  let padL = 36, padR = 12, padT = 14, padB = 18;
  let aX = grX + padL, aY = grY + padT;
  let aW = grW - padL - padR, aH = grH - padT - padB;

  // Etiqueta
  noStroke();
  fill(dark ? color(80,95,130) : color(90,110,140));
  textAlign(LEFT, TOP); textStyle(NORMAL); textSize(9);
  text("VELOCIDAD DE REACCIÓN (reacciones/s)", grX + padL, grY + 4);

  if (rateHistory.length < 2) return;

  let maxRate = max(...rateHistory, 1);

  // Líneas de guía horizontales
  stroke(dark ? color(35,42,65) : color(160,175,195));
  strokeWeight(0.7);
  for (let g = 1; g <= 4; g++) {
    let gy = map(g * maxRate / 4, 0, maxRate, aY + aH, aY);
    line(aX, gy, aX + aW, gy);
  }

  // Etiqueta eje Y
  noStroke();
  fill(dark ? color(80,95,130) : color(90,110,140));
  textAlign(RIGHT, CENTER); textSize(8);
  text(maxRate, aX - 3, aY);
  text("0", aX - 3, aY + aH);

  // Etiquetas eje X
  textAlign(LEFT,  BOTTOM); text("–" + rateHistory.length + "s", aX, aY + aH + 11);
  textAlign(RIGHT, BOTTOM); text("ahora", aX + aW, aY + aH + 11);

  // Relleno bajo la curva
  let histColor = hc ? color(255,255,0) : (dark ? color(52,199,130) : color(30,140,90));
  noStroke();
  fill(red(histColor), green(histColor), blue(histColor), 45);
  beginShape();
  vertex(aX, aY + aH);
  for (let i = 0; i < rateHistory.length; i++) {
    let px = map(i, 0, rateHistory.length - 1, aX, aX + aW);
    let py = map(rateHistory[i], 0, maxRate, aY + aH, aY);
    vertex(px, py);
  }
  vertex(aX + aW, aY + aH);
  endShape(CLOSE);

  // Línea de la curva
  stroke(histColor);
  strokeWeight(hc ? 2 : 1.5);
  noFill();
  beginShape();
  for (let i = 0; i < rateHistory.length; i++) {
    let px = map(i, 0, rateHistory.length - 1, aX, aX + aW);
    let py = map(rateHistory[i], 0, maxRate, aY + aH, aY);
    vertex(px, py);
  }
  endShape();

  // Punto actual (último valor)
  let lx = aX + aW;
  let ly = map(currentRate, 0, maxRate, aY + aH, aY);
  noStroke();
  fill(histColor);
  ellipse(lx, ly, 6, 6);
}

// ─── Contadores DOM ────────────────────────────────────────────────────────
function updateCounters() {
  let nA = molecules.filter(m => m.type === 'A').length;
  let nB = molecules.filter(m => m.type === 'B').length;
  let nC = molecules.filter(m => m.type === 'C').length;
  let setTxt = (id, v) => { let el = document.getElementById(id); if (el) el.innerText = v; };
  setTxt("count-a", nA);
  setTxt("count-b", nB);
  setTxt("count-c", nC);
  setTxt("count-total", totalReactions);
  setTxt("count-rate", rateHistory.length > 0 ? currentRate + " /s" : "—");
}

// ─── Event listeners ───────────────────────────────────────────────────────
function setupEventListeners() {
  document.getElementById("ui-temp-slider").addEventListener("input", (e) => {
    document.getElementById("temp-val").innerText = tempLabel(parseInt(e.target.value));
  });
  document.getElementById("ui-na-slider").addEventListener("input", (e) => {
    document.getElementById("na-val").innerText = e.target.value;
  });
  document.getElementById("ui-nb-slider").addEventListener("input", (e) => {
    document.getElementById("nb-val").innerText = e.target.value;
  });

  document.getElementById("ui-btn-catalyst").addEventListener("click", () => {
    let btn = document.getElementById("ui-btn-catalyst");
    let isOn = btn.classList.contains("is-on");
    btn.classList.toggle("is-on",  !isOn);
    btn.classList.toggle("is-off",  isOn);
  });

  document.getElementById("ui-btn-reset").addEventListener("click", () => {
    initSim();
  });

  // Info collapsible
  let infoCard = document.getElementById("ui-panel-info");
  document.getElementById("ui-info-trigger").addEventListener("click", () => {
    infoCard.classList.toggle("is-expanded");
  });

  // Tema
  let themeSelect = document.getElementById("ui-theme-select");
  if (themeSelect) {
    let root = document.documentElement;
    let saved = root.getAttribute("data-theme") || "dark";
    themeSelect.value = saved;
    themeMode = saved;
    themeSelect.addEventListener("change", (e) => {
      themeMode = e.target.value;
      root.setAttribute("data-theme", e.target.value);
      try { localStorage.setItem("sim-ui-theme-vr", e.target.value); } catch (_) {}
    });
  }

  // Engranaje
  let gear = document.getElementById("ui-dropdown-trigger");
  let drop = document.getElementById("ui-dropdown-container");
  if (gear && drop) {
    gear.addEventListener("click", (e) => { e.stopPropagation(); drop.classList.toggle("is-active"); });
    drop.querySelector(".dropdown-card")?.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", () => drop.classList.remove("is-active"));
  }

  // Valor inicial de temperatura
  let t0 = parseInt(document.getElementById("ui-temp-slider")?.value || 4);
  document.getElementById("temp-val").innerText = tempLabel(t0);
  prevTIdx = t0;
}

function syncTheme() {
  try {
    let saved = localStorage.getItem("sim-ui-theme-vr");
    if (saved) {
      themeMode = saved;
      document.documentElement.setAttribute("data-theme", saved);
      let sel = document.getElementById("ui-theme-select");
      if (sel) sel.value = saved;
    }
  } catch (_) {}
}

function tempLabel(idx) {
  const labels = ["","Muy baja","Baja","Moderada","Normal","Alta","Muy alta","Elevada","Intensa","Extrema","Máxima"];
  return (labels[idx] || idx) + " (" + idx + ")";
}
