// RETOS Y ÁLBUM de «Velocidad de reacción». Lo común está en js/retos-comun.js (crearRetos).
// Ocultos tras «★ Retos» (o ?retos=1). Se guardan en este navegador (localStorage).
//   datos.hechos[id]  retos de un solo paso
//   datos.cmp[var]    variables ya comparadas en «Comparar» (catalyst, energy, count)
//   datos.ch[kind]    resultados vistos en «Choque» (eficaz, energia, orient, ambas)
const RETOS_VR = crearRetos({
    clave: 'simulaciencia-velocidad-reaccion-retos',
    titulo: 'Velocidad de reacción',
    retos: [
        { id: 'rapida', txt: 'Completa una reacción en menos de 30 s', pista: 'Los catalizadores ayudan mucho.' },
        { id: 'fria', txt: 'Consigue ese tiempo con la temperatura en «Baja» o menos, usando catalizadores' },
        { id: 'sobra', txt: 'Termina una reacción en la que sobre reactivo (A y B distintos) y averigua cuál era el limitante' },
        { id: 'comparar', n: 3, txt: 'En Comparar, averigua con cada una de las tres variables cuál hace terminar antes' },
        { id: 'choques', n: 4, txt: 'En Choque, consigue los cuatro resultados: eficaz, le falta energía, mal orientadas y las dos cosas' },
    ],
    progreso: (r, d) => {
        if (r.id === 'comparar') return Object.keys(d.cmp || {}).length / 3;
        if (r.id === 'choques') return Object.keys(d.ch || {}).length / 4;
        return d.hechos[r.id] ? 1 : 0;
    },
    album: {
        ids: ['eficaz', 'energia', 'orient', 'completa', 'cat', 'sobra'],
        mini: (k) => ({ eficaz: { txt: '✓', col: '#34e3a8', titulo: 'Choque eficaz' }, energia: { txt: 'Eₐ', col: '#ff8a6a', titulo: 'Le falta energía' },
            orient: { txt: '↻', col: '#ffb08a', titulo: 'Mal orientadas' }, completa: { txt: '100', col: '#ffd84a', titulo: 'Reacción completa' },
            cat: { txt: 'K', col: '#a78bfa', titulo: 'Con catalizador' }, sobra: { txt: '±', col: '#7fb0ff', titulo: 'Sobra reactivo' } }[k]),
        celda: (k, ok) => {
            const t = { eficaz: ['Choque eficaz', 'energía y orientación'], energia: ['Le falta energía', 'rebotan sin llegar a Eₐ'], orient: ['Mal orientadas', 'sitios que no se tocan'],
                completa: ['Reacción completa', 'se acaban los reactivos'], cat: ['Con catalizador', 'completa con K'], sobra: ['Sobra reactivo', 'A y B distintos'] }[k];
            const m = RETOS_CFG_ALBUM_MINI(k);
            return { txt: m.txt, col: m.col, nombre: i18n.t(t[0]), detalle: ok ? i18n.t(t[1]) : i18n.t('pendiente') };
        },
        nota: (nuevo) => nuevo ? i18n.t('Sello nuevo') : i18n.t('Cada sello se gana con un resultado distinto.'),
    },
});
function RETOS_CFG_ALBUM_MINI(k) {
    return { eficaz: { txt: '✓', col: '#34e3a8' }, energia: { txt: 'Eₐ', col: '#ff8a6a' }, orient: { txt: '↻', col: '#ffb08a' },
        completa: { txt: '100', col: '#ffd84a' }, cat: { txt: 'K', col: '#a78bfa' }, sobra: { txt: '±', col: '#7fb0ff' } }[k];
}
// Avisos desde la escena
function retoHecho(id) { RETOS_VR.hecho(id); }
function retoSello(k) { return RETOS_VR.sello(k); }
function retoCmp(v) { const d = RETOS_VR.datos; d.cmp = d.cmp || {}; if (!d.cmp[v]) { d.cmp[v] = true; RETOS_VR.guardar(); } }
function retoChoque(k) { const d = RETOS_VR.datos; d.ch = d.ch || {}; if (!d.ch[k]) { d.ch[k] = true; RETOS_VR.guardar(); } }
