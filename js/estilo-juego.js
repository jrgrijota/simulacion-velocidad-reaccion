// ─── Estilo SimulaCiencia · juego (el de cambios-estado y densidad) ─────────
// Temas «Pizarra» (Oscuro) y «Día» (Claro): tarjetas con sombra de tinta, letra
// Fredoka, mascota con bocadillo y chispas. Alto contraste se dibuja como antes.

const TEMAS_LIENZO = {
  // Pizarra: azules de SimulaCiencia, oscuro de tono medio para la pizarra digital
  dark: {
    fun: true,
    bg:     [17, 49, 79],   panel:  [21, 57, 90],   panel2: [29, 74, 114],
    border: [45, 105, 150], ink:    [7, 26, 43],
    text:   [238, 247, 255], muted: [181, 211, 236], title: [255, 255, 255],
    single: [52, 227, 168], left:   [255, 216, 74], right: [255, 138, 190],
    ok:     [52, 227, 168], bad:    [255, 138, 138],
    curve:  [127, 184, 255], ea:    [255, 160, 160], cat:  [196, 170, 255],
    molA:   [79, 142, 247], sombraCifra: [7, 26, 43],
  },
  // Día: claro sin llegar a blanco
  light: {
    fun: true,
    bg:     [238, 245, 251], panel: [247, 251, 255], panel2: [228, 239, 248],
    border: [169, 198, 222], ink:   [19, 48, 74],
    text:   [19, 48, 74],    muted: [63, 95, 122],   title: [11, 34, 54],
    single: [10, 125, 88],   left:  [180, 83, 9],    right: [190, 24, 93],
    ok:     [8, 112, 78],    bad:   [192, 40, 40],
    curve:  [31, 95, 191],   ea:    [192, 40, 40],   cat:  [109, 40, 217],
    molA:   [79, 142, 247], sombraCifra: [169, 198, 222],
  },
  "high-contrast": { fun: false },
};
let TH = TEMAS_LIENZO.dark;

const MOV_REDUCIDO = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FUENTE_TEXTO = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// Texto en tipo frase («Cámara de reacción») en el estilo juego. Las palabras de
// una letra (A, B, C, T, s) se quedan como están.
function frase(t) {
  if (!TH.fun) return t;
  let l = t.split(" ").map(p => p.length === 1 ? p : p.toLocaleLowerCase()).join(" ");
  // Mayúscula solo si el texto empieza por letra (tras ◀, ✓…): «4 catalizadores» no cambia
  return l.replace(/^([^\p{L}\p{N}]*)(\p{L})/u, (m, pre, c) => pre + c.toLocaleUpperCase());
}

// Color del acento de una cámara: el del tema juego o el de siempre
function acentoCamara(w) {
  if (!TH.fun) return w.accent;
  return w.lado === "L" ? TH.left : w.lado === "R" ? TH.right : TH.single;
}

// Tarjeta redondeada con borde y sombra sólida de tinta
function tarjeta(x, y, w, h, r, relleno, borde, grosor) {
  noStroke(); fill(...TH.ink); rect(x, y + 4, w, h, r);
  stroke(...(borde || TH.border)); strokeWeight(grosor || 2); fill(...(relleno || TH.panel));
  rect(x, y, w, h, r);
  noStroke();
}

// Píldora con texto (títulos de cámara, etiquetas)
function pildora(x, y, txt, col, tam) {
  textFont("Fredoka"); textStyle(BOLD); textSize(tam);
  let w = textWidth(txt) + tam * 1.5, h = tam * 1.75;
  noStroke(); fill(...TH.ink); rect(x, y + 3, w, h, h / 2);
  fill(...col); rect(x, y, w, h, h / 2);
  fill(...(esClaro(col) ? TH.ink : [255, 255, 255]));
  textAlign(CENTER, CENTER);
  text(txt, x + w / 2, y + h / 2 - 1);
  textStyle(NORMAL);
  return w;
}

function esClaro(col) { return (col[0] * 0.299 + col[1] * 0.587 + col[2] * 0.114) > 130; }

// Cifra grande con sombra de tinta (se lee desde el fondo del aula)
function cifra(txt, x, y, col) {
  fill(...TH.sombraCifra); text(txt, x, y + 3);
  fill(...col); text(txt, x, y);
}

// ── Mascota con bocadillo ──────────────────────────────────────────────────
let etiquetaMascota = "", desdeMascota = -1e9, chispas = [];

function salto(t0) {
  if (MOV_REDUCIDO) return 1;
  let e = (millis() - t0) / 450;
  if (e >= 1) return 1;
  return 1 + 0.35 * sin(e * PI) * (1 - e);
}

function lanzarChispas(x, y, col, n) {
  if (MOV_REDUCIDO) return;
  for (let i = 0; i < n; i++) {
    let a = random(TWO_PI), v = random(1.5, 4);
    chispas.push({ x, y, vx: cos(a) * v, vy: sin(a) * v - 1, vida: 1, col, r: random(3, 6), estrella: random() < 0.5 });
  }
}

function estrella(x, y, r1, r2) {
  beginShape();
  for (let i = 0; i < 10; i++) {
    let a = -HALF_PI + i * PI / 5, r = i % 2 ? r2 : r1;
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

function drawChispas(zona) {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(zona.x, zona.y, zona.w, zona.h);   // nunca salen de la zona de la mascota
  drawingContext.clip();
  for (let i = chispas.length - 1; i >= 0; i--) {
    let c = chispas[i];
    c.x += c.vx; c.y += c.vy; c.vy += 0.12; c.vida -= 0.04;
    if (c.vida <= 0) { chispas.splice(i, 1); continue; }
    noStroke(); fill(...c.col, 255 * c.vida);
    if (c.estrella) estrella(c.x, c.y, c.r * 1.3, c.r * 0.5);
    else ellipse(c.x, c.y, c.r * 2 * c.vida);
  }
  drawingContext.restore();
}

// Mascota: partícula sonriente
function drawMascota(cx, cy, r, col) {
  let bote = MOV_REDUCIDO ? 0 : sin(millis() / 260) * 1.5;
  let parpadeo = millis() % 4200 > 4050;
  push();
  translate(cx, cy + bote);
  let s = salto(desdeMascota);
  scale(s, 2 - s);
  noStroke(); fill(0, 0, 0, 45); ellipse(0, r + 3 - bote, r * 1.5, 5);
  stroke(...TH.ink); strokeWeight(2.5); fill(...col);
  ellipse(0, 0, r * 2);
  noStroke(); fill(255, 255, 255, 150);
  ellipse(-r * 0.42, -r * 0.45, r * 0.55, r * 0.35);
  fill(...TH.ink);
  if (parpadeo) {
    stroke(...TH.ink); strokeWeight(2);
    line(-r * 0.42, -r * 0.05, -r * 0.18, -r * 0.05); line(r * 0.18, -r * 0.05, r * 0.42, -r * 0.05);
  } else {
    ellipse(-r * 0.3, -r * 0.08, r * 0.2, r * 0.3); ellipse(r * 0.3, -r * 0.08, r * 0.2, r * 0.3);
  }
  noFill(); stroke(...TH.ink); strokeWeight(2.2);
  arc(0, r * 0.18, r * 0.6, r * 0.45, 0.15 * PI, 0.85 * PI);
  noStroke(); fill(255, 120, 150, 120);
  ellipse(-r * 0.58, r * 0.22, r * 0.3); ellipse(r * 0.58, r * 0.22, r * 0.3);
  pop();
}

// Medidas de la franja del bocadillo. Con poco ancho (móvil) la etiqueta va
// encima del texto y la franja es más alta.
const BOC_X = 14, BOC_Y = 12;
function estrecho() { return width < 640; }
function altoBocadillo() { return estrecho() ? 80 : 52; }

// Parte un texto en líneas que caben en «ancho» con el tamaño actual
function lineasDe(txt, ancho) {
  let palabras = txt.split(/\s+/), lineas = [], linea = "";
  for (let p of palabras) {
    let prueba = linea ? linea + " " + p : p;
    if (textWidth(prueba) > ancho && linea) { lineas.push(linea); linea = p; }
    else linea = prueba;
  }
  if (linea) lineas.push(linea);
  return lineas;
}

// Franja superior: mascota + bocadillo con etiqueta y mensaje
function drawBocadillo(m) {
  let x = BOC_X, y = BOC_Y, w = width - 2 * BOC_X, h = altoBocadillo();
  let clave = m.tag + "|" + m.txt;
  if (clave !== etiquetaMascota) {
    if (etiquetaMascota) lanzarChispas(x + 22, y + h / 2, m.col, 12);
    etiquetaMascota = clave; desdeMascota = millis();
    let an = document.getElementById("anuncio");
    if (an) an.textContent = m.tag + ". " + m.txt;
  }
  // En el tema Día los colores son oscuros: la mascota, más clara
  let cm = TH === TEMAS_LIENZO.light ? m.col.map(v => lerp(v, 255, 0.45)) : m.col;
  let r = estrecho() ? 18 : 20;
  drawMascota(x + 22, y + h / 2, r, cm);

  let bx = x + 52, my = y + h / 2, bw = w - 52;
  noStroke(); fill(...TH.ink); rect(bx, y + 3, bw, h, 16);
  stroke(...TH.border); strokeWeight(2); fill(...TH.panel);
  triangle(bx - 10, my, bx + 4, my - 8, bx + 4, my + 8);
  rect(bx, y, bw, h, 16);
  noStroke(); fill(...TH.panel);
  triangle(bx - 7, my, bx + 3, my - 6, bx + 3, my + 6);

  // Etiqueta que da un salto al cambiar
  let tam = estrecho() ? 14 : 16;
  textFont("Fredoka"); textStyle(BOLD); textSize(tam);
  let tw = textWidth(m.tag) + 24, th = tam + 12;
  let tagX = bx + 12, tagY = estrecho() ? y + 8 : my - th / 2 - 1;
  push();
  translate(tagX + tw / 2, tagY + th / 2);
  scale(salto(desdeMascota));
  noStroke(); fill(...TH.ink); rect(-tw / 2, -th / 2 + 2, tw, th, th / 2);
  fill(...m.col); rect(-tw / 2, -th / 2, tw, th, th / 2);
  fill(...(esClaro(m.col) ? TH.ink : [255, 255, 255]));
  textAlign(CENTER, CENTER);
  text(m.tag, 0, -1);
  pop();
  textStyle(NORMAL);

  // Mensaje: letra del sistema, tan grande como quepa
  textFont(FUENTE_TEXTO);
  let tx = estrecho() ? bx + 12 : tagX + tw + 12;
  let ty = estrecho() ? tagY + th + 2 : y + 3;
  let ancho = bx + bw - tx - 12, alto = y + h - ty - 3;
  let sz = estrecho() ? 14 : 16, lineas;
  for (; sz > 11; sz--) {
    textSize(sz);
    lineas = lineasDe(m.txt, ancho);
    if (lineas.length * sz * 1.18 <= alto) break;
  }
  textSize(sz);
  lineas = lineasDe(m.txt, ancho);
  fill(...TH.text); textAlign(LEFT, CENTER);
  let lh = sz * 1.18, cy0 = ty + alto / 2 - (lineas.length - 1) * lh / 2;
  lineas.forEach((l, i) => text(l, tx, cy0 + i * lh));
  textFont("Fredoka");
  textAlign(LEFT, BASELINE);

  drawChispas({ x: x - 4, y: y - 6, w: 60, h: h + 12 });
}
