// ─── Modo Choque ──────────────────────────────────────────────────────────────
// Dos moléculas grandes (A y B) en escena. Se pueden rotar arrastrando y lanzar
// una contra la otra con energía variable. Muestra si el choque es efectivo.

const CM_RADIUS   = 44;   // radio visual de las moléculas grandes
const CM_SITE     = 30;   // distancia del sitio reactivo al centro
const CM_EA_NORM  = 5.8;  // energía de activación normalizada (igual que World)

class CollisionMode {
  constructor() {
    this.reset();
  }

  reset() {
    this.phase = "ready"; // "ready" | "flying" | "result"
    this.resultText = "";
    this.resultEffective = false;
    this.resultTimer = 0;

    // Molécula A (izquierda) y B (derecha)
    this.molA = { angle: 0, dragging: false };
    this.molB = { angle: Math.PI, dragging: false };

    // Posiciones de reposo (se calculan en draw según bounds)
    this.posA = null;
    this.posB = null;

    // Animación de vuelo
    this.flyA = null;
    this.flyB = null;
    this.flashTimer = 0;
    this.fragmentTimer = 0;
    this.fragments = [];
  }

  // Lanzar con la energía dada (0–10, escala de tIdx)
  launch(energyIdx) {
    if (this.phase !== "ready") return;
    this.phase = "flying";
    let speed = BASE_SIGMA * Math.sqrt(energyIdx) * 1.6 + 1.2;
    this.flyA = { x: this.posA.x, y: this.posA.y, vx:  speed, vy: 0, angle: this.molA.angle };
    this.flyB = { x: this.posB.x, y: this.posB.y, vx: -speed, vy: 0, angle: this.molB.angle };
    this._energyIdx = energyIdx;
  }

  step() {
    if (this.phase === "flying") {
      this.flyA.x += this.flyA.vx;
      this.flyB.x += this.flyB.vx;

      let dx = this.flyB.x - this.flyA.x;
      let dy = this.flyB.y - this.flyA.y;
      let dist = Math.hypot(dx, dy);

      if (dist <= CM_RADIUS * 2 + 4) {
        // Comprobar condiciones de reacción
        let relSpd = Math.abs(this.flyA.vx - this.flyB.vx);
        let siteA = {
          x: this.flyA.x + Math.cos(this.flyA.angle) * CM_SITE,
          y: this.flyA.y + Math.sin(this.flyA.angle) * CM_SITE
        };
        let siteB = {
          x: this.flyB.x + Math.cos(this.flyB.angle) * CM_SITE,
          y: this.flyB.y + Math.sin(this.flyB.angle) * CM_SITE
        };
        let siteDist = Math.hypot(siteA.x - siteB.x, siteA.y - siteB.y);
        let energyOk      = relSpd >= CM_EA_NORM;
        let orientationOk = siteDist <= CM_RADIUS * 0.85;

        this.resultEffective = energyOk && orientationOk;
        this.resultTimer = 0;
        this.flashTimer = 40;
        this.fragments = [];

        if (this.resultEffective) {
          // Producto C en el centro
          let cx = (this.flyA.x + this.flyB.x) / 2;
          let cy = (this.flyA.y + this.flyB.y) / 2;
          this._productAngle = (this.flyA.angle + this.flyB.angle) / 2;
          this._productPos   = { x: cx, y: cy };
          this.fragmentTimer = 90; // mostrar producto durante 90 frames
        } else {
          // Fragmentos rebotan
          this._spawnFragments();
        }

        this.phase = "result";
        this._energyOk      = energyOk;
        this._orientationOk = orientationOk;
        this._collisionPos  = {
          x: (this.flyA.x + this.flyB.x) / 2,
          y: (this.flyA.y + this.flyB.y) / 2
        };
        // Detener las moléculas en el punto de impacto (separadas)
        this.flyA.vx = -1.8; this.flyB.vx = 1.8;
      }
    }

    if (this.phase === "result") {
      this.resultTimer++;
      if (this.flashTimer > 0) this.flashTimer--;

      if (this.resultEffective) {
        this.fragmentTimer--;
        if (this.fragmentTimer <= 0) this.phase = "ready";
      } else {
        // Las moléculas siguen separándose
        this.flyA.x += this.flyA.vx;
        this.flyB.x += this.flyB.vx;
        if (this.resultTimer > 80) this.phase = "ready";
      }

      for (let f of this.fragments) {
        f.x += f.vx; f.y += f.vy;
        f.angle += f.av;
        f.life--;
      }
      this.fragments = this.fragments.filter(f => f.life > 0);
    }
  }

  _spawnFragments() {
    // Partículas de impacto visual (no reacción)
    for (let i = 0; i < 8; i++) {
      let ang = (i / 8) * Math.PI * 2;
      this.fragments.push({
        x: this._collisionPos.x, y: this._collisionPos.y,
        vx: Math.cos(ang) * (1.5 + Math.random() * 2),
        vy: Math.sin(ang) * (1.5 + Math.random() * 2),
        angle: Math.random() * Math.PI * 2,
        av: (Math.random() - 0.5) * 0.15,
        life: 35 + Math.floor(Math.random() * 20),
        type: Math.random() < 0.5 ? 'A' : 'B'
      });
    }
  }

  // ─── Interacción ──────────────────────────────────────────────────────────

  mousePressed(mx, my, bx, by, bw, bh) {
    if (this.phase !== "ready") return;
    let pA = this._restPos(bx, by, bw, bh, 'A');
    let pB = this._restPos(bx, by, bw, bh, 'B');
    if (Math.hypot(mx - pA.x, my - pA.y) < CM_RADIUS + 14) {
      this.molA.dragging = true;
      this._dragRef = { mx, my, mol: this.molA, cx: pA.x, cy: pA.y };
    } else if (Math.hypot(mx - pB.x, my - pB.y) < CM_RADIUS + 14) {
      this.molB.dragging = true;
      this._dragRef = { mx, my, mol: this.molB, cx: pB.x, cy: pB.y };
    }
  }

  mouseDragged(mx, my) {
    if (!this._dragRef) return;
    let mol = this._dragRef.mol;
    if (!mol.dragging) return;
    mol.angle = Math.atan2(my - this._dragRef.cy, mx - this._dragRef.cx);
  }

  mouseReleased() {
    if (this.molA) this.molA.dragging = false;
    if (this.molB) this.molB.dragging = false;
    this._dragRef = null;
  }

  // ─── Dibujo ───────────────────────────────────────────────────────────────

  _restPos(bx, by, bw, bh, type) {
    let cx = bx + bw / 2;
    let cy = by + bh / 2;
    let sep = min(bw * 0.28, 200);
    return type === 'A'
      ? { x: cx - sep, y: cy }
      : { x: cx + sep, y: cy };
  }

  draw(bx, by, bw, bh, theme) {
    let dark = theme !== "light";
    let hc   = theme === "high-contrast";

    // Fondo de la zona de choque
    noStroke();
    fill(dark ? (hc ? color(0,0,0) : color(17, 20, 32)) : color(195, 204, 216));
    rect(bx, by, bw, bh, 10);
    noFill();
    stroke(hc ? color(255,255,0) : color(100, 120, 180));
    strokeWeight(1.5);
    rect(bx, by, bw, bh, 10);

    // Título
    noStroke();
    fill(hc ? color(255,255,0) : color(140, 160, 210));
    textAlign(LEFT, TOP); textStyle(BOLD); textSize(10);
    text("MODO CHOQUE", bx + 10, by + 7);
    textStyle(NORMAL);

    let pA = this._restPos(bx, by, bw, bh, 'A');
    let pB = this._restPos(bx, by, bw, bh, 'B');
    this.posA = pA;
    this.posB = pB;

    // Línea central punteada
    stroke(dark ? color(50, 60, 90) : color(160, 175, 200));
    strokeWeight(1);
    drawingContext.save();
    drawingContext.setLineDash([6, 6]);
    line(bx + bw/2, by + 20, bx + bw/2, by + bh - 20);
    drawingContext.restore();

    if (this.phase === "ready") {
      this._drawMolLarge(pA.x, pA.y, this.molA.angle, 'A', theme);
      this._drawMolLarge(pB.x, pB.y, this.molB.angle, 'B', theme);
      this._drawReadyHints(bx, by, bw, bh, theme);

    } else if (this.phase === "flying") {
      this._drawMolLarge(this.flyA.x, this.flyA.y, this.flyA.angle, 'A', theme);
      this._drawMolLarge(this.flyB.x, this.flyB.y, this.flyB.angle, 'B', theme);

    } else if (this.phase === "result") {
      // Flash de colisión
      if (this.flashTimer > 0) {
        let a = map(this.flashTimer, 0, 40, 0, 200);
        noStroke(); fill(255, 240, 80, a);
        let r = map(this.flashTimer, 0, 40, 80, 20);
        ellipse(this._collisionPos.x, this._collisionPos.y, r * 2);
      }

      if (this.resultEffective) {
        // Producto C grande en el centro
        let fac = constrain(map(90 - this.fragmentTimer, 0, 15, 0, 1), 0, 1);
        this._drawProductLarge(this._productPos.x, this._productPos.y, this._productAngle, fac, theme);
      } else {
        // Moléculas rebotan separadas
        this._drawMolLarge(this.flyA.x, this.flyA.y, this.flyA.angle, 'A', theme);
        this._drawMolLarge(this.flyB.x, this.flyB.y, this.flyB.angle, 'B', theme);
        // Fragmentos de chispa
        for (let f of this.fragments) this._drawFragment(f, theme);
      }

      this._drawResultPanel(bx, by, bw, bh, theme);
    }
  }

  _drawReadyHints(bx, by, bw, bh, theme) {
    let dark = theme !== "light";
    noStroke();
    fill(dark ? color(80, 95, 130) : color(80, 100, 140));
    textAlign(CENTER, TOP); textStyle(ITALIC); textSize(11);
    text("↻ Arrastra para rotar", bx + bw/2, by + bh - 46);
    textStyle(NORMAL);
  }

  _drawMolLarge(x, y, angle, type, theme) {
    let dark = theme !== "light";
    let hc = theme === "high-contrast";
    let base = (type === 'A') ? color(79, 142, 247) : color(247, 130, 60);
    let ca = Math.cos(angle), sa = Math.sin(angle);
    let siteX = x + ca * CM_SITE, siteY = y + sa * CM_SITE;
    let rearX  = x - ca * 22,    rearY  = y - sa * 22;
    let R = CM_RADIUS;

    // Halo exterior
    noStroke();
    fill(red(base), green(base), blue(base), dark ? 22 : 32);
    ellipse(x, y, (R + 10) * 2);

    // Enlace
    stroke(red(base), green(base), blue(base), 200);
    strokeWeight(12);
    line(rearX, rearY, siteX, siteY);

    // Átomo trasero (A: mismo azul; B: naranja oscuro)
    noStroke();
    if (type === 'A') { fill(base); } else { fill(red(base)*0.65, green(base)*0.65, blue(base)*0.65); }
    ellipse(rearX, rearY, 28, 28);
    fill(255,255,255, dark ? 40 : 60);
    ellipse(rearX - 5, rearY - 5, 10, 10);

    // Cuerpo principal
    fill(base);
    ellipse(x, y, R * 2, R * 2);
    fill(255, 255, 255, dark ? 50 : 75);
    ellipse(x - R*0.25, y - R*0.25, R * 0.55, R * 0.55);

    // Sitio reactivo (resaltado)
    stroke(hc ? color(255,255,0) : color(255, 200, 90)); strokeWeight(3);
    fill(hc ? color(255,255,0) : color(255, 245, 200));
    ellipse(siteX, siteY, 22, 22);
    noStroke(); fill(255, 255, 255, dark ? 80 : 120);
    ellipse(siteX - 4, siteY - 4, 7, 7);

    // Etiqueta
    noStroke();
    fill(255, 255, 255, dark ? 240 : 255);
    textAlign(CENTER, CENTER); textStyle(BOLD); textSize(20);
    text(type, x, y + 1);
    textStyle(NORMAL);

    // Flecha de orientación (indicador del eje)
    if (this.phase === "ready") {
      stroke(red(base), green(base), blue(base), 120); strokeWeight(2);
      let ax = x + ca * (R + 16), ay = y + sa * (R + 16);
      line(x, y, ax, ay);
      // Punta de flecha
      let perp = 6;
      fill(red(base), green(base), blue(base), 120); noStroke();
      triangle(ax, ay,
        ax - ca*8 - (-sa)*perp, ay - sa*8 - ca*perp,
        ax - ca*8 + (-sa)*perp, ay - sa*8 + ca*perp);
    }
  }

  _drawProductLarge(x, y, angle, fac, theme) {
    let dark = theme !== "light";
    let ca = Math.cos(angle), sa = Math.sin(angle);
    let px = -sa, py = ca;
    let D = 24 * fac;
    let R = CM_RADIUS * fac;

    let a1 = { x: x + ca*D, y: y + sa*D };
    let a2 = { x: x - ca*D, y: y - sa*D };
    let b1 = { x: x + px*D, y: y + py*D };
    let b2 = { x: x - px*D, y: y - py*D };

    // Halo verde de producto
    noStroke();
    fill(110, 200, 150, (dark ? 40 : 55) * fac);
    ellipse(x, y, (R + 22) * 2);

    // Flash verde al aparecer
    if (fac < 0.7) {
      fill(80, 255, 150, map(fac, 0, 0.7, 160, 0));
      ellipse(x, y, (R + 40) * 2);
    }

    // Enlaces
    stroke(160, 200, 170, 200); strokeWeight(10 * fac);
    line(a1.x, a1.y, b1.x, b1.y);
    line(b1.x, b1.y, a2.x, a2.y);
    line(a2.x, a2.y, b2.x, b2.y);
    line(b2.x, b2.y, a1.x, a1.y);

    let ds = 40 * fac;
    noStroke();
    fill(79, 142, 247);
    ellipse(a1.x, a1.y, ds, ds);
    ellipse(a2.x, a2.y, ds, ds);
    fill(180, 210, 255, dark ? 100 : 140);
    ellipse(a1.x - 6, a1.y - 6, 13, 13);
    ellipse(a2.x - 6, a2.y - 6, 13, 13);

    fill(247, 130, 60);
    ellipse(b1.x, b1.y, ds, ds);
    ellipse(b2.x, b2.y, ds, ds);
    fill(255, 210, 170, dark ? 100 : 140);
    ellipse(b1.x - 6, b1.y - 6, 13, 13);
    ellipse(b2.x - 6, b2.y - 6, 13, 13);

    noStroke();
    fill(255, 255, 255, (dark ? 240 : 255) * fac);
    textAlign(CENTER, CENTER); textStyle(BOLD); textSize(28 * fac);
    text('C', x, y + 1);
    textStyle(NORMAL);
  }

  _drawFragment(f, theme) {
    let dark = theme !== "light";
    let base = (f.type === 'A') ? color(79, 142, 247) : color(247, 130, 60);
    let a = map(f.life, 0, 35, 0, 180);
    noStroke();
    fill(red(base), green(base), blue(base), a);
    let s = map(f.life, 0, 35, 3, 10);
    ellipse(f.x, f.y, s, s);
  }

  _drawResultPanel(bx, by, bw, bh, theme) {
    let dark = theme !== "light";
    let hc = theme === "high-contrast";

    let eff = this.resultEffective;
    let panW = min(bw * 0.55, 340), panH = 110;
    let px = bx + bw/2 - panW/2;
    let py = by + bh - panH - 16;

    noStroke();
    fill(dark ? color(12, 15, 26, 225) : color(225, 230, 240, 225));
    rect(px, py, panW, panH, 10);

    // Borde de color
    noFill();
    stroke(hc ? color(255,255,0) : (eff ? color(52, 199, 130) : color(220, 70, 70)));
    strokeWeight(2);
    rect(px, py, panW, panH, 10);

    // Título del resultado
    noStroke();
    let titleCol = hc ? color(255,255,0) : (eff ? color(52, 220, 130) : color(240, 90, 90));
    fill(titleCol);
    textAlign(CENTER, TOP); textStyle(BOLD); textSize(16);
    text(eff ? "✓ CHOQUE EFECTIVO" : "✗ CHOQUE INEFECTIVO", px + panW/2, py + 10);

    // Condiciones
    let yy = py + 36;
    textSize(11); textStyle(NORMAL);
    let mutedCol = dark ? color(160, 175, 205) : color(50, 65, 90);

    let eOk = this._energyOk, oOk = this._orientationOk;
    let eCol = hc ? color(255,255,0) : (eOk ? color(52, 220, 130) : color(240, 90, 90));
    let oCol = hc ? color(255,255,0) : (oOk ? color(52, 220, 130) : color(240, 90, 90));

    fill(mutedCol); textAlign(LEFT, TOP);
    text("Energía suficiente:", px + 16, yy);
    fill(eCol); textAlign(RIGHT, TOP);
    text(eOk ? "Sí ✓" : "No ✗", px + panW - 16, yy);

    yy += 20;
    fill(mutedCol); textAlign(LEFT, TOP);
    text("Orientación correcta:", px + 16, yy);
    fill(oCol); textAlign(RIGHT, TOP);
    text(oOk ? "Sí ✓" : "No ✗", px + panW - 16, yy);

    yy += 20;
    fill(dark ? color(100, 115, 155) : color(80, 100, 135));
    textAlign(CENTER, TOP); textStyle(ITALIC); textSize(10);
    text(eff ? "A + B → C  (ambas condiciones cumplidas)"
             : "No se forma C  (falta al menos una condición)", px + panW/2, yy);
    textStyle(NORMAL);
  }
}
