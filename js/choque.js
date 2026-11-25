// ═══════════════════════════════════════════════════════════════════
//  MODO CHOQUE
//  Dos moléculas grandes en el círculo del modelo. Se giran arrastrándolas y se
//  lanzan una contra otra con la energía elegida. Solo reaccionan si el choque
//  cumple las DOS condiciones: energía mayor que Eₐ y sitios reactivos de frente.
//  Coordenadas del círculo del modelo (origen en el centro, radio R_MODELO).
// ═══════════════════════════════════════════════════════════════════
const CH_ESC     = 4.2;          // escala de las moléculas grandes (la misma que molAB / molC)
const CH_SITIO   = 10 * CH_ESC;  // distancia del sitio reactivo al centro
const CH_REPOSO  = 150;          // posición de reposo (± en x)
const CH_CONTACTO = 128;         // distancia entre centros a la que se evalúa el choque
const CH_ORIENT  = 56;           // los sitios deben quedar a menos de esto para reaccionar
const CH_VELOCIDAD = 1.5;        // v = K · √E (la relativa 2v supera Eₐ a partir del nivel 4)
const CH_NIVEL_EA = Math.pow(EA / (2 * CH_VELOCIDAD), 2);   // nivel de energía que equivale a Eₐ (≈ 3,7)

class Choque {
    constructor() { this.reiniciar(true); }
    reiniciar(todo) {
        this.fase = 'listo';                 // 'listo' | 'vuelo' | 'resultado'
        this.A = { x: -CH_REPOSO, y: 0, ang: 0, vx: 0 };
        this.B = { x: CH_REPOSO, y: 0, ang: Math.PI, vx: 0 };
        this.arrastre = null; this.t = 0; this.chispas = [];
        if (todo) { this.ultimo = null; this.historial = []; }
    }
    colocar() { if (this.fase !== 'vuelo') { const a = this.A.ang, b = this.B.ang; this.reiniciar(false); this.A.ang = a; this.B.ang = b; } }
    lanzar(nivel) {
        if (this.fase !== 'listo') return false;
        const v = CH_VELOCIDAD * Math.sqrt(nivel);
        this.fase = 'vuelo'; this.nivel = nivel; this.t = 0;
        this.A.vx = v; this.B.vx = -v; this.ultimo = null;
        return true;
    }
    sitio(m) { return { x: m.x + Math.cos(m.ang) * CH_SITIO, y: m.y + Math.sin(m.ang) * CH_SITIO }; }
    paso() {
        if (this.fase === 'vuelo') {
            this.A.x += this.A.vx; this.B.x += this.B.vx;
            if (this.B.x - this.A.x <= CH_CONTACTO) this.evaluar();
        } else if (this.fase === 'resultado') {
            this.t++;
            if (!this.eficaz) { this.A.x += this.A.vx; this.B.x += this.B.vx; }
            this.chispas.forEach(f => { f.x += f.vx; f.y += f.vy; f.vida--; });
            this.chispas = this.chispas.filter(f => f.vida > 0);
            if (this.t > (this.eficaz ? 170 : 90)) { const a = this.A.ang, b = this.B.ang; this.reiniciar(false); this.A.ang = a; this.B.ang = b; }
        }
    }
    evaluar() {
        const rel = Math.abs(this.A.vx - this.B.vx), sa = this.sitio(this.A), sb = this.sitio(this.B);
        const dsit = Math.hypot(sa.x - sb.x, sa.y - sb.y);
        this.energiaOk = rel >= EA; this.orientOk = dsit <= CH_ORIENT;
        this.eficaz = this.energiaOk && this.orientOk;
        this.cx = (this.A.x + this.B.x) / 2; this.cy = (this.A.y + this.B.y) / 2;
        this.angA = this.A.ang; this.angB = this.B.ang;
        this.angC = (this.A.ang + this.B.ang) / 2;
        this.t = 0; this.fase = 'resultado'; this.chispas = [];
        this.A.vx = -1.8; this.B.vx = 1.8;
        if (!this.eficaz) for (let i = 0; i < 8; i++) {
            const a = i / 8 * Math.PI * 2, v = 1.5 + Math.random() * 2;
            this.chispas.push({ x: this.cx, y: this.cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 35 + Math.floor(Math.random() * 20), t: Math.random() < .5 ? 'A' : 'B' });
        }
        const kind = this.eficaz ? 'eficaz' : (!this.energiaOk ? 'energia' : 'orient');
        const E = this.nivel;
        const tit = { eficaz: i18n.t('Eficaz'), energia: i18n.t('Poca energía'), orient: i18n.t('Mal orientadas') }[kind];
        const sub = { eficaz: i18n.t('energía y orientación'), energia: i18n.t('energía {e}, menos que Eₐ', { e: E }), orient: i18n.t('sitios que no se tocan') }[kind];
        this.ultimo = { kind, ok: this.eficaz, titulo: tit, sub, nivel: E, energiaOk: this.energiaOk, orientOk: this.orientOk, angA: this.angA, angB: this.angB };
        this.historial.push(this.ultimo);
        if (this.historial.length > 40) this.historial.shift();
        return kind;
    }
    // ── Interacción: coordenadas del círculo (origen en el centro) ──
    pulsar(mx, my) {
        if (this.fase !== 'listo') return;
        for (const m of [this.A, this.B]) if (Math.hypot(mx - m.x, my - m.y) < 70) { this.arrastre = m; return true; }
        return false;
    }
    arrastrar(mx, my) { if (this.arrastre) this.arrastre.ang = Math.atan2(my - this.arrastre.y, mx - this.arrastre.x); }
    soltar() { this.arrastre = null; }

    // ── Dibujo dentro del círculo (ya trasladado y escalado) ──
    dibujarFondo() {
        const c = this;
        if (c.fase === 'resultado' || c.fase === 'vuelo') {
            // por dónde llegaron A y B (rastro de puntos)
            const ea = c.fase === 'vuelo' ? c.A.x - 30 : -CH_CONTACTO / 2 - 14, eb = c.fase === 'vuelo' ? c.B.x + 30 : CH_CONTACTO / 2 + 14;
            forma(`M${-CH_REPOSO} 0 H${ea}`, { s: CF.A, sw: 4, lc: 'round', dash: [2, 9], op: .75 });
            forma(`M${CH_REPOSO} 0 H${eb}`, { s: CF.B, sw: 4, lc: 'round', dash: [2, 9], op: .75 });
        }
        if (c.fase === 'listo') {
            [c.A, c.B].forEach(m => forma(E(m.x, m.y, 74, 74), { s: THEME.accent, sw: 2, dash: [6, 7], op: c.arrastre === m ? .8 : .35 }));
        }
    }
    dibujar() {
        const c = this;
        if (c.fase === 'listo' || c.fase === 'vuelo') {
            molAB(c.A.x, c.A.y, c.A.ang, 'A', CH_ESC); molAB(c.B.x, c.B.y, c.B.ang, 'B', CH_ESC);
        } else if (c.eficaz) {
            const f = Math.min(1, c.t / 14);
            forma(E(c.cx, c.cy, 82, 82), { s: CF.cam, sw: 2.4, dash: [6, 5], op: .9 * f });
            chispaD(c.cx + 82 * .8 + 8, c.cy - 82 * .8 - 4, 6 * f + 1); chispaD(c.cx - 82 * .85 - 7, c.cy + 82 * .7 + 4, 5 * f + 1);
            molC(c.cx, c.cy, c.angC, CH_ESC * (.4 + .6 * f));
        } else {
            molAB(c.A.x, c.A.y, c.A.ang, 'A', CH_ESC); molAB(c.B.x, c.B.y, c.B.ang, 'B', CH_ESC);
            c.chispas.forEach(f => { const a0 = drawingContext.globalAlpha; drawingContext.globalAlpha = a0 * Math.min(1, f.vida / 25); CC(f.x, f.y, 3 + f.vida / 9, { f: f.t === 'A' ? CF.A : CF.B, s: tinta(), sw: 1.5 }); drawingContext.globalAlpha = a0; });
        }
    }
}

// ═════════ Panel con las dos condiciones (modo Choque) ═════════
function mensajeChoque(c) {
    const u = c.ultimo;
    if (!u) return { tag: i18n.t('LISTO PARA LANZAR'), col: '#9ec9ff', msg: i18n.t('Elige la energía y pulsa Lanzar. Aquí verás si reaccionan y por qué.') };
    if (u.kind === 'eficaz') return { tag: i18n.t('CHOQUE EFICAZ'), col: CF.cam, msg: i18n.t('Se cumplen las dos condiciones a la vez, así que A y B se unen y forman C.') };
    if (u.kind === 'energia') return { tag: i18n.t('LE FALTA ENERGÍA'), col: CF.no, msg: i18n.t('Los sitios reactivos se tocan, pero el choque no llega a Eₐ: las moléculas rebotan sin reaccionar.') };
    if (u.kind === 'orient') return { tag: i18n.t('MAL ORIENTADAS'), col: CF.no, msg: i18n.t('Hay energía de sobra, pero los sitios reactivos no se tocan de frente: las moléculas rebotan sin reaccionar.') };
    return { tag: i18n.t('NO REACCIONAN'), col: CF.no, msg: i18n.t('Falta energía y, además, los sitios reactivos no están de frente: las moléculas rebotan.') };
}
function dibujarPanelChoque(x, y, w, h, c, nivelActual, m) {
    const ink = tinta(), u = c.ultimo, e = mensajeChoque(c);
    tarj({ x, y, w, h }, THEME.pillBg, 20);
    const px = x + 24, iw = w - 48, fs = m ? 16.5 : 18;
    rotulo(px, y + 20, 32, e.tag, e.col, { fs: 16.5 });
    const lineas = partir(e.msg, iw, { fs, w: 500 }).slice(0, 3);
    lineas.forEach((l, i) => T(px, y + 86 + i * (fs + 7), l, { fs, c: THEME.text }));
    const dy = y + 86 + (Math.max(3, lineas.length) - 1) * (fs + 7) + 22;
    linea(`M${px} ${dy} H${px + iw}`, THEME.border, 1.5);
    // condición 1: energía
    const E1 = u ? u.nivel : nivelActual, ok1 = u ? u.energiaOk : null, ok2 = u ? u.orientOk : null;
    const marca = (cx, cy, ok) => {
        CC(cx, cy, 14, { f: ok == null ? THEME.hundido : ok ? CF.ok : CF.no, s: ink, sw: 2.5 });
        T(cx, cy + 6, ok == null ? '?' : ok ? '✓' : '✗', { fs: 16, w: 700, a: 'middle', c: ok == null ? THEME.textDim : '#071a2b', sys: true });
    };
    marca(px + 14, dy + 34, ok1);
    T(px + 38, dy + 30, i18n.t('Energía suficiente'), { fs: 17.5, w: 600, c: THEME.text });
    TS(px + 38, dy + 52, i18n.t('energía del choque {e} · Eₐ ≈ {ea}', { e: E1, ea: Math.round(CH_NIVEL_EA) }), { fs: 15, c: THEME.textDim });
    const bx = px + 38, bw = iw - 38, by = dy + 64;
    forma(R(bx, by, bw, 14, 7), { f: THEME.hundido, s: THEME.border, sw: 1.5 });
    forma(R(bx, by, Math.max(14, bw * E1 / 10), 14, 7), { f: ok1 === false ? CF.no : ok1 ? CF.ok : '#9ec9ff', s: ink, sw: 1.5 });
    const ex = bx + bw * CH_NIVEL_EA / 10;
    forma(`M${ex} ${by - 6} V${by + 20}`, { s: '#ff6b7d', sw: 2.5, dash: [4, 3] });
    T(ex, by + 37, 'Eₐ', { fs: 15, w: 700, a: 'middle', c: '#ff9aa4' });
    // condición 2: orientación
    const d2 = dy + 124;
    marca(px + 14, d2 + 14, ok2);
    T(px + 38, d2 + 10, i18n.t('Sitios reactivos de frente'), { fs: 17.5, w: 600, c: THEME.text });
    TS(px + 38, d2 + 32, u ? (u.orientOk ? i18n.t('los extremos claros se tocan') : i18n.t('los extremos claros no se tocan')) : i18n.t('los extremos claros deben tocarse'), { fs: 15, c: THEME.textDim });
    const mx = x + w - 66;
    molAB(mx, d2 + 16, u ? u.angA : 0, 'A', 1.15); molAB(mx + 34, d2 + 16, u ? u.angB : Math.PI, 'B', 1.15);
}

// ═════════ Diagrama de energía del choque (modo Choque) ═════════
// Perfil de la reacción: reactivos (A + B) a energía 0, cima a Eₐ, producto C más abajo.
// La pareja A + B es una bola que sube la ladera con la energía del choque:
// si llega a la cima (y están de frente) baja al lado de C; si no, vuelve.
const CH_NIVEL_EA_K = Math.pow(EA_CAT / (2 * CH_VELOCIDAD), 2);   // la cima con catalizador (≈ 0,9)
const PERFIL_C = -2.2;                                              // energía del producto C
function alturaPerfil(s, ea) {                  // s: avance del choque (0–1)
    if (s <= .2) return 0;
    if (s <= .5) return ea * (1 - Math.cos(Math.PI * (s - .2) / .3)) / 2;
    if (s <= .8) return PERFIL_C + (ea - PERFIL_C) * (1 + Math.cos(Math.PI * (s - .5) / .3)) / 2;
    return PERFIL_C;
}
function puntoRetorno(E) { return E >= CH_NIVEL_EA ? .5 : .2 + .3 * Math.acos(1 - 2 * E / CH_NIVEL_EA) / Math.PI; }
function avancePerfil(c, E) {
    const s0 = .07;
    if (c.fase === 'vuelo') {
        const p = Math.max(0, Math.min(1, (c.A.x + CH_REPOSO) / (CH_REPOSO - CH_CONTACTO / 2)));
        return s0 + (puntoRetorno(E) - s0) * p;
    }
    if (c.fase === 'resultado' && c.ultimo) {
        const f = Math.min(1, c.t / 50), sr = puntoRetorno(E);
        return c.eficaz ? .5 + (.93 - .5) * f : sr - (sr - s0) * f;
    }
    return s0;
}
function dibujarPerfil(x, y, w, h, c, nivelActual, m) {
    const ink = tinta(), u = c.fase === 'resultado' ? c.ultimo : null;
    const E = c.fase === 'listo' ? nivelActual : c.nivel;
    T(x, y + 20, i18n.t('Energía durante el choque'), { fs: m ? 16 : 17.5, w: 600, c: THEME.text });
    const gx = x + 26, gx1 = x + w - 8, gy = y + 86, gb = y + h - 30, eMin = PERFIL_C - .9, eMax = 10.6;
    const X = s => gx + s * (gx1 - gx), Y = e => gb - (e - eMin) / (eMax - eMin) * (gb - gy);
    // ejes
    forma(`M${gx} ${gb} V${gy - 6} M${gx - 5} ${gy + 2} L${gx} ${gy - 6} L${gx + 5} ${gy + 2}`, { s: THEME.textDim, sw: 2, lc: 'round', lj: 'round' });
    forma(`M${gx} ${gb} H${gx1} M${gx1 - 8} ${gb - 5} L${gx1} ${gb} L${gx1 - 8} ${gb + 5}`, { s: THEME.textDim, sw: 2, lc: 'round', lj: 'round' });
    TS(gx - 8, gy - 12, i18n.t('energía'), { fs: 14, c: THEME.textDim, a: 'start' });
    TS(gx1, gb + 22, i18n.t('avance del choque'), { fs: 14, c: THEME.textDim, a: 'end' });
    // perfil con catalizador (referencia) y perfil normal
    const camino = ea => { let d = ''; for (let i = 0; i <= 80; i++) { const s = i / 80; d += (i ? ' L' : 'M') + X(s) + ' ' + Y(alturaPerfil(s, ea)); } return d; };
    forma(camino(CH_NIVEL_EA_K), { s: CF.K, sw: 2.4, dash: [6, 5], op: .9 });
    forma(camino(CH_NIVEL_EA), { s: '#e9f2ff', sw: 3.5, lj: 'round' });
    TS(X(.36), Y(0) + 24, i18n.t('con catalizador'), { fs: 13.5, a: 'middle', c: CF.K });
    // Eₐ: flecha doble de los reactivos a la cima
    const xe = X(.7);
    forma(`M${X(.2)} ${Y(0)} H${xe + 6}`, { s: THEME.textDim, sw: 1.2, dash: [3, 4] });
    forma(`M${X(.5)} ${Y(CH_NIVEL_EA)} H${xe + 6}`, { s: THEME.textDim, sw: 1.2, dash: [3, 4] });
    forma(`M${xe} ${Y(0) - 2} V${Y(CH_NIVEL_EA) + 2} M${xe - 4} ${Y(0) - 8} L${xe} ${Y(0) - 2} L${xe + 4} ${Y(0) - 8} M${xe - 4} ${Y(CH_NIVEL_EA) + 8} L${xe} ${Y(CH_NIVEL_EA) + 2} L${xe + 4} ${Y(CH_NIVEL_EA) + 8}`, { s: '#ff6b7d', sw: 2.2, lc: 'round', lj: 'round' });
    const yEa = (Y(0) + Y(CH_NIVEL_EA)) / 2;
    forma(R(xe + 8, yEa - 12, 36, 24, 12), { f: '#c23b4a', s: ink, sw: 1.6 });
    T(xe + 26, yEa + 5, 'Eₐ', { fs: 14, w: 700, a: 'middle', c: '#fff' });
    TS(X(.1), Y(0) + 24, 'A + B', { fs: 15, w: 700, a: 'middle', c: THEME.text });
    TS(X(.84), Y(PERFIL_C) - 12, 'C', { fs: 15, w: 700, a: 'middle', c: THEME.text });
    // energía que trae el choque
    const ok = E >= CH_NIVEL_EA, colE = ok ? CF.ok : CF.no;
    forma(`M${X(.03)} ${Y(E)} H${gx1 - 4}`, { s: colE, sw: 2, dash: [7, 5], op: .9 });
    const etE = i18n.t('energía del choque: {e}', { e: E }), anE = ancho(etE, { fs: 14, w: 600, sys: true });
    forma(R(X(.03) - 4, Y(E) - 24, anE + 8, 20, 6), { f: THEME.cardBg, op: .92 });
    TS(X(.03), Y(E) - 8, etE, { fs: 14, w: 600, c: colE });
    // la pareja A + B (o C ya formada) sobre el perfil
    const s = avancePerfil(c, E), bx = X(s), by = Y(alturaPerfil(s, CH_NIVEL_EA)) - 10;
    if (c.fase === 'resultado' && c.eficaz && s > .55) molC(bx, by - 4, .5, 1.05);
    else { CC(bx - 5, by, 8, { f: 'g:molA', s: ink, sw: 1.8 }); CC(bx + 5, by, 8, { f: 'g:molB', s: ink, sw: 1.8 }); }
    if (u) {
        const txt = { eficaz: i18n.t('supera la cima: se forma C'), energia: i18n.t('no llega a la cima: vuelve'), orient: i18n.t('llega, pero mal orientadas: vuelve') }[u.kind];
        TS(x, y + 46, txt, { fs: 14.5, w: 700, c: u.ok ? CF.ok : CF.no });
    }
}
