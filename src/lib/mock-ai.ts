import { ModuleNote, VTUAnswer, ImportantQuestion, QuizQuestion, DiagramExplanation, RevisionPlan, DailyPlan, ChatMessage, Citation } from './types';
import { DEMO_QUIZ_QUESTIONS, DEMO_CHAT_RESPONSES, DEMO_DIAGRAM_EXPLANATIONS, MARKS_OPTIONS } from './constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateSummary(pdfName: string, subject: string, module: string): Promise<ModuleNote> {
  await delay(800);
  
  const summaries: Record<string, string> = {
    'Module 1: Electrochemistry': 'Electrochemistry deals with the relationship between electrical energy and chemical changes. Key concepts: Electrochemical cells (galvanic/voltaic), Nernst equation for electrode potential, concentration cells (with/without transference), electrochemical series, and applications like batteries and corrosion. The Nernst equation E = E° - (RT/nF)lnQ relates potential to concentration. Standard hydrogen electrode (SHE) is reference. Applications: Daniel cell, fuel cells, corrosion monitoring.',
    'Module 2: Corrosion': 'Corrosion is the deterioration of metals by electrochemical reaction with environment. Types: Dry (chemical) and Wet (electrochemical). Wet corrosion mechanism: Anode (oxidation: M→Mⁿ⁺+ne⁻), Cathode (reduction: O₂+2H₂O+4e⁻→4OH⁻), Electrolyte, Metallic path. Forms: Uniform, Galvanic, Pitting, Crevice, Stress corrosion, Intergranular. Prevention: Cathodic protection (sacrificial anode, impressed current), anodic protection, coatings, inhibitors, material selection.',
    'Module 3: Nanomaterials': 'Nanomaterials have at least one dimension in 1-100 nm range. Properties differ from bulk due to quantum confinement and high surface area. Synthesis: Top-down (ball milling, lithography) and Bottom-up (sol-gel, CVD, hydrothermal, biosynthesis). Types: 0D (quantum dots), 1D (nanotubes, nanowires), 2D (graphene), 3D (nanocomposites). Carbon nanotubes: SWCNT, MWCNT. Applications: Electronics, medicine, energy storage, sensors, catalysis.',
    'Module 4: Sensors': 'Sensors convert chemical/physical quantities to electrical signals. Classification: Potentiometric (ion-selective electrodes, glass electrode for pH), Amperometric (biosensors - glucose), Conductometric, Optical, Piezoelectric. Glass electrode: pH-sensitive glass membrane, internal reference electrode. Biosensors: Bioreceptor (enzyme/antibody/DNA) + Transducer. Glucose biosensor uses glucose oxidase. Applications: Medical diagnostics, environmental monitoring, industrial process control.',
    'Module 5: Green Chemistry': 'Green Chemistry: Design of chemical products/processes that reduce/eliminate hazardous substances. 12 Principles: 1) Waste prevention, 2) Atom economy, 3) Less hazardous synthesis, 4) Safer chemicals, 5) Safer solvents, 6) Energy efficiency, 7) Renewable feedstocks, 8) Reduce derivatives, 9) Catalysis, 10) Degradability, 11) Real-time analysis, 12) Inherently safer chemistry. Atom economy = (MW product/ΣMW reactants)×100. Examples: Supercritical CO₂ solvent, microwave synthesis, biocatalysis.',
  };

  const formulas: Record<string, string[]> = {
    'Module 1: Electrochemistry': [
      'E = E° - (RT/nF) ln Q',
      'E = E° + (0.0591/n) log[Mⁿ⁺] (at 298K)',
      'EMF_cell = E_cathode - E_anode',
      'Concentration cell (no transference): E = (0.0591/n) log(C₂/C₁)',
      'ΔG = -nFE',
    ],
    'Module 2: Corrosion': [
      'Anode: M → Mⁿ⁺ + ne⁻',
      'Cathode (neutral): O₂ + 2H₂O + 4e⁻ → 4OH⁻',
      'Cathode (acidic): 2H⁺ + 2e⁻ → H₂',
      'Corrosion rate ∝ i_corr (corrosion current)',
      'Faraday\'s law: m = (I × t × M) / (n × F)',
    ],
    'Module 3: Nanomaterials': [
      'Surface area ∝ 1/r',
      'Quantum confinement: E_g(nano) = E_g(bulk) + h²/8mr²',
      'SPR wavelength shift with size',
      'BET surface area measurement',
    ],
    'Module 4: Sensors': [
      'Nernst equation for ISE: E = E° + (0.0591/n) log a',
      'Glass electrode: E = k + 0.0591 pH',
      'Amperometric: i = nFADc/δ',
      'Michaelis-Menten: v = V_max[S]/(K_m + [S])',
    ],
    'Module 5: Green Chemistry': [
      'Atom Economy = (MW desired product / ΣMW all reactants) × 100',
      'E-factor = Total waste (kg) / Product (kg)',
      'Process Mass Efficiency = Product mass / Total mass input × 100',
    ],
  };

  return {
    id: `note-${Date.now()}`,
    pdfId: `pdf-${Date.now()}`,
    module,
    subject,
    summary: summaries[module] || `Summary for ${module} of ${subject}`,
    keyFormulas: formulas[module] || [],
    importantQuestions: [],
    generatedAt: new Date().toISOString(),
  };
}

export async function generateVTUAnswer(question: string, marks: number, subject: string = 'Engineering Chemistry'): Promise<VTUAnswer> {
  await delay(1000);
  
  const wordCounts = { 3: 60, 5: 120, 7: 180, 8: 220, 10: 300 };
  const targetWords = wordCounts[marks as keyof typeof wordCounts] || 150;
  
  const baseAnswer = getBaseAnswer(question, subject);
  
  return {
    definition: baseAnswer.definition,
    explanation: baseAnswer.explanation,
    constructionPrinciple: marks >= 5 ? baseAnswer.constructionPrinciple : undefined,
    working: marks >= 5 ? baseAnswer.working : undefined,
    diagramInstructions: marks >= 7 ? baseAnswer.diagramInstructions : undefined,
    applications: baseAnswer.applications,
    conclusion: baseAnswer.conclusion,
    wordCount: targetWords,
    marks,
  };
}

function getBaseAnswer(question: string, subject: string) {
  const q = question.toLowerCase();
  
  if (q.includes('nernst')) {
    return {
      definition: 'The Nernst equation relates the electrode potential of an electrochemical half-cell to the standard electrode potential, temperature, and reaction quotient (concentration of species).',
      explanation: 'For a half-cell reaction Mⁿ⁺ + ne⁻ ⇌ M, the electrode potential is given by E = E° - (RT/nF) ln(1/[Mⁿ⁺]) = E° + (RT/nF) ln[Mⁿ⁺]. At 298K, E = E° + (0.0591/n) log[Mⁿ⁺]. For a full cell, E_cell = E°_cell - (RT/nF) ln Q where Q is the reaction quotient. This equation is fundamental for calculating cell potentials under non-standard conditions.',
      constructionPrinciple: 'Based on thermodynamic relationship between Gibbs free energy and electrical work: ΔG = -nFE. At equilibrium, ΔG = -RT ln K. Combining gives the Nernst equation.',
      working: 'The equation shows how electrode potential changes with concentration. As [Mⁿ⁺] increases, E becomes more positive (for reduction). This principle is used in concentration cells, pH measurement (glass electrode), and ion-selective electrodes.',
      diagramInstructions: 'Draw a concentration cell: Two beakers with same electrolyte at different concentrations (C₁ and C₂), identical metal electrodes, salt bridge connecting them, voltmeter measuring EMF. Label anode (lower conc.), cathode (higher conc.), ion flow in salt bridge.',
      applications: [
        'Calculation of cell EMF under non-standard conditions',
        'Determination of pH using glass electrode',
        'Ion-selective electrodes for specific ion detection',
        'Concentration cells for precise potential measurements',
        'Corrosion potential monitoring',
        'Battery state-of-charge estimation',
      ],
      conclusion: 'The Nernst equation is a cornerstone of electrochemistry, bridging thermodynamics and electrical measurements. It enables quantitative analysis of electrochemical systems and is essential for designing batteries, sensors, and corrosion protection systems.',
    };
  }
  
  if (q.includes('corrosion') && q.includes('mechanism')) {
    return {
      definition: 'Electrochemical corrosion is the deterioration of metal due to redox reactions with its environment, involving anodic oxidation and cathodic reduction reactions connected by an electrolyte and metallic path.',
      explanation: 'Corrosion occurs when four components are present: 1) Anode (metal oxidizes: M → Mⁿ⁺ + ne⁻), 2) Cathode (reduction: O₂ + 2H₂O + 4e⁻ → 4OH⁻ in neutral/alkaline, or 2H⁺ + 2e⁻ → H₂ in acidic), 3) Electrolyte (moisture with dissolved salts), 4) Metallic path for electron flow. The anodic and cathodic areas can be on the same metal (local cells) or different metals (galvanic corrosion).',
      constructionPrinciple: 'The corrosion cell functions like a galvanic cell. Anodic reaction releases electrons that flow through the metal to the cathode. At the cathode, electrons are consumed by oxygen reduction or hydrogen evolution. Metal ions (Mⁿ⁺) and hydroxide ions (OH⁻) diffuse and form corrosion products (e.g., Fe₂O₃·xH₂O) typically between anode and cathode.',
      working: 'In differential aeration corrosion, oxygen-deprived areas become anodic. Waterline corrosion, crevice corrosion, and pitting are examples. The corrosion product (rust) forms away from the anode because Mⁿ⁺ and OH⁻ meet in the electrolyte between anodic and cathodic regions.',
      diagramInstructions: 'Draw metal surface with anodic (A) and cathodic (C) regions. Show thin electrolyte film. At A: M → Mⁿ⁺ + ne⁻, electrons flow through metal to C. At C: O₂ + 2H₂O + 4e⁻ → 4OH⁻. Show Mⁿ⁺ and OH⁻ diffusing to form M(OH)ₙ precipitate between A and C. Label oxygen concentration gradient.',
      applications: [
        'Cathodic protection: Sacrificial anodes (Mg, Zn) for pipelines, ships',
        'Impressed current systems for large structures',
        'Corrosion inhibitors in cooling systems',
        'Protective coatings: galvanizing, painting, anodizing',
        'Material selection: stainless steel, alloys',
        'Design considerations: avoid crevices, ensure drainage',
      ],
      conclusion: 'Understanding corrosion mechanism is crucial for designing protection strategies. The electrochemical nature allows us to control corrosion by eliminating any one of the four components: anode, cathode, electrolyte, or metallic path.',
    };
  }
  
  if (q.includes('nanomaterial') || q.includes('nanoparticle')) {
    return {
      definition: 'Nanomaterials are materials with at least one external dimension in the size range 1-100 nm. At this scale, materials exhibit unique properties due to quantum confinement effects and extremely high surface-area-to-volume ratio.',
      explanation: 'Properties change dramatically at nanoscale: 1) Quantum confinement alters electronic/optical properties (bandgap widening), 2) Surface atoms dominate (high reactivity, catalytic activity), 3) Mechanical strength increases, 4) Thermal/electrical conductivity changes. Classification: 0D (quantum dots, nanoparticles), 1D (nanotubes, nanowires, nanorods), 2D (graphene, nanosheets), 3D (nanocomposites, bulk nanomaterials).',
      constructionPrinciple: 'Synthesis approaches: Top-down (breaking bulk: ball milling, lithography, etching) and Bottom-up (building from atoms: sol-gel, chemical vapor deposition, hydrothermal, biosynthesis, self-assembly). Sol-gel: Metal alkoxide → hydrolysis → condensation → gel → calcination → nanoparticles.',
      working: 'In sol-gel, precursor (e.g., TEOS for SiO₂) hydrolyzes in alcohol/water with acid/base catalyst. Condensation forms M-O-M network (gel). Drying removes solvent (xerogel/aerogel). Calcination crystallizes nanoparticles. Size controlled by pH, temperature, concentration, catalyst.',
      diagramInstructions: 'Draw sol-gel process flowchart: Precursor → Hydrolysis → Condensation → Gelation → Aging → Drying → Calcination → Nanoparticles. Show M(OR)₄ + 4H₂O → M(OH)₄ + 4ROH (hydrolysis), M-OH + HO-M → M-O-M + H₂O (condensation). Draw nanoparticle with core-shell if coated.',
      applications: [
        'Catalysis: High surface area nanocatalysts',
        'Drug delivery: Targeted nanoparticles',
        'Electronics: CNTs, graphene transistors',
        'Energy: Li-ion battery electrodes, supercapacitors',
        'Sensors: High sensitivity gas/bio sensors',
        'Coatings: Self-cleaning, anti-reflective',
        'Medicine: Imaging, therapy, diagnostics',
      ],
      conclusion: 'Nanomaterials bridge bulk materials and atomic structures. Their tunable properties enable revolutionary applications across fields. Green synthesis methods are gaining importance for sustainable nanotechnology.',
    };
  }
  
  if (q.includes('sensor') || q.includes('glass electrode') || q.includes('biosensor')) {
    return {
      definition: 'A chemical sensor is a device that converts chemical information (concentration, activity, partial pressure) into an analytically useful electrical signal. It consists of a recognition element (receptor) and a transducer.',
      explanation: 'Classification by transduction: 1) Potentiometric: Measures potential at zero current (ISE, glass electrode). 2) Amperometric: Measures current at fixed potential (biosensors). 3) Conductometric: Measures conductivity change. 4) Optical: Measures absorbance/fluorescence. 5) Piezoelectric: Measures mass change. Glass electrode: pH-sensitive glass membrane (SiO₂-Na₂O-CaO) develops potential E = k + 0.0591 pH at 298K.',
      constructionPrinciple: 'Glass electrode: Thin pH-sensitive glass bulb (0.05-0.1 mm) sealed to glass stem. Internal: 0.1M HCl + Ag/AgCl reference electrode. External: Test solution. Potential develops due to H⁺ exchange at glass surface. Biosensor: Bioreceptor (enzyme/antibody/DNA/whole cell) immobilized on transducer. Glucose biosensor: Glucose oxidase on O₂ electrode or H₂O₂ electrode.',
      working: 'Glass electrode: H⁺ from solution exchanges with Na⁺ in glass surface layer, creating potential proportional to pH. Nernstian response: 59.16 mV/pH at 298K. Glucose biosensor: Glucose + O₂ → Gluconic acid + H₂O₂ (catalyzed by GOx). H₂O₂ oxidized at Pt anode: H₂O₂ → O₂ + 2H⁺ + 2e⁻. Current ∝ glucose concentration.',
      diagramInstructions: 'Draw glass electrode: Glass bulb, internal Ag/AgCl in 0.1M HCl, lead wire, external test solution. Show H⁺/Na⁺ exchange at glass membrane. For biosensor: Electrode → Immobilized enzyme layer → Membrane → Solution. Show reaction: Glucose + O₂ → Gluconate + H₂O₂ → detection.',
      applications: [
        'pH measurement: Clinical, environmental, industrial',
        'Blood glucose monitoring: Diabetes management',
        'Environmental: Heavy metals, pesticides, BOD',
        'Clinical: Urea, cholesterol, creatinine',
        'Food industry: Quality control, fermentation',
        'Process control: Chemical manufacturing',
      ],
      conclusion: 'Sensors enable real-time, in-situ chemical analysis. Miniaturization and integration with electronics (lab-on-chip, IoT) are expanding applications. Selectivity, stability, and response time are key performance metrics.',
    };
  }
  
  if (q.includes('green chemistry') || q.includes('atom economy')) {
    return {
      definition: 'Green Chemistry is the design of chemical products and processes that reduce or eliminate the use and generation of hazardous substances. It follows 12 principles established by Anastas and Warner (1998).',
      explanation: '12 Principles: 1) Prevent waste, 2) Maximize atom economy, 3) Use less hazardous syntheses, 4) Design safer chemicals, 5) Use safer solvents/auxiliaries, 6) Design for energy efficiency, 7) Use renewable feedstocks, 8) Reduce derivatives, 9) Use catalysts (vs stoichiometric), 10) Design for degradation, 11) Real-time analysis for pollution prevention, 12) Inherently safer chemistry. Atom Economy = (MW of desired product / Σ MW of all reactants) × 100. E-factor = Total waste / Product.',
      constructionPrinciple: 'Traditional adipic acid: Benzene → Cyclohexane → KA oil → HNO₃ oxidation → Adipic acid (N₂O byproduct). Green route: Glucose → Muconic acid (fermentation) → Hydrogenation → Adipic acid. Supercritical CO₂ (Tc=31°C, Pc=73 atm) replaces organic solvents: non-toxic, non-flammable, easily removed, tunable density.',
      working: 'In microwave-assisted synthesis, polar molecules align with oscillating field (2.45 GHz), generating heat volumetrically. Reaction rates increase 10-1000x. Biocatalysis uses enzymes/whole cells: mild conditions, high selectivity, aqueous media. Flow chemistry: continuous processing, better heat/mass transfer, safer.',
      diagramInstructions: 'Draw 12 principles as circular diagram. Show atom economy calculation: Reactants → Product + Byproducts. Draw supercritical CO₂ phase diagram. Show microwave reactor: Magnetron → Waveguide → Cavity → Reaction vessel. Compare traditional vs green synthesis flowchart.',
      applications: [
        'Pharmaceuticals: Ibuprofen (91% atom economy vs 40%), Sitagliptin',
        'Polymers: PLA from corn starch, PHA from bacteria',
        'Solvents: scCO₂, water, bio-based solvents',
        'Energy: Biofuels, solar cell materials',
        'Agriculture: Biopesticides, controlled release fertilizers',
      ],
      conclusion: 'Green chemistry is not just environmental compliance but economic advantage. Higher atom economy = less waste = lower cost. Industry adoption driven by regulation, consumer demand, and cost savings. Metrics: Atom economy, E-factor, Process mass intensity, Carbon footprint.',
    };
  }
  
  // Default generic answer
  return {
    definition: `This topic covers fundamental concepts in ${subject} related to the question asked.`,
    explanation: 'The detailed explanation would cover the theoretical background, key principles, mathematical derivations where applicable, and practical significance of the concept.',
    constructionPrinciple: 'Based on established scientific principles and experimental observations.',
    working: 'The mechanism involves sequential steps governed by thermodynamic and kinetic principles.',
    diagramInstructions: 'Draw a labeled diagram showing the key components, processes, and relationships. Include directional arrows for flows and label all important parts.',
    applications: ['Academic understanding', 'Industrial applications', 'Research and development', 'Engineering design'],
    conclusion: 'This concept is fundamental to the subject and has wide-ranging applications in engineering and technology.',
  };
}

export async function generateImportantQuestions(subject: string, module?: string): Promise<ImportantQuestion[]> {
  await delay(600);
  // Return from constants with IDs
  const { DEMO_QUESTIONS } = await import('./constants');
  return DEMO_QUESTIONS
    .filter(q => q.subject === subject && (!module || q.module === module))
    .map((q, i) => ({ ...q, id: `q-${subject}-${module || 'all'}-${i}` }));
}

export async function generateQuiz(module: string, subject: string, difficulty: string, count: number = 10): Promise<QuizQuestion[]> {
  await delay(800);
  const { DEMO_QUIZ_QUESTIONS } = await import('./constants');
  const filtered = DEMO_QUIZ_QUESTIONS.filter(q => q.module === module && q.subject === subject);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q, i) => ({ ...q, id: `quiz-${module}-${i}` }));
}

export async function generateDiagramExplanation(topic: string): Promise<DiagramExplanation> {
  await delay(500);
  const { DEMO_DIAGRAM_EXPLANATIONS } = await import('./constants');
  return DEMO_DIAGRAM_EXPLANATIONS[topic] || DEMO_DIAGRAM_EXPLANATIONS['Li-ion Battery'];
}

export async function generateRevisionPlan(
  subject: string,
  examDate: string,
  hoursPerDay: number,
  difficulty: string
): Promise<RevisionPlan> {
  await delay(1000);
  
  const exam = new Date(examDate);
  const today = new Date();
  const totalDays = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const modules = [
    'Module 1: Electrochemistry',
    'Module 2: Corrosion',
    'Module 3: Nanomaterials',
    'Module 4: Sensors',
    'Module 5: Green Chemistry',
  ];
  
  const dailyPlan: DailyPlan[] = [];
  let day = 1;
  
  for (let i = 0; i < totalDays && i < modules.length * 2; i++) {
    const moduleIndex = Math.floor(i / 2) % modules.length;
    const isSecondPass = i >= modules.length;
    
    dailyPlan.push({
      day: day++,
      date: new Date(today.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      modules: [modules[moduleIndex]],
      hours: hoursPerDay,
      tasks: [
        `Read summary of ${modules[moduleIndex]}`,
        `Review key formulas`,
        `Solve 3-5 numerical problems`,
        isSecondPass ? 'Practice previous year questions' : 'Make concise notes',
      ],
      importantQuestions: [
        `Important Q1 from ${modules[moduleIndex]}`,
        `Important Q2 from ${modules[moduleIndex]}`,
      ],
      quizPractice: i % 3 === 0,
      isRevisionDay: i >= totalDays - 3,
    });
  }
  
  // Add final revision days
  for (let i = 0; i < 3; i++) {
    dailyPlan.push({
      day: day++,
      date: new Date(today.getTime() + (totalDays - 3 + i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      modules: modules,
      hours: hoursPerDay + 1,
      tasks: ['Quick revision of all modules', 'Formula sheet review', 'Mock test', 'Weak area focus'],
      importantQuestions: ['All high priority questions'],
      quizPractice: true,
      isRevisionDay: true,
    });
  }
  
  return {
    id: `plan-${Date.now()}`,
    subject,
    examDate,
    hoursPerDay,
    difficulty: difficulty as 'easy' | 'medium' | 'hard',
    totalDays,
    dailyPlan,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateChatResponse(message: string): Promise<{ answer: string; citations: Citation[]; suggestedQuestions: string[] }> {
  await delay(800);
  const lower = message.toLowerCase();
  
  for (const [key, response] of Object.entries(DEMO_CHAT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) {
      return response;
    }
  }
  
  return DEMO_CHAT_RESPONSES.default;
}
