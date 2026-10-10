// Traducciones al inglés (?lang=en). Clave: texto en español tal como aparece
// en el HTML o en las llamadas a i18n.t(); valor: texto en inglés británico.
window.I18N_EN = {
  // Cabecera y título
  'Simulación: Velocidad de Reacción': 'Simulation: Rate of Reaction',
  'Velocidad de Reacción': 'Rate of Reaction',
  'Teoría de Colisiones · A + B → C': 'Collision Theory · A + B → C',

  // Configuración de visualización
  'Configuración de visualización': 'Display settings',
  'Apariencia': 'Appearance',
  'Oscuro': 'Dark',
  'Claro': 'Light',
  'Alto Contraste': 'High Contrast',

  // Modo
  'Modo': 'Mode',
  'Modo reacción': 'Reaction mode',
  'Modo comparación': 'Comparison mode',
  'Modo choque': 'Collision mode',
  'Una cámara con A, B y opcionalmente catalizadores.': 'One chamber with A, B and, optionally, catalysts.',
  'Dos cámaras: elige una variable a comparar; las otras dos quedan iguales en ambas.':
    'Two chambers: choose one variable to compare; the other two stay the same in both.',
  'Dos moléculas grandes. Rótalas arrastrando y lánzalas una contra la otra para ver si el choque es efectivo.':
    'Two large molecules. Drag to rotate them, then launch them at each other to see whether the collision is successful.',

  // Parámetros
  'Parámetros': 'Parameters',
  'Temperatura': 'Temperature',
  'Controla la energía cinética media de las moléculas.': 'Controls the average kinetic energy of the molecules.',
  'Moléculas A (reactivo)': 'Molecules A (reactant)',
  'Moléculas B (reactivo)': 'Molecules B (reactant)',
  'Catalizadores': 'Catalysts',
  'Moléculas que sujetan A y B ya bien orientadas y les ofrecen un camino con menor energía de activación.':
    'Molecules that hold A and B already correctly oriented and offer them a pathway with a lower activation energy.',
  '⏸ Pausar': '⏸ Pause',
  '▶ Reanudar': '▶ Resume',
  '↺ Reiniciar': '↺ Restart',
  'Energía del choque': 'Collision energy',
  'hint-energia-choque': 'Controls the launch speed. The activation energy E<sub>a</sub> is roughly level 4.',
  '▶ Lanzar': '▶ Launch',
  '↺ Reset': '↺ Reset',

  // Niveles de temperatura
  'Muy baja': 'Very low',
  'Baja': 'Low',
  'Moderada': 'Moderate',
  'Normal': 'Normal',
  'Alta': 'High',
  'Muy alta': 'Very high',
  'Elevada': 'Elevated',
  'Intensa': 'Intense',
  'Extrema': 'Extreme',
  'Máxima': 'Maximum',
  'Normal (4)': 'Normal (4)',

  // Comparación
  'Comparación': 'Comparison',
  'Variable a comparar': 'Variable to compare',
  'Presencia de catalizador': 'Presence of catalyst',
  'Energía (temperatura)': 'Energy (temperature)',
  'Cantidad de moléculas': 'Number of molecules',
  'Las otras dos variables quedan bloqueadas (iguales en ambas cámaras) con los sliders de arriba.':
    'The other two variables are locked (the same in both chambers) using the sliders above.',
  '◀ Izquierda': '◀ Left',
  '▶ Derecha': '▶ Right',
  'Moléculas (A=B)': 'Molecules (A=B)',
  'Sin catalizador': 'No catalyst',
  '{n} catalizador': '{n} catalyst',
  '{n} catalizadores': '{n} catalysts',
  'reactivo limitante agotado': 'limiting reactant used up',
  '{n} de {total} reacciones': '{n} of {total} reactions',

  // Estadísticas
  'Estadísticas': 'Statistics',
  'Moléculas A': 'Molecules A',
  'Moléculas B': 'Molecules B',
  'Producto C': 'Product C',
  'Reacciones': 'Reactions',
  'Tasa actual': 'Current rate',

  // Leyenda
  'Leyenda': 'Key',
  'Molécula A (reactivo)': 'Molecule A (reactant)',
  'Molécula B (reactivo)': 'Molecule B (reactant)',
  'Molécula C (producto)': 'Molecule C (product)',
  'Catalizador (K)': 'Catalyst (K)',
  'Sitio reactivo (extremo activo)': 'Reactive site (active end)',
  'Destello de reacción': 'Reaction flash',

  // ¿Cómo funciona?
  '¿Cómo funciona?': 'How does it work?',
  'info-1': 'Molecules <b>A</b> and <b>B</b> are <b>polyatomic</b>: they have an orientation and a <b>reactive site</b> (the highlighted light end). Their speeds follow the <b>Maxwell-Boltzmann distribution</b> and increase with temperature.',
  'info-2': '<b>Thermal pathway.</b> A direct collision only produces C if <b>two</b> conditions are met at once: the relative speed must exceed the <b>activation energy E<sub>a</sub></b> (enough energy) <b>and</b> both reactive sites must meet head-on (<b>correct orientation</b>). That is why it is uncommon.',
  'info-3': '<b>Catalysed pathway.</b> The <b>catalyst (K)</b> pulls one A and one B into its two cavities. Once both are docked, they are already correctly oriented and need only a <b>lower activation energy</b> (the violet line in the inset), so they almost always react. The catalyst is released unchanged, ready to act again.',
  'info-4': 'The inset shows how the relative speeds of the collisions are distributed; the green area, to the right of E<sub>a</sub>, shows those with enough energy; the lower graph shows the <b>rate of reaction</b> (reactions/s) as it proceeds.',
  'Los segundos son de simulación: cada uno son 60 pasos. En un equipo lento la animación va más despacio, pero las cifras son las mismas.':
    'The seconds are simulation seconds: each one is 60 steps. On a slow computer the animation runs more slowly, but the figures are the same.',
  'info-6': '<b>Comparison mode.</b> Splits the screen into two chambers. You choose <b>one</b> variable to compare (energy, number of molecules or catalyst) and a different value is applied to each chamber; the other two stay <b>locked and equal</b>. The lower graph overlays both curves (◀ left / ▶ right) so you can compare the rate of reaction directly.',

  // Lienzo: cámaras y gráficos
  'CÁMARA DE REACCIÓN': 'REACTION CHAMBER',
  'conversión': 'conversion',
  'Velocidad relativa de los choques (T = {t})': 'Relative speed of collisions (T = {t})',
  '{pct} % supera Ea': '{pct}% exceed Ea',
  'Ea cat.': 'Ea cat.',
  'Térm. {t} · Cat. {c}': 'Therm. {t} · Cat. {c}',
  'VELOCIDAD DE REACCIÓN (reacciones/s simulado)': 'RATE OF REACTION (reactions per simulated s)',
  'ahora': 'now',

  // Lienzo: modo choque
  'MODO CHOQUE': 'COLLISION MODE',
  '↻ Arrastra para rotar': '↻ Drag to rotate',
  '✓ CHOQUE EFECTIVO': '✓ SUCCESSFUL COLLISION',
  '✗ CHOQUE INEFECTIVO': '✗ UNSUCCESSFUL COLLISION',
  'Energía suficiente:': 'Enough energy:',
  'Orientación correcta:': 'Correct orientation:',
  'Sí ✓': 'Yes ✓',
  'No ✗': 'No ✗',
  'A + B → C  (ambas condiciones cumplidas)': 'A + B → C  (both conditions met)',
  'No se forma C  (falta al menos una condición)': 'No C forms  (at least one condition not met)'
};
