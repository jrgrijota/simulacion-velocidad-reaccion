// ═══════════════════════════════════════════════════════════════════
//  FÍSICA DE LA REACCIÓN A + B → C (sin dibujo)
//  Las mismas leyes de siempre: energía de activación (Eₐ), orientación de los
//  sitios reactivos, catalizador que rebaja Eₐ. El gas vive en un círculo de
//  radio R_MODELO, con las medidas de la escena (todo × ESC_MOL respecto a la
//  versión anterior) y un reloj simulado propio: TICKS_S pasos = 1 s.
// ═══════════════════════════════════════════════════════════════════
const R_MODELO   = 222;          // radio del círculo de gas (unidades del lienzo)
const ESC_MOL    = 1.2;          // tamaño de las moléculas respecto a la versión anterior
const MOL_RADIUS = 12 * ESC_MOL; // radio físico de A, B y C
const SITE_DIST  = 8 * ESC_MOL;  // distancia del sitio reactivo al centro
const CAT_RADIUS = 20 * ESC_MOL; // radio físico del catalizador (para las paredes)
const SLOT_SPREAD = 0.55;        // separación angular de las dos cavidades (rad)
const SLOT_DIST  = 28;           // distancia de la cavidad al centro del catalizador
const BASE_SIGMA = 2.0;          // px/paso @ nivel 1
const EA         = 5.8;          // energía de activación (vía térmica)
const EA_CAT     = 2.9;          // energía de activación (vía catalizada)
const SITE_CONTACT = 11 * ESC_MOL;
const CAT_ATTRACT_R = 115 * ESC_MOL;
const CAT_PULL   = 0.11;
const CAT_CAPTURE_DIST = 18 * ESC_MOL;
const CAT_BIND_FRAMES = 28;
// Reloj: el gas está más concentrado que en la cámara ancha anterior y se chocan
// más a menudo; se ajustó una sola vez para que los tiempos se parezcan a los de antes.
const TICKS_S = 60;              // pasos por segundo: igual que PASOS_REALES, así el cronómetro marca segundos reales

function gaussianRandom() {
    let u, v;
    do { u = Math.random(); } while (u === 0);
    do { v = Math.random(); } while (v === 0);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const aleatorio = (a, b) => a + Math.random() * (b - a);

class Molecula {
    constructor(x, y, vx, vy, tipo) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.tipo = tipo;                       // 'A' | 'B' | 'C' | 'K'
        this.radio = tipo === 'K' ? CAT_RADIUS : MOL_RADIUS;
        this.angulo = Math.random() * Math.PI * 2;
        this.giro = (Math.random() - 0.5) * 0.07;
        this.muerta = false;
        this.en = null;                          // catalizador que la sujeta
        this.slotA = null; this.slotB = null; this.tempo = 0;   // solo K
    }
    mover() {
        this.x += this.vx; this.y += this.vy;
        this.angulo += this.giro; this.giro *= 0.997;
    }
    // Rebote dentro del círculo de gas (centro en el origen)
    rebotar(R) {
        const lim = R - (this.tipo === 'K' ? CAT_RADIUS * 0.7 : this.radio);
        const d = Math.hypot(this.x, this.y);
        if (d <= lim || d === 0) return;
        const nx = this.x / d, ny = this.y / d;
        this.x = nx * lim; this.y = ny * lim;
        const vn = this.vx * nx + this.vy * ny;
        if (vn > 0) { this.vx -= 2 * vn * nx; this.vy -= 2 * vn * ny; }
    }
    sitio() { return { x: this.x + Math.cos(this.angulo) * SITE_DIST, y: this.y + Math.sin(this.angulo) * SITE_DIST }; }
    cavidad(rol) {
        const a = this.angulo + (rol === 'A' ? -SLOT_SPREAD : SLOT_SPREAD);
        return { x: this.x + Math.cos(a) * SLOT_DIST, y: this.y + Math.sin(a) * SLOT_DIST };
    }
}

class Mundo {
    constructor(o) {
        this.nivel = o.nivel; this.nA = o.nA; this.nB = o.nB; this.nK = o.nK;
        this.reiniciar();
    }
    reiniciar() {
        this.mol = [];
        this.destellos = [];            // reacciones recientes {x, y, edad}
        this.total = 0; this.termicas = 0; this.catalizadas = 0;
        this.pasos = 0;                 // el cronómetro se para al terminar
        this.tFin = null;               // segundos simulados al terminar
        this.serie = [];                // reacciones en cada segundo simulado
        this.enSegundo = 0;
        this.poblar();
    }
    poblar() {
        for (let i = 0; i < this.nA; i++) this.crear('A');
        for (let i = 0; i < this.nB; i++) this.crear('B');
        for (let i = 0; i < this.nK; i++) this.crear('K');
        this.limitante = Math.min(this.nA, this.nB);
    }
    porcentaje() { return this.limitante ? Math.min(100, Math.round(this.total / this.limitante * 100)) : 0; }
    conversion() { return this.limitante ? Math.min(1, this.total / this.limitante) : 0; }
    terminada() { return this.limitante > 0 && this.total >= this.limitante; }
    tiempo() { return (this.tFin != null ? this.tFin : this.pasos / TICKS_S); }
    sigma() { return BASE_SIGMA * Math.sqrt(this.nivel); }
    // Fracción de pares con velocidad relativa mayor que ea (área verde de la curva)
    fraccionSobre(ea) { const s = this.sigma() * Math.SQRT2; return Math.exp(-(ea * ea) / (2 * s * s)); }
    velAleatoria(esc) {
        const s = this.sigma() * (esc || 1);
        let vx = s * gaussianRandom(), vy = s * gaussianRandom();
        let spd = Math.hypot(vx, vy);
        const lo = s * 0.3, hi = s * 2.8;
        if (spd < lo && spd > 0) { vx *= lo / spd; vy *= lo / spd; spd = lo; }
        if (spd > hi) { vx *= hi / spd; vy *= hi / spd; }
        return { vx, vy };
    }
    crear(tipo, px, py) {
        const r = tipo === 'K' ? CAT_RADIUS : MOL_RADIUS;
        if (px === undefined) {
            let ok = false, k = 0;
            while (!ok && k < 80) {
                const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (R_MODELO - r - 2);
                px = Math.cos(a) * d; py = Math.sin(a) * d;
                ok = this.mol.every(m => Math.hypot(px - m.x, py - m.y) >= r + m.radio + 3);
                k++;
            }
        }
        const v = this.velAleatoria(tipo === 'K' ? 1 : 1);
        const m = new Molecula(px, py, v.vx, v.vy, tipo);
        if (tipo === 'K') m.giro = (Math.random() - 0.5) * 0.02;
        this.mol.push(m);
        return m;
    }
    cambiarNivel(n) {
        if (this.nivel > 0 && n !== this.nivel) {
            const f = Math.sqrt(n / this.nivel);
            this.mol.forEach(m => { if (m.tipo !== 'K' && !m.en) { m.vx *= f; m.vy *= f; } });
        }
        this.nivel = n;
    }
    cambiarCatalizadores(n) {
        this.nK = n;
        const cats = this.mol.filter(m => m.tipo === 'K'), cur = cats.length;
        if (cur < n) for (let i = 0; i < n - cur; i++) this.crear('K');
        else if (cur > n) {
            for (let i = cats.length - 1, q = cur - n; i >= 0 && q > 0; i--, q--) {
                const K = cats[i];
                if (K.slotA) { K.slotA.en = null; K.slotA = null; }
                if (K.slotB) { K.slotB.en = null; K.slotB = null; }
                K.muerta = true;
            }
            this.mol = this.mol.filter(m => !m.muerta);
        }
    }
    contar(t) { let n = 0; for (const m of this.mol) if (m.tipo === t) n++; return n; }

    paso() {
        const parada = this.tFin != null;
        if (!parada) this.pasos++;
        this.fuerzasCatalizador();
        this.traspasos();
        for (const m of this.mol) {
            if (m.en) { this.sujetar(m); continue; }
            m.mover(); m.rebotar(R_MODELO);
        }
        this.choques();
        this.catalisis();
        if (this.mol.some(m => m.muerta)) this.mol = this.mol.filter(m => !m.muerta);
        this.destellos.forEach(d => d.edad++);
        this.destellos = this.destellos.filter(d => d.edad <= 30);
        if (!parada) {
            if (this.pasos % Math.round(TICKS_S) === 0) { this.serie.push(this.enSegundo); this.enSegundo = 0; }
            if (this.terminada()) { this.tFin = this.pasos / TICKS_S; this.serie.push(this.enSegundo); this.enSegundo = 0; }
        }
    }
    fuerzasCatalizador() {
        const cats = this.mol.filter(m => m.tipo === 'K');
        if (!cats.length) return;
        for (const m of this.mol) {
            if (m.en || (m.tipo !== 'A' && m.tipo !== 'B')) continue;
            let mejor = null, mejorD = CAT_ATTRACT_R;
            for (const K of cats) {
                if ((m.tipo === 'A') ? K.slotA : K.slotB) continue;
                const sp = K.cavidad(m.tipo), d = Math.hypot(sp.x - m.x, sp.y - m.y);
                if (d < mejorD) { mejorD = d; mejor = K; }
            }
            if (mejor) {
                const sp = mejor.cavidad(m.tipo), dx = sp.x - m.x, dy = sp.y - m.y, d = Math.hypot(dx, dy) || 1;
                const tira = CAT_PULL * (1 + (1 - mejorD / CAT_ATTRACT_R));
                // La atracción solo gira la trayectoria: la rapidez (la temperatura) no cambia
                const v0 = Math.hypot(m.vx, m.vy);
                m.vx += dx / d * tira; m.vy += dy / d * tira;
                const v1 = Math.hypot(m.vx, m.vy) || 1;
                m.vx *= v0 / v1; m.vy *= v0 / v1;
            }
        }
    }
    sujetar(m) {
        const K = m.en, rol = (K.slotA === m) ? 'A' : 'B', sp = K.cavidad(rol);
        m.x += (sp.x - m.x) * 0.45; m.y += (sp.y - m.y) * 0.45;
        m.vx = K.vx; m.vy = K.vy;
        m.angulo = Math.atan2(K.y - m.y, K.x - m.x);
    }
    // Dos catalizadores con una molécula cada uno y complementarias se buscan y se pasan una
    traspasos() {
        const cats = this.mol.filter(m => m.tipo === 'K' && !m.muerta);
        if (cats.length < 2) return;
        const PULL_R = 190 * ESC_MOL, DIST = CAT_RADIUS * 2 + 22 * ESC_MOL, PULL = 0.05;
        for (let i = 0; i < cats.length; i++) for (let j = i + 1; j < cats.length; j++) {
            const K1 = cats[i], K2 = cats[j];
            const c1 = (K1.slotA ? 1 : 0) + (K1.slotB ? 1 : 0), c2 = (K2.slotA ? 1 : 0) + (K2.slotB ? 1 : 0);
            if (c1 !== 1 || c2 !== 1) continue;
            if (!((K1.slotA && K2.slotB) || (K1.slotB && K2.slotA))) continue;
            const dx = K2.x - K1.x, dy = K2.y - K1.y, d = Math.hypot(dx, dy) || 1;
            if (d <= DIST) { if (K1.slotA && K2.slotB) this.pasar(K2, 'B', K1); else this.pasar(K2, 'A', K1); }
            else if (d < PULL_R) { const ux = dx / d, uy = dy / d; K1.vx += ux * PULL; K1.vy += uy * PULL; K2.vx -= ux * PULL; K2.vy -= uy * PULL; }
        }
    }
    pasar(de, rol, a) {
        const m = rol === 'A' ? de.slotA : de.slotB;
        if (!m) return;
        if (rol === 'A') de.slotA = null; else de.slotB = null;
        de.tempo = 0;
        if (rol === 'A') a.slotA = m; else a.slotB = m;
        m.en = a;
    }
    anotar(x, y, via) {
        this.destellos.push({ x, y, edad: 0, via });
        this.total++; this.enSegundo++;
        if (via === 'K') this.catalizadas++; else this.termicas++;
    }
    // Colisiones elásticas y reacción por la vía térmica (energía + orientación)
    choques() {
        const n = this.mol.length, nuevos = [];
        for (let i = 0; i < n; i++) {
            const a = this.mol[i];
            if (a.muerta || a.tipo === 'K' || a.en) continue;
            for (let j = i + 1; j < n; j++) {
                const b = this.mol[j];
                if (b.muerta || b.tipo === 'K' || b.en) continue;
                const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, minD = a.radio + b.radio;
                if (d2 >= minD * minD || d2 <= 0) continue;
                const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = (minD - d) * 0.5;
                a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
                const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
                if ((a.tipo === 'A' && b.tipo === 'B') || (a.tipo === 'B' && b.tipo === 'A')) {
                    const rel = Math.hypot(dvx, dvy), sa = a.sitio(), sb = b.sitio();
                    if (rel >= EA && Math.hypot(sa.x - sb.x, sa.y - sb.y) <= SITE_CONTACT) {
                        const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
                        nuevos.push({ x: cx, y: cy, vx: (a.vx + b.vx) / 2, vy: (a.vy + b.vy) / 2 });
                        this.anotar(cx, cy, 'T');
                        a.muerta = true; b.muerta = true;
                        break;
                    }
                }
                const dot = dvx * nx + dvy * ny;
                if (dot > 0) { a.vx -= dot * nx; a.vy -= dot * ny; b.vx += dot * nx; b.vy += dot * ny; }
                a.giro += (Math.random() - 0.5) * 0.03; b.giro += (Math.random() - 0.5) * 0.03;
            }
        }
        for (const p of nuevos) this.crearProducto(p.x, p.y, p.vx, p.vy);
    }
    crearProducto(x, y, vx, vy) { this.mol.push(new Molecula(x, y, vx, vy, 'C')); }
    // Captura en las cavidades y reacción por la vía catalizada (Eₐ rebajada)
    catalisis() {
        const cats = this.mol.filter(m => m.tipo === 'K' && !m.muerta);
        for (const K of cats) {
            for (const rol of ['A', 'B']) {
                if (rol === 'A' ? K.slotA : K.slotB) continue;
                const sp = K.cavidad(rol);
                for (const m of this.mol) {
                    if (m.tipo !== rol || m.en || m.muerta) continue;
                    if (Math.hypot(m.x - sp.x, m.y - sp.y) < CAT_CAPTURE_DIST) { m.en = K; if (rol === 'A') K.slotA = m; else K.slotB = m; break; }
                }
            }
            if (K.slotA && K.slotB) {
                K.tempo++;
                if (K.tempo >= CAT_BIND_FRAMES) {
                    if (Math.random() >= this.fraccionSobre(EA_CAT)) K.tempo = 0;
                    else {
                        const a = K.slotA, b = K.slotB, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
                        const ox = cx - K.x, oy = cy - K.y, on = Math.hypot(ox, oy) || 1, v = this.sigma();
                        this.crearProducto(cx, cy, ox / on * v, oy / on * v);
                        this.anotar(cx, cy, 'K');
                        a.muerta = true; b.muerta = true; K.slotA = null; K.slotB = null; K.tempo = 0;
                    }
                }
            } else K.tempo = 0;
        }
    }
}
