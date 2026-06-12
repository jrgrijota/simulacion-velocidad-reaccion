// ─── Estado global ─────────────────────────────────────────────────────────
let worlds = [];               // 1 mundo (single) o 2 (compare: [izquierda, derecha])
let mode = "single";           // "single" | "compare" | "collision"
let compareVar = "catalyst";   // "energy" | "count" | "catalyst"
let themeMode = "dark";
let paused = false;            // pausa la física (sigue dibujando)
let compareDone = false;       // una cámara ha agotado su reactivo limitante
let collisionMode = null;      // instancia de CollisionMode cuando mode === "collision"

const ACCENT_SINGLE = [120, 200, 160];
const ACCENT_LEFT   = [56, 189, 248];   // cian
const ACCENT_RIGHT  = [244, 114, 182];  // rosa

// Región de las cámaras + gráfico inferior
let regionX, regionY, regionW, regionH;
let grX, grY, grW, grH;
const PAD = 16;
const GAP = 14;

// Presets del par Izquierda/Derecha según la variable comparada
const COMPARE_PRESETS = {
  energy:   { label: "Temperatura",      min: 1, max: 10, left: 2, right: 8 },
  count:    { label: "Moléculas (A=B)",  min: 4, max: 30, left: 8, right: 24 },
  catalyst: { label: "Catalizadores",    min: 0, max: 6,  left: 0, right: 4 },
};

// ─── Helpers DOM ────────────────────────────────────────────────────────────
function val(id) { let e = document.getElementById(id); return e ? e.value : 0; }
function intVal(id) { return parseInt(val(id)); }

// ─── Setup / resize ────────────────────────────────────────────────────────
function setup() {
  let holder = document.getElementById("canvas-holder");
  let w = holder ? holder.offsetWidth  : 1000;
  let h = holder ? holder.offsetHeight : 680;
  createCanvas(w, h).parent("canvas-holder");
  computeLayout();
  setupEventListeners();
  syncTheme();
  configureComparePair();
  updateUIVisibility();
  rebuildWorlds();
}

function windowResized() {
  let holder = document.getElementById("canvas-holder");
  if (!holder) return;
  resizeCanvas(holder.offsetWidth, holder.offsetHeight);
  computeLayout();
  layoutWorlds();
}

function computeLayout() {
  if (mode === "collision") {
    regionX = PAD; regionY = PAD;
    regionW = width - 2*PAD;
    regionH = height - 2*PAD;
    grH = 0; grX = 0; grY = 0; grW = 0;
    return;
  }
  grH = max(85, Math.floor(height * 0.20));
  regionX = PAD; regionY = PAD;
  regionW = width - 2*PAD;
  regionH = height - grH - 3*PAD;
  grX = PAD; grY = regionY + regionH + PAD; grW = regionW;
}

function layoutWorlds() {
  if (worlds.length === 1) {
    worlds[0].setBounds(regionX, regionY, regionW, regionH);
  } else if (worlds.length === 2) {
    let w = (regionW - GAP) / 2;
    worlds[0].setBounds(regionX, regionY, w, regionH);
    worlds[1].setBounds(regionX + w + GAP, regionY, w, regionH);
  }
}

// ─── Construcción de mundos ─────────────────────────────────────────────────
function readConfig() {
  let temp = intVal("ui-temp-slider");
  let nA = intVal("ui-na-slider");
  let nB = intVal("ui-nb-slider");
  let nK = intVal("ui-cat-slider");

  if (mode === "single") {
    return [{ tIdx: temp, nA, nB, nK, title: "CÁMARA DE REACCIÓN", accent: ACCENT_SINGLE }];
  }

  let L = intVal("ui-cmp-left");
  let R = intVal("ui-cmp-right");
  let base = { tIdx: temp, nA, nB, nK };

  function mk(side, v) {
    let s = Object.assign({}, base);
    let title = "";
    if (compareVar === "energy")      { s.tIdx = v; title = "T = " + v; }
    else if (compareVar === "count")  { s.nA = v; s.nB = v; title = v + " A + " + v + " B"; }
    else                              { s.nK = v; title = (v === 0) ? "Sin catalizador"
                                                       : (v + " catalizador" + (v > 1 ? "es" : "")); }
    s.title = (side === "L" ? "◀ " : "▶ ") + title;
    s.accent = (side === "L") ? ACCENT_LEFT : ACCENT_RIGHT;
    return s;
  }
  return [mk("L", L), mk("R", R)];
}

function rebuildWorlds() {
  computeLayout();
  if (mode === "collision") {
    worlds = [];
    if (!collisionMode) collisionMode = new CollisionMode();
    else collisionMode.reset();
    return;
  }
  let cfg = readConfig();
  worlds = cfg.map(spec => new World(spec));
  layoutWorlds();
  worlds.forEach(w => w.reset());
  compareDone = false;
  setPaused(false);
}

// ─── Bucle principal ────────────────────────────────────────────────────────
function draw() {
  background(themeMode === "light" ? [215, 222, 232] :
             themeMode === "high-contrast" ? [0, 0, 0] : [11, 12, 16]);

  if (mode === "collision") {
    if (collisionMode) {
      collisionMode.step();
      collisionMode.draw(regionX, regionY, regionW, regionH, themeMode);
    }
    return;
  }

  if (!paused) for (let w of worlds) w.step();

  // Comparación: al agotarse el reactivo limitante de una cámara, parar y mostrar %
  if (mode === "compare" && !compareDone && worlds.length === 2 &&
      worlds.some(w => w.isComplete())) {
    compareDone = true;
    setPaused(true);
  }

  for (let w of worlds) w.draw(themeMode);

  if (mode === "compare" && compareDone && paused) drawCompletionOverlay();

  drawRateGraph();
  updateCounters();
}

function mousePressed() {
  if (mode === "collision" && collisionMode) {
    collisionMode.mousePressed(mouseX, mouseY, regionX, regionY, regionW, regionH);
  }
}
function mouseDragged() {
  if (mode === "collision" && collisionMode) collisionMode.mouseDragged(mouseX, mouseY);
}
function mouseReleased() {
  if (mode === "collision" && collisionMode) collisionMode.mouseReleased();
}

// Muestra el porcentaje de conversión en grande en cada cámara
function drawCompletionOverlay() {
  let hc = themeMode === "high-contrast";
  for (let w of worlds) {
    let pct = w.progressPercent();

    // Atenuar la cámara para resaltar el dato
    noStroke();
    fill(themeMode === "light" ? color(228, 233, 240, 165) : color(8, 10, 16, 165));
    rect(w.camX, w.camY, w.camW, w.camH, 10);

    let ac = hc ? [255, 255, 0] : w.accent;
    fill(ac[0], ac[1], ac[2]);
    textAlign(CENTER, CENTER); textStyle(BOLD);
    let sz = constrain(min(w.camW, w.camH) * 0.32, 42, 150);
    textSize(sz);
    text(pct + "%", w.camX + w.camW / 2, w.camY + w.camH / 2 - sz * 0.12);

    textStyle(NORMAL);
    textSize(constrain(w.camW * 0.04, 11, 17));
    fill(themeMode === "light" ? color(40, 50, 70) : color(205, 214, 232));
    let sub = w.isComplete()
      ? "reactivo limitante agotado"
      : w.totalReactions + " de " + w.initLimiting + " reacciones";
    text(sub, w.camX + w.camW / 2, w.camY + w.camH / 2 + sz * 0.55);
  }
}

function setPaused(state) {
  paused = state;
  let btn = document.getElementById("ui-btn-playpause");
  if (btn) btn.innerText = paused ? "▶ Reanudar" : "⏸ Pausar";
}

// ─── Gráfico de tasa (superpone las curvas de todas las cámaras) ────────────
function drawRateGraph() {
  let dark = themeMode !== "light";
  let hc   = themeMode === "high-contrast";

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

  noStroke();
  fill(dark ? color(80,95,130) : color(90,110,140));
  textAlign(LEFT, TOP); textStyle(NORMAL); textSize(9);
  text("VELOCIDAD DE REACCIÓN (reacciones/s)", grX + padL, grY + 4);

  let maxLen = 0, maxRate = 1;
  for (let w of worlds) {
    maxLen = max(maxLen, w.rateHistory.length);
    if (w.rateHistory.length) maxRate = max(maxRate, max(...w.rateHistory));
  }
  if (maxLen < 2) return;

  // Guías horizontales
  stroke(dark ? color(35,42,65) : color(160,175,195));
  strokeWeight(0.7);
  for (let g = 1; g <= 4; g++) {
    let gy = map(g * maxRate / 4, 0, maxRate, aY + aH, aY);
    line(aX, gy, aX + aW, gy);
  }

  noStroke();
  fill(dark ? color(80,95,130) : color(90,110,140));
  textAlign(RIGHT, CENTER); textSize(8);
  text(maxRate, aX - 3, aY);
  text("0", aX - 3, aY + aH);
  textAlign(LEFT,  BOTTOM); text("–" + maxLen + "s", aX, aY + aH + 11);
  textAlign(RIGHT, BOTTOM); text("ahora", aX + aW, aY + aH + 11);

  // Curva de cada cámara
  for (let w of worlds) {
    let h = w.rateHistory;
    if (h.length < 2) continue;
    let ac = hc ? [255,255,0] : w.accent;
    let col = color(ac[0], ac[1], ac[2]);

    noStroke();
    fill(ac[0], ac[1], ac[2], 38);
    beginShape();
    vertex(aX, aY + aH);
    for (let i = 0; i < h.length; i++) {
      vertex(map(i, 0, maxLen - 1, aX, aX + aW), map(h[i], 0, maxRate, aY + aH, aY));
    }
    vertex(map(h.length - 1, 0, maxLen - 1, aX, aX + aW), aY + aH);
    endShape(CLOSE);

    stroke(col); strokeWeight(hc ? 2 : 1.7); noFill();
    beginShape();
    for (let i = 0; i < h.length; i++) {
      vertex(map(i, 0, maxLen - 1, aX, aX + aW), map(h[i], 0, maxRate, aY + aH, aY));
    }
    endShape();

    let lx = map(h.length - 1, 0, maxLen - 1, aX, aX + aW);
    let ly = map(w.currentRate, 0, maxRate, aY + aH, aY);
    noStroke(); fill(col); ellipse(lx, ly, 6, 6);
  }

  // Leyenda (solo en comparación)
  if (worlds.length === 2) {
    textSize(9); textAlign(LEFT, TOP);
    let lx = aX + 8, ly = aY + 4;
    for (let w of worlds) {
      let ac = hc ? [255,255,0] : w.accent;
      noStroke(); fill(ac[0], ac[1], ac[2]);
      ellipse(lx + 4, ly + 5, 8, 8);
      fill(dark ? color(200,210,230) : color(40,50,70));
      text(w.title, lx + 13, ly);
      ly += 14;
    }
  }
}

// ─── Contadores DOM (agregados de todas las cámaras) ────────────────────────
function updateCounters() {
  let nA = 0, nB = 0, nC = 0, total = 0, rate = 0;
  for (let w of worlds) {
    nA += w.countType('A'); nB += w.countType('B'); nC += w.countType('C');
    total += w.totalReactions; rate += w.currentRate;
  }
  let setTxt = (id, v) => { let e = document.getElementById(id); if (e) e.innerText = v; };
  setTxt("count-a", nA);
  setTxt("count-b", nB);
  setTxt("count-c", nC);
  setTxt("count-total", total);
  let anyHist = worlds.some(w => w.rateHistory.length > 0);
  setTxt("count-rate", anyHist ? rate + " /s" : "—");
}

// ─── Ajustes en vivo ────────────────────────────────────────────────────────
function applySharedTemperature() {
  if (mode === "compare" && compareVar === "energy") return; // la controla el par
  let t = intVal("ui-temp-slider");
  worlds.forEach(w => w.setTemperature(t));
}
function applySharedCatalysts() {
  if (mode === "compare" && compareVar === "catalyst") return;
  let k = intVal("ui-cat-slider");
  worlds.forEach(w => w.setCatalysts(k));
}

// ─── UI: visibilidad y configuración del par ────────────────────────────────
function updateUIVisibility() {
  let compareOn   = (mode === "compare");
  let collisionOn = (mode === "collision");
  let show = (id, on) => { let e = document.getElementById(id); if (e) e.style.display = on ? "" : "none"; };

  // Hints descriptivos del modo
  show("mode-hint-reaction",  mode === "single");
  show("mode-hint-compare",   compareOn);
  show("mode-hint-collision", collisionOn);

  // Controles de parámetros: ocultar los que la variable comparada ya controla, y todos en modo choque
  show("group-temp", !(compareOn && compareVar === "energy") && !collisionOn);
  show("group-na",   !(compareOn && compareVar === "count")  && !collisionOn);
  show("group-nb",   !(compareOn && compareVar === "count")  && !collisionOn);
  show("group-cat",  !(compareOn && compareVar === "catalyst") && !collisionOn);

  // Card de comparación: solo en modo comparación
  show("card-compare", compareOn);

  // Play/pausa y reset: solo en modos reacción y comparación
  show("group-play-reset", !collisionOn);

  // Controles de choque: solo en modo choque
  show("group-collision-controls", collisionOn);
}

function configureComparePair() {
  let p = COMPARE_PRESETS[compareVar];
  let nameEls = document.querySelectorAll(".cmp-var-name");
  nameEls.forEach(el => el.innerText = p.label);

  let left = document.getElementById("ui-cmp-left");
  let right = document.getElementById("ui-cmp-right");
  left.min = p.min;  left.max = p.max;  left.value = p.left;
  right.min = p.min; right.max = p.max; right.value = p.right;
  document.getElementById("cmpl-val").innerText = p.left;
  document.getElementById("cmpr-val").innerText = p.right;
}

// ─── Event listeners ────────────────────────────────────────────────────────
function setupEventListeners() {
  // Sliders compartidos
  document.getElementById("ui-temp-slider").addEventListener("input", (e) => {
    document.getElementById("temp-val").innerText = tempLabel(parseInt(e.target.value));
    applySharedTemperature();
  });
  document.getElementById("ui-na-slider").addEventListener("input", (e) => {
    document.getElementById("na-val").innerText = e.target.value;
  });
  document.getElementById("ui-na-slider").addEventListener("change", rebuildWorlds);
  document.getElementById("ui-nb-slider").addEventListener("input", (e) => {
    document.getElementById("nb-val").innerText = e.target.value;
  });
  document.getElementById("ui-nb-slider").addEventListener("change", rebuildWorlds);
  document.getElementById("ui-cat-slider").addEventListener("input", (e) => {
    document.getElementById("cat-val").innerText = e.target.value;
    applySharedCatalysts();
  });

  // Selector de modo único
  document.getElementById("ui-mode-select").addEventListener("change", (e) => {
    mode = e.target.value;
    if (mode === "collision") {
      if (!collisionMode) collisionMode = new CollisionMode();
      else collisionMode.reset();
    } else {
      collisionMode = null;
    }
    updateUIVisibility();
    computeLayout();
    if (mode !== "collision") rebuildWorlds();
  });

  // Selector de variable comparada
  document.getElementById("ui-compare-var").addEventListener("change", (e) => {
    compareVar = e.target.value;
    configureComparePair();
    updateUIVisibility();
    rebuildWorlds();
  });

  // Par Izquierda / Derecha
  let onPairInput = () => {
    document.getElementById("cmpl-val").innerText = val("ui-cmp-left");
    document.getElementById("cmpr-val").innerText = val("ui-cmp-right");
    if (worlds.length !== 2) return;
    if (compareVar === "energy") {
      worlds[0].setTemperature(intVal("ui-cmp-left"));
      worlds[1].setTemperature(intVal("ui-cmp-right"));
    } else if (compareVar === "catalyst") {
      worlds[0].setCatalysts(intVal("ui-cmp-left"));
      worlds[1].setCatalysts(intVal("ui-cmp-right"));
    }
  };
  document.getElementById("ui-cmp-left").addEventListener("input", onPairInput);
  document.getElementById("ui-cmp-right").addEventListener("input", onPairInput);
  // 'count' requiere repoblar → solo al soltar
  let onPairChange = () => { if (compareVar === "count") rebuildWorlds(); };
  document.getElementById("ui-cmp-left").addEventListener("change", onPairChange);
  document.getElementById("ui-cmp-right").addEventListener("change", onPairChange);

  // Play / pausa
  document.getElementById("ui-btn-playpause").addEventListener("click", () => {
    setPaused(!paused);
  });

  // Reset
  document.getElementById("ui-btn-reset").addEventListener("click", rebuildWorlds);

  // Info colapsable
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

  // Slider de energía del modo choque
  document.getElementById("ui-collision-energy").addEventListener("input", (e) => {
    document.getElementById("collision-energy-val").innerText = e.target.value;
  });

  // Botones del modo choque
  document.getElementById("ui-btn-launch").addEventListener("click", () => {
    if (collisionMode) collisionMode.launch(intVal("ui-collision-energy"));
  });
  document.getElementById("ui-btn-collision-reset").addEventListener("click", () => {
    if (collisionMode) collisionMode.reset();
  });

  // Engranaje
  let gear = document.getElementById("ui-dropdown-trigger");
  let drop = document.getElementById("ui-dropdown-container");
  if (gear && drop) {
    gear.addEventListener("click", (e) => { e.stopPropagation(); drop.classList.toggle("is-active"); });
    drop.querySelector(".dropdown-card")?.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", () => drop.classList.remove("is-active"));
  }

  // Estado inicial de etiquetas
  document.getElementById("temp-val").innerText = tempLabel(intVal("ui-temp-slider"));
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
