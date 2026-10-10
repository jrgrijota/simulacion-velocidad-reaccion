// Traduccions al català (?lang=ca). Clau: text en castellà tal com apareix
// a l'HTML o a les crides a i18n.t(); valor: text en català.
window.I18N_CA = {
  // Cabecera y título
  'Simulación: Velocidad de Reacción': 'Simulació: Velocitat de Reacció',
  'Velocidad de Reacción': 'Velocitat de Reacció',
  'Teoría de Colisiones · A + B → C': 'Teoria de Col·lisions · A + B → C',

  // Configuración de visualización
  'Configuración de visualización': 'Configuració de visualització',
  'Apariencia': 'Aparença',
  'Oscuro': 'Fosc',
  'Claro': 'Clar',
  'Alto Contraste': 'Alt contrast',

  // Modo
  'Modo': 'Mode',
  'Modo reacción': 'Mode reacció',
  'Modo comparación': 'Mode comparació',
  'Modo choque': 'Mode xoc',
  'Una cámara con A, B y opcionalmente catalizadores.': 'Una cambra amb A, B i, opcionalment, catalitzadors.',
  'Dos cámaras: elige una variable a comparar; las otras dos quedan iguales en ambas.':
    'Dues cambres: tria una variable per comparar; les altres dues queden iguals a totes dues.',
  'Dos moléculas grandes. Rótalas arrastrando y lánzalas una contra la otra para ver si el choque es efectivo.':
    'Dues molècules grans. Fes-les girar arrossegant-les i llança-les l\'una contra l\'altra per veure si el xoc és efectiu.',

  // Parámetros
  'Parámetros': 'Paràmetres',
  'Temperatura': 'Temperatura',
  'Controla la energía cinética media de las moléculas.': 'Controla l\'energia cinètica mitjana de les molècules.',
  'Moléculas A (reactivo)': 'Molècules A (reactiu)',
  'Moléculas B (reactivo)': 'Molècules B (reactiu)',
  'Catalizadores': 'Catalitzadors',
  'Moléculas que sujetan A y B ya bien orientadas y les ofrecen un camino con menor energía de activación.':
    'Molècules que subjecten A i B ja ben orientades i els ofereixen un camí amb una energia d\'activació menor.',
  '⏸ Pausar': '⏸ Pausa',
  '▶ Reanudar': '▶ Reprèn',
  '↺ Reiniciar': '↺ Reinicia',
  'Energía del choque': 'Energia del xoc',
  'hint-energia-choque': 'Controla la velocitat en llançar-les. L\'energia d\'activació E<sub>a</sub> equival aproximadament al nivell 4.',
  '▶ Lanzar': '▶ Llança',
  '↺ Reset': '↺ Reinicia',

  // Niveles de temperatura
  'Muy baja': 'Molt baixa',
  'Baja': 'Baixa',
  'Moderada': 'Moderada',
  'Normal': 'Normal',
  'Alta': 'Alta',
  'Muy alta': 'Molt alta',
  'Elevada': 'Elevada',
  'Intensa': 'Intensa',
  'Extrema': 'Extrema',
  'Máxima': 'Màxima',
  'Normal (4)': 'Normal (4)',

  // Comparación
  'Comparación': 'Comparació',
  'Variable a comparar': 'Variable per comparar',
  'Presencia de catalizador': 'Presència de catalitzador',
  'Energía (temperatura)': 'Energia (temperatura)',
  'Cantidad de moléculas': 'Quantitat de molècules',
  'Las otras dos variables quedan bloqueadas (iguales en ambas cámaras) con los sliders de arriba.':
    'Les altres dues variables queden bloquejades (iguals a totes dues cambres) amb els controls lliscants de dalt.',
  '◀ Izquierda': '◀ Esquerra',
  '▶ Derecha': '▶ Dreta',
  'Moléculas (A=B)': 'Molècules (A=B)',
  'Sin catalizador': 'Sense catalitzador',
  '{n} catalizador': '{n} catalitzador',
  '{n} catalizadores': '{n} catalitzadors',
  'reactivo limitante agotado': 'reactiu limitant esgotat',
  '{n} de {total} reacciones': '{n} de {total} reaccions',

  // Estadísticas
  'Estadísticas': 'Estadístiques',
  'Moléculas A': 'Molècules A',
  'Moléculas B': 'Molècules B',
  'Producto C': 'Producte C',
  'Reacciones': 'Reaccions',
  'Tasa actual': 'Taxa actual',

  // Leyenda
  'Leyenda': 'Llegenda',
  'Molécula A (reactivo)': 'Molècula A (reactiu)',
  'Molécula B (reactivo)': 'Molècula B (reactiu)',
  'Molécula C (producto)': 'Molècula C (producte)',
  'Catalizador (K)': 'Catalitzador (K)',
  'Sitio reactivo (extremo activo)': 'Lloc reactiu (extrem actiu)',
  'Destello de reacción': 'Destell de reacció',

  // ¿Cómo funciona?
  '¿Cómo funciona?': 'Com funciona?',
  'info-1': 'Les molècules <b>A</b> i <b>B</b> són <b>poliatòmiques</b>: tenen una orientació i un <b>lloc reactiu</b> (l\'extrem clar destacat). Les seves velocitats segueixen la <b>distribució de Maxwell-Boltzmann</b> i augmenten amb la temperatura.',
  'info-2': '<b>Via tèrmica.</b> Una col·lisió directa només produeix C si es compleixen <b>dues</b> condicions alhora: que la velocitat relativa superi l\'<b>energia d\'activació E<sub>a</sub></b> (energia suficient) <b>i</b> que tots dos llocs reactius xoquin de cara (<b>orientació correcta</b>). Per això és poc freqüent.',
  'info-3': '<b>Via catalitzada.</b> El <b>catalitzador (K)</b> atreu una A i una B cap a les seves dues cavitats. Quan totes dues hi queden acoblades, ja estan ben orientades i en tenen prou amb una <b>energia d\'activació menor</b> (la línia violeta del requadre), de manera que reaccionen gairebé sempre. El catalitzador s\'allibera intacte per tornar a actuar.',
  'info-4': 'El requadre mostra com es reparteixen les velocitats relatives dels xocs; l\'àrea verda, a la dreta d\'E<sub>a</sub>, són els que tenen energia suficient; la gràfica inferior, la <b>velocitat de reacció</b> (reaccions/s) a mesura que avança.',
  'Los segundos son de simulación: cada uno son 60 pasos. En un equipo lento la animación va más despacio, pero las cifras son las mismas.':
    'Els segons són de simulació: cadascun són 60 passos. En un ordinador lent l\'animació va més a poc a poc, però les xifres són les mateixes.',
  'info-6': '<b>Mode comparació.</b> Divideix la pantalla en dues cambres. Tries <b>una</b> variable per comparar —energia, quantitat de molècules o catalitzador— i s\'aplica un valor diferent a cada cambra; les altres dues queden <b>bloquejades i iguals</b>. La gràfica inferior superposa les dues corbes (◀ esquerra / ▶ dreta) per comparar directament la velocitat de reacció.',

  // Lienzo: cámaras y gráficos
  'CÁMARA DE REACCIÓN': 'CAMBRA DE REACCIÓ',
  'conversión': 'conversió',
  'Velocidad relativa de los choques (T = {t})': 'Velocitat relativa dels xocs (T = {t})',
  '{pct} % supera Ea': '{pct} % supera Ea',
  'Ea cat.': 'Ea cat.',
  'Térm. {t} · Cat. {c}': 'Tèrm. {t} · Cat. {c}',
  'VELOCIDAD DE REACCIÓN (reacciones/s simulado)': 'VELOCITAT DE REACCIÓ (reaccions/s simulat)',
  'ahora': 'ara',

  // Lienzo: modo choque
  'MODO CHOQUE': 'MODE XOC',
  '↻ Arrastra para rotar': '↻ Arrossega per girar',
  '✓ CHOQUE EFECTIVO': '✓ XOC EFECTIU',
  '✗ CHOQUE INEFECTIVO': '✗ XOC INEFECTIU',
  'Energía suficiente:': 'Energia suficient:',
  'Orientación correcta:': 'Orientació correcta:',
  'Sí ✓': 'Sí ✓',
  'No ✗': 'No ✗',
  'A + B → C  (ambas condiciones cumplidas)': 'A + B → C  (totes dues condicions complertes)',
  'No se forma C  (falta al menos una condición)': 'No es forma C  (falta almenys una condició)'
};
