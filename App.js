const { useState, useEffect } = React;

// Constantes y Presets de la literatura clínica y radiobiológica
const ALPHABETA_PRESETS = {
  tumores: [
    { name: "Tumores Genéricos (Efectos Agudos)", value: 10, detail: "Valor estándar de referencia histórica para la mayoría de carcinomas epiteliales activos." },
    { name: "Cáncer de Próstata", value: 1.5, detail: "Sensibilidad extrema al fraccionamiento. Avalado por metaanálisis de los ensayos CHHiP, PROFIT y PACE." },
    { name: "Cáncer de Mama (Invasivo/Ductal)", value: 3.5, detail: "Cociente bajo (~3-4 Gy). Justifica esquemas hipofraccionados modernos (ensayos START y FAST-Forward)." },
    { name: "Carcinoma Escamoso de Cabeza y Cuello (HNSCC)", value: 10.0, detail: "Alta tasa mitótica y repoblación acelerada. Sensible a prolongaciones del tiempo total (OTT)." },
    { name: "Glioblastoma Multiforme (GBM)", value: 10.0, detail: "Tumor de respuesta rápida, alta resistencia intrínseca por mecanismos de reparación celular activos." },
    { name: "Melanoma Maligno", value: 2.5, detail: "Históricamente considerado radiorresistente en fraccionamiento convencional por su amplio hombro de supervivencia." },
    { name: "Liposarcoma y Sarcomas de Partes Blandas", value: 4.0, detail: "Sensibilidad intermedia. Aplicable para esquemas preoperatorios o adyuvantes en extremidades." },
    { name: "Carcinoma de Cérvix (Ginecología)", value: 10.0, detail: "Modelo tumoral de referencia estándar del grupo GEC-ESTRO para el tumor primario." },
    { name: "Carcinoma Pulmonar de Células No Pequeñas (NSCLC)", value: 10.0, detail: "Comportamiento clásico de respuesta rápida. Parámetro clave en modelos de TCP en radioterapia torácica." },
    { name: "Carcinoma Pulmonar de Células Pequeñas (SCLC)", value: 10.0, detail: "Tumor de duplicación extremadamente veloz. Requiere esquemas hiperfraccionados acelerados." },
    { name: "Linfoma Difuso de Células B Grandes (DLBCL)", value: 10.0, detail: "Alta radiosensibilidad inicial mitótica, típica de neoplasias hematológicas malignas de alto grado." },
    { name: "Seminoma Testicular", value: 10.0, detail: "Excepcional radiosensibilidad intrínseca debido a vías de apoptosis altamente sensibles y activas." },
    { name: "Carcinoma Epidermoide de Esófago", value: 10.0, detail: "Comportamiento agudo estándar. Sensible a esquemas de quimiorradioterapia neoadyuvante." },
    { name: "Carcinoma Epidermoide de Canal Anal", value: 10.0, detail: "Respuesta rápida típica. Clave para el control tumoral macroscópico con quimioterapia concurrente." },
    { name: "Carcinoma Basocelular y Espinocelular de Piel", value: 8.5, detail: "Cociente discretamente menor debido a un nivel moderado de diferenciación celular queratinizante." }
  ],
  sanos: [
    { name: "Médula Espinal (Mielopatía Tardía)", value: 2.0, detail: "Estructura neurológica de riesgo crítico. Tolerancia estricta para evitar radionecrosis irreversible." },
    { name: "Cerebro / Tronco Cerebral (SNC)", value: 3.0, detail: "Tejido glial y vascular tardío del tronco y encéfalo. Límite de toxicidad tardía en radiocirugía (SRS)." },
    { name: "Pulmón (Neumonitis/Fibrosis Tardía)", value: 3.0, detail: "Límite QUANTEC. Daño tardío en las células alveolares tipo II y endotelio capilar pulmonar." },
    { name: "Riñón (Nefropatía Tardía)", value: 2.5, detail: "Órgano parenquimatoso extremadamente sensible a largo plazo. Riesgo de insuficiencia renal crónica." },
    { name: "Recto y Canal Anal (Complicación Tardía)", value: 3.0, detail: "Riesgo de proctitis, sangrado o fístula tardía. Límite de dosis 2cc de GEC-ESTRO / QUANTEC." },
    { name: "Intestino Delgado (Enteritis Crónica)", value: 4.0, detail: "Tolerancia tardía de las asas intestinales. Riesgo de estenosis, obstrucción o perforación tardía." },
    { name: "Vejiga (Pérdida de Elasticidad / Cistitis)", value: 3.0, detail: "Tolerancia crónica de la pared muscular vesical frente a la fibrosis inducida por radiación." },
    { name: "Corazón (Fibrosis Miocárdica / Pericarditis)", value: 3.0, detail: "QUANTEC limita la dosis media cardíaca para evitar enfermedad coronaria tardía e insuficiencia." },
    { name: "Glándula Parótida / Submandibular (Xerostomía)", value: 3.0, detail: "Destrucción tardía de células acinares serosas. Clave en planificación IMRT de cabeza y cuello." },
    { name: "Cabezas Femorales / Hueso Sano (Radionecrosis)", value: 3.0, detail: "Tolerancia vascular de la cortical ósea. Límite crítico para evitar fracturas patológicas tardías." },
    { name: "Hígado (Hepatitis por Radiación - RILD)", value: 3.0, detail: "Destrucción del parénquima funcional hepático. Crucial en SBRT hepática para evitar fallo hepático." },
    { name: "Cristalino Ocular (Catarata Radioinducida)", value: 1.0, detail: "Extremadamente sensible. El daño se acumula con dosis muy bajas por fracción, induciendo opacidad." },
    { name: "Esófago Sano (Estenosis Crónica)", value: 3.0, detail: "Fibrosis tardía de la capa submucosa. Límite crítico en tratamientos de tumores torácicos." },
    { name: "Piel Sana (Fibrosis Cutánea Tardía)", value: 2.5, detail: "Fibrosis del tejido conectivo subcutáneo y telangiectasias crónicas a largo plazo." },
    { name: "Médula Ósea (Respuesta Aguda/Hematopoyética)", value: 10.0, detail: "Tejido normal atípico de respuesta rápida con altas tasas de renovación celular progenitora." }
  ]
};

// Monografías Educativas para la pestaña de Orientación y Estudio
const STUDY_MONOGRAPHS = {
  ab: {
    title: "Cociente Tisular (α/β)",
    symbol: "α/β (Gy)",
    definition: "Es el punto de cruce en la curva de supervivencia celular donde la tasa de muerte por daño directo no reparable (componente lineal α, proporcional a la dosis d) se iguala numéricamente a la tasa de muerte por la acumulación interactiva de lesiones subletales (componente cuadrático β, proporcional a d²).",
    clinicalUse: "Se utiliza como un parámetro que cuantifica la sensibilidad de un tejido a los cambios en la dosis por fracción. Un α/β bajo (1.5 - 3 Gy) indica una alta sensibilidad al tamaño de la fracción (tejidos de respuesta tardía y tumores lentos como próstata o mama), favoreciendo el hipofraccionamiento. Un α/β alto (10 Gy) denota un tejido de respuesta rápida con baja dependencia del tamaño de fracción.",
    derivation: "Se deriva in vitro trazando curvas clonogénicas de supervivencia celular ajustadas por regresión no lineal de mínimos cuadrados al modelo S = e^-(αd+βd²). In vivo, se obtiene retrospectivamente analizando isoelementos de control tumoral o complicaciones tardías en pacientes tratados con esquemas de fraccionamiento variados, utilizando métodos gráficos como el gráfico de Fe (Fe-plot)."
  },
  alpha: {
    title: "Sensibilidad Intrínseca Lineal (α)",
    symbol: "α (Gy⁻¹)",
    definition: "Mide la probabilidad de muerte celular clonogénica o de daño tisular letal irreversible producido por un solo impacto de radiación ionizante (por ejemplo, una rotura doble de la hebra de ADN de alta densidad producida por una única traza electrónica).",
    clinicalUse: "Domina la pendiente inicial de la curva de supervivencia a dosis bajas de radiación clínico-estándar (< 2.0 Gy). Determina la respuesta inmediata del tejido tumoral activo en fraccionamientos convencionales y es crítico para evaluar la resistencia tisular a dosis bajas.",
    derivation: "Se obtiene mediante ajustes matemáticos lineales a la respuesta inicial de supervivencia de colonias celulares in vitro. Fisiológicamente, depende estrechamente de la integridad y rapidez de las enzimas de reparación del ADN celular (vía NHEJ y HR) y de mutaciones asociadas a genes supresores de tumores como p53 o ATM."
  },
  beta: {
    title: "Sensibilidad Intrínseca Cuadrática (β)",
    symbol: "β (Gy⁻²)",
    definition: "Representa el coeficiente de probabilidad de inactivación o muerte por acumulación e interacción en el tiempo de múltiples eventos de daño subletal. Ocurre cuando dos rupturas de hebra de ADN aisladas y producidas por diferentes trazas ionizantes no se reparan a tiempo e interactúan para formar un daño cromosómico letal.",
    clinicalUse: "Explica la curvatura ('hombro') de la gráfica de supervivencia celular. Es la responsable de que a dosis altas por fracción (como en SBRT/SRS) la tasa de letalidad celular por unidad de dosis aumente drásticamente, lo cual representa un riesgo de toxicidad severa para los tejidos sanos circundantes con bajo cociente α/β.",
    derivation: "Calculado a partir de los datos in vitro de dosis medias a altas. Clínicamente, el factor β disminuye sustancialmente si el tiempo entre fracciones (o la duración de la aplicación en braquiterapia) se prolonga, debido a que las células disponen de tiempo suficiente para reparar los daños subletales aislados de manera independiente."
  },
  tpot: {
    title: "Tiempo de Duplicación Celular Potencial (Tpot)",
    symbol: "Tpot (días)",
    definition: "Es el tiempo teórico requerido por una población celular tumoral en mitosis para duplicar su tamaño clonogénico, bajo el supuesto de que no ocurra pérdida celular espontánea (apoptosis, necrosis o senescencia celular espontánea).",
    clinicalUse: "Ayuda a predecir la agresividad tumoral y a diseñar regímenes acelerados (ej. esquemas CHART). Si un tumor posee un Tpot corto (< 3 a 5 días, común en carcinomas epidermoides de cabeza y cuello o cérvix), el retraso total de las sesiones médicas generará una multiplicación masiva de células supervivientes, comprometiendo la curación local.",
    derivation: "Se obtiene clínicamente in vivo inyectando de forma intravenosa un análogo nucleósido de la timidina (como la Bromodesoxiuridina [BrdU] o Yododesoxiuridina [IdU]) antes de tomar una biopsia tumoral. La biopsia se procesa por citometría de flujo de doble canal para calcular el Índice de Marcaje (LI) and la duración de la Fase S del ciclo celular (Ts). Se calcula mediante: Tpot = ln(2) × (Ts / LI)."
  },
  tk: {
    title: "Tiempo de Inicio de la Proliferación (Tk)",
    symbol: "Tk / T_delay (días)",
    definition: "Es el período de latencia o retardo temporal (lag-time) que transcurre desde el inicio de la radioterapia fraccionada hasta el momento en que se activa la repoblación celular compensatoria y acelerada de las células clonogénicas tumorales supervivientes.",
    clinicalUse: "Es el parámetro central que rige las interrupciones del tratamiento. Permite modelar a partir de qué día el tumor comienza a proliferar a una velocidad exponencial mayor a la normal (estimada frecuentemente en el día 21 a 28 de tratamiento en tumores de cabeza y cuello, cabeza, cuello y pulmón).",
    derivation: "Se deriva retrospectivamente de la observación estadística en cohortes de ensayos clínicos, mapeando las diferencias en la dosis total requerida para lograr el control local tumoral en esquemas con diferentes duraciones en días (Overall Treatment Time, OTT). Se analiza matemáticamente como el punto de flexión temporal donde disminuye la probabilidad de control local por cada día de prolongación imprevista."
  },
  bed: {
    title: "Dosis Biológica Efectiva (BED)",
    symbol: "BED (Gy_BED)",
    definition: "Representa el logaritmo neperiano de la fracción de supervivencia celular dividido por el parámetro α. Es una cifra cuantitativa que unifica los factores físicos de la radiación (Dosis Total D y dosis por fracción d) y la susceptibilidad del tejido (cociente α/β) en un único valor de dosis representativo del efecto biológico real.",
    clinicalUse: "Es la herramienta de cálculo estándar en el servicio clínico para planificar, modificar o rescatar esquemas terapéuticos de radioterapia fraccionada o braquiterapia. Permite calcular la equivalencia biológica exacta entre esquemas hiperfraccionados, convencionales y de hipofraccionamiento extremo.",
    derivation: "Deducido analíticamente a partir de la expresión lineal-cuadrática para la supervivencia celular: -ln(S) = n × (αd + βd²). Dividiendo todo entre α, obtenemos la dosis biológica efectiva: BED = D × (1 + d / [α/β])."
  }
};

// Parámetros y tolerancia de tejidos para Re-irradiación según QUANTEC / Basic Clinical Radiobiology
const REIRRAD_OARS = {
  medula: {
    name: "Médula Espinal (Mielopatía Tardía)",
    ab: 2.0,
    limitEqd2: 100.0,
    recoveryFn: (months) => {
      if (months < 6) return 0.0;
      if (months < 12) return 0.25; // 25% de recuperación
      return 0.50; // Hasta 50% de recuperación tras 1 año o más
    },
    detail: "La médula espinal tolera re-irradiaciones parciales tras un intervalo mayor a 6 meses. Se asume una recuperación biológica a largo plazo de hasta el 50% según la literatura de soporte (Basic Clinical Radiobiology, p. 110)."
  },
  cerebro: {
    name: "Cerebro / Tronco Cerebral (SNC)",
    ab: 3.0,
    limitEqd2: 110.0,
    recoveryFn: (months) => {
      if (months < 6) return 0.0;
      if (months < 12) return 0.15; // 15% de recuperación
      return 0.30; // Máximo 30% tras 1 año
    },
    detail: "La recuperación del SNC es significativamente menor y más lenta que la de la médula. Alto riesgo de necrosis cerebral o del tronco cerebral si se supera el EQD2 de 100-110 Gy corregido."
  },
  pulmon: {
    name: "Pulmón Sano (Neumonitis/Fibrosis)",
    ab: 3.0,
    limitEqd2: 80.0,
    recoveryFn: (months) => {
      if (months < 3) return 0.0;
      if (months < 6) return 0.20;
      return 0.40; // Buena recuperación del componente parenquimatoso, hasta 40%
    },
    detail: "El parénquima pulmonar muestra una recuperación moderadamente rápida (iniciando a los 3 meses) por división de neumocitos remanentes. Se sugiere limitar la re-irradiación para no provocar neumonitis difusa catastrófica."
  },
  gastro: {
    name: "Recto / Sigmoides (Fibrosis/Estenosis)",
    ab: 3.0,
    limitEqd2: 75.0,
    recoveryFn: (months) => {
      if (months < 6) return 0.0;
      return 0.15; // Muy poca recuperación real, máx 15%
    },
    detail: "Mientras la mucosa (aguda) regenera por completo, las capas musculares y los vasos sanguíneos submucosos se recuperan mínimamente. Riesgo elevado de estenosis o fístula tardía."
  },
  rinon: {
    name: "Riñón (Nefropatía Tardía)",
    ab: 2.5,
    limitEqd2: 30.0,
    recoveryFn: (months) => 0.0, // Sin recuperación demostrada
    detail: "El parénquima funcional renal prácticamente carece de recuperación biológica a largo plazo (FR = 0%). Toda la dosis administrada en la primera sesión se acumula para siempre."
  },
  personalizado: {
    name: "Otro Órgano / Parámetro Personalizado",
    ab: 3.0,
    limitEqd2: 80.0,
    recoveryFn: (months) => 0.20,
    detail: "Utilice este perfil para parametrizar tejidos no tabulados de forma manual."
  }
};

export default function App() {
  // Estado de navegación
  const [activeTab, setActiveTab] = useState('directo');

  // Parámetros de cálculo global/básico
  const [alphaBeta, setAlphaBeta] = useState(10);
  const [customAlphaBeta, setCustomAlphaBeta] = useState('');
  
  // Variables de entrada de cálculo directo
  const [calcMode, setCalcMode] = useState('d_n'); // 'd_n' o 'D_n'
  const [inputDosePerFx, setInputDosePerFx] = useState(2.0);
  const [inputTotalDose, setInputTotalDose] = useState(50.0);
  const [inputFractions, setInputFractions] = useState(25);

  // Variables de entrada de cálculo inverso
  const [targetType, setTargetType] = useState('bed'); // 'bed' o 'eqd2'
  const [targetValue, setTargetValue] = useState(72.0);
  const [targetFractions, setTargetFractions] = useState(30);

  // Variables para la pestaña de Proliferación y Tiempo
  const [timeTotal, setTimeTotal] = useState(35); // días totales de tratamiento
  const [timeDelay, setTimeDelay] = useState(21); // Tk (días de inicio de proliferación)
  const [timeTpot, setTimeTpot] = useState(3);    // Tpot (tiempo de duplicación celular en días)
  const [alphaSensitivity, setAlphaSensitivity] = useState(0.3); // alpha en Gy^-1

  // Estado del buscador de la guía clínica
  const [searchQuery, setSearchQuery] = useState('');

  // Estado de la pestaña de estudio / orientación
  const [selectedStudyTerm, setSelectedStudyTerm] = useState('ab');

  // VARIABLES PARA EL MÓDULO DE RE-IRRADIACIÓN
  const [reOarKey, setReOarKey] = useState('medula');
  const [reRT1Dose, setReRT1Dose] = useState(45.0);
  const [reRT1Fx, setReRT1Fx] = useState(25);
  const [reRT2Dose, setReRT2Dose] = useState(30.0);
  const [reRT2Fx, setReRT2Fx] = useState(10);
  const [reInterval, setReInterval] = useState(12); // en meses
  const [reRecoveryManual, setReRecoveryManual] = useState(null); // factor de recuperación manual

  // Comparador de hasta 3 esquemas clínicos
  const [schedules, setSchedules] = useState([
    { id: 1, name: 'Esquema Estándar (Fracc. Convencional)', dosePerFx: 2, fractions: 35 },
    { id: 2, name: 'Hipofraccionamiento Moderado', dosePerFx: 3, fractions: 20 },
    { id: 3, name: 'SBRT / Hipofraccionamiento Extremo', dosePerFx: 7.25, fractions: 5 }
  ]);

  // Resultados calculados en tiempo real para cálculo directo
  const [resultsDirect, setResultsDirect] = useState({
    dosePerFx: 2,
    totalDose: 50,
    fractions: 25,
    bed: 60,
    eqd2: 50
  });

  // Resultados calculados en tiempo real para cálculo inverso
  const [resultsInverse, setResultsInverse] = useState({
    dosePerFx: 0,
    totalDose: 0,
    fractions: 30,
    calculatedBed: 0,
    calculatedEqd2: 0,
    isValid: false
  });

  // Copiar reporte al portapapeles
  const [copied, setCopied] = useState(false);

  // Sincronizar y recalcular pestaña Directa
  useEffect(() => {
    const ab = parseFloat(alphaBeta);
    const n = parseInt(inputFractions) || 1;
    let d = 0;
    let D = 0;

    if (calcMode === 'd_n') {
      d = parseFloat(inputDosePerFx) || 0;
      D = n * d;
    } else {
      D = parseFloat(inputTotalDose) || 0;
      d = n > 0 ? D / n : 0;
    }

    const bed = D * (1 + d / ab);
    const eqd2 = bed / (1 + 2 / ab);

    setResultsDirect({
      dosePerFx: d,
      totalDose: D,
      fractions: n,
      bed: bed,
      eqd2: eqd2
    });
  }, [alphaBeta, calcMode, inputDosePerFx, inputTotalDose, inputFractions]);

  // Sincronizar y recalcular pestaña Inversa
  useEffect(() => {
    const ab = parseFloat(alphaBeta);
    const n = parseInt(targetFractions) || 1;
    const target = parseFloat(targetValue) || 0;
    
    let bedTarget = target;
    if (targetType === 'eqd2') {
      // Convertir EQD2 objetivo a BED objetivo
      bedTarget = target * (1 + 2 / ab);
    }

    // Resolver ecuación cuadrática: d^2 + (ab)*d - (bedTarget * ab / n) = 0
    // d = (-ab + sqrt(ab^2 + 4 * ab * bedTarget / n)) / 2
    const discriminant = (ab * ab) + (4 * ab * bedTarget) / n;
    
    if (discriminant >= 0 && n > 0 && target > 0) {
      const d = (-ab + Math.sqrt(discriminant)) / 2;
      const D = n * d;
      const calculatedBed = D * (1 + d / ab);
      const calculatedEqd2 = calculatedBed / (1 + 2 / ab);

      setResultsInverse({
        dosePerFx: d,
        totalDose: D,
        fractions: n,
        calculatedBed: calculatedBed,
        calculatedEqd2: calculatedEqd2,
        isValid: true
      });
    } else {
      setResultsInverse(prev => ({ ...prev, isValid: false }));
    }
  }, [alphaBeta, targetType, targetValue, targetFractions]);

  const handlePresetSelect = (val) => {
    setAlphaBeta(val);
    setCustomAlphaBeta('');
  };

  const handleCustomAlphaBetaChange = (val) => {
    setCustomAlphaBeta(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAlphaBeta(parsed);
    }
  };

  // Guardar cambio de un esquema en el comparador
  const updateSchedule = (id, field, value) => {
    setSchedules(prev => prev.map(sch => {
      if (sch.id === id) {
        const updated = { ...sch, [field]: value };
        return updated;
      }
      return sch;
    }));
  };

  // Cálculo de repoblación celular
  const calculateRepopulationLoss = () => {
    const ab = parseFloat(alphaBeta);
    const d = resultsDirect.dosePerFx;
    const D = resultsDirect.totalDose;
    const bedPhys = resultsDirect.bed;

    if (timeTotal <= timeDelay) {
      return { bedCorr: bedPhys, lostDoseEq: 0, text: "No hay proliferación (el tiempo total es menor que el retraso celular Tk)" };
    }

    const proliferationDays = timeTotal - timeDelay;
    // Pérdida biológica en el BED = ln(2) * (T - Tk) / (alpha * Tpot)
    const bedLoss = (Math.log(2) * proliferationDays) / (alphaSensitivity * timeTpot);
    const bedCorr = Math.max(0, bedPhys - bedLoss);
    
    // Dosis física equivalente perdida = pérdida biológica / (1 + d / ab)
    const lostDoseEq = d > 0 ? bedLoss / (1 + d / ab) : 0;

    return {
      bedCorr,
      lostDoseEq,
      text: `Proliferación activa durante ${proliferationDays.toFixed(0)} días.`
    };
  };

  const repopResults = calculateRepopulationLoss();

  // CÁLCULO DINÁMICO DE RE-IRRADIACIÓN
  const getReirradiationMetrics = () => {
    const oar = REIRRAD_OARS[reOarKey];
    const ab = oar.ab;
    
    const d1 = reRT1Fx > 0 ? reRT1Dose / reRT1Fx : 0;
    const d2 = reRT2Fx > 0 ? reRT2Dose / reRT2Fx : 0;

    const bed1 = reRT1Dose * (1 + d1 / ab);
    const bed2 = reRT2Dose * (1 + d2 / ab);

    const eqd2_1 = bed1 / (1 + 2 / ab);
    const eqd2_2 = bed2 / (1 + 2 / ab);

    const rawRecovery = oar.recoveryFn(reInterval);
    const recoveryFactor = reRecoveryManual !== null ? reRecoveryManual : rawRecovery;

    // Dosis corregida por recuperación a largo plazo
    const bedAccum = bed2 + (bed1 * (1 - recoveryFactor));
    const eqd2Accum = eqd2_2 + (eqd2_1 * (1 - recoveryFactor));

    const pctLimit = oar.limitEqd2 > 0 ? (eqd2Accum / oar.limitEqd2) * 100 : 0;

    let riskLevel = "Bajo";
    let riskColor = "text-emerald-400";
    let riskBg = "bg-emerald-500/10 border-emerald-500/20";
    if (pctLimit >= 85 && pctLimit < 100) {
      riskLevel = "Moderado / Vigilancia";
      riskColor = "text-yellow-400";
      riskBg = "bg-yellow-500/10 border-yellow-500/20";
    } else if (pctLimit >= 100) {
      riskLevel = "Crítico / Riesgo Alto de Complicación";
      riskColor = "text-red-400";
      riskBg = "bg-red-500/10 border-red-500/20";
    }

    return {
      d1, d2, bed1, bed2, eqd2_1, eqd2_2,
      recoveryFactor, bedAccum, eqd2Accum, pctLimit,
      riskLevel, riskColor, riskBg, limitEqd2: oar.limitEqd2,
      detail: oar.detail, oarName: oar.name, ab
    };
  };

  const reMetrics = getReirradiationMetrics();

  // Generar reporte en texto para copiar
  const copyReportToClipboard = () => {
    const ab = alphaBeta;
    let reportText = `=== REPORTE DE CÁLCULO RADIOBIOLÓGICO CLÍNICO ===\n`;
    reportText += `Creador: Dr. Vicente Badillo Hernández\n`;
    reportText += `Fecha de generación: 2026\n`;
    reportText += `Cociente alpha/beta de referencia: ${ab} Gy\n\n`;
    reportText += `--- ESQUEMA DE TRATAMIENTO DIRECTO ---\n`;
    reportText += `- Fraccionamiento: ${resultsDirect.fractions} fracciones de ${resultsDirect.dosePerFx.toFixed(2)} Gy\n`;
    reportText += `- Dosis Física Total: ${resultsDirect.totalDose.toFixed(2)} Gy\n`;
    reportText += `- BED calculado (α/β = ${ab}): ${resultsDirect.bed.toFixed(2)} Gy_BED\n`;
    reportText += `- EQD2 calculado (α/β = ${ab}): ${resultsDirect.eqd2.toFixed(2)} Gy_EQD2\n\n`;

    if (resultsInverse.isValid) {
      reportText += `--- CÁLCULO INVERSO PARA OBJETIVO DE ${targetType.toUpperCase()} ---\n`;
      reportText += `- Objetivo de ${targetType.toUpperCase()}: ${targetValue} Gy\n`;
      reportText += `- Número de fracciones propuesto: ${targetFractions}\n`;
      reportText += `- Dosis por fracción calculada: ${resultsInverse.dosePerFx.toFixed(2)} Gy/fx\n`;
      reportText += `- Dosis física total necesaria: ${resultsInverse.totalDose.toFixed(2)} Gy\n`;
      reportText += `- BED del esquema resultante: ${resultsInverse.calculatedBed.toFixed(2)} Gy_BED\n`;
      reportText += `- EQD2 del esquema resultante: ${resultsInverse.calculatedEqd2.toFixed(2)} Gy_EQD2\n\n`;
    }

    reportText += `--- ANÁLISIS DE RE-IRRADIACIÓN (ÓRGANO: ${reMetrics.oarName}) ---\n`;
    reportText += `- Tratamiento 1: ${reRT1Dose.toFixed(1)} Gy en ${reRT1Fx} fx (EQD2: ${reMetrics.eqd2_1.toFixed(1)} Gy | BED: ${reMetrics.bed1.toFixed(1)} Gy)\n`;
    reportText += `- Tratamiento 2 (Propuesto): ${reRT2Dose.toFixed(1)} Gy en ${reRT2Fx} fx (EQD2: ${reMetrics.eqd2_2.toFixed(1)} Gy | BED: ${reMetrics.bed2.toFixed(1)} Gy)\n`;
    reportText += `- Intervalo: ${reInterval} meses | Factor de Recuperación Biológica: ${(reMetrics.recoveryFactor * 100).toFixed(0)}%\n`;
    reportText += `- EQD2 Acumulado Corregido: ${reMetrics.eqd2Accum.toFixed(1)} Gy (Límite OAR: ${reMetrics.limitEqd2} Gy)\n`;
    reportText += `- Nivel de Riesgo de Complicación Tardía: ${reMetrics.riskLevel.toUpperCase()} (${reMetrics.pctLimit.toFixed(1)}% del límite)\n\n`;

    reportText += `--- COMPARATIVA MULTI-ESQUEMA EN EL SERVICIO ---\n`;
    schedules.forEach((sch) => {
      const d = parseFloat(sch.dosePerFx) || 0;
      const n = parseInt(sch.fractions) || 0;
      const D = d * n;
      const bedTumor = D * (1 + d / 10);
      const bedLate = D * (1 + d / 3);
      const eqd2Local = D * (1 + d / ab) / (1 + 2 / ab);
      reportText += `* ${sch.name}:\n`;
      reportText += `  Dosis total: ${D.toFixed(2)} Gy (${n} fx x ${d.toFixed(2)} Gy)\n`;
      reportText += `  BED Tumor (ab=10): ${bedTumor.toFixed(2)} Gy | BED Tardío (ab=3): ${bedLate.toFixed(2)} Gy\n`;
      reportText += `  EQD2 (ab=${ab} Gy): ${eqd2Local.toFixed(2)} Gy\n`;
    });

    reportText += `\nGenerado con RadBioCalc Pro. El modelo lineal-cuadrático tiene menor exactitud con dosis >8 Gy/fracción. Creado por el Dr. Vicente Badillo Hernández. Utilizar criterio médico de soporte.`;

    // Clipboard fallback por restricciones de iFrame
    const textarea = document.createElement('textarea');
    textarea.value = reportText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('No se pudo copiar el texto', err);
    }
    document.body.removeChild(textarea);
  };

  // Filtrar los presets de la guía de referencia
  const filteredPresetsTumor = ALPHABETA_PRESETS.tumores.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.detail.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPresetsSanos = ALPHABETA_PRESETS.sanos.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.detail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Header Principal */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-lg text-white">Rβ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                RadBioCalc Pro
                <span className="text-[10px] font-semibold tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase">
                  v2.5 Clínico
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Soporte radiobiológico avanzado para oncólogos radioterapeutas
              </p>
            </div>
          </div>

          {/* Configuración rápida global de Alpha/Beta */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2 max-w-full sm:max-w-md">
            <span className="text-xs font-medium text-slate-400 ml-1">α/β Global:</span>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => handlePresetSelect(10)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${alphaBeta === 10 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}
              >
                10 (Tumor)
              </button>
              <button
                onClick={() => handlePresetSelect(3)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${alphaBeta === 3 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}
              >
                3 (Tardío)
              </button>
              <button
                onClick={() => handlePresetSelect(1.5)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${alphaBeta === 1.5 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}
              >
                1.5 (Próstata)
              </button>
              
              <div className="relative flex items-center gap-1 bg-slate-850 border border-slate-750 rounded px-1.5 py-0.5 w-20">
                <input
                  type="number"
                  placeholder="Manual"
                  value={customAlphaBeta}
                  onChange={(e) => handleCustomAlphaBetaChange(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-none text-right font-bold text-indigo-400"
                  step="0.1"
                  min="0.1"
                />
                <span className="text-[10px] text-slate-500 font-bold">Gy</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navegación lateral izquierda */}
        <aside className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Herramientas</h2>
            
            <button
              onClick={() => setActiveTab('directo')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'directo' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M12 7h.01M9 11h.01M12 17h.01M11 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-6" />
              </svg>
              Cálculo de BED y EQD2
            </button>

            <button
              onClick={() => setActiveTab('inverso')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'inverso' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Cálculo de Dosis Inverso
            </button>

            <button
              onClick={() => setActiveTab('comparar')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'comparar' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Comparador Clínico
            </button>

            <button
              onClick={() => setActiveTab('tiempo')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'tiempo' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tiempo y Repoblación
            </button>

            <button
              onClick={() => setActiveTab('curva')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'curva' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Curva de Supervivencia
            </button>

            <button
              onClick={() => setActiveTab('guia')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'guia' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Guía de α/β de la Literatura
            </button>

            <button
              onClick={() => setActiveTab('estudio')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition border ${activeTab === 'estudio' ? 'bg-violet-600/15 text-violet-400 border-violet-500/20' : 'text-slate-300 hover:bg-slate-800/60 border-transparent'}`}
            >
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Orientación y Estudio
            </button>

            {/* Nueva pestaña de Re-irradiación */}
            <button
              onClick={() => setActiveTab('reirradiacion')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition border ${activeTab === 'reirradiacion' ? 'bg-rose-600/15 text-rose-400 border-rose-500/20 shadow-sm' : 'text-slate-300 hover:bg-slate-800/60 border-transparent'}`}
            >
              <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H12M4 8h12M4 8l4-4M4 8l4 4" />
              </svg>
              Análisis de Re-irradiación
            </button>
          </div>

          {/* Tarjeta de Resumen Rápido / Exportar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Esquema Activo</h3>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Dosis Total:</span>
                  <span className="font-bold text-white">{resultsDirect.totalDose.toFixed(1)} Gy</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Fraccionamiento:</span>
                  <span className="font-bold text-white">{resultsDirect.fractions} fx de {resultsDirect.dosePerFx.toFixed(2)} Gy</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>BED (α/β = {alphaBeta}):</span>
                  <span className="font-bold text-emerald-400">{resultsDirect.bed.toFixed(2)} Gy</span>
                </div>
                <div className="flex justify-between">
                  <span>EQD2 (α/β = {alphaBeta}):</span>
                  <span className="font-bold text-violet-400">{resultsDirect.eqd2.toFixed(2)} Gy</span>
                </div>
              </div>
            </div>

            <button
              onClick={copyReportToClipboard}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-750'}`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Reporte Copiado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copiar Reporte Clínico
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Zona de cálculo principal */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Alerta de Seguridad Radiobiológica si las dosis por fracción son extremas */}
          {resultsDirect.dosePerFx > 8.0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex gap-3 text-yellow-300">
              <svg className="w-6 h-6 shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-xs">
                <span className="font-bold block text-sm mb-1">Precaución: Hipofraccionamiento Extremo ({resultsDirect.dosePerFx.toFixed(2)} Gy/fx)</span>
                A dosis mayores de 8 Gy por fracción, la aproximación del modelo Lineal-Cuadrático convencional tiende a perder precisión clínica puesto que sobrestima la muerte celular al no considerar la saturación del daño celular en dosis altas (como se detalla en *Basic Clinical Radiobiology*, cap 10). Se aconseja interpretar los BED/EQD2 con cautela y usar modelos como el Lineal-Cuadrático-Lineal (LQ-L) en SBRT.
              </div>
            </div>
          )}

          {/* TAB 1: CÁLCULO DIRECTO */}
          {activeTab === 'directo' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Calculadora Radiobiológica Convencional</h3>
                  <p className="text-xs text-slate-400">Ingresa el fraccionamiento para obtener el BED y el EQD2 clínico equivalente.</p>
                </div>
                <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl">
                  <button
                    onClick={() => setCalcMode('d_n')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${calcMode === 'd_n' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Dosis/fx + Fx
                  </button>
                  <button
                    onClick={() => setCalcMode('D_n')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${calcMode === 'D_n' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Dosis Total + Fx
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Inputs */}
                <div className="md:col-span-1 space-y-4">
                  {calcMode === 'd_n' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dosis por Fracción (d)</label>
                      <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                        <input
                          type="number"
                          value={inputDosePerFx}
                          onChange={(e) => setInputDosePerFx(parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-lg font-bold text-white w-full focus:outline-none"
                          step="0.1"
                          min="0"
                        />
                        <span className="text-xs font-bold text-indigo-400">Gy</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="20"
                        step="0.1"
                        value={inputDosePerFx}
                        onChange={(e) => setInputDosePerFx(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 mt-2"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dosis Física Total (D)</label>
                      <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                        <input
                          type="number"
                          value={inputTotalDose}
                          onChange={(e) => setInputTotalDose(parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-lg font-bold text-white w-full focus:outline-none"
                          step="0.5"
                          min="0"
                        />
                        <span className="text-xs font-bold text-indigo-400">Gy</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="120"
                        step="0.5"
                        value={inputTotalDose}
                        onChange={(e) => setInputTotalDose(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 mt-2"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Número de Fracciones (n)</label>
                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                      <input
                        type="number"
                        value={inputFractions}
                        onChange={(e) => setInputFractions(parseInt(e.target.value) || 0)}
                        className="bg-transparent text-lg font-bold text-white w-full focus:outline-none"
                        step="1"
                        min="1"
                      />
                      <span className="text-xs font-bold text-indigo-400">fracciones</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      step="1"
                      value={inputFractions}
                      onChange={(e) => setInputFractions(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 mt-2"
                    />
                  </div>
                </div>

                {/* Gran Visor de Resultados */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 flex flex-col justify-between shadow-inner">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">BED Resultante</span>
                      <p className="text-4xl font-extrabold text-emerald-400 tracking-tight">
                        {resultsDirect.bed.toFixed(2)}
                        <span className="text-sm font-bold text-emerald-500 ml-1">Gy</span>
                      </p>
                    </div>
                    <div className="mt-4 border-t border-slate-900 pt-3 text-xs text-slate-400">
                      Calculado con α/β de {alphaBeta} Gy.<br/>
                      Fórmula: <span className="font-mono text-slate-300">D × (1 + d/[α/β])</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 flex flex-col justify-between shadow-inner">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">EQD2 Clínico</span>
                      <p className="text-4xl font-extrabold text-violet-400 tracking-tight">
                        {resultsDirect.eqd2.toFixed(2)}
                        <span className="text-sm font-bold text-violet-500 ml-1">Gy</span>
                      </p>
                    </div>
                    <div className="mt-4 border-t border-slate-900 pt-3 text-xs text-slate-400">
                      Equivalente en fracciones de 2.0 Gy.<br/>
                      Fórmula: <span className="font-mono text-slate-300">BED / (1 + 2/[α/β])</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
                    <span className="font-bold text-white block mb-1">Demostración Numérica:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono">
                      <li>Dosis Total (D) = {resultsDirect.fractions} × {resultsDirect.dosePerFx.toFixed(2)} Gy = {resultsDirect.totalDose.toFixed(2)} Gy</li>
                      <li>BED = {resultsDirect.totalDose.toFixed(2)} × (1 + {resultsDirect.dosePerFx.toFixed(2)} / {alphaBeta}) = {resultsDirect.bed.toFixed(2)} Gy</li>
                      <li>EQD2 = {resultsDirect.bed.toFixed(2)} / (1 + 2 / {alphaBeta}) = {resultsDirect.eqd2.toFixed(2)} Gy</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CÁLCULO INVERSO */}
          {activeTab === 'inverso' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Planificación Inversa Radiobiológica</h3>
                <p className="text-xs text-slate-400">Introduce el BED o EQD2 clínico objetivo que deseas alcanzar para que el software diseñe las dosis fraccionadas óptimas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Inputs */}
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tipo de Objetivo</label>
                    <div className="grid grid-cols-2 bg-slate-950 p-1 border border-slate-850 rounded-xl">
                      <button
                        onClick={() => setTargetType('bed')}
                        className={`text-xs py-1.5 rounded-lg font-semibold transition ${targetType === 'bed' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        BED Target
                      </button>
                      <button
                        onClick={() => setTargetType('eqd2')}
                        className={`text-xs py-1.5 rounded-lg font-semibold transition ${targetType === 'eqd2' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        EQD2 Target
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Valor Objetivo (Gy)</label>
                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                      <input
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-lg font-bold text-white w-full focus:outline-none"
                        step="0.5"
                        min="0"
                      />
                      <span className="text-xs font-bold text-indigo-400">Gy</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      step="0.5"
                      value={targetValue}
                      onChange={(e) => setTargetValue(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Número de Fracciones deseado (n)</label>
                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                      <input
                        type="number"
                        value={targetFractions}
                        onChange={(e) => setTargetFractions(parseInt(e.target.value) || 0)}
                        className="bg-transparent text-lg font-bold text-white w-full focus:outline-none"
                        step="1"
                        min="1"
                      />
                      <span className="text-xs font-bold text-indigo-400">fx</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="65"
                      step="1"
                      value={targetFractions}
                      onChange={(e) => setTargetFractions(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 mt-2"
                    />
                  </div>
                </div>

                {/* Resultados Inversos */}
                <div className="md:col-span-2">
                  {resultsInverse.isValid ? (
                    <div className="flex flex-col gap-4 h-full">
                      <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 flex flex-col justify-between shadow-inner flex-1">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Esquema Propuesto Calculado</span>
                          
                          <div className="grid grid-cols-2 gap-4 my-2">
                            <div className="border-r border-slate-800 pr-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Dosis por fracción (d):</span>
                              <p className="text-3xl font-extrabold text-indigo-400">{resultsInverse.dosePerFx.toFixed(3)} <span className="text-xs text-slate-400">Gy</span></p>
                            </div>
                            <div className="pl-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Dosis Física Total (D):</span>
                              <p className="text-3xl font-extrabold text-white">{resultsInverse.totalDose.toFixed(2)} <span className="text-xs text-slate-400">Gy</span></p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                            Para alcanzar un <span className="text-indigo-400 font-semibold">{targetType.toUpperCase()} de {targetValue} Gy</span> utilizando <span className="text-white font-semibold">{targetFractions} fracciones</span> (con un cociente α/β de {alphaBeta} Gy), la dosis por fracción calculada de manera analítica es de <span className="text-white font-bold">{resultsInverse.dosePerFx.toFixed(2)} Gy</span> por aplicación, lo cual suma una dosis total prescrita de <span className="text-white font-bold">{resultsInverse.totalDose.toFixed(2)} Gy</span>.
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-900 grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-500">BED de Control:</span> <span className="font-bold text-emerald-400">{resultsInverse.calculatedBed.toFixed(2)} Gy</span>
                          </div>
                          <div>
                            <span className="text-slate-500">EQD2 de Control:</span> <span className="font-bold text-violet-400">{resultsInverse.calculatedEqd2.toFixed(2)} Gy</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 text-xs text-indigo-300">
                        <span className="font-bold text-indigo-400 block mb-1">Fundamento Algebraico Utilizado:</span>
                        Se resolvió algebraicamente la ecuación cuadrática cuadrando el factor de sensibilidad tisular por la ecuación lineal cuadrática para hallar la raíz de daño letal acumulado:
                        <div className="mt-2 text-center font-mono font-bold text-indigo-200">
                          d = [-ab + √(ab² + 4 × ab × BED_target / n)] / 2
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 rounded-2xl p-10 border border-slate-850 flex items-center justify-center text-center text-slate-500 h-full">
                      <div>
                        <svg className="w-12 h-12 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Parámetros de cálculo no válidos o insuficientes.
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: COMPARADOR DE ESQUEMAS */}
          {activeTab === 'comparar' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Comparador de Esquemas de Radioterapia</h3>
                <p className="text-xs text-slate-400">Modifica y compara de manera interactiva hasta 3 planes de dosis física simultáneamente para observar su efecto biológico.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {schedules.map((sch) => {
                  const d = parseFloat(sch.dosePerFx) || 0;
                  const n = parseInt(sch.fractions) || 0;
                  const D = d * n;
                  // BED para tumor (ab = 10)
                  const bedTumor = D * (1 + d / 10);
                  // BED para tejido sano tardío (ab = 3)
                  const bedLate = D * (1 + d / 3);
                  // EQD2 para el alphaBeta global actual
                  const ab = parseFloat(alphaBeta);
                  const eqd2Local = D * (1 + d / ab) / (1 + 2 / ab);

                  return (
                    <div key={sch.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col gap-4 shadow-sm hover:border-slate-800 transition">
                      <div className="border-b border-slate-900 pb-2">
                        <input
                          type="text"
                          value={sch.name}
                          onChange={(e) => updateSchedule(sch.id, 'name', e.target.value)}
                          className="bg-transparent font-bold text-sm text-indigo-400 focus:outline-none w-full border-b border-transparent focus:border-indigo-500 pb-0.5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Dosis por Fx</label>
                          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                            <input
                              type="number"
                              value={sch.dosePerFx}
                              onChange={(e) => updateSchedule(sch.id, 'dosePerFx', parseFloat(e.target.value) || 0)}
                              className="bg-transparent text-xs font-bold text-white w-full focus:outline-none"
                              step="0.1"
                            />
                            <span className="text-[10px] text-slate-500 font-bold">Gy</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fracciones</label>
                          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                            <input
                              type="number"
                              value={sch.fractions}
                              onChange={(e) => updateSchedule(sch.id, 'fractions', parseInt(e.target.value) || 0)}
                              className="bg-transparent text-xs font-bold text-white w-full focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs border-t border-slate-900 pt-3 flex-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dosis Física Total:</span>
                          <span className="font-bold text-white">{D.toFixed(1)} Gy</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">BED Tumor (α/β = 10):</span>
                          <span className="font-bold text-emerald-400">{bedTumor.toFixed(1)} Gy</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">BED Sano (α/β = 3):</span>
                          <span className="font-bold text-yellow-500">{bedLate.toFixed(1)} Gy</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-900 pt-2">
                          <span className="text-indigo-400 font-semibold">EQD2 (α/β = {alphaBeta}):</span>
                          <span className="font-bold text-indigo-400">{eqd2Local.toFixed(1)} Gy</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs text-slate-400">
                <span className="font-bold text-slate-200 block mb-1">Análisis Comparativo Clínico</span>
                La comparación automática demuestra por qué el hipofraccionamiento (moderado o extremo, como el empleado en próstata, mama o metástasis óseas) requiere una dosis física total menor para alcanzar un effecto biológico similar en el tumor primario (α/β = 10), reduciendo el tiempo total de tratamiento. No obstante, incrementa el BED en el tejido de respuesta tardía (α/β = 3) si no se cuida la conformación espacial mediante técnicas avanzadas (IMRT/VMAT/SBRT).
              </div>
            </div>
          )}

          {/* TAB 4: EFECTO TIEMPO Y REPOBLACIÓN */}
          {activeTab === 'tiempo' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Factor Tiempo y Repoblación Tumoral</h3>
                <p className="text-xs text-slate-400">Calcula la pérdida biológica que se produce cuando se alarga el tratamiento de radioterapia debido a interrupciones imprevistas (gaps).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Inputs de Proliferación */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tiempo total de tratamiento (T)</label>
                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                      <input
                        type="number"
                        value={timeTotal}
                        onChange={(e) => setTimeTotal(parseInt(e.target.value) || 0)}
                        className="bg-transparent text-lg font-bold text-white w-full focus:outline-none"
                      />
                      <span className="text-xs font-bold text-indigo-400">días</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Inicio de la Proliferación (Tk)</label>
                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                      <input
                        type="number"
                        value={timeDelay}
                        onChange={(e) => setTimeDelay(parseInt(e.target.value) || 0)}
                        className="bg-transparent text-lg font-bold text-white w-full focus:outline-none"
                      />
                      <span className="text-xs font-bold text-indigo-400">días</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Tiempo de retardo celular antes de que comience la duplicación acelerada.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tiempo de duplicación tumoral (Tpot)</label>
                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                      <input
                        type="number"
                        value={timeTpot}
                        onChange={(e) => setTimeTpot(parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-lg font-bold text-white w-full focus:outline-none"
                      />
                      <span className="text-xs font-bold text-indigo-400">días</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sensibilidad intrínseca tumoral (α)</label>
                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                      <input
                        type="number"
                        value={alphaSensitivity}
                        onChange={(e) => setAlphaSensitivity(parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-lg font-bold text-white w-full focus:outline-none"
                        step="0.01"
                      />
                      <span className="text-xs font-bold text-indigo-400">Gy⁻¹</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Normalmente oscila entre 0.15 y 0.35 Gy⁻¹ para carcinomas.</span>
                  </div>
                </div>

                {/* Resultados con corrección por tiempo */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 flex flex-col justify-between shadow-inner h-full">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Análisis de Repoblación Celular</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                        <div className="border-r border-slate-800 pr-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">BED Corregido final:</span>
                          <p className="text-3xl font-extrabold text-emerald-400">{repopResults.bedCorr.toFixed(2)} <span className="text-xs text-slate-400">Gy</span></p>
                        </div>
                        <div className="pl-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Dosis Física Equivalente Perdida:</span>
                          <p className="text-3xl font-extrabold text-red-400">{repopResults.lostDoseEq.toFixed(2)} <span className="text-xs text-slate-400">Gy</span></p>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 my-4 text-xs">
                        <span className="font-semibold text-white block mb-1">Estado de la proliferación:</span>
                        <p className="text-slate-400 font-medium">{repopResults.text}</p>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        En tumores de duplicación rápida (como los de cabeza y cuello, o pulmón de células pequeñas), cada día de prolongación del tratamiento disminuye la dosis biológica efectiva efectiva administrada por la proliferación de las células tumorales clonogénicas supervivientes. Esto se conoce en la literatura radiobiológica como el factor tiempo de repoblación tardía.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                      Fórmula de Corrección: BED_final = n × d × [1 + d / (α/β)] - [ln(2) × (T - Tk) / (α × Tpot)]
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: CURVA DE SUPERVIVENCIA CELULAR */}
          {activeTab === 'curva' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Curva de Supervivencia Celular Teórica</h3>
                <p className="text-xs text-slate-400">
                  Visualiza de manera interactiva la curva de supervivencia del Modelo Lineal-Cuadrático: S = e^-(α·d + β·d²).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Sliders de la curva */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sensibilidad Intrínseca (α)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.05"
                        max="0.6"
                        step="0.01"
                        value={alphaSensitivity}
                        onChange={(e) => setAlphaSensitivity(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-xs font-bold text-indigo-400 w-12 text-right">{alphaSensitivity.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Mide la probabilidad de muerte celular por lesión de impacto directo simple de radiación.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Cociente Tisular (α/β)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.5"
                        max="20"
                        step="0.5"
                        value={alphaBeta}
                        onChange={(e) => {
                          setAlphaBeta(parseFloat(e.target.value));
                          setCustomAlphaBeta('');
                        }}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-xs font-bold text-indigo-400 w-12 text-right">{alphaBeta.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Indica la dosis a la cual el daño acumulado por impactos múltiples iguala al daño por impacto directo.</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs text-slate-400 space-y-2">
                    <span className="font-bold text-slate-200 block">Efecto del Hipofraccionamiento</span>
                    <p>
                      Observa cómo cambia la "curvatura" o hombro de la gráfica:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                      <li>Un <span className="font-bold text-white">α/β bajo (como 1.5 - 3)</span> produce una curva con mayor curvatura (hombro pronunciado), típica de tejidos de respuesta tardía o cáncer de próstata.</li>
                      <li>Un <span className="font-bold text-white">α/β alto (como 10)</span> produce una curva casi lineal en la porción inicial.</li>
                    </ul>
                  </div>
                </div>

                {/* Gráfico SVG Dinámico */}
                <div className="md:col-span-2 flex flex-col items-center justify-center bg-slate-950 rounded-2xl p-4 border border-slate-850 shadow-inner">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gráfica de Logaritmo de Fracción de Supervivencia Log₁₀(S) vs Dosis d (Gy)</span>
                  
                  {/* Renderizado de curva SVG */}
                  <div className="w-full relative h-64 sm:h-80">
                    <svg className="w-full h-full" viewBox="0 0 350 220">
                      {/* Ejes */}
                      <line x1="40" y1="20" x2="40" y2="190" stroke="#475569" strokeWidth="1.5" />
                      <line x1="40" y1="190" x2="320" y2="190" stroke="#475569" strokeWidth="1.5" />

                      {/* Etiquetas Eje Y */}
                      <text x="12" y="25" fill="#94a3b8" fontSize="8" fontWeight="bold">1.0 (0)</text>
                      <text x="10" y="53" fill="#94a3b8" fontSize="8" fontWeight="bold">0.1 (-1)</text>
                      <text x="5" y="81" fill="#94a3b8" fontSize="8" fontWeight="bold">0.01 (-2)</text>
                      <text x="1" y="109" fill="#94a3b8" fontSize="8" fontWeight="bold">1E-3 (-3)</text>
                      <text x="1" y="137" fill="#94a3b8" fontSize="8" fontWeight="bold">1E-4 (-4)</text>
                      <text x="1" y="165" fill="#94a3b8" fontSize="8" fontWeight="bold">1E-5 (-5)</text>
                      <text x="1" y="193" fill="#94a3b8" fontSize="8" fontWeight="bold">1E-6 (-6)</text>

                      {/* Etiquetas Eje X */}
                      <text x="40" y="205" fill="#94a3b8" fontSize="8" fontWeight="bold">0</text>
                      <text x="85" y="205" fill="#94a3b8" fontSize="8" fontWeight="bold">2</text>
                      <text x="130" y="205" fill="#94a3b8" fontSize="8" fontWeight="bold">4</text>
                      <text x="175" y="205" fill="#94a3b8" fontSize="8" fontWeight="bold">6</text>
                      <text x="220" y="205" fill="#94a3b8" fontSize="8" fontWeight="bold">8</text>
                      <text x="265" y="205" fill="#94a3b8" fontSize="8" fontWeight="bold">10</text>
                      <text x="310" y="205" fill="#94a3b8" fontSize="8" fontWeight="bold">12</text>

                      {/* Cuadrícula de fondo */}
                      {[25, 53, 81, 109, 137, 165, 190].map((yVal, i) => (
                        <line key={i} x1="40" y1={yVal} x2="320" y2={yVal} stroke="#1e293b" strokeDasharray="2" />
                      ))}
                      {[85, 130, 175, 220, 265, 310].map((xVal, i) => (
                        <line key={i} x1={xVal} y1="20" x2={xVal} y2="190" stroke="#1e293b" strokeDasharray="2" />
                      ))}

                      {/* Generación de Path SVG de la curva basada en inputs de React */}
                      {(() => {
                        const pts = [];
                        const bVal = alphaSensitivity / alphaBeta;
                        for (let d = 0; d <= 12; d += 0.25) {
                          const s = Math.exp(-alphaSensitivity * d - bVal * d * d);
                          const logS = s > 1e-6 ? Math.log10(s) : -6;
                          const x = 40 + (d / 12) * 270;
                          const y = 20 + (logS / -6) * 170;
                          pts.push(`${x},${y}`);
                        }
                        return (
                          <path
                            d={`M ${pts.join(' L ')}`}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="3"
                          />
                        );
                      })()}

                      {/* Punto de dosis por fracción actual */}
                      {(() => {
                        const curD = resultsDirect.dosePerFx;
                        if (curD <= 12) {
                          const bVal = alphaSensitivity / alphaBeta;
                          const sCur = Math.exp(-alphaSensitivity * curD - bVal * curD * curD);
                          const logSCur = sCur > 1e-6 ? Math.log10(sCur) : -6;
                          const markerX = 40 + (curD / 12) * 270;
                          const markerY = 20 + (logSCur / -6) * 170;

                          return (
                            <g>
                              <circle cx={markerX} cy={markerY} r="6" fill="#10b981" />
                              <text x={markerX + 10} y={markerY - 5} fill="#10b981" fontSize="9" fontWeight="bold">
                                {curD.toFixed(2)} Gy / Fx (S = {sCur.toExponential(2)})
                              </text>
                            </g>
                          );
                        }
                        return null;
                      })()}
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: GUÍA CLÍNICA DE ALPHABETA */}
          {activeTab === 'guia' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Guía de Referencia Clínica de Cocientes α/β</h3>
                <p className="text-xs text-slate-400">Valores típicos de sensibilidad tisular extraídos de los ensayos de referencia clínicos y literatura radiobiológica.</p>
              </div>

              {/* Input Buscador */}
              <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 max-w-md">
                <svg className="w-5 h-5 text-slate-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar tejido o tumor (ej. próstata, pulmón, médula)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white w-full focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tabla Tumores */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    Tejido Tumoral y Efectos Agudos (Respuesta Rápida)
                  </h4>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {filteredPresetsTumor.length > 0 ? (
                      filteredPresetsTumor.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => handlePresetSelect(p.value)}
                          className="bg-slate-950 border border-slate-850 hover:border-indigo-500/50 rounded-xl p-3 cursor-pointer transition flex justify-between items-start gap-4"
                        >
                          <div>
                            <span className="font-bold text-xs text-white block">{p.name}</span>
                            <span className="text-[11px] text-slate-400 block mt-1">{p.detail}</span>
                          </div>
                          <span className="bg-indigo-500/10 text-indigo-400 text-xs font-extrabold border border-indigo-500/20 px-2.5 py-1 rounded shrink-0 font-mono">
                            {p.value.toFixed(1)} Gy
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic p-2">No se encontraron tumores coincidentes.</p>
                    )}
                  </div>
                </div>

                {/* Tabla Tejidos Sanos */}
                <div>
                  <h4 className="text-sm font-bold text-yellow-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    Tejido Sano y Efectos Tardíos (Respuesta Lenta)
                  </h4>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {filteredPresetsSanos.length > 0 ? (
                      filteredPresetsSanos.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => handlePresetSelect(p.value)}
                          className="bg-slate-950 border border-slate-850 hover:border-yellow-500/50 rounded-xl p-3 cursor-pointer transition flex justify-between items-start gap-4"
                        >
                          <div>
                            <span className="font-bold text-xs text-white block">{p.name}</span>
                            <span className="text-[11px] text-slate-400 block mt-1">{p.detail}</span>
                          </div>
                          <span className="bg-yellow-500/10 text-yellow-400 text-xs font-extrabold border border-yellow-500/20 px-2.5 py-1 rounded shrink-0 font-mono">
                            {p.value.toFixed(1)} Gy
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic p-2">No se encontraron órganos coincidentes.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: ORIENTACIÓN Y ESTUDIO DE CONCEPTOS (GLOSARIO INTEGRADO) */}
          {activeTab === 'estudio' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-violet-400">Academia de Radiobiología y Orientación Clínica</h3>
                <p className="text-xs text-slate-400">Guía de estudio interactiva para entender la definición, la obtención experimental y las implicaciones de los parámetros radiobiológicos de referencia.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Panel lateral de selección */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-1">Conceptos Clave</span>
                  
                  {Object.keys(STUDY_MONOGRAPHS).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedStudyTerm(key)}
                      className={`text-left px-3 py-2.5 rounded-xl transition border text-xs font-semibold flex items-center justify-between ${selectedStudyTerm === key ? 'bg-violet-600/15 border-violet-500/30 text-violet-400' : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900'}`}
                    >
                      <span>{STUDY_MONOGRAPHS[key].title}</span>
                      <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-800 shrink-0 ml-2">
                        {STUDY_MONOGRAPHS[key].symbol}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Detalle pedagógico interactivo */}
                <div className="md:col-span-2 bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-inner flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <h4 className="text-base font-extrabold text-white">{STUDY_MONOGRAPHS[selectedStudyTerm].title}</h4>
                      <span className="text-xs font-extrabold text-violet-400 bg-violet-600/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                        {STUDY_MONOGRAPHS[selectedStudyTerm].symbol}
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider block mb-1">¿Qué es? (Definición Académica)</span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-900/80">
                          {STUDY_MONOGRAPHS[selectedStudyTerm].definition}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">¿Cómo se usa en la práctica clínica?</span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                          {STUDY_MONOGRAPHS[selectedStudyTerm].clinicalUse}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block mb-1">¿De dónde se obtiene y cómo se calcula?</span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-blue-500/5 p-2.5 rounded-lg border border-blue-500/10">
                          {STUDY_MONOGRAPHS[selectedStudyTerm].derivation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
                    <span>Fuentes: Basic Clinical Radiobiology / Radiotherapy Treatment Planning (LQ)</span>
                    <button 
                      onClick={() => {
                        // Acciones rápidas para cargar valores típicos según el concepto seleccionado
                        if (selectedStudyTerm === 'ab') {
                          handlePresetSelect(10);
                          setActiveTab('directo');
                        } else if (selectedStudyTerm === 'alpha') {
                          setAlphaSensitivity(0.3);
                          setActiveTab('tiempo');
                        } else if (selectedStudyTerm === 'tpot' || selectedStudyTerm === 'tk') {
                          setActiveTab('tiempo');
                        } else {
                          setActiveTab('directo');
                        }
                      }}
                      className="text-violet-400 font-bold hover:underline shrink-0"
                    >
                      Ir al cálculo dinámico →
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: ANÁLISIS DE RE-IRRADIACIÓN CLÍNICA */}
          {activeTab === 'reirradiacion' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-rose-400">Calculadora de Tolerancia a la Re-irradiación</h3>
                <p className="text-xs text-slate-400">
                  Evalúa la dosis acumulada biológica (BED) y equivalente (EQD2) corregida por la recuperación a largo plazo de los tejidos sanos, según los estándares recomendados en la literatura (Basic Clinical Radiobiology, pág. 110).
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Inputs de Configuración de Re-RT */}
                <div className="lg:col-span-1 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">1. Seleccionar Estructura Crítica (OAR)</label>
                    <select
                      value={reOarKey}
                      onChange={(e) => {
                        setReOarKey(e.target.value);
                        setReRecoveryManual(null); // Reset manual recovery factor on OAR change
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-rose-500 text-slate-200"
                    >
                      {Object.keys(REIRRAD_OARS).map((key) => (
                        <option key={key} value={key}>
                          {REIRRAD_OARS[key].name} (α/β = {REIRRAD_OARS[key].ab} Gy)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block mb-1">Nota del Tejido</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{reMetrics.detail}</p>
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Tratamiento de Radioterapia Inicial (1º)</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Dosis Total (Gy)</label>
                        <input
                          type="number"
                          value={reRT1Dose}
                          onChange={(e) => setReRT1Dose(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-white focus:outline-none"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fracciones (n)</label>
                        <input
                          type="number"
                          value={reRT1Fx}
                          onChange={(e) => setReRT1Fx(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-white focus:outline-none"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-3">
                    <span className="text-xs font-bold text-rose-300 block">Tratamiento de Re-irradiación Propuesto (2º)</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Dosis Total (Gy)</label>
                        <input
                          type="number"
                          value={reRT2Dose}
                          onChange={(e) => setReRT2Dose(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-white focus:outline-none"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fracciones (n)</label>
                        <input
                          type="number"
                          value={reRT2Fx}
                          onChange={(e) => setReRT2Fx(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-white focus:outline-none"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Intervalo y Recuperación</span>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Intervalo de tiempo (Meses)</label>
                      <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                        <input
                          type="number"
                          value={reInterval}
                          onChange={(e) => setReInterval(parseInt(e.target.value) || 0)}
                          className="bg-transparent text-sm font-bold text-white w-full focus:outline-none"
                          min="0"
                        />
                        <span className="text-[10px] font-bold text-rose-400 shrink-0">meses</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Factor de Recuperación (FR)</label>
                      <div className="flex gap-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={reRecoveryManual !== null ? reRecoveryManual : reMetrics.recoveryFactor}
                          onChange={(e) => setReRecoveryManual(parseFloat(e.target.value))}
                          className="w-full accent-rose-500"
                        />
                        <span className="text-xs font-mono font-bold text-rose-400 w-12 text-right">
                          {((reRecoveryManual !== null ? reRecoveryManual : reMetrics.recoveryFactor) * 100).toFixed(0)}%
                        </span>
                      </div>
                      {reRecoveryManual !== null && (
                        <button
                          onClick={() => setReRecoveryManual(null)}
                          className="text-[9px] text-slate-400 hover:text-white underline block mt-1"
                        >
                          Restablecer al sugerido por literatura
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Panel de Reporte y Simulación de Riesgo */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Visores de Resultados Re-RT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 flex flex-col justify-between shadow-inner">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">BED Acumulado Corregido</span>
                        <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                          {reMetrics.bedAccum.toFixed(2)}
                          <span className="text-sm font-bold text-emerald-500 ml-1">Gy_BED</span>
                        </p>
                      </div>
                      <div className="mt-4 border-t border-slate-900 pt-3 text-[10px] text-slate-400 font-mono">
                        BED1 = {reMetrics.bed1.toFixed(1)} Gy | BED2 = {reMetrics.bed2.toFixed(1)} Gy.<br/>
                        Fórmula: <span className="text-rose-300">BED2 + [BED1 × (1 - FR)]</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 flex flex-col justify-between shadow-inner">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">EQD2 Acumulado Corregido</span>
                        <p className="text-3xl font-extrabold text-violet-400 tracking-tight">
                          {reMetrics.eqd2Accum.toFixed(2)}
                          <span className="text-sm font-bold text-violet-500 ml-1">Gy_EQD2</span>
                        </p>
                      </div>
                      <div className="mt-4 border-t border-slate-900 pt-3 text-[10px] text-slate-400 font-mono">
                        EQD2_1 = {reMetrics.eqd2_1.toFixed(1)} Gy | EQD2_2 = {reMetrics.eqd2_2.toFixed(1)} Gy.<br/>
                        Fórmula: <span className="text-rose-300">EQD2_2 + [EQD2_1 × (1 - FR)]</span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progreso / Límite de Tolerancia */}
                  <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850">
                    <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                      <span className="text-slate-400">Consumo del Límite de Tolerancia de Respuesta Tardía:</span>
                      <span className="text-white font-bold">{reMetrics.pctLimit.toFixed(1)}% ({reMetrics.eqd2Accum.toFixed(1)} / {reMetrics.limitEqd2} Gy_EQD2)</span>
                    </div>
                    
                    <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${reMetrics.pctLimit >= 100 ? 'bg-gradient-to-r from-red-600 to-rose-500' : reMetrics.pctLimit >= 85 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                        style={{ width: `${Math.min(100, reMetrics.pctLimit)}%` }}
                      ></div>
                    </div>

                    <div className={`mt-4 p-3 rounded-xl border text-xs font-medium ${reMetrics.riskBg}`}>
                      <span className="font-bold block mb-1">Evaluación de Seguridad Clínica:</span>
                      El nivel de riesgo se categoriza como: <span className={`font-bold ${reMetrics.riskColor}`}>{reMetrics.riskLevel.toUpperCase()}</span>.
                      {reMetrics.pctLimit >= 100 ? (
                        <p className="mt-1 text-slate-300 leading-relaxed">
                          La dosis equivalente acumulada calculada supera el límite sugerido por la literatura clínica para evitar complicaciones tardías severas irreversibles (p. ej., mielopatía radionecrótica en médula espinal o necrosis cerebral). Se recomienda evaluar alternativas técnicas (IMRT/VMAT hiperconformadas, SBRT de rescate, braquiterapia) para reducir la dosis física real entregada a este órgano o replantear el fraccionamiento.
                        </p>
                      ) : reMetrics.pctLimit >= 85 ? (
                        <p className="mt-1 text-slate-300 leading-relaxed">
                          La dosis equivalente está muy cerca de la tolerancia del tejido normal tardío. Aunque el tratamiento es viable, es mandatorio extremar las medidas de control geométrico (IGRT diaria), realizar fusión de imágenes anatómicas de planificación y minimizar los márgenes del PTV.
                        </p>
                      ) : (
                        <p className="mt-1 text-slate-300 leading-relaxed">
                          El esquema propuesto se encuentra dentro de los límites de dosis acumulada seguros reportados por la literatura. El riesgo de inducir toxicidad tisular tardía severa a largo plazo se considera bajo, asumiendo un posicionamiento adecuado y el respeto de las restricciones físicas en el planificador (TPS).
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Fundamento Teórico y Metodológico */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs text-slate-400 space-y-2">
                    <span className="font-bold text-slate-200 block">¿Cómo interpretar estos resultados?</span>
                    <p className="leading-relaxed">
                      La tolerancia de los tejidos sanos a la re-irradiación depende de dos procesos fundamentales: la reparación del daño subletal agudo (que se completa en pocas horas) y la **recuperación a largo plazo (FR)** que se produce lentamente a lo largo de meses gracias a la repoblación celular y migración desde zonas vecinas no irradiadas.
                    </p>
                    <p className="leading-relaxed">
                      El modelo lineal-cuadrático (LQ) representa la mejor aproximación matemática disponible para simular este fenómeno en la práctica clínica diaria, aunque la estimación del factor de recuperación (FR) debe adaptarse siempre a la condición clínica individual del paciente, antecedentes quirúrgicos, y la concordancia espacial de los volúmenes de radiación previos.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </section>

      </main>

      {/* Footer del software */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:justify-between gap-2 items-center">
          <p>
            © 2026 RadBioCalc Pro. Desarrollado por el <strong>Dr. Vicente Badillo Hernández</strong>. Herramienta de simulación diseñada para fines docentes y de verificación clínica.
          </p>
          <div className="flex gap-4">
            <span className="text-emerald-500 font-bold">Modelo LQ de Alta Certeza</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Basic Clinical Radiobiology</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
