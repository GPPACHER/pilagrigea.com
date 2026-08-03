// ============================================================================
// PIL.AGRIGEA — ONTOLOGY
// The distilled conceptual core shared by every page and island.
// Iceberg (inference engine) × Tree (pill pharmacology) × Skool (post network).
// ============================================================================

// --- Iceberg layers ---------------------------------------------------------
// The iceberg is an inference engine: 10% observable, 90% inferred.
// Observation deck at 0m. Each layer descends toward the SOURCE paradigm.

export interface IcebergLayer {
  id: 'MATRIX' | 'FRAMES' | 'PILLS' | 'DEEP' | 'SOURCE'
  name: string
  depth: string
  percent: number
  tagline: string
  description: string
  flow: string // how this layer feeds the one below / above
}

export const ICEBERG_LAYERS: IcebergLayer[] = [
  {
    id: 'MATRIX',
    name: 'The Matrix of Observation',
    depth: '0m',
    percent: 100,
    tagline: 'Does not explain. It presents.',
    description:
      'The surface where effects are first seen. Raw observation, data points, events — visible to anyone standing on the deck. Nothing here is interpreted yet.',
    flow: 'MATRIX observes effects → FRAMES detects patterns',
  },
  {
    id: 'FRAMES',
    name: 'The Frames of Pattern',
    depth: '-50m',
    percent: 60,
    tagline: 'Taxonomies, timelines, maps.',
    description:
      'Pattern recognition. The layer that groups observations into structures: categories, sequences, maps. A frame is a way of seeing — useful, never final.',
    flow: 'FRAMES detects patterns → PILLS infers mechanisms',
  },
  {
    id: 'PILLS',
    name: 'The Pills of Insight',
    depth: '-200m',
    percent: 25,
    tagline: 'Pills are hypotheses, not facts.',
    description:
      'Inference. Heuristics and working models distilled from patterns. A pill is a lens you swallow and test against reality — it can be verified, and it can be wrong.',
    flow: 'PILLS infers mechanisms → DEEP validates causality',
  },
  {
    id: 'DEEP',
    name: 'The Deep of Analysis',
    depth: '-500m',
    percent: 10,
    tagline: 'Consensus built — or broken.',
    description:
      'Causal analysis. The fishbone goes tail to head here: effects traced to variables, variables to mechanisms, mechanisms to paradigms. The deep is where consensus is tested.',
    flow: 'DEEP validates causality → SOURCE reveals paradigms',
  },
  {
    id: 'SOURCE',
    name: 'The Source of Paradigm',
    depth: '-1000m',
    percent: 2,
    tagline: 'Bedrock. The paradigm itself.',
    description:
      'The bedrock of the system: self-hosted infrastructure, trading algorithms, and the methodology itself. Paradigms are rarely seen and almost never moved — but everything above rests on them.',
    flow: 'feedback ascends — SOURCE shapes every layer above',
  },
]

export const ICEBERG_FLOW =
  'MATRIX observes effects → FRAMES detects patterns → PILLS infers mechanisms → DEEP validates causality → SOURCE reveals paradigms'

// --- Fishbone anatomy -------------------------------------------------------
// Each fish (post) is structured as a fishbone: tail → ribs → spine → head.

export type FishDepth = 'SURFACE' | 'MID-WATER' | 'ABYSSAL' | 'HADAL'

export interface FishboneAnatomy {
  tail: string // Effects — what is observed on the surface
  ribs: Rib[]
  spine: string // Mechanism — the thread that connects head to tail
  head: string // Paradigm — the deep truth the fish points at
}

export interface Rib {
  variable: 'UPSTREAM_CAUSE' | 'DOWNSTREAM_EFFECT' | 'HIDDEN_VARIABLE' | 'REFLEX_ACTION'
  label: string
  value: string
}

export const RIB_DEFS: Record<Rib['variable'], string> = {
  UPSTREAM_CAUSE: 'Upstream Cause — what feeds the mechanism',
  DOWNSTREAM_EFFECT: 'Downstream Effect — what the mechanism feeds',
  HIDDEN_VARIABLE: 'Hidden Variable — the invisible hand in the water',
  REFLEX_ACTION: 'Reflex Action — how the system reacts to itself',
}

export const FISH_DEPTHS: { id: FishDepth; label: string; meter: string }[] = [
  { id: 'SURFACE', label: 'Surface', meter: '0m' },
  { id: 'MID-WATER', label: 'Mid-Water', meter: '-50m' },
  { id: 'ABYSSAL', label: 'Abyssal', meter: '-200m' },
  { id: 'HADAL', label: 'Hadal', meter: '-500m' },
]

// --- The Tree ---------------------------------------------------------------
// ROOTS → TRUNK → BRANCHES → FRUITS. The tree is the pharmacology of pills.

export type PillId = 'blue' | 'red' | 'black' | 'white' | 'grey'
export type PillState = 'CURE' | 'ANTAGONIZER' | 'SICKNESS' | 'PLACEBO' | 'PSY'

export interface Pill {
  id: PillId
  name: string
  color: string
  state: PillState
  maturity: 'mature' | 'medium' | 'low' | 'stable' | 'meta'
  relations: string
  description: string
}

export const PILLS: Record<PillId, Pill> = {
  blue: {
    id: 'blue',
    name: 'BLUE',
    color: '#0066CC',
    state: 'CURE',
    maturity: 'mature',
    relations: 'Truth · Calm · Verified · Cures the black',
    description:
      'The cure. Verified, calm, truthful. The blue pill resolves the sickness of the void. Red antagonizes it — the two sharpen each other.',
  },
  red: {
    id: 'red',
    name: 'RED',
    color: '#CC0000',
    state: 'ANTAGONIZER',
    maturity: 'medium',
    relations: 'Danger · Awakening · Alert · Complements the blue',
    description:
      'The antagonist. A warning and a wake-up call. The red pill introduces stress into the system — and stress is what makes a tree strong.',
  },
  black: {
    id: 'black',
    name: 'BLACK',
    color: '#1a1a1a',
    state: 'SICKNESS',
    maturity: 'low',
    relations: 'Void · Unknown · Mystery · Cured by the blue',
    description:
      'The sickness. The branch that grows into darkness. The void is not empty — it is full of potential, and it must be treated carefully.',
  },
  white: {
    id: 'white',
    name: 'WHITE',
    color: '#E8E8E8',
    state: 'PLACEBO',
    maturity: 'stable',
    relations: 'Pure · Neutral · Control · The trunk itself',
    description:
      'The placebo. Pure, neutral, stable — the control group against which every other pill is measured. The trunk does not judge; it simply supports.',
  },
  grey: {
    id: 'grey',
    name: 'GREY',
    color: '#666666',
    state: 'PSY',
    maturity: 'meta',
    relations: 'Balance · Ambiguity · Bridge · The meta-branch',
    description:
      'The psy. The branch that connects all others while remaining ambiguous. It asks the questions that contain their own answers.',
  },
}

export interface TreePart {
  id: 'ROOTS' | 'TRUNK' | 'BRANCHES' | 'FRUITS'
  label: string
  description: string
  pillIds: PillId[]
}

export const TREE_PARTS: TreePart[] = [
  {
    id: 'ROOTS',
    label: 'Roots',
    description: 'The foundations — where the tree draws its stress and its soil.',
    pillIds: ['red'],
  },
  {
    id: 'TRUNK',
    label: 'Trunk',
    description: 'The neutral spine — the placebo all other pills are measured against.',
    pillIds: ['white'],
  },
  {
    id: 'BRANCHES',
    label: 'Branches',
    description: 'Where the pills grow — antagonism, void, and the ambiguous bridge.',
    pillIds: ['black', 'grey'],
  },
  {
    id: 'FRUITS',
    label: 'Fruits',
    description: 'The synthesis — the cure that emerges when all pills have been taken.',
    pillIds: ['blue'],
  },
]

// --- Schools (currents) -----------------------------------------------------
// Each fish swims in the same current. Schools are the water, not the fish.

export interface School {
  id: 'neural-net' | 'memetic-engine' | 'attention-mine' | 'supply-chain'
  name: string
  symbol: string
  description: string
}

export const SCHOOLS: School[] = [
  {
    id: 'neural-net',
    name: 'Neural Net',
    symbol: '🧠',
    description: 'The current of computation — models, training, feedback, lock-in.',
  },
  {
    id: 'memetic-engine',
    name: 'Memetic Engine',
    symbol: '🧬',
    description: 'The current of meaning — myths, identity, virality, shared reality.',
  },
  {
    id: 'attention-mine',
    name: 'Attention Mine',
    symbol: '👁',
    description: 'The current of scarcity — attention, extraction, addiction, erosion.',
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    symbol: '⛓',
    description: 'The current of material flows — resources, chips, trade, war.',
  },
]

export const SCHOOL_ID_INDEX = Object.fromEntries(
  SCHOOLS.map((s, i) => [s.id, i]),
) as Record<School['id'], number>

// --- Domains ----------------------------------------------------------------
export const DOMAINS = ['tech', 'culture', 'economy', 'geopolitics'] as const
export type Domain = (typeof DOMAINS)[number]

export const DOMAIN_LABELS: Record<Domain, string> = {
  tech: 'Technology',
  culture: 'Culture',
  economy: 'Economy',
  geopolitics: 'Geopolitics',
}

// --- Site-wide motto --------------------------------------------------------
export const TAGLINES = {
  observation: 'This is the observation deck. The PG box is where you stand to look at reality.',
  flow: 'OBSERVE → INFER → ANALYZE → DISTILL',
  cook: 'WE ARE COOKING KNOWLEDGE',
  ethos: 'SELF.HOSTED // NO.DEPENDENCIES',
  pharmacology:
    'A living pharmacology of ideas… They oppose. They complement. They are the sickness and the cure.',
}
