// Geometría de las moléculas
const MOL_RADIUS  = 12;   // radio físico (disco) de A, B y C
const SITE_DIST   = 8;    // distancia del sitio reactivo al centro
const CAT_RADIUS  = 20;   // radio físico del catalizador
const SLOT_SPREAD = 0.55; // separación angular de las dos cavidades del catalizador (rad)
const SLOT_GAP    = 8;    // distancia de la cavidad respecto al borde del catalizador

class Molecule {
  constructor(x, y, vx, vy, type) {
    this.pos = { x, y };
    this.vel = { x: vx, y: vy };
    this.type = type; // 'A', 'B', 'C', 'K' (catalizador)
    this.radius = (type === 'K') ? CAT_RADIUS : MOL_RADIUS;
    this.siteDist = SITE_DIST;

    this.angle = Math.random() * Math.PI * 2;       // orientación
    this.angularVel = (Math.random() - 0.5) * 0.07; // giro propio

    this.flash = 0;       // contador para el destello de reacción
    this.age = 0;
    this.dead = false;    // marcado para eliminar

    // Solo reactivos: pueden quedar fijados a un catalizador
    this.boundTo = null;

    // Solo catalizador: cavidades de unión y temporizador
    this.slotA = null;
    this.slotB = null;
    this.bindTimer = 0;
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.angle += this.angularVel;
    this.angularVel *= 0.997;
    if (this.flash > 0) this.flash--;
    this.age++;
  }

  bounceWalls(x1, y1, x2, y2) {
    const r = this.radius;
    if (this.pos.x - r < x1) { this.pos.x = x1 + r; this.vel.x =  Math.abs(this.vel.x); }
    if (this.pos.x + r > x2) { this.pos.x = x2 - r; this.vel.x = -Math.abs(this.vel.x); }
    if (this.pos.y - r < y1) { this.pos.y = y1 + r; this.vel.y =  Math.abs(this.vel.y); }
    if (this.pos.y + r > y2) { this.pos.y = y2 - r; this.vel.y = -Math.abs(this.vel.y); }
  }

  // Posición del sitio reactivo (extremo de la molécula que debe encontrar al otro)
  sitePos() {
    return {
      x: this.pos.x + Math.cos(this.angle) * this.siteDist,
      y: this.pos.y + Math.sin(this.angle) * this.siteDist,
    };
  }

  // Posición de una cavidad del catalizador ('A' o 'B')
  slotPos(role) {
    const off = (role === 'A') ? -SLOT_SPREAD : SLOT_SPREAD;
    const ang = this.angle + off;
    const d = this.radius + SLOT_GAP;
    return {
      x: this.pos.x + Math.cos(ang) * d,
      y: this.pos.y + Math.sin(ang) * d,
    };
  }

  // ─── Dibujo ──────────────────────────────────────────────────────────────
  display(theme) {
    if (this.type === 'K') { this.drawCatalyst(theme); return; }
    if (this.type === 'C') { this.drawProduct(theme); return; }
    this.drawReactant(theme);
  }

  drawReactant(theme) {
    let dark = theme !== "light";
    let hc = theme === "high-contrast";
    let base = (this.type === 'A') ? color(79, 142, 247) : color(247, 130, 60);
    let ca = Math.cos(this.angle), sa = Math.sin(this.angle);
    let sx = this.pos.x + ca * this.siteDist, sy = this.pos.y + sa * this.siteDist; // sitio reactivo
    let bx = this.pos.x - ca * 6,             by = this.pos.y - sa * 6;             // átomo trasero

    // Halo
    noStroke();
    fill(red(base), green(base), blue(base), dark ? 28 : 38);
    ellipse(this.pos.x, this.pos.y, (this.radius + 5) * 2);

    // Destello de reacción
    if (this.flash > 0) {
      let a = map(this.flash, 0, 18, 0, 180);
      noStroke(); fill(255, 240, 80, a);
      ellipse(this.pos.x, this.pos.y, (this.radius + 8) * 2);
    }

    // Enlace
    stroke(red(base), green(base), blue(base), 220);
    strokeWeight(5);
    line(bx, by, sx, sy);

    // Átomo trasero (apéndice, marca la orientación)
    // A: mismo azul que el cuerpo; B: naranja oscuro para distinción
    noStroke();
    if (this.type === 'A') {
      fill(base);
    } else {
      fill(red(base) * 0.7, green(base) * 0.7, blue(base) * 0.7);
    }
    ellipse(bx, by, 9, 9);

    // Átomo central (cuerpo)
    fill(base);
    ellipse(this.pos.x, this.pos.y, 15, 15);
    fill(255, 255, 255, dark ? 55 : 85);
    ellipse(this.pos.x - 2.5, this.pos.y - 2.5, 6, 6);

    // Sitio reactivo (extremo activo, resaltado)
    fill(hc ? color(255, 255, 0) : color(255, 245, 210));
    stroke(hc ? color(255, 255, 0) : color(255, 200, 90));
    strokeWeight(2);
    ellipse(sx, sy, 9, 9);

    // Letra
    noStroke();
    fill(255, 255, 255, dark ? 235 : 255);
    textAlign(CENTER, CENTER); textStyle(BOLD); textSize(9);
    text(this.type, this.pos.x, this.pos.y + 0.5);
  }

  drawProduct(theme) {
    // C = 4 átomos en rombo: 2 azules (de A, eje de ángulo) + 2 naranjas (de B, perpendicular)
    let dark = theme !== "light";
    let ca = Math.cos(this.angle), sa = Math.sin(this.angle);
    let px = -sa, py = ca;

    let D = 6.5;
    let a1 = { x: this.pos.x + ca*D,  y: this.pos.y + sa*D  };
    let a2 = { x: this.pos.x - ca*D,  y: this.pos.y - sa*D  };
    let b1 = { x: this.pos.x + px*D,  y: this.pos.y + py*D  };
    let b2 = { x: this.pos.x - px*D,  y: this.pos.y - py*D  };

    noStroke();
    fill(110, 200, 150, dark ? 30 : 42);
    ellipse(this.pos.x, this.pos.y, (this.radius + 6) * 2);

    if (this.flash > 0) {
      let a = map(this.flash, 0, 18, 0, 180);
      noStroke(); fill(255, 240, 80, a);
      ellipse(this.pos.x, this.pos.y, (this.radius + 9) * 2);
    }

    stroke(160, 180, 160, 190); strokeWeight(3.5);
    line(a1.x, a1.y, b1.x, b1.y);
    line(b1.x, b1.y, a2.x, a2.y);
    line(a2.x, a2.y, b2.x, b2.y);
    line(b2.x, b2.y, a1.x, a1.y);

    noStroke();
    fill(79, 142, 247);
    ellipse(a1.x, a1.y, 12, 12);
    ellipse(a2.x, a2.y, 12, 12);
    fill(180, 210, 255, dark ? 100 : 140);
    ellipse(a1.x - 2, a1.y - 2, 4, 4);
    ellipse(a2.x - 2, a2.y - 2, 4, 4);

    fill(247, 130, 60);
    ellipse(b1.x, b1.y, 12, 12);
    ellipse(b2.x, b2.y, 12, 12);
    fill(255, 210, 170, dark ? 100 : 140);
    ellipse(b1.x - 2, b1.y - 2, 4, 4);
    ellipse(b2.x - 2, b2.y - 2, 4, 4);

    noStroke();
    fill(255, 255, 255, dark ? 230 : 255);
    textAlign(CENTER, CENTER); textStyle(BOLD); textSize(9);
    text('C', this.pos.x, this.pos.y + 0.5);
    textStyle(NORMAL);
  }

  drawCatalyst(theme) {
    let dark = theme !== "light";
    let hc = theme === "high-contrast";
    let v = hc ? color(255, 255, 0) : color(167, 139, 250); // violeta

    // Aura de atracción (muy sutil)
    noStroke();
    fill(red(v), green(v), blue(v), dark ? 12 : 16);
    ellipse(this.pos.x, this.pos.y, this.radius * 2 + 26);

    // Destello al liberar producto
    if (this.flash > 0) {
      let a = map(this.flash, 0, 20, 0, 150);
      fill(255, 240, 80, a);
      ellipse(this.pos.x, this.pos.y, (this.radius + 14) * 2);
    }

    // Cuerpo
    fill(red(v), green(v), blue(v), dark ? 235 : 255);
    stroke(red(v) * 0.7, green(v) * 0.7, blue(v) * 0.7);
    strokeWeight(2);
    ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);

    // Cavidades de unión
    for (let role of ['A', 'B']) {
      let sp = this.slotPos(role);
      let filled = (role === 'A') ? this.slotA : this.slotB;
      noStroke();
      fill(filled ? color(255, 240, 120) : color(255, 255, 255, dark ? 70 : 110));
      ellipse(sp.x, sp.y, 8, 8);
    }

    // Etiqueta
    noStroke();
    fill(dark ? color(20, 18, 40) : color(255, 255, 255));
    textAlign(CENTER, CENTER); textStyle(BOLD); textSize(11);
    text('K', this.pos.x, this.pos.y + 0.5);
  }
}
