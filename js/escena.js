// ═══════════════════════════════════════════════════════════════════
//  ESCENA DE «VELOCIDAD DE REACCIÓN» (plantilla común v1.1)
//  Común: js/escena-comun.js, arranque-comun.js, dibujo-comun.js, retos-comun.js.
//  Aquí: retícula de los tres modos (Reacción, Comparar, Choque), el puesto con su
//  balón, el modelo de moléculas, el panel de estado, la tira de velocidad de
//  reacción y los mandos. Física en js/fisica.js, choque en js/choque.js y
//  dibujos del boceto aprobado en js/dibujo.js.
// ═══════════════════════════════════════════════════════════════════
let CV_W = 1330, CV_H = 696;       // usados por arranque-comun.js
let ESC_MOVIL = null;
let LAY = null;                    // retícula del modo y del dispositivo actuales

const NOMBRES_NIVEL = ['', 'Muy baja', 'Baja', 'Moderada', 'Normal', 'Alta', 'Muy alta', 'Elevada', 'Intensa', 'Extrema', 'Máxima'];
const nomNivel = (n) => i18n.t(NOMBRES_NIVEL[n]);
const textoNivel = (n) => `${nomNivel(n)} (${n})`;
const COL_IZQ = '#2f6fd0', COL_DER = '#1f9e66';
const PRESETS = {
    energy:   { nom: 'Temperatura',        min: 1, max: 10, izq: 2, der: 8 },
    count:    { nom: 'Moléculas A = B',    min: 4, max: 30, izq: 8, der: 24 },
    catalyst: { nom: 'Catalizadores',      min: 0, max: 6,  izq: 0, der: 4 },
};
const S = {
    modo: 'reaccion', cmp: 'catalyst', pausado: false,
    mundos: [], choque: new Choque(), tmax: 30, ymax: 1, cmpListo: false, ganador: -1, tSello: 0, finRegistrado: false,
};
const elId = (id) => document.getElementById(id);

// ── Retícula ─────────────────────────────────────────────────────────
function disponerReaccion(m) {
    if (!m) return {
        w: 1330, h: 696, tarjetas: [{ x: 0, y: 0, w: 1330, h: 556 }],
        puestos: [{ x: 0, y: 0, esc: 1, sinZoom: false, sinLeyenda: false }],
        modelos: [{ cx: 664, cy: 262, r: 222, txt: 'Modelo: así imaginamos las moléculas', zoom: [ZOOM_P[0], ZOOM_P[1], 13], fs: 16 }],
        panel: { x: 910, y: 20, w: 400, h: 516, m: false }, graf: { x: 0, y: 568, w: 1330, h: 128, m: false },
        sello: { x: 1167, y: 628, m: false }, mandos: { x: 22, y: 372, w: 384 },
    };
    return {
        w: 370, h: 1590, tarjetas: [{ x: 0, y: 0, w: 370, h: 500 }, { x: 0, y: 1018, w: 370, h: 396 }],
        puestos: [{ x: 4, y: 10, esc: .86, sinZoom: true, sinLeyenda: false }],
        modelos: [{ cx: 185, cy: 1202, r: 166, txt: 'Modelo de moléculas', zoom: null, fs: 14.5 }],
        panel: { x: 0, y: 516, w: 370, h: 486, m: true }, graf: { x: 0, y: 1430, w: 370, h: 160, m: true, tit: 'Velocidad de reacción (reacciones/s)' },
        sello: { x: 185, y: 1410, m: true }, mandos: { x: 14, y: 324, w: 342 },
    };
}
function disponerComparar(m) {
    if (!m) {
        const lados = [0, 1].map(i => {
            const ox = i * 665, esc = .84;
            return { tag: { x: ox + 24, y: 18 }, puesto: { x: ox - 8, y: 96, esc, sinZoom: false, sinLeyenda: i === 1 },
                modelo: { cx: ox + 477, cy: 222, r: 180, txt: 'Modelo de moléculas', fs: 14.5, zoom: [ox - 8 + ZOOM_P[0] * esc, 96 + ZOOM_P[1] * esc, 10] },
                barra: { x: ox + 322, y: 428, w: 300 }, texto: { x: ox + 477, y: 460 }, mando: { x: ox + 28, y: 484, w: 608 } };
        });
        return { w: 1330, h: 696, tarjetas: [{ x: 0, y: 0, w: 1330, h: 540 }], lados, divisor: { x: 665, y1: 24, y2: 516 },
            graf: { x: 0, y: 552, w: 900, h: 144, m: false }, igual: { x: 916, y: 552, w: 414, h: 144 }, sello: { x: 743, y: 634, m: true },
            mandos: { x: 938, y: 588, w: 372, compacto: true } };
    }
    const lados = [0, 1].map(i => {
        const y0 = i * 692;
        return { tag: { x: 14, y: y0 + 14 }, puesto: { x: 55, y: y0 + 52, esc: .62, sinZoom: true, sinLeyenda: i === 1 },
            modelo: { cx: 185, cy: y0 + 476, r: 130, txt: 'Modelo de moléculas', fs: 13.5, zoom: null },
            barra: { x: 40, y: y0 + 292, w: 290 }, texto: { x: 185, y: y0 + 326 }, mando: { x: 14, y: y0 + 622, w: 342 } };
    });
    return { w: 370, h: 1810, tarjetas: [{ x: 0, y: 0, w: 370, h: 676 }, { x: 0, y: 692, w: 370, h: 676 }], lados,
        graf: { x: 0, y: 1384, w: 370, h: 200, m: true, tit: 'Velocidad de reacción (reacciones/s)', filaLeyenda: true },
        igual: { x: 0, y: 1600, w: 370, h: 200 }, sello: { x: 185, y: 1360, m: true }, mandos: { x: 14, y: 1636, w: 342, compacto: true } };
}
function disponerChoque(m) {
    if (!m) return {
        w: 1330, h: 696, tarjetas: [{ x: 0, y: 0, w: 880, h: 556 }],
        modelo: { cx: 420, cy: 268, r: 222, txt: 'Modelo: así imaginamos dos moléculas que chocan', fs: 16 },
        panel: { x: 896, y: 0, w: 434, h: 330, m: false }, controles: { x: 896, y: 346, w: 434, h: 210 },
        tira: { x: 0, y: 568, w: 1330, h: 128, m: false }, sello: { x: 758, y: 46, m: true }, mandos: { x: 920, y: 368, w: 386 },
    };
    return {
        w: 370, h: 1360, tarjetas: [{ x: 0, y: 0, w: 370, h: 420 }],
        modelo: { cx: 185, cy: 206, r: 166, txt: 'Dos moléculas que chocan', fs: 14.5 },
        panel: { x: 0, y: 436, w: 370, h: 352, m: true }, controles: { x: 0, y: 804, w: 370, h: 200 },
        tira: { x: 0, y: 1020, w: 370, h: 340, m: true }, sello: { x: 185, y: 30, m: true }, mandos: { x: 14, y: 820, w: 342 },
    };
}
function calcularEscena() {          // devuelve true si cambia el tamaño del lienzo
    const movil = esMovil(), antes = CV_W + 'x' + CV_H;
    ESC_MOVIL = movil;
    LAY = S.modo === 'reaccion' ? disponerReaccion(movil) : S.modo === 'comparar' ? disponerComparar(movil) : disponerChoque(movil);
    CV_W = LAY.w; CV_H = LAY.h;
    colocarMandos();
    return antes !== CV_W + 'x' + CV_H;
}
function colocarMandos() {
    if (!LAY) return;
    const c = elId('mandos-comun'), compara = S.modo === 'comparar';
    c.classList.toggle('compacto', !!LAY.mandos.compacto);
    if (S.modo === 'choque') colocarSobreLienzo(elId('mandos-choque'), LAY.mandos, CV_W, CV_H);
    else colocarSobreLienzo(c, LAY.mandos, CV_W, CV_H);
    if (compara) {
        colocarSobreLienzo(elId('mandos-izq'), LAY.lados[0].mando, CV_W, CV_H);
        colocarSobreLienzo(elId('mandos-der'), LAY.lados[1].mando, CV_W, CV_H);
    }
}

// ── Mundos y estado ──────────────────────────────────────────────────
function leerConfig() { return { nivel: +elId('sl-nivel').value, nK: +elId('sl-cat').value, nA: +elId('sl-na').value, nB: +elId('sl-nb').value }; }
function configLado(i) {
    const c = leerConfig(), v = +elId(i ? 'sl-der' : 'sl-izq').value;
    if (S.cmp === 'energy') c.nivel = v; else if (S.cmp === 'count') { c.nA = v; c.nB = v; } else c.nK = v;
    return c;
}
function construir() {
    if (S.modo === 'reaccion') S.mundos = [new Mundo(leerConfig())];
    else if (S.modo === 'comparar') S.mundos = [new Mundo(configLado(0)), new Mundo(configLado(1))];
    else S.mundos = [];
    S.tmax = 30; S.ymax = 1; S.cmpListo = false; S.ganador = -1; S.finRegistrado = false; S.tSello = 0;
    pausar(false);
}
function pausar(v) { S.pausado = v; elId('btn-pausa').textContent = v ? i18n.t('▶ Reanudar') : i18n.t('❚❚ Pausar'); }
function etiquetaLado(i) {
    const v = +elId(i ? 'sl-der' : 'sl-izq').value, pre = i ? '▶ ' : '◀ ';
    if (S.cmp === 'energy') return pre + i18n.t('Temperatura {n}', { n: nomNivel(v) });
    if (S.cmp === 'count') return pre + i18n.t('{n} A + {n} B', { n: v });
    return pre + (v === 0 ? i18n.t('Sin catalizador') : v === 1 ? i18n.t('Con 1 catalizador') : i18n.t('Con {n} catalizadores', { n: v }));
}

// ── Mensajes del panel de estado ─────────────────────────────────────
const plural = (n, uno, varios) => i18n.t(n === 1 ? uno : varios, { n });
function estadoPanel(w) {
    const nK = w.nK, n = [w.contar('A'), w.contar('B'), w.contar('C'), w.contar('K')];
    let e = { nivel: w.nivel, cat: nK > 0, n };
    if (w.tFin != null) {
        const t = coma(w.tFin, 1);
        let msg = i18n.t('Ya no quedan parejas de A y B: se han gastado los reactivos.') + ' ' +
            (nK > 0 ? plural(nK, 'Con {n} catalizador ha tardado ' + t + ' s.', 'Con {n} catalizadores ha tardado ' + t + ' s.') + ' ' + i18n.t('El catalizador sale intacto.')
                    : i18n.t('Sin catalizador ha tardado {t} s.', { t }));
        if (w.nA !== w.nB) msg += ' ' + i18n.t('Sobra {x}: el limitante era {y}.', { x: w.nA > w.nB ? 'A' : 'B', y: w.nA > w.nB ? 'B' : 'A' });
        Object.assign(e, { tag: i18n.t('REACCIÓN COMPLETA'), col: CF.cam, msg,
            pie: i18n.t('{n} reacciones: {t} por choque directo · {k} con K', { n: w.total, t: w.termicas, k: w.catalizadas }) });
    } else if (nK > 0) {
        Object.assign(e, { tag: plural(nK, '{n} CATALIZADOR', '{n} CATALIZADORES'), col: CF.K,
            msg: i18n.t('El catalizador sujeta A y B ya bien orientadas y les basta una energía de activación menor: reaccionan más a menudo.') });
    } else {
        Object.assign(e, { tag: i18n.t('SIN CATALIZADOR'), col: '#9ec9ff',
            msg: i18n.t('Solo reaccionan los choques con energía suficiente (más que Eₐ) y con los sitios reactivos de frente.') });
    }
    if (w.tFin == null) e.pie = i18n.t('{n} de {total} reacciones · {p} %', { n: w.total, total: w.limitante, p: w.porcentaje() });
    return e;
}

// ── Dibujo por modo ──────────────────────────────────────────────────
function datosPuesto(w, p) {
    return { conv: w.conversion(), nivel: w.nivel, terminada: w.tFin != null, tiempo: w.tiempo(), nomNivel: nomNivel(w.nivel), sinZoom: p.sinZoom, sinLeyenda: p.sinLeyenda };
}
function curvaGrafica(w, c, o) {
    const pts = curvaDe(w);
    return Object.assign({ pts, c, area: true }, o);
}
function ajustarEjes(mundos) {
    let t = 0, pico = 0;
    mundos.forEach(w => { t = Math.max(t, w.tiempo()); curvaDe(w).forEach(p => { pico = Math.max(pico, p[1]); }); });
    const algunaFin = mundos.some(w => w.tFin != null);
    S.tmax = Math.max(S.tmax, sobre(ESCALA_T, t / (algunaFin ? 0.72 : 0.92)));
    S.ymax = Math.max(S.ymax, sobre(ESCALA_Y, pico * 1.15));
}
function dibujarReaccion() {
    const w = S.mundos[0], p = LAY.puestos[0], mo = LAY.modelos[0];
    LAY.tarjetas.forEach(t => tarj(t));
    dibujarPuesto(p.x, p.y, p.esc, datosPuesto(w, p));
    dibujarModelo(mo.cx, mo.cy, mo.r, w, i18n.t(mo.txt), mo.zoom, mo.fs);
    const e = estadoPanel(w);
    panelEstado(LAY.panel.x, LAY.panel.y, LAY.panel.w, LAY.panel.h, e, LAY.panel.m);
    anunciar({ tag: e.tag, txt: e.msg });
    ajustarEjes([w]);
    const g = LAY.graf;
    dibujarGrafica(g.x, g.y, g.w, g.h, [curvaGrafica(w, COL_DER, { fin: w.tFin != null ? i18n.t('{t} s: se acaban los reactivos', { t: coma(w.tFin) }) : null })],
        S.tmax, S.ymax, g.m, g.tit && i18n.t(g.tit));
    if (w.tFin != null) selloVR(i18n.t('¡REACCIÓN COMPLETA!'), i18n.t('en {t} s · {c}', { t: coma(w.tFin), c: w.nK > 0 ? plural(w.nK, 'con {n} catalizador', 'con {n} catalizadores') : i18n.t('sin catalizador') }), LAY.sello.x, LAY.sello.y, S.tSello, LAY.sello.m);
}
function dibujarComparar() {
    LAY.tarjetas.forEach(t => tarj(t));
    if (LAY.divisor) forma(`M${LAY.divisor.x} ${LAY.divisor.y1} V${LAY.divisor.y2}`, { s: THEME.border, sw: 2, dash: [8, 8] });
    S.mundos.forEach((w, i) => {
        const L = LAY.lados[i], tag = etiquetaLado(i);
        const tw = ancho(tag, { fs: 16, w: 600 }) + 34;
        forma(R(L.tag.x, L.tag.y, tw, 32, 16), { f: THEME.pillBg, s: i ? COL_DER : COL_IZQ, sw: 2.5 });
        T(L.tag.x + tw / 2, L.tag.y + 22, tag, { fs: 16, w: 600, a: 'middle', c: THEME.text });
        dibujarPuesto(L.puesto.x, L.puesto.y, L.puesto.esc, datosPuesto(w, L.puesto));
        dibujarModelo(L.modelo.cx, L.modelo.cy, L.modelo.r, w, i18n.t(L.modelo.txt), L.modelo.zoom, L.modelo.fs);
        const b = L.barra;
        forma(R(b.x, b.y, b.w, 12, 6), { f: THEME.hundido, s: THEME.border, sw: 1.5 });
        if (w.conversion() > 0) forma(R(b.x, b.y, Math.max(12, b.w * w.conversion()), 12, 6), { f: '#34c782', s: tinta(), sw: 1.5 });
        T(L.texto.x, L.texto.y, i18n.t('{n} de {total} reacciones · {p} %', { n: w.total, total: w.limitante, p: w.porcentaje() }), { fs: 15.5, w: 600, a: 'middle', c: THEME.text });
    });
    ajustarEjes(S.mundos);
    const g = LAY.graf, ig = LAY.igual;
    dibujarGrafica(g.x, g.y, g.w, g.h, S.mundos.map((w, i) => curvaGrafica(w, i ? COL_DER : COL_IZQ,
        { lab: etiquetaLado(i).replace(/^[◀▶] /, (i ? '▶ ' : '◀ ')).toLowerCase(), fin: w.tFin != null ? coma(w.tFin) + ' s' : null })),
        S.tmax, S.ymax, g.m, g.tit && i18n.t(g.tit), g.filaLeyenda);
    tarj(ig, THEME.pillBg, 16);
    T(ig.x + 22, ig.y + 28, i18n.t('Igual en los dos'), { fs: 15, w: 600, c: THEME.textDim });
    if (S.cmpListo && S.ganador >= 0) {
        const w = S.mundos[S.ganador], L = etiquetaLado(S.ganador).replace(/^[◀▶] /, '');
        selloVR(i18n.t('¡TERMINA ANTES!'), `${L}: ${coma(w.tFin)} s`, LAY.sello.x, LAY.sello.y, S.tSello, LAY.sello.m);
    }
}
function dibujarChoque() {
    const c = S.choque, mo = LAY.modelo, k = mo.r / R_MODELO;
    LAY.tarjetas.forEach(t => tarj(t));
    const extra = { dibujarFondo: () => {
        c.dibujarFondo();
        if (c.fase === 'resultado' && c.eficaz) {
            TS(-150, -16, i18n.t('A llegaba por aquí'), { fs: 13, a: 'middle', c: THEME.textDim }); TS(150, -16, i18n.t('B llegaba por aquí'), { fs: 13, a: 'middle', c: THEME.textDim });
        }
    }, dibujar: () => c.dibujar() };
    dibujarModelo(mo.cx, mo.cy, mo.r, null, i18n.t(mo.txt), null, mo.fs, extra);
    const P = LAY.panel;
    dibujarPanelChoque(P.x, P.y, P.w, P.h, c, +elId('sl-energia').value, P.m);
    tarj(LAY.controles, THEME.cardBg, 20);
    const tr = LAY.tira; dibujarTiraChoques(tr.x, tr.y, tr.w, tr.h, c.historial, tr.m);
    if (c.fase === 'resultado' && c.eficaz) selloVR(i18n.t('¡CHOQUE EFICAZ!'), 'A + B → C', LAY.sello.x, LAY.sello.y, S.tSello, LAY.sello.m);
    anunciar({ tag: mensajeChoque(c).tag, txt: mensajeChoque(c).msg });
}

// ── Bucle ────────────────────────────────────────────────────────────
function setup() {
    if (document.fonts) { document.fonts.load('600 16px Fredoka'); document.fonts.load('700 16px Fredoka'); }
    calcularEscena();
    const cv = createCanvas(CV_W, CV_H);
    cv.parent('canvas-container');
    iniciarSelectorTema();
    configurarPar();
    construir();
    iniciarEventos(cv.elt);
    fitCanvas();
    actualizarUI();
}
function avanzar() {
    if (S.modo === 'choque') {
        const c = S.choque, antes = c.fase;
        c.paso();
        if (antes === 'vuelo' && c.fase === 'resultado') {
            S.tSello = millis(); retoChoque(c.ultimo.kind);
            if (c.ultimo.kind !== 'ambas') retoSello(c.ultimo.kind);
        }
        return;
    }
    if (S.pausado) return;
    S.mundos.forEach(w => w.paso());
    if (S.modo === 'reaccion') {
        const w = S.mundos[0];
        if (w.tFin != null && !S.finRegistrado) {
            S.finRegistrado = true; S.tSello = millis();
            retoSello('completa'); if (w.nK > 0) retoSello('cat'); if (w.nA !== w.nB) { retoSello('sobra'); retoHecho('sobra'); }
            if (w.tFin < 30) { retoHecho('rapida'); if (w.nivel <= 2 && w.nK > 0) retoHecho('fria'); }
        }
    } else if (S.modo === 'comparar' && !S.cmpListo && S.mundos.some(w => w.tFin != null)) {
        S.cmpListo = true; S.tSello = millis();
        const [a, b] = S.mundos;
        S.ganador = a.tFin != null && b.tFin != null ? (a.tFin <= b.tFin ? 0 : 1) : (a.tFin != null ? 0 : 1);
        retoCmp(S.cmp);
        pausar(true);
    }
}
function draw() {
    actualizarTema(TEMA_PROPIO);
    vigilarRendimiento();
    clear();
    avanzar();
    if (S.modo === 'reaccion') dibujarReaccion(); else if (S.modo === 'comparar') dibujarComparar(); else dibujarChoque();
}

// ── Interfaz ─────────────────────────────────────────────────────────
function actualizarUI() {
    document.body.classList.remove('modo-reaccion', 'modo-comparar', 'modo-choque');
    document.body.classList.add('modo-' + S.modo);
    const compara = S.modo === 'comparar';
    document.querySelectorAll('[data-modo]').forEach(b => { const on = b.dataset.modo === S.modo; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
    document.querySelectorAll('[data-cmp]').forEach(b => { const on = b.dataset.cmp === S.cmp; b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); });
    elId('fila-nivel').hidden = compara && S.cmp === 'energy';
    elId('fila-cat').hidden = compara && S.cmp === 'catalyst';
    elId('fila-na').hidden = elId('fila-nb').hidden = compara && S.cmp === 'count';
    const p = PRESETS[S.cmp];
    document.querySelectorAll('.nom-cmp').forEach(n => { n.textContent = i18n.t(p.nom); });
    const frases = {
        reaccion: [i18n.t('Solo reaccionan los choques con energía suficiente (más que Eₐ) y con los sitios reactivos de frente.'), i18n.t('El catalizador (K) sujeta A y B ya bien orientadas y les basta menos energía.')],
        comparar: [i18n.t({ catalyst: 'Solo cambia el catalizador; lo demás es igual en los dos.', energy: 'Solo cambia la temperatura; lo demás es igual en los dos.', count: 'Solo cambia la cantidad de moléculas; lo demás es igual en los dos.' }[S.cmp]), i18n.t('¿Cuál termina antes?')],
        choque: [i18n.t('Gira cada molécula arrastrándola y lánzalas una contra otra.'), i18n.t('Solo reaccionan si chocan con energía suficiente y con los sitios reactivos de frente.')],
    }[S.modo];
    elId('frase').innerHTML = `<strong>${frases[0]}</strong><br><em>${frases[1]}</em>`;
    document.querySelectorAll('input[type=range]').forEach(pintarRelleno);
    mostrarValores();
}
function mostrarValores() {
    elId('val-nivel').textContent = textoNivel(+elId('sl-nivel').value);
    ['cat', 'na', 'nb', 'energia'].forEach(k => { elId('val-' + k).textContent = elId('sl-' + k).value; });
    ['izq', 'der'].forEach(k => { const v = +elId('sl-' + k).value; elId('val-' + k).textContent = S.cmp === 'energy' ? textoNivel(v) : String(v); });
}
function configurarPar() {
    const p = PRESETS[S.cmp];
    [['izq', p.izq], ['der', p.der]].forEach(([k, v]) => { const s = elId('sl-' + k); s.min = p.min; s.max = p.max; s.value = v; });
}
function cambiarModo(m) {
    if (m === S.modo) return;
    S.modo = m;
    if (m === 'choque') S.choque.reiniciar(false);
    construir();
    actualizarUI();
    calcularEscena(); resizeCanvas(CV_W, CV_H);
    fitCanvas();
}
function cambiarComparacion(v) { S.cmp = v; configurarPar(); construir(); actualizarUI(); }
function coordsLienzo(e) {
    const cv = document.querySelector('#canvas-container canvas'), r = cv.getBoundingClientRect();
    const t = e.touches && e.touches[0] ? e.touches[0] : (e.changedTouches && e.changedTouches[0]) || e;
    const mo = LAY.modelo, k = mo.r / R_MODELO;
    return { x: ((t.clientX - r.left) / r.width * CV_W - mo.cx) / k, y: ((t.clientY - r.top) / r.height * CV_H - mo.cy) / k };
}
function iniciarEventos(cv) {
    document.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => cambiarModo(b.dataset.modo)));
    document.querySelectorAll('[data-cmp]').forEach(b => b.addEventListener('click', () => cambiarComparacion(b.dataset.cmp)));
    elId('btn-pausa').addEventListener('click', () => pausar(!S.pausado));
    elId('btn-reiniciar').addEventListener('click', construir);
    // Mandos del gas
    elId('sl-nivel').addEventListener('input', () => {
        const n = +elId('sl-nivel').value; if (!(S.modo === 'comparar' && S.cmp === 'energy')) S.mundos.forEach(w => w.cambiarNivel(n));
        pintarRelleno(elId('sl-nivel')); mostrarValores();
    });
    elId('sl-cat').addEventListener('input', () => {
        const n = +elId('sl-cat').value; if (!(S.modo === 'comparar' && S.cmp === 'catalyst')) S.mundos.forEach(w => w.cambiarCatalizadores(n));
        pintarRelleno(elId('sl-cat')); mostrarValores();
    });
    ['sl-na', 'sl-nb'].forEach(id => {
        elId(id).addEventListener('input', () => { pintarRelleno(elId(id)); mostrarValores(); });
        elId(id).addEventListener('change', construir);
    });
    // Comparar: el mando de cada lado
    ['izq', 'der'].forEach((k, i) => {
        const s = elId('sl-' + k);
        s.addEventListener('input', () => {
            pintarRelleno(s); mostrarValores();
            const w = S.mundos[i], v = +s.value; if (!w) return;
            if (S.cmp === 'energy') w.cambiarNivel(v); else if (S.cmp === 'catalyst') w.cambiarCatalizadores(v);
        });
        s.addEventListener('change', () => { if (S.cmp === 'count') construir(); });
    });
    // Choque
    elId('sl-energia').addEventListener('input', () => { pintarRelleno(elId('sl-energia')); mostrarValores(); });
    elId('btn-lanzar').addEventListener('click', () => S.choque.lanzar(+elId('sl-energia').value));
    elId('btn-colocar').addEventListener('click', () => S.choque.colocar());
    // Girar las moléculas del modo Choque (ratón y dedo)
    const pulsar = (e) => { if (S.modo !== 'choque') return; const p = coordsLienzo(e); if (S.choque.pulsar(p.x, p.y) && e.cancelable) e.preventDefault(); };
    const mover = (e) => { if (S.modo !== 'choque' || !S.choque.arrastre) return; const p = coordsLienzo(e); S.choque.arrastrar(p.x, p.y); if (e.cancelable) e.preventDefault(); };
    const soltar = () => S.choque.soltar();
    cv.addEventListener('mousedown', pulsar); window.addEventListener('mousemove', mover); window.addEventListener('mouseup', soltar);
    cv.addEventListener('touchstart', pulsar, { passive: false }); cv.addEventListener('touchmove', mover, { passive: false });
    cv.addEventListener('touchend', soltar); cv.addEventListener('touchcancel', soltar);
    // Paneles, pantalla completa, tema recordado
    iniciarPopover('btn-ayuda', 'panel-ayuda');
    elId('check-pantalla').addEventListener('change', (e) => {
        try {
            if (e.target.checked && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
            else if (!e.target.checked && document.fullscreenElement) document.exitFullscreen();
        } catch (err) { /* nada */ }
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) elId('check-pantalla').checked = false; setTimeout(fitCanvas, 100); });
    document.querySelectorAll('.theme-opt').forEach(b => b.addEventListener('click', () => { try { localStorage.setItem('sim-vr-tema', b.dataset.theme); } catch (e) { /* nada */ } _cachePuesto.n = null; }));
    const t = temaActual(), clave = { pizarra: 'dark', dia: 'light', marca: 'marca', contraste: 'contrast' }[t];
    document.querySelectorAll('.theme-opt').forEach(b => b.classList.toggle('active', b.dataset.theme === clave));
    // En los grupos de opciones, las flechas pasan a la opción vecina
    document.querySelectorAll('.carril[role="radiogroup"], .carril[role="tablist"]').forEach(grupo => {
        grupo.addEventListener('keydown', (e) => {
            const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (!paso) return;
            const bs = [...grupo.querySelectorAll('.carril-btn')], i = bs.indexOf(document.activeElement);
            if (i < 0) return;
            e.preventDefault(); const b = bs[(i + paso + bs.length) % bs.length]; b.focus(); b.click();
        });
    });
    // Dirección con ajustes (fichas del alumnado): ver js/parametros.js
    const alias = (map, f) => (v) => f(map[v] || v);
    aplicarParametrosUrl({
        tema:        (v) => { const t = { simulaciencia: 'marca', marca: 'marca', claro: 'light', oscuro: 'dark', contraste: 'contrast' }[v]; const b = t && document.querySelector(`.theme-opt[data-theme="${t}"]`); if (b) b.click(); },
        modo:        alias({ 'reacción': 'reaccion', comparacion: 'comparar', 'comparación': 'comparar' }, (v) => { if (['reaccion', 'comparar', 'choque'].includes(v)) cambiarModo(v); }),
        comparar:    alias({ catalizador: 'catalyst', temperatura: 'energy', cantidad: 'count' }, (v) => { if (PRESETS[v]) cambiarComparacion(v); }),
        temperatura: urlParam.range('sl-nivel'),
        a:           urlParam.range('sl-na'),
        b:           urlParam.range('sl-nb'),
        catalizador: urlParam.range('sl-cat'),
        izquierda:   urlParam.range('sl-izq'),
        derecha:     urlParam.range('sl-der'),
        energia:     urlParam.range('sl-energia'),
        retos:       (v) => { if (['1', 'si', 'sí', 'true'].includes(v)) abrirRetos(); },
    });
}
