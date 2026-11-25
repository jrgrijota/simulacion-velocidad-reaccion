// ═══════════════════════════════════════════════════════════════════
//  DIBUJOS DE «VELOCIDAD DE REACCIÓN» (portados del boceto aprobado v2b)
//  Mismas coordenadas y trazados que el boceto: puesto (placa, balón,
//  termómetro, cronómetro), moléculas A, B, C y K, modelo en círculo,
//  panel de estado, curva de velocidades, tira de velocidad de reacción
//  y piezas del modo Choque. Usa las primitivas de js/dibujo-comun.js.
// ═══════════════════════════════════════════════════════════════════

Object.assign(CF, {
    A: '#4f8ef7', Ac: '#7fb0ff', B: '#f7823c', Bc: '#ffb07a', Cv: '#34c782', K: '#a78bfa',
    sitio: '#fff5d2', ok: '#34e3a8', no: '#ff8a6a', gasC: '#b9dc4a', cian: '#00c8ff',
});
Object.assign(GR, {
    pcF: ['l', [0, 0, 0, 1], [[0, '#5d7a92'], [.5, '#3f5a70'], [1, '#2c4255']]],
    pcT: ['l', [0, 1, 1, 0], [[0, '#6f8ca4'], [.55, '#8eaac0'], [1, '#6a869d']]],
    pcS: ['l', [0, 0, 0, 1], [[0, '#2f4a60'], [1, '#1c2e3e']]],
    pcPanel: ['l', [0, 0, 0, 1], [[0, '#14263a'], [1, '#1e3449']]],
    disco: ['r', [.42, .38, .75], [[0, '#f4f8fb'], [.55, '#c3d0dc'], [1, '#8da2b5']]],
    discoLado: ['l', [0, 0, 1, 0], [[0, '#6f8497'], [.35, '#c9d5e0'], [1, '#5f7487']]],
    calor: ['r', [.5, .5, .5], [[0, 'rgba(255,154,106,.9)'], [.55, 'rgba(255,122,89,.45)'], [1, 'rgba(255,122,89,0)']]],
    pomo: ['r', [.38, .32, .8], [[0, '#f4f8fb'], [.6, '#a9bacb'], [1, '#5f7487']]],
    led: ['r', [.5, .5, .5], [[0, '#ffd0b8'], [.5, '#ff7a59'], [1, '#b8432a']]],
    vidrio: ['r', [.4, .36, .66], [[0, 'rgba(233,246,255,.10)'], [.78, 'rgba(159,208,240,.08)'], [1, 'rgba(10,34,54,.42)']]],
    gasC: ['r', [.45, .6, .7], [[0, '#c8e45e'], [1, '#8fbf2a']]],
    tapon: ['l', [0, 0, 1, 0], [[0, '#6e3a2e'], [.35, '#b56a52'], [.6, '#9a5442'], [1, '#5b3026']]],
    taponT: ['r', [.4, .4, .7], [[0, '#d58a70'], [1, '#9a5442']]],
    corcho: ['l', [0, 0, 0, 1], [[0, '#d9b07a'], [1, '#9c7444']]],
    tubo: ['l', [0, 0, 1, 0], [[0, '#c9dbe8'], [.35, '#ffffff'], [1, '#b3c8d8']]],
    alcohol: ['l', [0, 0, 1, 0], [[0, '#d22c3e'], [.45, '#ff6a78'], [1, '#c0263a']]],
    bulbo: ['r', [.38, .35, .7], [[0, '#ff9aa4'], [.6, '#ff4d5e'], [1, '#b81f33']]],
    collar: ['l', [0, 0, 1, 0], [[0, '#5f7487'], [.4, '#dbe5ee'], [1, '#5f7487']]],
    crF: ['l', [0, 0, 0, 1], [[0, '#eef3f7'], [1, '#b9c8d5']]],
    crT: ['l', [0, 1, 1, 0], [[0, '#d9e3eb'], [1, '#ffffff']]],
    crS: ['l', [0, 0, 0, 1], [[0, '#93a7b8'], [1, '#6c8195']]],
    lcd: ['l', [0, 0, 0, 1], [[0, '#1d3549'], [1, '#0b1a27']]],
    molA: ['r', [.35, .3, .75], [[0, '#a9c8ff'], [.55, '#4f8ef7'], [1, '#2f62c8']]],
    molB: ['r', [.35, .3, .75], [[0, '#ffc7a0'], [.55, '#f7823c'], [1, '#c4561c']]],
    molK: ['r', [.35, .3, .75], [[0, '#ddd0ff'], [.55, '#a78bfa'], [1, '#6d50c9']]],
    molS: ['r', [.35, .3, .75], [[0, '#ffffff'], [1, '#f3d98f']]],
});

// Colores propios de los objetos en cada tema (lo de alrededor sigue al tema)
const TEMA_PROPIO = { pizarra: { foco: 1 }, dia: { foco: 0.25 }, marca: {}, contraste: {} };

// ── p5 y el lienzo 2D comparten el contexto: forma() y T() cambian fillStyle por su cuenta y
// p5 recuerda el último que puso él, así que antes de usar tarjeta() o sello() se le olvida.
function p5Limpio() { const r = p5.instance && p5.instance._renderer; if (r) { r._cachedFillStyle = null; r._cachedStrokeStyle = null; } }
const tarj = (t, rel, rad) => { p5Limpio(); tarjeta(t, rel, rad); };
const selloVR = (a, b, x, y, t0, m) => { p5Limpio(); sello(a, b, x, y, t0, m); };
// ── Utilidades de forma ────────────────────────────────────────────
const RR = (x, y, w, h, r, o) => forma(R(x, y, w, h, r), Object.assign({ bb: [x, y, w, h] }, o));
const CC = (cx, cy, r, o) => forma(E(cx, cy, r, r), Object.assign({ bb: [cx - r, cy - r, 2 * r, 2 * r] }, o));
function EE(cx, cy, rx, ry, rot, o) {
    const ctx = cx2(); ctx.save(); ctx.translate(cx, cy); ctx.rotate((rot || 0) * Math.PI / 180);
    forma(E(0, 0, rx, ry), Object.assign({ bb: [-rx, -ry, 2 * rx, 2 * ry] }, o)); ctx.restore();
}
// Sombra difusa (blur de SVG); si el navegador no filtra en el lienzo, una sombra plana más tenue
function suave(d, col, op, px) {
    const ctx = cx2();
    if ('filter' in ctx) { ctx.save(); ctx.filter = `blur(${px * (typeof pixelDensity === 'function' ? pixelDensity() : 1)}px)`; forma(d, { f: col, op }); ctx.restore(); }
    else forma(d, { f: col, op: op * 0.45 });
}
const ang = (x, y, a, r) => [x + Math.cos(a) * r, y + Math.sin(a) * r];
const coma = (x, d = 1) => x.toFixed(d).replace('.', ',');
const TS = (x, y, s, o = {}) => T(x, y, s, Object.assign({ sys: true }, o));
function ancho(s, o) { return anchoT(s, o); }
// Parte un texto en líneas que caben en w (con las medidas del lienzo)
function partir(txt, w, o) {
    const pal = String(txt).split(' '), out = []; let l = '';
    pal.forEach(p => { const t = l ? l + ' ' + p : p; if (l && ancho(t, o) > w) { out.push(l); l = p; } else l = t; });
    if (l) out.push(l);
    return out;
}
function textoLuz(col) { // texto oscuro sobre fondos claros y blanco sobre oscuros
    const h = col.replace('#', ''), r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#071a2b' : '#ffffff';
}
// Píldora con texto; devuelve el ancho
function rotulo(x, y, h, txt, fill, o = {}) {
    const fs = o.fs || 16.5, w = ancho(txt, { fs, w: 700 }) + (o.pad || 2 * fs * 1.1);
    forma(R(x, y, w, h, h / 2), { f: fill, s: o.borde || tinta(), sw: o.sw || 2.5 });
    T(x + w / 2, y + h / 2 + fs * 0.35, txt, { fs, w: 700, a: 'middle', c: o.c || textoLuz(fill) });
    return w;
}

// ── Proyección oblicua única de la serie ───────────────────────────
function arcoH(cx, cy, r, t0, t1, n = 40) {
    let d = '';
    for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; d += (i ? ' L' : 'M') + (cx + r * Math.cos(t) + r * Math.sin(t) * PDX).toFixed(1) + ' ' + (cy + r * Math.sin(t) * PDY).toFixed(1); }
    return d;
}
const elH = (cx, cy, r) => arcoH(cx, cy, r, 0, 2 * Math.PI, 64) + ' Z';
const frenteH = (cx, cy, r) => arcoH(cx, cy, r, Math.PI, 2 * Math.PI);
const bbEl = (cx, cy, r) => [cx - r * 1.056, cy - 0.26 * r, 2.112 * r, 0.52 * r];
function cilindro(cx, cy, r, h, fLado, fTapa, sw = 2.5) {
    const t = Math.atan2(PDX, 1), ink = tinta();
    const xL = cx + r * Math.cos(t + Math.PI) + r * Math.sin(t + Math.PI) * PDX, yL = cy + r * Math.sin(t + Math.PI) * PDY;
    const xR = cx + r * Math.cos(t) + r * Math.sin(t) * PDX, yR = cy + r * Math.sin(t) * PDY;
    const lado = `M${xL} ${yL - h} L${xL} ${yL} ${arcoH(cx, cy, r, t + Math.PI, t + 2 * Math.PI).replace('M', ' L')} L${xR} ${yR - h} ${arcoH(cx, cy - h, r, t, t + Math.PI).replace('M', ' L')} Z`;
    forma(lado, { f: fLado, s: ink, sw, lj: 'round', bb: [cx - r * 1.056, cy - h - 0.26 * r, 2.112 * r, h + 0.52 * r] });
    forma(elH(cx, cy - h, r), { f: fTapa, s: ink, sw, bb: bbEl(cx, cy - h, r) });
}

// ═════════ MOLÉCULAS (con tinta, brillo y sin halos) ═════════
// s: escala; a: ángulo; el sitio reactivo (extremo claro) apunta hacia a
function molAB(x, y, a, t, s = 1) {
    const ink = tinta(), ca = Math.cos(a), sa = Math.sin(a), sx = x + ca * 10 * s, sy = y + sa * 10 * s, bx = x, by = y;
    const col = t === 'A' ? CF.A : CF.B, tras = t === 'A' ? '#3b72d6' : '#b9561f';
    const d = `M${bx} ${by} L${sx} ${sy}`;
    forma(d, { s: ink, sw: 8 * s, lc: 'round' }); forma(d, { s: col, sw: 4.4 * s, lc: 'round' });
    CC(x, y, 8 * s, { f: t === 'A' ? 'g:molA' : 'g:molB', s: ink, sw: 1.9 * s });
    EE(x - 2.6 * s, y - 3 * s, 2.8 * s, 1.8 * s, -30, { f: '#fff', op: .55 });
    CC(sx, sy, 4.8 * s, { f: 'g:molS', s: ink, sw: 1.7 * s });
    if (s >= .85 && s < 2.2) T(x + .3 * s, y + 3.6 * s, t, { fs: 9.5 * s, w: 700, a: 'middle', c: '#fff', sys: true });
}
function molC(x, y, a, s = 1) {
    const ink = tinta(), ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca, D = 9.6 * s;
    const a1 = [x + ca * D, y + sa * D], a2 = [x - ca * D, y - sa * D], b1 = [x + px * D, y + py * D], b2 = [x - px * D, y - py * D];
    const rombo = `M${a1.join(' ')} L${b1.join(' ')} L${a2.join(' ')} L${b2.join(' ')} Z`;
    forma(rombo, { s: ink, sw: 6.5 * s, lj: 'round' });
    forma(rombo, { f: CF.Cv, fo: .35, s: '#9fe3bf', sw: 3 * s, lj: 'round' });
    // mismos átomos y tamaños que en A y B (grande 8, pequeño 4,8): uno azul, uno naranja y los dos pequeños blancos (se conserva la masa)
    [[a1, 'g:molA', 8], [b1, 'g:molS', 4.8], [a2, 'g:molB', 8], [b2, 'g:molS', 4.8]].forEach(([p, f, r]) => {
        CC(p[0], p[1], r * s, { f, s: ink, sw: 1.7 * s });
        CC(p[0] - r * .32 * s, p[1] - r * .36 * s, r * .28 * s, { f: '#fff', op: .6 });
    });
    if (s >= 1 && s < 2) T(x, y + 3.4 * s, 'C', { fs: 9 * s, w: 700, a: 'middle', c: '#eafff3', sys: true });
    else if (s >= 2) T(x, y + D + 5.6 * s + 22, 'C', { fs: 20, w: 700, a: 'middle', c: '#7fe3ae' });
}
function molK(x, y, a, s = 1, llenaA = false, llenaB = false) {
    const ink = tinta(), r = 13 * s;
    CC(x, y, r, { f: 'g:molK', s: ink, sw: 2.2 * s });
    EE(x - r * .38, y - r * .42, r * .32, r * .2, -30, { f: '#fff', op: .5 });
    [[a - SLOT_SPREAD, llenaA], [a + SLOT_SPREAD, llenaB]].forEach(([aa, ll]) => {
        const cx = x + Math.cos(aa) * r * .98, cy = y + Math.sin(aa) * r * .98;
        CC(cx, cy, 4.2 * s, { f: ll ? '#ffe98a' : '#3e2d7a', s: ink, sw: 1.5 * s });
    });
    T(x, y + 4 * s, 'K', { fs: 11 * s, w: 700, a: 'middle', c: '#1c1240', sys: true });
}

// ═════════ PUESTO: PLACA CON TERMOSTATO, BALÓN CERRADO, TERMÓMETRO Y CRONÓMETRO ═════════
// Coordenadas propias 420 × 370 (suelo en y = 352). conv: 0–1 de producto C. nivel: 1–10
const PU = (() => {
    const PX = 136, PW = 220, PH = 36, PD = 130, PYB = 352, PT = PYB - PH, pdx = PD * PDX, pdy = PD * PDY;
    const DX = PX + PW / 2 + pdx / 2, DY = PT + pdy / 2, DR = 60, FX = DX, FR = 80, FY = DY - 7 - FR;
    return { PX, PW, PH, PD, PYB, PT, pdx, pdy, DX, DY, DR, FX, FR, FY, NW: 19, NTOP: FY - FR - 28, W: 420, H: 372 };
})();
const ZOOM_P = [PU.FX + 44, PU.FY + 10];

function puestoBase(o) {
    const { conv, nivel, terminada, sinZoom, sinLeyenda } = o;
    const { PX, PW, PH, PYB, PT, pdx, pdy, DX, DY, DR, FX, FR, FY, NW, NTOP } = PU;
    const ink = tinta(), gl = .2 + nivel / 10 * .8, ctx = cx2();
    focoD(FX, FY + 30, 230, 210);
    // sombra suave en el suelo
    suave(`M${PX - 4} ${PYB} L${PX + pdx + 10} ${PYB + pdy + 4} H${PX + PW + pdx + 30} L${PX + PW + 26} ${PYB + 8} Z`, '#020b14', .55, 4);
    // placa: lado, tapa
    forma(`M${PX + PW} ${PT} L${PX + PW + pdx} ${PT + pdy} V${PYB + pdy} L${PX + PW} ${PYB} Z`, { f: 'g:pcS', s: ink, sw: 3.5, lj: 'round', bb: [PX + PW, PT + pdy, pdx, PYB - PT] });
    linea(`M${PX + PW + 4} ${PT + 3} L${PX + PW + pdx - 3} ${PT + pdy + 3}`, '#7f9ab0', 1.5, .6);
    forma(`M${PX} ${PT} L${PX + pdx} ${PT + pdy} H${PX + PW + pdx} L${PX + PW} ${PT} Z`, { f: 'g:pcT', s: ink, sw: 3.5, lj: 'round', bb: [PX, PT + pdy, PW + pdx, -pdy] });
    linea(`M${PX + 6} ${PT - 1.5} H${PX + PW - 4}`, '#d6e4ee', 2, .75);
    // disco calefactor con anillos torneados y el calor de la resistencia
    cilindro(DX, DY + 2, DR, 6, 'g:discoLado', 'g:disco', 2.5);
    for (let i = 1; i <= 4; i++) forma(elH(DX, DY - 4, DR * i / 5), { s: i % 2 ? '#ffffff' : '#7f93a6', sw: 1, op: .45 });
    forma(elH(DX, DY - 4, DR * .98), { f: 'g:calor', op: gl, bb: bbEl(DX, DY - 4, DR * .98) });
    // frente de la placa con su panel de mandos
    RR(PX, PT, PW, PH, 7, { f: 'g:pcF', s: ink, sw: 3.5 });
    RR(PX + 6, PT + 4, PW - 12, 2.5, 1.2, { f: '#c3d6e4', op: .55 });
    RR(PX + 14, PT + 10, PW - 28, PH - 18, 6, { f: 'g:pcPanel', s: ink, sw: 2 });
    const kx = PX + 40, ky = PT + 21;
    for (let i = 0; i < 10; i++) {
        const a = Math.PI * .8 + i / 9 * Math.PI * 1.4;
        linea(`M${kx + Math.cos(a) * 11.5} ${ky + Math.sin(a) * 11.5} L${kx + Math.cos(a) * 14} ${ky + Math.sin(a) * 14}`, i < nivel ? '#ffb08a' : '#5f7487', 1.6);
    }
    CC(kx + 1.5, ky + 2, 9.5, { f: '#020b14', op: .6 });
    CC(kx, ky, 9.5, { f: 'g:pomo', s: ink, sw: 2 });
    const ka = Math.PI * .8 + (nivel - 1) / 9 * Math.PI * 1.4;
    linea(`M${kx} ${ky} L${kx + Math.cos(ka) * 7.5} ${ky + Math.sin(ka) * 7.5}`, ink, 2.6, 1, 'round');
    suave(E(PX + 76, ky, 9, 9), '#ff7a59', .35, 2);
    CC(PX + 76, ky, 4.2, { f: 'g:led', s: ink, sw: 1.4 });
    TS(PX + 90, ky + 4.5, i18n.t('termostato'), { fs: 12.5, c: '#9fb9cc' });
    [[PX + 14, PYB], [PX + PW - 34, PYB]].forEach(([x, y]) => RR(x, y - 1, 20, 6, 2.5, { f: '#1a2733', s: ink, sw: 2 }));

    // ── balón ──
    const RRc = 34, hw = NW, yj = FY - Math.sqrt(FR * FR - hw * hw), xf = hw + 9, yf = FY - Math.sqrt(FR * FR - xf * xf);
    const nx0 = FX - NW, nx1 = FX + NW;
    const cuerpo = `M${nx0} ${NTOP} V${yj - 12} Q${nx0} ${yj - 2} ${FX - xf} ${yf} A${FR} ${FR} 0 1 0 ${FX + xf} ${yf} Q${nx1} ${yj - 2} ${nx1} ${yj - 12} V${NTOP} Z`;
    // anillo de corcho de atrás: solo se ve fuera del balón
    ctx.save(); ctx.clip(new Path2D('M-20 -20H460V400H-20Z ' + cuerpo), 'evenodd');
    cilindro(DX, DY - 4, RRc, 7, 'g:corcho', '#caa070', 2.2);
    ctx.restore();
    suave(E(FX + 22, DY - 2, 44, 9), '#020b14', .35, 2);
    ctx.save(); ctx.clip(new Path2D(cuerpo));
    RR(FX - FR, NTOP, 2 * FR, FY + FR - NTOP, 0, { f: '#ffffff', op: .07 });      // velo: A y B invisibles
    // termómetro por el centro del tapón y del cuello
    const TX = FX, TB = FY + 34;
    RR(TX - 6, NTOP - 4, 12, TB - NTOP + 4, 6, { f: 'g:tubo', s: ink, sw: 2.4 });
    const hcol = (TB - 12 - (NTOP + 26)) * (.18 + nivel / 10 * .74);
    RR(TX - 2, TB - 8 - hcol, 4, hcol + 4, 2, { f: 'g:alcohol' });
    for (let i = 0; i < 7; i++) { const yy = TB - 30 - i * 16; linea(`M${TX + 2.5} ${yy} H${TX + (i % 2 ? 5 : 6.5)}`, '#6d8396', 1.3); }
    CC(TX, TB, 9, { f: 'g:bulbo', s: ink, sw: 2.4 });
    EE(TX - 3, TB - 3.5, 2.6, 1.8, 0, { f: '#fff', op: .75 });
    // parte del tapón metida en el cuello (se ve a través del vidrio)
    const SI = NTOP + 18;
    forma(`M${FX - NW + 2} ${NTOP - 4} L${FX - NW + 3.5} ${SI} ${arcoH(FX, SI, NW - 3.5, Math.PI, 2 * Math.PI, 16).replace(/^M/, 'L')} L${FX + NW - 2} ${NTOP - 4} Z`, { f: 'g:tapon', op: .78, bb: [FX - NW + 2, NTOP - 4, 2 * NW - 4, SI - NTOP + 4 + 5] });
    forma(frenteH(FX, SI, NW - 3.5), { s: ink, sw: 1.6, op: .6 });
    if (conv > 0) RR(FX - FR, NTOP, 2 * FR, FY + FR - NTOP, 0, { f: 'g:gasC', op: conv * .6 });
    CC(FX, FY, FR, { f: 'g:vidrio' });
    CC(FX, FY, FR - 6, { s: '#d8efff', sw: 1.4, op: .28 });
    linea(`M${nx0 + 4} ${SI + 2} V${yj - 8} M${nx1 - 4} ${SI + 2} V${yj - 8}`, '#d8efff', 1.2, .3);
    suave(E(FX + 6, FY + FR - 10, 46, 12), '#ff8a6a', .06 + gl * .16, 4);
    ctx.restore();
    forma(cuerpo, { s: ink, sw: 7, lj: 'round' });
    forma(cuerpo, { s: CF.vidrio, sw: 2.6, lj: 'round' });
    // brillos
    const arc = (r, a0, a1) => `M${FX + r * Math.cos(a0)} ${FY + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${FX + r * Math.cos(a1)} ${FY + r * Math.sin(a1)}`;
    linea(arc(FR - 13, Math.PI * 1.08, Math.PI * 1.38), '#fff', 9, .42, 'round');
    linea(arc(FR - 26, Math.PI * 1.12, Math.PI * 1.3), '#fff', 3.5, .25, 'round');
    EE(FX + 36, FY - 42, 5, 3.2, -35, { f: '#fff', op: .8 });
    linea(arc(FR - 9, Math.PI * .08, Math.PI * .42), '#bfe9ff', 3, .45, 'round');
    RR(nx0 + 3.5, SI + 6, 4, Math.max(0, yj - SI - 20), 2, { f: '#fff', op: .38 });
    // anillo de corcho de delante del fondo
    ctx.save(); ctx.clip(new Path2D(R(DX - 60, DY - 9.5, 140, 30))); cilindro(DX, DY - 4, RRc, 7, 'g:corcho', '#caa070', 2.2); ctx.restore();
    // boca: reborde de vidrio y tapón de goma (tronco de cono)
    RR(nx0 - 5, NTOP - 5, 2 * NW + 10, 11, 5.5, { f: '#cfe9f7', fo: .35, s: ink, sw: 2.8 });
    RR(nx0 - 1, NTOP - 3, NW, 2.5, 1.2, { f: '#fff', op: .55 });
    const SB = NTOP - 3, ST = NTOP - 29, rb = NW - 1, rt = NW + 3;
    forma(`M${FX - rt} ${ST} L${FX - rb} ${SB} ${arcoH(FX, SB, rb, Math.PI, 2 * Math.PI, 20).replace(/^M/, 'L')} L${FX + rt} ${ST} Z`, { f: 'g:tapon', s: ink, sw: 2.8, lj: 'round', bb: [FX - rt, ST, 2 * rt, SB - ST + 5] });
    forma(elH(FX, ST, rt), { f: 'g:taponT', s: ink, sw: 2.6, bb: bbEl(FX, ST, rt) });
    linea(`M${FX - rt + 5} ${ST + 7} L${FX - rb + 3} ${SB - 4}`, '#e0a08a', 2.2, .6, 'round');
    forma(elH(TX, ST, 8), { f: '#3e1f18', s: ink, sw: 1.6 });
    RR(TX - 6, ST - 16, 12, 16, 0, { f: 'g:tubo', s: ink, sw: 2.4 });
    forma(frenteH(TX, ST, 7.2), { s: '#7a3f30', sw: 2.4 });
    RR(TX - 10, ST - 24, 20, 9, 3, { f: 'g:collar', s: ink, sw: 2 });
    const hw2 = 124, hx = TX - hw2 / 2, hy = ST - 24 - 40;
    RR(hx + 3, hy + 4, hw2, 40, 12, { f: ink, op: .55 });
    RR(hx, hy, hw2, 40, 12, { f: THEME.headBg, s: THEME.headEdge, sw: 2 });
    TS(hx + hw2 / 2, hy + 13, i18n.t('temperatura'), { fs: 11, c: THEME.headText === '#ffffff' ? '#b5d3ec' : THEME.headText, a: 'middle' });
    // el nombre del nivel se escribe en vivo (puestoVivo)
    if (!sinZoom) { CC(FX + 44, FY + 10, 13, { s: ink, sw: 5, op: .6 }); CC(FX + 44, FY + 10, 13, { s: CF.cian, sw: 2.4, dash: [5, 4] }); }

    // ── cronómetro de laboratorio (caja en la misma proyección) ──
    const cx0 = 18, cyb = 352, cw = 100, ch = 74, cD = 46, cdx = cD * PDX, cdy = cD * PDY, cy0 = cyb - ch;
    suave(`M${cx0 - 2} ${cyb} L${cx0 + cdx + 6} ${cyb + cdy + 3} H${cx0 + cw + cdx + 16} L${cx0 + cw + 12} ${cyb + 6} Z`, '#020b14', .5, 4);
    forma(`M${cx0 + cw} ${cy0} L${cx0 + cw + cdx} ${cy0 + cdy} V${cyb + cdy} L${cx0 + cw} ${cyb} Z`, { f: 'g:crS', s: ink, sw: 3, lj: 'round', bb: [cx0 + cw, cy0 + cdy, cdx, ch] });
    forma(`M${cx0} ${cy0} L${cx0 + cdx} ${cy0 + cdy} H${cx0 + cw + cdx} L${cx0 + cw} ${cy0} Z`, { f: 'g:crT', s: ink, sw: 3, lj: 'round', bb: [cx0, cy0 + cdy, cw + cdx, -cdy] });
    cilindro(cx0 + 30 + cdx / 2, cy0 + cdy / 2 + 1, 8, 5, terminada ? '#d8b22c' : '#d4553b', terminada ? CF.cam : '#ff7a59', 2);
    cilindro(cx0 + 70 + cdx / 2, cy0 + cdy / 2 + 1, 6.5, 4, '#6c8195', '#a9bacb', 2);
    RR(cx0, cy0, cw, ch, 10, { f: 'g:crF', s: ink, sw: 3 });
    RR(cx0 + 4, cy0 + 3, cw - 8, 2.5, 1.2, { f: '#fff', op: .8 });
    RR(cx0 + 8, cy0 + 10, cw - 16, 38, 6, { f: 'g:lcd', s: terminada ? CF.cam : ink, sw: terminada ? 2.6 : 2 });
    T(cx0 + cw / 2 - 6, cy0 + 38, '88,8', { fs: 23, w: 600, a: 'middle', c: '#bff3ff', op: .07 });
    T(cx0 + cw - 14, cy0 + 38, 's', { fs: 13, w: 600, a: 'middle', c: terminada ? CF.cam : '#8fd3e8' });
    RR(cx0 + 10, cy0 + 12, cw - 20, 5, 2.5, { f: '#fff', op: .1 });
    TS(cx0 + cw / 2, cy0 + 65, i18n.t('cronómetro'), { fs: 11, a: 'middle', c: '#516a80' });
    if (terminada) {
        chispaD(cx0 + cw + cdx + 4, cy0 + cdy - 10, 7); chispaD(cx0 - 2, cy0 - 8, 5.5);
        const lab = i18n.t('¡terminada!'), lw = ancho(lab, { fs: 14, w: 700 }) + 22;
        forma(R(cx0 + cw / 2 - lw / 2 + 6, cyb - ch - 40, lw, 26, 13), { f: CF.cam, s: ink, sw: 2 });
        T(cx0 + cw / 2 + 6, cyb - ch - 22, lab, { fs: 14, w: 700, a: 'middle', c: ink });
    }
    // leyenda del gas, fuera del objeto (arriba a la izquierda)
    if (!sinLeyenda) {
        const lx = 16, ly = 22;
        RR(lx, ly, 14, 14, 3.5, { f: '#fff', fo: .12, s: THEME.textDim, sw: 1.4 });
        TS(lx + 22, ly + 12, i18n.t('A y B: gases invisibles'), { fs: 14.5, c: THEME.textDim });
        RR(lx, ly + 24, 14, 14, 3.5, { f: CF.gasC, fo: .75, s: ink, sw: 1.4 });
        TS(lx + 22, ly + 36, i18n.t('C: gas de color (sí se ve)'), { fs: 14.5, c: THEME.textDim });
    }
}
// Lo que cambia en cada fotograma: el nombre del nivel y los dígitos del cronómetro
function puestoVivo(nomNivel, tiempo, terminada) {
    const FX = PU.FX, ST = PU.NTOP - 29, hy = ST - 24 - 40, hx = FX - 62;
    T(hx + 62, hy + 33.5, nomNivel, { fs: 20, w: 600, a: 'middle', c: THEME.headText });
    const cx0 = 18, cy0 = 352 - 74, cw = 100;
    const txt = tiempo >= 1000 ? String(Math.round(tiempo)) : coma(tiempo, 1);
    T(cx0 + cw / 2 - 6, cy0 + 38, txt, { fs: 23, w: 600, a: 'middle', c: terminada ? CF.cam : '#bff3ff' });
}
// Dibuja el puesto en (x, y) a escala esc, con caché de lo que no cambia en cada fotograma
const _cachePuesto = {};
function dibujarPuesto(x, y, esc, o) {
    const dpr = pixelDensity(), conv = Math.round(Math.min(1, o.conv) * 40);
    const fuente = document.fonts && document.fonts.check('600 16px Fredoka') ? 1 : 0;
    const key = [temaActual(), o.nivel, conv, o.terminada ? 1 : 0, o.sinZoom ? 1 : 0, o.sinLeyenda ? 1 : 0, dpr, fuente].join('|');
    // Un lienzo de caché por puesto (en Comparación hay dos con estados distintos: si compartieran caché se redibujarían en cada fotograma)
    const clave = [o.sinZoom ? 'z' : 'n', o.sinLeyenda ? 'l' : 'n', Math.round(x), Math.round(y)].join('|');
    let c = _cachePuesto[clave];
    if (!c) c = _cachePuesto[clave] = { cv: document.createElement('canvas'), key: '' };
    if (c.key !== key) {
        c.cv.width = Math.ceil(PU.W * dpr); c.cv.height = Math.ceil(PU.H * dpr);
        const cx = c.cv.getContext('2d'); cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, PU.W, PU.H);
        CTX_FUERA = cx;
        try { puestoBase({ conv: conv / 40, nivel: o.nivel, terminada: o.terminada, sinZoom: o.sinZoom, sinLeyenda: o.sinLeyenda }); } finally { CTX_FUERA = null; }
        c.key = key;
    }
    const ctx = drawingContext;
    ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc);
    ctx.drawImage(c.cv, 0, 0, PU.W, PU.H);
    puestoVivo(o.nomNivel, o.tiempo, o.terminada);
    ctx.restore();
}

// ═════════ MODELO EN CÍRCULO: muestra el gas del balón ═════════
// cx, cy, r: el círculo en el lienzo. mundo: el gas (coordenadas con el origen en el centro, radio R_MODELO).
// extra: { estelas, flash } para el modo Choque (se dibujan en coordenadas del círculo escaladas)
function dibujarModelo(cx, cy, r, mundo, texto, zoom, fsR, extra) {
    const ctx = drawingContext, ink = tinta(), k = r / R_MODELO;
    if (zoom) {
        const [zx, zy, zr] = zoom, a = r * .42;
        forma(`M${zx} ${zy - zr} L${cx - r * .9} ${cy - a} L${cx - r * .9} ${cy + a} L${zx} ${zy + zr} Z`, { f: CF.cian, op: .06 });
        forma(`M${zx} ${zy - zr} L${cx - r * .9} ${cy - a} M${zx} ${zy + zr} L${cx - r * .9} ${cy + a}`, { s: CF.cian, sw: 1.4, op: .4, dash: [4, 5] });
    }
    CC(cx + 4, cy + 5, r + 5, { f: ink, op: .55 });
    CC(cx, cy, r, { f: THEME.modelBg });
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.translate(cx, cy); ctx.scale(k, k);
    if (extra && extra.dibujarFondo) extra.dibujarFondo();
    // reacciones recientes: anillo amarillo discontinuo y dos chispas alrededor, nunca encima
    if (mundo) mundo.destellos.forEach(d => {
        const f = d.edad / 30, rr = 24 + d.edad * .35, a0 = ctx.globalAlpha;
        ctx.globalAlpha = a0 * (1 - f * f);
        forma(E(d.x, d.y, rr, rr), { s: CF.cam, sw: 2.4, dash: [6, 5], op: .9 });
        chispaD(d.x + rr * .8 + 8, d.y - rr * .8 - 4, 6); chispaD(d.x - rr * .85 - 7, d.y + rr * .7 + 4, 5);
        ctx.globalAlpha = a0;
    });
    if (mundo) {
        ['A', 'B', 'C', 'K'].forEach(t => mundo.mol.forEach(m => {
            if (m.tipo !== t) return;
            if (t === 'K') molK(m.x, m.y, m.angulo, ESC_MOL, !!m.slotA, !!m.slotB);
            else if (t === 'C') molC(m.x, m.y, m.angulo, ESC_MOL);
            else molAB(m.x, m.y, m.angulo, t, ESC_MOL);
        }));
    }
    if (extra && extra.dibujar) extra.dibujar();
    ctx.restore();
    CC(cx, cy, r, { s: ink, sw: 9 });
    CC(cx, cy, r + 7, { s: CF.cian, sw: 2, dash: [7, 6], op: .8 });
    if (texto) {
        const fs = fsR || 16, w = ancho(texto, { fs, w: 600 }) + 36;
        forma(R(cx - w / 2, cy + r - 16, w, 32, 16), { f: THEME.pillBg, s: THEME.accent, sw: 2 });
        T(cx, cy + r + 5.5, texto, { fs, w: 600, a: 'middle', c: THEME.text });
    }
}

// ═════════ PANEL DE ESTADO ═════════
// Curva de velocidades relativas de los choques, con Eₐ (y Eₐ con K si hay catalizador)
function dibujarDistribucion(x, y, w, h, nivel, conCat) {
    const ink = tinta();
    RR(x, y, w, h, 12, { f: THEME.paper, s: ink, sw: 2.5 });
    const gx = x + 14, gw = w - 28, top = y + 34, gb = y + h - 24, gh = gb - top - 4;
    const sg = BASE_SIGMA * Math.sqrt(nivel) * Math.SQRT2, vmax = sg * 4.5;
    const f = v => (v / (sg * sg)) * Math.exp(-(v * v) / (2 * sg * sg));
    let fMax = 0; for (let i = 0; i <= 120; i++) fMax = Math.max(fMax, f(i / 120 * vmax));
    const X = v => gx + v / vmax * gw, Y = v => gb - f(v) / fMax * gh;
    for (let i = 1; i < 6; i++) linea(`M${gx + i * gw / 6} ${top} V${gb}`, THEME.paperGrid, 1);
    let d = `M${gx} ${gb}`; for (let i = 0; i <= 60; i++) { const v = i / 60 * vmax; d += ` L${X(v)} ${Y(v)}`; }
    const ea = EA, eac = EA_CAT;
    let area = `M${X(ea)} ${gb}`; for (let i = 0; i <= 40; i++) { const v = ea + i / 40 * (vmax - ea); area += ` L${X(v)} ${Y(v)}`; } area += ` L${X(vmax)} ${gb} Z`;
    if (conCat) { let a2 = `M${X(eac)} ${gb}`; for (let i = 0; i <= 30; i++) { const v = eac + i / 30 * (ea - eac); a2 += ` L${X(v)} ${Y(v)}`; } a2 += ` L${X(ea)} ${gb} Z`; forma(a2, { f: CF.K, op: .5 }); }
    forma(area, { f: '#34c782', op: .6 });
    forma(d, { s: '#1f5fae', sw: 3.5, lj: 'round' });
    linea(`M${gx} ${gb} H${x + w - 10}`, THEME.paperInk, 2);
    const et = (xx, txt, col, tc, alDerecha) => {
        forma(`M${xx} ${top + 2} V${gb}`, { s: col, sw: 2.4, dash: [5, 4] });
        const tw = ancho(txt, { fs: 13, w: 700 }) + 16;
        let px0 = alDerecha == null ? xx - tw / 2 : Math.min(xx + 10, alDerecha) - tw;     // «Eₐ con K» acaba antes que «Eₐ»
        px0 = Math.max(x + 6, px0);
        forma(R(px0, y + 7, tw, 22, 11), { f: col, s: ink, sw: 1.6 });
        T(px0 + tw / 2, y + 23, txt, { fs: 13, w: 700, a: 'middle', c: tc });
    };
    et(X(ea), 'Eₐ', '#c23b4a', '#fff');
    if (conCat) et(X(eac), i18n.t('Eₐ con K'), '#6d50c9', '#fff', X(ea) - 22);
    const pct = Math.round(Math.exp(-(ea * ea) / (2 * sg * sg)) * 100);
    const lab = i18n.t('{pct} % supera Eₐ', { pct }), lw = ancho(lab, { fs: 14, w: 700 }) + 18;
    forma(R(x + w - 12 - lw, gb - 34, lw, 24, 12), { f: '#167a4c', s: ink, sw: 1.6 });
    T(x + w - 12 - lw / 2, gb - 17, lab, { fs: 14, w: 700, a: 'middle', c: '#fff' });
    TS(gx, y + h - 7, i18n.t('lentas'), { fs: 14, c: THEME.paperInk });
    TS(x + w - 12, y + h - 7, i18n.t('rápidas'), { fs: 14, a: 'end', c: THEME.paperInk });
}
// e = { tag, col, msg, nivel, cat, n:[A,B,C,K], pie }
function panelEstado(x, y, w, h, e, m) {
    tarj({ x, y, w, h }, THEME.pillBg, 20);
    const px = x + (m ? 20 : 24), iw = w - (m ? 40 : 48), ink = tinta();
    rotulo(px, y + 20, 32, e.tag, e.col, { fs: 16.5 });
    const fs = m ? 16.5 : 18.5, lh = fs + 7;
    const lineas = partir(e.msg, iw, { fs, w: 500 }).slice(0, 5);
    lineas.forEach((l, i) => T(px, y + 86 + i * lh, l, { fs, c: THEME.text }));
    let dy = y + 86 + (Math.max(lineas.length, 4) - 1) * lh + 24;
    linea(`M${px} ${dy} H${px + iw}`, THEME.border, 1.5);
    TS(px, dy + 26, i18n.t('Velocidad de las moléculas al chocar'), { fs: 15.5, c: THEME.textDim });
    const dh = m ? 132 : 140; dibujarDistribucion(px, dy + 38, iw, dh, e.nivel, e.cat);
    dy += 38 + dh + 18;
    linea(`M${px} ${dy} H${px + iw}`, THEME.border, 1.5);
    const sp = iw / 4;
    [['A', e.n[0]], ['B', e.n[1]], ['C', e.n[2]], ['K', e.n[3]]].forEach(([t, n], i) => {
        const ix = px + i * sp + 16, iy = dy + 34;
        if (t === 'C') molC(ix, iy, .5, 1.1); else if (t === 'K') molK(ix, iy, -1.6, 1); else molAB(ix, iy, -.5, t, 1.1);
        T(ix + 25, iy + 8, String(n), { fs: 22, w: 600, c: THEME.text });
    });
    TS(px, dy + 78, e.pie, { fs: 17, c: THEME.textDim });
}

// ═════════ TIRA: VELOCIDAD DE REACCIÓN EN PAPEL (toda la reacción) ═════════
// curvas: [{ pts:[[t, v]…], c, area, fin:'texto', lab:'texto', lx, ly, dash }]
function dibujarGrafica(x, y, w, h, curvas, tmax, ymax, m, titulo, filaLeyenda) {
    const ink = tinta();
    forma(R(x + 4, y + 5, w, h, 16), { f: ink, op: .55 });
    forma(R(x, y, w, h, 16), { f: THEME.paper, s: ink, sw: 3 });
    const gx = x + (m ? 40 : 64), gx1 = x + w - (m ? 18 : 30), gy = y + (m ? 46 : 40) + (filaLeyenda ? 30 : 0), gb = y + h - (m ? 30 : 26);
    T(x + (m ? 16 : 20), y + 26, titulo || i18n.t('Velocidad de reacción · reacciones por segundo'), { fs: m ? 14.5 : 16, w: 600, c: THEME.paperInk });
    const paso = tmax / 6;
    for (let i = 0; i <= 6; i++) {
        const t = paso * i, xx = gx + t / tmax * (gx1 - gx);
        linea(`M${xx} ${gy} V${gb}`, THEME.paperGrid, 1);
        TS(xx, gb + 18, `${Math.round(t)} s`, { fs: 14, a: 'middle', c: THEME.paperInk });
    }
    for (let j = 0; j <= 2; j++) {
        const yy = gb - j * (gb - gy) / 2;
        linea(`M${gx} ${yy} H${gx1}`, THEME.paperGrid, 1);
        TS(gx - 8, yy + 4, coma(j * ymax / 2, ymax < 2 ? 1 : 0).replace(',0', ''), { fs: 14, a: 'end', c: THEME.paperInk });
    }
    forma(`M${gx} ${gy - 4} V${gb} H${gx1}`, { s: THEME.paperInk, sw: 2 });
    curvas.forEach(cv => {
        if (!cv.pts.length) return;
        const pts = cv.pts.map(([t, v]) => [gx + t / tmax * (gx1 - gx), gb - Math.min(1, v / ymax) * (gb - gy)]);
        const d = 'M' + pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join(' L');
        if (cv.area) forma(`${d} L${pts[pts.length - 1][0]} ${gb} L${pts[0][0]} ${gb} Z`, { f: cv.c, op: .2 });
        forma(d, { s: ink, sw: 6.5, lj: 'round', lc: 'round', op: .85 });
        forma(d, { s: cv.c, sw: 4, lj: 'round', lc: 'round' });
        const [lx, ly] = pts[pts.length - 1];
        if (cv.fin) {
            linea(`M${lx} ${gy} V${gb}`, CF.cam, 16, .5);
            CC(lx, ly, 9, { f: CF.cam, s: ink, sw: 2.5 }); chispaD(lx + 15, ly - 14, 6);
            const tw = ancho(cv.fin, { fs: 14, w: 600 }) + 22;
            forma(R(lx - tw - 14, gy - 8, tw, 26, 13), { f: THEME.paperInk, s: ink, sw: 1.5 });
            T(lx - 14 - tw / 2, gy + 10, cv.fin, { fs: 14, w: 600, a: 'middle', c: THEME.paper });
        } else CC(lx, ly, 8, { f: cv.c, s: ink, sw: 2.5 });
    });
    // nombres de las curvas en píldoras de color: a la derecha del título (o en una fila propia en el móvil)
    let lx0 = x + w - 20;
    const conLab = curvas.filter(cv => cv.lab);
    if (filaLeyenda) lx0 = x + 16;
    (filaLeyenda ? conLab : conLab.slice().reverse()).forEach(cv => {
        const tw = ancho(cv.lab, { fs: 13.5, w: 700 }) + 20, by = filaLeyenda ? y + 62 : y + 24;
        const bx = filaLeyenda ? lx0 : lx0 - tw;
        forma(R(bx, by - 17, tw, 24, 12), { f: cv.c, s: ink, sw: 1.6 });
        T(bx + tw / 2, by, cv.lab, { fs: 13.5, w: 700, a: 'middle', c: '#fff' });
        if (filaLeyenda) lx0 += tw + 8; else lx0 -= tw + 8;
    });
}
// Reacciones por segundo suavizadas (media móvil de 5 s) a partir de la serie del mundo
function curvaDe(mundo) {
    const s = mundo.serie, pts = [];
    if (!s.length) return pts;
    for (let i = 0; i < s.length; i++) {
        let a = 0, n = 0;
        for (let j = Math.max(0, i - 2); j <= Math.min(s.length - 1, i + 2); j++) { a += s[j]; n++; }
        pts.push([i + 0.5, a / n]);
    }
    pts.unshift([0, pts[0][1] * 0.6]);
    if (mundo.tFin != null) { pts[pts.length - 1][0] = Math.min(pts[pts.length - 1][0], mundo.tFin); pts.push([mundo.tFin, 0]); }
    return pts;
}
const ESCALA_T = [30, 60, 120, 240, 600, 1200, 2400, 6000, 12000];
const ESCALA_Y = [1, 2, 4, 8, 16, 32, 64];
const sobre = (lista, v) => lista.find(x => x >= v) || lista[lista.length - 1];

// Leyenda del gas en dos líneas, fuera del puesto (Comparación en escritorio, bajo la etiqueta izquierda)
function leyendaGasColumna(x, y) {
    const ink = tinta();
    RR(x, y, 14, 14, 3.5, { f: '#fff', fo: .12, s: THEME.textDim, sw: 1.4 });
    TS(x + 22, y + 12, i18n.t('A y B: gases invisibles'), { fs: 14.5, c: THEME.textDim });
    RR(x, y + 24, 14, 14, 3.5, { f: CF.gasC, fo: .75, s: ink, sw: 1.4 });
    TS(x + 22, y + 36, i18n.t('C: gas de color (sí se ve)'), { fs: 14.5, c: THEME.textDim });
}

// ═════════ MODO CHOQUE ═════════
function dibujarTiraChoques(x, y, w, h, hist, m) {
    const ink = tinta();
    tarj({ x, y, w, h }, THEME.pillBg, 16);
    T(x + 24, y + 32, i18n.t('Tus choques'), { fs: 17.5, w: 600, c: THEME.text });
    const ef = hist.filter(c => c.ok).length;
    TS(x + 24 + ancho(i18n.t('Tus choques'), { fs: 17.5, w: 600 }) + 16, y + 32, hist.length ? (hist.length === 1 ? i18n.t('1 lanzamiento') : i18n.t('{n} lanzamientos', { n: hist.length })) + ' · ' + (ef === 1 ? i18n.t('1 eficaz') : i18n.t('{e} eficaces', { e: ef })) : i18n.t('Todavía no has lanzado'), { fs: 15.5, c: THEME.textDim });
    const items = hist.slice(-4);
    for (let i = 0; i < 4; i++) {
        const c = items[i - (4 - items.length)];                // los vacíos primero; el último, a la derecha (o abajo)
        const [cx, cy, cw, ch] = m ? [x + 14, y + 52 + i * 66, w - 28, 58] : [x + 24 + i * 322, y + 48, 306, 60];
        if (c) celdaChoque(cx, cy, cw, ch, c, i === 3);
        else forma(R(cx, cy, cw, ch, 14), { s: THEME.border, sw: 1.5, dash: [6, 6], op: .6 });
    }
}
function celdaChoque(x, y, w, h, c, ultimo) {
    const ink = tinta();
    forma(R(x, y, w, h, 14), { f: THEME.cardBg, s: ultimo ? CF.cam : THEME.border, sw: ultimo ? 2.5 : 1.5 });
    const col = c.ok ? CF.ok : CF.no;
    CC(x + 30, y + h / 2, 15, { f: col, s: ink, sw: 2.5 });
    T(x + 30, y + h / 2 + 6, c.ok ? '✓' : '✗', { fs: 16, w: 700, a: 'middle', c: '#071a2b', sys: true });
    T(x + 56, y + h / 2 - 3, c.titulo, { fs: 16, w: 600, c: THEME.text });
    TS(x + 56, y + h / 2 + 17, c.sub, { fs: 14.5, c: THEME.textDim });
    if (ultimo) TS(x + w - 12, y + h / 2 - 3, i18n.t('último'), { fs: 14, a: 'end', c: THEME.change });
}
