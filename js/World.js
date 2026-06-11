// ─── Parámetros físicos (compartidos por todas las cámaras) ─────────────────
const BASE_SIGMA      = 2.0;  // px/frame @ T_IDX = 1
const EA              = 5.8;  // energía de activación (vía térmica)
const SITE_CONTACT    = 11;   // distancia entre sitios reactivos para reaccionar
const CAT_ATTRACT_R   = 115;  // radio de atracción del catalizador
const CAT_PULL        = 0.11; // aceleración hacia la cavidad
const CAT_CAPTURE_DIST = 18;  // distancia para fijar la molécula en la cavidad
const CAT_BIND_FRAMES = 28;   // frames con ambas cavidades llenas antes de reaccionar

function gaussianRandom() {
  let u, v;
  do { u = Math.random(); } while (u === 0);
  do { v = Math.random(); } while (v === 0);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Una cámara de reacción autónoma: su propia población, física y estadísticas.
class World {
  constructor(opts) {
    this.tIdx = opts.tIdx;
    this.nA = opts.nA;
    this.nB = opts.nB;
    this.nK = opts.nK;
    this.title = opts.title || "CÁMARA DE REACCIÓN";
    this.accent = opts.accent || [120, 200, 160];

    // Límites (se asignan con setBounds)
    this.camX = 0; this.camY = 0; this.camW = 100; this.camH = 100;

    this.reset();
  }

  setBounds(x, y, w, h) {
    this.camX = x; this.camY = y; this.camW = w; this.camH = h;
  }

  reset() {
    this.molecules = [];
    this.reactionFlashes = [];
    this.totalReactions = 0;
    this.thermalReactions = 0;
    this.catalyzedReactions = 0;
    this.frameCount = 0;
    this.reactionTimestamps = [];
    this.rateHistory = [];
    this.currentRate = 0;
    if (this.camW > 1) this.populate();
  }

  populate() {
    this.molecules = [];
    for (let i = 0; i < this.nA; i++) this.spawnMolecule('A');
    for (let i = 0; i < this.nB; i++) this.spawnMolecule('B');
    for (let i = 0; i < this.nK; i++) this.spawnMolecule('K');
    // Reactivo limitante: el de menor cantidad; marca el máximo de reacciones posibles
    this.nA0 = this.nA;
    this.nB0 = this.nB;
    this.initLimiting = Math.min(this.nA, this.nB);
  }

  // Porcentaje de conversión respecto al reactivo limitante (0–100)
  progressPercent() {
    if (!this.initLimiting) return 0;
    return Math.min(100, Math.round(this.totalReactions / this.initLimiting * 100));
  }

  // Verdadero cuando se ha agotado el reactivo limitante
  isComplete() {
    return this.initLimiting > 0 && this.totalReactions >= this.initLimiting;
  }

  getSigma() { return BASE_SIGMA * Math.sqrt(this.tIdx); }

  randomVel(scale) {
    let s = this.getSigma() * (scale || 1);
    let vx = s * gaussianRandom();
    let vy = s * gaussianRandom();
    let spd = Math.sqrt(vx*vx + vy*vy);
    let lo = s * 0.3, hi = s * 2.8;
    if (spd < lo && spd > 0) { vx *= lo/spd; vy *= lo/spd; spd = lo; }
    if (spd > hi)            { vx *= hi/spd; vy *= hi/spd; }
    return { vx, vy };
  }

  spawnMolecule(type, px, py) {
    let r = (type === 'K') ? CAT_RADIUS : MOL_RADIUS;
    if (px === undefined) {
      let ok = false, tries = 0;
      while (!ok && tries < 60) {
        px = random(this.camX + r + 2, this.camX + this.camW - r - 2);
        py = random(this.camY + r + 2, this.camY + this.camH - r - 2);
        ok = true;
        for (let m of this.molecules) {
          let dx = px - m.pos.x, dy = py - m.pos.y;
          if (Math.sqrt(dx*dx + dy*dy) < r + m.radius + 4) { ok = false; break; }
        }
        tries++;
      }
    }
    let v = (type === 'K') ? this.randomVel(0.35) : this.randomVel(1);
    let m = new Molecule(px, py, v.vx, v.vy, type);
    if (type === 'K') m.angularVel = (Math.random() - 0.5) * 0.02;
    this.molecules.push(m);
    return m;
  }

  spawnProduct(x, y, vx, vy) {
    let m = new Molecule(x, y, vx, vy, 'C');
    m.flash = 18;
    this.molecules.push(m);
  }

  // ─── Ajustes en vivo ──────────────────────────────────────────────────────
  setTemperature(tIdx) {
    if (this.tIdx > 0 && tIdx !== this.tIdx) {
      let factor = Math.sqrt(tIdx / this.tIdx);
      for (let m of this.molecules) {
        if (m.type === 'K' || m.boundTo) continue;
        m.vel.x *= factor; m.vel.y *= factor;
      }
    }
    this.tIdx = tIdx;
  }

  setCatalysts(target) {
    this.nK = target;
    let cats = this.molecules.filter(m => m.type === 'K');
    let cur = cats.length;
    if (cur < target) {
      for (let i = 0; i < target - cur; i++) this.spawnMolecule('K');
    } else if (cur > target) {
      let toRemove = cur - target;
      for (let i = cats.length - 1; i >= 0 && toRemove > 0; i--) {
        let K = cats[i];
        if (K.slotA) { K.slotA.boundTo = null; K.slotA = null; }
        if (K.slotB) { K.slotB.boundTo = null; K.slotB = null; }
        K.dead = true; toRemove--;
      }
      this.molecules = this.molecules.filter(m => !m.dead);
    }
  }

  // ─── Un paso de simulación ────────────────────────────────────────────────
  step() {
    this.frameCount++;
    this.applyCatalystForces();
    this.processCatalystHandoff();

    for (let m of this.molecules) {
      if (m.boundTo) { this.holdBound(m); continue; }
      m.update();
      if (m.type === 'K')
        m.bounceWalls(this.camX + 20, this.camY + 20, this.camX + this.camW - 20, this.camY + this.camH - 20);
      else
        m.bounceWalls(this.camX, this.camY, this.camX + this.camW, this.camY + this.camH);
    }

    this.processCollisionsAndReactions();
    this.processCatalysis();

    if (this.molecules.some(m => m.dead))
      this.molecules = this.molecules.filter(m => !m.dead);

    if (this.frameCount % 60 === 0) {
      let cutoff = this.frameCount - 60;
      this.reactionTimestamps = this.reactionTimestamps.filter(f => f > cutoff);
      this.currentRate = this.reactionTimestamps.length;
      this.rateHistory.push(this.currentRate);
      if (this.rateHistory.length > 90) this.rateHistory.shift();
    }
  }

  applyCatalystForces() {
    let cats = this.molecules.filter(m => m.type === 'K');
    if (!cats.length) return;

    for (let m of this.molecules) {
      if (m.boundTo) continue;
      if (m.type !== 'A' && m.type !== 'B') continue;

      let best = null, bestD = CAT_ATTRACT_R, bestSlot = null;
      for (let K of cats) {
        let role = m.type;
        let occupied = (role === 'A') ? K.slotA : K.slotB;
        if (occupied) continue;
        let sp = K.slotPos(role);
        let d = Math.hypot(sp.x - m.pos.x, sp.y - m.pos.y);
        if (d < bestD) { bestD = d; best = K; bestSlot = role; }
      }

      if (best) {
        let sp = best.slotPos(bestSlot);
        let dx = sp.x - m.pos.x, dy = sp.y - m.pos.y;
        let d = Math.hypot(dx, dy) || 1;
        let pull = CAT_PULL * (1 + (1 - bestD / CAT_ATTRACT_R));
        m.vel.x += (dx / d) * pull;
        m.vel.y += (dy / d) * pull;
        m.vel.x *= 0.985; m.vel.y *= 0.985;
      }
    }
  }

  holdBound(m) {
    let K = m.boundTo;
    let role = (K.slotA === m) ? 'A' : 'B';
    let sp = K.slotPos(role);
    m.pos.x += (sp.x - m.pos.x) * 0.45;
    m.pos.y += (sp.y - m.pos.y) * 0.45;
    m.vel.x = K.vel.x; m.vel.y = K.vel.y;
    m.angle = Math.atan2(K.pos.y - m.pos.y, K.pos.x - m.pos.x);
    if (m.flash > 0) m.flash--;
  }

  // Dos catalizadores con una sola molécula cada uno y complementarias (uno con A,
  // otro con B) se atraen; al juntarse, uno cede su molécula al otro para completar
  // el par A+B y poder reaccionar.
  processCatalystHandoff() {
    let cats = this.molecules.filter(m => m.type === 'K' && !m.dead);
    if (cats.length < 2) return;

    const PULL_R       = 190;               // radio al que empiezan a buscarse
    const HANDOFF_DIST = CAT_RADIUS * 2 + 22; // distancia para ceder la molécula
    const PULL         = 0.05;

    for (let i = 0; i < cats.length; i++) {
      for (let j = i + 1; j < cats.length; j++) {
        let K1 = cats[i], K2 = cats[j];
        let c1 = (K1.slotA ? 1 : 0) + (K1.slotB ? 1 : 0);
        let c2 = (K2.slotA ? 1 : 0) + (K2.slotB ? 1 : 0);
        if (c1 !== 1 || c2 !== 1) continue;            // cada uno con una sola molécula

        let complementary = (K1.slotA && K2.slotB) || (K1.slotB && K2.slotA);
        if (!complementary) continue;                 // deben sumar A + B

        let dx = K2.pos.x - K1.pos.x, dy = K2.pos.y - K1.pos.y;
        let d = Math.hypot(dx, dy) || 1;

        if (d <= HANDOFF_DIST) {
          // Completar K1 tomando la molécula que le falta de K2
          if (K1.slotA && K2.slotB) this.transferMolecule(K2, 'B', K1);
          else                      this.transferMolecule(K2, 'A', K1);
        } else if (d < PULL_R) {
          // Atracción mutua suave para que se encuentren
          let ux = dx / d, uy = dy / d;
          K1.vel.x += ux * PULL; K1.vel.y += uy * PULL;
          K2.vel.x -= ux * PULL; K2.vel.y -= uy * PULL;
        }
      }
    }
  }

  // Mueve la molécula de la cavidad 'role' de fromK a la misma cavidad de toK
  transferMolecule(fromK, role, toK) {
    let m = (role === 'A') ? fromK.slotA : fromK.slotB;
    if (!m) return;
    if (role === 'A') fromK.slotA = null; else fromK.slotB = null;
    fromK.bindTimer = 0;
    if (role === 'A') toK.slotA = m; else toK.slotB = m;
    m.boundTo = toK;
    m.flash = 14; // destello al ceder la molécula
  }

  // Colisiones elásticas + reacciones por vía TÉRMICA (energía + orientación)
  processCollisionsAndReactions() {
    let n = this.molecules.length;
    let newProducts = [];

    for (let i = 0; i < n; i++) {
      let a = this.molecules[i];
      if (a.dead || a.type === 'K' || a.boundTo) continue;

      for (let j = i + 1; j < n; j++) {
        let b = this.molecules[j];
        if (b.dead || b.type === 'K' || b.boundTo) continue;

        let dx = b.pos.x - a.pos.x, dy = b.pos.y - a.pos.y;
        let distSq = dx*dx + dy*dy;
        let minD = a.radius + b.radius;
        if (distSq >= minD * minD || distSq <= 0) continue;

        let dist = Math.sqrt(distSq);
        let nx = dx/dist, ny = dy/dist;

        let ov = (minD - dist) * 0.5;
        a.pos.x -= nx * ov; a.pos.y -= ny * ov;
        b.pos.x += nx * ov; b.pos.y += ny * ov;

        let dvx = a.vel.x - b.vel.x, dvy = a.vel.y - b.vel.y;

        let reactive = (a.type === 'A' && b.type === 'B') ||
                       (a.type === 'B' && b.type === 'A');
        if (reactive) {
          let relSpd = Math.hypot(dvx, dvy);
          let sa = a.sitePos(), sb = b.sitePos();
          let sd = Math.hypot(sa.x - sb.x, sa.y - sb.y);
          if (relSpd >= EA && sd <= SITE_CONTACT) {
            let cx = (a.pos.x + b.pos.x) / 2, cy = (a.pos.y + b.pos.y) / 2;
            newProducts.push({ x: cx, y: cy, vx: (a.vel.x+b.vel.x)/2, vy: (a.vel.y+b.vel.y)/2 });
            this.reactionFlashes.push({ x: cx, y: cy, age: 0, maxAge: 22 });
            this.totalReactions++; this.thermalReactions++;
            this.reactionTimestamps.push(this.frameCount);
            a.dead = true; b.dead = true;
            break;
          }
        }

        let dot = dvx * nx + dvy * ny;
        if (dot > 0) {
          a.vel.x -= dot * nx; a.vel.y -= dot * ny;
          b.vel.x += dot * nx; b.vel.y += dot * ny;
        }
        a.angularVel += (Math.random() - 0.5) * 0.03;
        b.angularVel += (Math.random() - 0.5) * 0.03;
      }
    }

    for (let p of newProducts) this.spawnProduct(p.x, p.y, p.vx, p.vy);
  }

  // Captura en cavidades + reacción por vía CATALIZADA (sin requisitos)
  processCatalysis() {
    let cats = this.molecules.filter(m => m.type === 'K' && !m.dead);

    for (let K of cats) {
      if (!K.slotA) {
        let sp = K.slotPos('A');
        for (let m of this.molecules) {
          if (m.type !== 'A' || m.boundTo || m.dead) continue;
          if (Math.hypot(m.pos.x - sp.x, m.pos.y - sp.y) < CAT_CAPTURE_DIST) {
            m.boundTo = K; K.slotA = m; break;
          }
        }
      }
      if (!K.slotB) {
        let sp = K.slotPos('B');
        for (let m of this.molecules) {
          if (m.type !== 'B' || m.boundTo || m.dead) continue;
          if (Math.hypot(m.pos.x - sp.x, m.pos.y - sp.y) < CAT_CAPTURE_DIST) {
            m.boundTo = K; K.slotB = m; break;
          }
        }
      }

      if (K.slotA && K.slotB) {
        K.bindTimer++;
        if (K.bindTimer >= CAT_BIND_FRAMES) {
          let a = K.slotA, b = K.slotB;
          let cx = (a.pos.x + b.pos.x) / 2, cy = (a.pos.y + b.pos.y) / 2;
          let ox = cx - K.pos.x, oy = cy - K.pos.y, on = Math.hypot(ox, oy) || 1;
          let spd = this.getSigma();
          this.spawnProduct(cx, cy, (ox/on) * spd, (oy/on) * spd);
          this.reactionFlashes.push({ x: cx, y: cy, age: 0, maxAge: 22 });
          a.dead = true; b.dead = true;
          K.slotA = null; K.slotB = null; K.bindTimer = 0;
          K.flash = 20;
          this.totalReactions++; this.catalyzedReactions++;
          this.reactionTimestamps.push(this.frameCount);
        }
      } else {
        K.bindTimer = 0;
      }
    }
  }

  countType(t) { return this.molecules.filter(m => m.type === t).length; }

  // ─── Dibujo ───────────────────────────────────────────────────────────────
  draw(theme) {
    this.drawChamber(theme);
    this.drawMBInset(theme);

    for (let i = this.reactionFlashes.length - 1; i >= 0; i--) {
      let f = this.reactionFlashes[i];
      f.age++;
      if (f.age > f.maxAge) { this.reactionFlashes.splice(i, 1); continue; }
      let t = f.age / f.maxAge;
      let a = map(t, 0, 1, 220, 0);
      let rr = map(t, 0, 1, 14, 30);
      noStroke(); fill(255, 240, 80, a);
      ellipse(f.x, f.y, rr * 2);
    }

    for (let m of this.molecules) m.display(theme);
    this.drawStatsOverlay(theme);
    this.drawProgressBadge(theme);
  }

  // Porcentaje de conversión, grande y continuo, en la esquina inferior derecha
  drawProgressBadge(theme) {
    let dark = theme !== "light";
    let hc   = theme === "high-contrast";
    let ac = hc ? [255, 255, 0] : this.accent;
    let pct = this.progressPercent();
    let label = pct + "%";

    let sz = constrain(min(this.camW, this.camH) * 0.17, 26, 54);
    let rx = this.camX + this.camW - 12;   // borde derecho
    let by = this.camY + this.camH - 10;   // línea base inferior

    textStyle(BOLD); textSize(sz);
    let tw = textWidth(label);
    let capH = constrain(this.camW * 0.03, 9, 12);

    // Fondo translúcido para legibilidad en cualquier tema
    noStroke();
    fill(dark ? color(8, 10, 16, 150) : color(235, 239, 245, 175));
    rect(rx - tw - 12, by - sz - capH - 8, tw + 18, sz + capH + 14, 7);

    // Etiqueta "conversión"
    textStyle(NORMAL); textSize(capH);
    fill(dark ? color(150, 165, 195) : color(70, 90, 120));
    textAlign(RIGHT, BOTTOM);
    text("conversión", rx, by - sz + 1);

    // Porcentaje
    textStyle(BOLD); textSize(sz);
    fill(ac[0], ac[1], ac[2]);
    textAlign(RIGHT, BOTTOM);
    text(label, rx, by);
    textStyle(NORMAL);
  }

  drawChamber(theme) {
    let dark = theme !== "light";
    let hc   = theme === "high-contrast";
    let ac = this.accent;

    noStroke();
    fill(dark ? (hc ? color(0,0,0) : color(17, 20, 32)) : color(195, 204, 216));
    rect(this.camX, this.camY, this.camW, this.camH, 10);

    noFill();
    stroke(hc ? color(255,255,0) : color(ac[0], ac[1], ac[2]));
    strokeWeight(hc ? 2 : 1.5);
    rect(this.camX, this.camY, this.camW, this.camH, 10);

    noStroke();
    fill(hc ? color(255,255,0) : color(ac[0], ac[1], ac[2]));
    textAlign(LEFT, TOP); textStyle(BOLD); textSize(10);
    text(this.title, this.camX + 10, this.camY + 7);
    textStyle(NORMAL);
  }

  drawMBInset(theme) {
    let dark = theme !== "light";
    let hc   = theme === "high-contrast";
    let bW = min(150, this.camW - 24), bH = 78;
    let bX = this.camX + this.camW - bW - 12, bY = this.camY + 10;

    noStroke();
    fill(dark ? (hc ? color(20,20,20,230) : color(12, 15, 26, 210)) : color(175, 185, 200, 210));
    rect(bX, bY, bW, bH, 6);

    let padL = 8, padR = 6, padT = 18, padB = 12;
    let aX = bX + padL, aY = bY + padT;
    let aW = bW - padL - padR, aH = bH - padT - padB;

    noStroke();
    fill(dark ? color(100, 120, 160) : color(70, 90, 120));
    textAlign(LEFT, TOP); textSize(8);
    text("Velocidades (T = " + this.tIdx + ")", bX + 5, bY + 5);

    let sigma = this.getSigma();
    let ea = EA, vMax = sigma * 4.5, N = 120;

    let fMax = 0;
    for (let k = 0; k <= N; k++) {
      let v = (k / N) * vMax;
      let f = (v / (sigma*sigma)) * Math.exp(-(v*v) / (2*sigma*sigma));
      if (f > fMax) fMax = f;
    }
    if (fMax === 0) return;

    beginShape();
    noStroke();
    fill(hc ? color(255,255,0,80) : color(52,199,130,70));
    let eaPixel = map(ea, 0, vMax, aX, aX + aW);
    vertex(max(eaPixel, aX), aY + aH);
    for (let k = 0; k <= N; k++) {
      let v = (k / N) * vMax;
      if (v < ea) continue;
      let f = (v / (sigma*sigma)) * Math.exp(-(v*v) / (2*sigma*sigma));
      vertex(map(v, 0, vMax, aX, aX + aW), map(f, 0, fMax, aY + aH, aY));
    }
    vertex(aX + aW, aY + aH);
    endShape(CLOSE);

    noFill();
    stroke(dark ? (hc ? color(255,255,0) : color(120,160,255)) : color(60, 100, 200));
    strokeWeight(1.5);
    beginShape();
    for (let k = 0; k <= N; k++) {
      let v = (k / N) * vMax;
      let f = (v / (sigma*sigma)) * Math.exp(-(v*v) / (2*sigma*sigma));
      vertex(map(v, 0, vMax, aX, aX + aW), map(f, 0, fMax, aY + aH, aY));
    }
    endShape();

    let eaX = constrain(map(ea, 0, vMax, aX, aX + aW), aX, aX + aW);
    stroke(hc ? color(255,255,0) : color(220,80,80));
    strokeWeight(1.2);
    drawingContext.save();
    drawingContext.setLineDash([3, 3]);
    line(eaX, aY, eaX, aY + aH);
    drawingContext.restore();

    stroke(dark ? color(60,70,100) : color(120,140,170));
    strokeWeight(0.8); noFill();
    line(aX, aY + aH, aX + aW, aY + aH);

    noStroke();
    fill(hc ? color(255,255,0) : color(220,80,80));
    textAlign(CENTER, BOTTOM); textSize(7);
    text("Ea", eaX, aY - 1);
  }

  drawStatsOverlay(theme) {
    let dark = theme !== "light";
    let hc   = theme === "high-contrast";

    let nA = this.countType('A'), nB = this.countType('B');
    let nC = this.countType('C'), nK = this.countType('K');

    let items = [
      { label: "A", count: nA, c: color(79,142,247) },
      { label: "B", count: nB, c: color(247,130, 60) },
      { label: "C", count: nC, c: color(52,199,130) },
    ];
    if (nK > 0) items.push({ label: "K", count: nK, c: color(167,139,250) });

    let bX = this.camX + 10;
    let bW = 132, bH = items.length * 17 + 10;
    let bY = this.camY + this.camH - 14 - bH - 4;

    noStroke();
    fill(dark ? (hc ? color(20,20,20,210) : color(12,15,26,200)) : color(175,185,200,200));
    rect(bX, bY, bW, bH, 5);

    textSize(10.5); textStyle(NORMAL);
    for (let i = 0; i < items.length; i++) {
      let it = items[i];
      let y = bY + 7 + i * 17;
      noStroke();
      fill(it.c); ellipse(bX + 10, y + 5, 8, 8);
      fill(it.count === 0 ? (dark ? color(80,90,110) : color(130,140,160)) :
           (dark ? color(200,210,230) : color(20,30,50)));
      textAlign(LEFT, TOP);
      text(it.label + ": " + it.count, bX + 19, y);
    }

    noStroke();
    fill(dark ? color(100,115,155) : color(70,90,120));
    textAlign(LEFT, TOP); textSize(9.5);
    text("Térm. " + this.thermalReactions + " · Cat. " + this.catalyzedReactions,
         this.camX + 10, this.camY + this.camH - 14);
  }
}
