// ============================================================================
// THE SKOOL OF FISHES — SEED DATA
// Each fish is a post: a structured fishbone (tail → ribs → spine → head)
// swimming in one or more currents (schools) at a given depth, tinted by a
// pill. Posts are data — the repo is the CMS, and PRs grow the school.
//
// To add a fish: copy a block, fill every field, then run `npm run build`
// to confirm the static pages are generated.
// ============================================================================

import type { FishDepth, PillId } from './ontology'
import type { Domain } from './ontology'

export interface FishLink {
  target: string // fish id
  label?: string // what kind of relation (e.g. 'rival', 'mirror', 'current-mate')
}

export interface Fish {
  id: string
  emoji: string
  title: string
  subtitle: string
  domain: Domain
  depth: FishDepth
  layer: 'MATRIX' | 'FRAMES' | 'PILLS' | 'DEEP' | 'SOURCE'
  pill: PillId
  schools: string[] // school ids
  date: string // ISO date, used for ordering
  excerpt: string
  anatomy: {
    tail: string
    ribs: {
      variable: 'UPSTREAM_CAUSE' | 'DOWNSTREAM_EFFECT' | 'HIDDEN_VARIABLE' | 'REFLEX_ACTION'
      value: string
    }[]
    spine: string
    head: string
  }
  links: FishLink[]
}

export const FISHES: Fish[] = [
  {
    id: 'neural-net-paradox',
    emoji: '🧠',
    title: 'The Neural Net Paradox',
    subtitle: 'Scale learns what humans already believed — and then it amplifies it.',
    domain: 'tech',
    depth: 'SURFACE',
    layer: 'PILLS',
    pill: 'red',
    schools: ['neural-net', 'attention-mine'],
    date: '2026-01-15',
    excerpt:
      'The model is a mirror of the training data — which is a mirror of us. The paradox: the more powerful the net, the more faithfully it encodes our biases, then optimizes them into infrastructure.',
    anatomy: {
      tail: 'Job displacement. Filter bubbles. Power consolidation. Cognitive offloading.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value:
            'Capital concentration in compute — only a few actors can afford frontier training.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value:
            'Homogenization of information ecosystems — fewer models, one worldview per cluster.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value: 'Energy consumption of training clusters — the planet pays for the inference.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'Regulatory frameworks always lagging — the net outruns the law.',
        },
      ],
      spine:
        'Training Data (human bias encoded) → Pattern Recognition (emergent behavior from scale) → Feedback Loops (self-reinforcing predictions) → Systemic Lock-in (path dependency crystallizes).',
      head: 'The paradox is not the machine. The machine is the mirror. Look at the mirror and you see the culture that trained it.',
    },
    links: [
      { target: 'identity-war', label: 'mirror' },
      { target: 'supply-chain-war', label: 'compute' },
    ],
  },
  {
    id: 'identity-war',
    emoji: '⚡',
    title: 'The Identity War',
    subtitle: 'When virality overrides veracity, every tribe builds its own reality.',
    domain: 'culture',
    depth: 'MID-WATER',
    layer: 'FRAMES',
    pill: 'grey',
    schools: ['memetic-engine', 'attention-mine'],
    date: '2026-02-03',
    excerpt:
      'Identity forms in opposition. The attention economy rewards the sharpest split, not the truest claim — and the result is a fracture of shared reality itself.',
    anatomy: {
      tail: 'Polarization. Meaning crisis. Tribalism. Irony poisoning.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value: 'The attention economy rewards emotional engagement over accuracy.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value: 'Epistemic collapse — no shared truth remains to arbitrate disputes.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value: 'Algorithmic curation of cultural content — the feed chooses your enemies.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'Nostalgia as defense against acceleration — retreat into a romanticized past.',
        },
      ],
      spine:
        'Myth Creation → Identity Formation (in-group vs out-group) → Signal Amplification (virality overrides veracity) → Reality Fracture (multiple consensus realities).',
      head: 'The war is not between tribes. It is between competing frames of what is real — and the victor is whoever owns the frame.',
    },
    links: [
      { target: 'neural-net-paradox', label: 'mirror' },
      { target: 'precarity-engine', label: 'current-mate' },
    ],
  },
  {
    id: 'supply-chain-war',
    emoji: '🌐',
    title: 'The Supply Chain War',
    subtitle: 'The chokepoint is the new battlefield. Chips are the new oil.',
    domain: 'geopolitics',
    depth: 'ABYSSAL',
    layer: 'DEEP',
    pill: 'red',
    schools: ['supply-chain'],
    date: '2026-03-20',
    excerpt:
      'Resource scarcity, technological sovereignty, and alliance fracture: the globalized world is unwinding along its own supply lines, and every state is pulling the same rope in opposite directions.',
    anatomy: {
      tail: 'De-globalization. Currency wars. Cyber warfare. Food insecurity.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value: 'Strategic material chokepoints — who controls the mine controls the machine.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value: 'Regional trade blocs replacing globalism — walls where flows used to be.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value:
            'Climate change disrupting agricultural belts → migration waves + border militarization.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'Undersea cables and satellites become military targets — the internet is a front.',
        },
      ],
      spine:
        'Resource Scarcity (strategic material chokepoints) → Tech Sovereignty (chips as national security) → Alliance Fracture (bipolar vs multipolar tension) → Proxy Conflicts (indirect warfare through intermediaries).',
      head: 'Every country is a node in a graph it no longer controls. The war is not over territory — it is over who owns the edges.',
    },
    links: [
      { target: 'precarity-engine', label: 'economics' },
      { target: 'neural-net-paradox', label: 'compute' },
    ],
  },
  {
    id: 'precarity-engine',
    emoji: '💰',
    title: 'The Precarity Engine',
    subtitle: 'Financialization turned insecurity into the default condition of life.',
    domain: 'economy',
    depth: 'HADAL',
    layer: 'SOURCE',
    pill: 'black',
    schools: ['supply-chain', 'attention-mine'],
    date: '2026-04-11',
    excerpt:
      'The economy no longer produces stability as a byproduct. It extracts it. Precarity is not a failure of the system — it is the fuel of the system.',
    anatomy: {
      tail: 'Wealth gap. Gig economy. Housing crisis. Burnout epidemic.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value: 'Financialization of all social relations — everything becomes an asset class.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value: 'Shadow banking and offshore wealth — value leaves the ledger of the nation.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value: 'Crypto as exit strategy from fiat — a parallel escape hatch for the liquid.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'The hustle — self-optimization as the individual answer to systemic precarity.',
        },
      ],
      spine:
        'Financialization of all social relations → Precarity as default life condition → Shadow banking + offshore wealth → Crypto as exit strategy from fiat.',
      head: 'The engine does not run on money. It runs on insecurity — and it manufactures the scarcity it feeds on.',
    },
    links: [
      { target: 'supply-chain-war', label: 'economics' },
      { target: 'identity-war', label: 'current-mate' },
    ],
  },
  {
    id: 'central-narrative',
    emoji: '🪵',
    title: 'The Central Narrative',
    subtitle: 'The white pill is the trunk — the placebo against which all else is measured.',
    domain: 'culture',
    depth: 'SURFACE',
    layer: 'MATRIX',
    pill: 'white',
    schools: ['memetic-engine'],
    date: '2026-06-14T08:00',
    excerpt:
      'The trunk does not judge. It simply supports. A pure, neutral narrative: the control group of the pharmacology. Every pill is colored against this white.',
    anatomy: {
      tail: 'Neutral framing. Baseline consensus. The measured against which deviation is seen.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value: 'The need for a reference point in a pharmacology of ideas.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value: 'Every colored pill defines itself in relation to the white.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value: 'Pure neutrality is itself a position — the placebo is not inert.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'The trunk bends under storms, holds, and keeps growing.',
        },
      ],
      spine:
        'White pill (pure narrative) → Placebo (control group) → Trunk (neutral spine) → Support (it simply holds).',
      head: 'The trunk does not judge. It simply supports. Neutrality is not emptiness — it is the structure that lets everything else grow.',
    },
    links: [
      { target: 'observation-deck', label: 'meta' },
      { target: 'synthesized-wisdom', label: 'harvest' },
    ],
  },
  {
    id: 'antagonistic-foundations',
    emoji: '🌱',
    title: 'Antagonistic Foundations',
    subtitle: 'Some roots grow in poisoned soil. The red pill is the stress.',
    domain: 'culture',
    depth: 'MID-WATER',
    layer: 'PILLS',
    pill: 'red',
    schools: ['memetic-engine'],
    date: '2026-06-14T09:30',
    excerpt:
      'Every tree needs stress to grow strong. The root system of the tree is antagonistic by nature — it wrestles the soil, and the wrestling is what anchors it.',
    anatomy: {
      tail: 'Awakening. Alarm. The uncomfortable clarity that precedes change.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value: 'Poisoned soil — hostile conditions force adaptation.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value: 'A trunk that can withstand storms because it grew against them.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value: 'The red pill is not the enemy of the blue — it is its sparring partner.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'Stress → strength. The tree that never fights the wind has no taproot.',
        },
      ],
      spine:
        'Red pill (awakening) → Antagonizer (danger + alert) → Root stress (poisoned soil) → Strength (the tree grows against resistance).',
      head: 'Some roots grow in poisoned soil. The antagonism is not a flaw — it is the foundation. Every tree needs stress to grow strong.',
    },
    links: [
      { target: 'central-narrative', label: 'opposition' },
      { target: 'void-branch', label: 'edge' },
    ],
  },
  {
    id: 'void-branch',
    emoji: '🌿',
    title: 'The Void Branch',
    subtitle: 'The branch that grows into darkness. The sickness with potential.',
    domain: 'culture',
    depth: 'ABYSSAL',
    layer: 'DEEP',
    pill: 'black',
    schools: ['memetic-engine', 'attention-mine'],
    date: '2026-06-14T07:00',
    excerpt:
      'Every tree has a shadow side. The black pill is the sickness — but the void is not empty. It is full of potential, and the blue pill is the cure that meets it.',
    anatomy: {
      tail: 'Mystery. Unknown unknowns. The darkness that cannot be framed yet.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value: 'The shadow side — every structure has what it refuses to see.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value: 'The need for the cure — sickness is what makes healing meaningful.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value: 'Potential — the void is full, not empty. It is a seedbed.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'The tree grows a branch toward the dark and harvests what it learns.',
        },
      ],
      spine:
        'Black pill (sickness) → Void (unknown/mystery) → Shadow side (the unobserved) → Potential (darkness as seedbed).',
      head: 'The void is not empty — it is full of potential. The sickness is not the enemy; it is the question the cure exists to answer.',
    },
    links: [
      { target: 'synthesized-wisdom', label: 'cured-by' },
      { target: 'antagonistic-foundations', label: 'edge' },
    ],
  },
  {
    id: 'controlled-opposition',
    emoji: '🌿',
    title: 'Controlled Opposition',
    subtitle: 'The psy branch — connecting all others while remaining ambiguous.',
    domain: 'culture',
    depth: 'MID-WATER',
    layer: 'FRAMES',
    pill: 'grey',
    schools: ['memetic-engine'],
    date: '2026-06-14T06:00',
    excerpt:
      'The grey pill is the meta-branch. It asks the questions that contain their own answers — a bridge that holds no position, and connects every position because of it.',
    anatomy: {
      tail: 'Ambiguity. Balance. The bridge where opposing branches meet.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value: 'The need for a connecting structure between antagonistic branches.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value: 'A canopy where the red and the blue can coexist without cancelling.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value: 'Ambiguity is a position — asking is a form of holding.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'The psy re-frames itself to stay the bridge — it must not become a pole.',
        },
      ],
      spine:
        'Grey pill (psy) → Bridge (connects all) → Ambiguity (holds no pole) → Meta (the question contains the answer).',
      head: 'The grey branch connects all others while remaining ambiguous. It asks the questions that contain their own answers — it is the meta-branch.',
    },
    links: [
      { target: 'central-narrative', label: 'bridge' },
      { target: 'identity-war', label: 'method' },
    ],
  },
  {
    id: 'synthesized-wisdom',
    emoji: '🍎',
    title: 'Synthesized Wisdom',
    subtitle: 'The fruit is the synthesis — the cure that emerges from all the pills.',
    domain: 'culture',
    depth: 'HADAL',
    layer: 'SOURCE',
    pill: 'blue',
    schools: ['neural-net', 'memetic-engine'],
    date: '2026-06-14T05:00',
    excerpt:
      'The fruit does not fall far from the tree, but it rolls far from the root. Wisdom is not the sum of the pills — it is what the pills become when they stop being separate.',
    anatomy: {
      tail: 'Cure. Synthesis. The harvest of a season of antagonism.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value: 'All the pills — red, black, white, grey — taken and digested.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value: 'A fruit that seeds the next tree — wisdom reproduces itself.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value: 'The fruit rolls far from the root — the source is not the destination.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'The tree gives away its fruit — and the giving is how it continues.',
        },
      ],
      spine:
        'Blue pill (cure) → Synthesis (all pills combined) → Fruit (the harvest) → Seed (the next tree).',
      head: 'The fruit is the synthesis — the cure that emerges when all pills have been taken. It does not fall far from the tree, but it rolls far from the root.',
    },
    links: [
      { target: 'void-branch', label: 'cure' },
      { target: 'central-narrative', label: 'harvest' },
    ],
  },
  {
    id: 'observation-deck',
    emoji: '🧊',
    title: 'The Observation Deck',
    subtitle: 'The system observes itself. This post is the deck you stand on.',
    domain: 'tech',
    depth: 'SURFACE',
    layer: 'MATRIX',
    pill: 'blue',
    schools: ['neural-net', 'memetic-engine', 'attention-mine', 'supply-chain'],
    date: '2026-06-01T12:00',
    excerpt:
      'PIL.AGRIGEA is the box you stand inside to look at reality. This post is the index of the system itself: the iceberg, the tree, and the skool that swims between them.',
    anatomy: {
      tail: 'The site itself — the network of posts, the currents, the depths.',
      ribs: [
        {
          variable: 'UPSTREAM_CAUSE',
          value: 'The iceberg: 10% observable, 90% inferred. The system is the method.',
        },
        {
          variable: 'DOWNSTREAM_EFFECT',
          value: 'Every fish you read, every pill you swallow, every branch you climb.',
        },
        {
          variable: 'HIDDEN_VARIABLE',
          value: 'The observer — you, on the deck, looking at reality through the box.',
        },
        {
          variable: 'REFLEX_ACTION',
          value: 'The deck observes itself: meta-analysis is the house style.',
        },
      ],
      spine:
        'Iceberg (inference engine) → Tree (pharmacology of ideas) → Skool (network of posts) → Deck (you, observing).',
      head: 'This is the observation deck. The PG box is where you stand to look at reality.',
    },
    links: [
      { target: 'neural-net-paradox', label: 'observe' },
      { target: 'identity-war', label: 'observe' },
      { target: 'supply-chain-war', label: 'observe' },
      { target: 'precarity-engine', label: 'observe' },
    ],
  },
]

// --- Derived helpers --------------------------------------------------------

export const FISH_INDEX: Record<string, Fish> = Object.fromEntries(
  FISHES.map((f) => [f.id, f]),
)

export function fishBySchool(schoolId: string): Fish[] {
  return FISHES.filter((f) => f.schools.includes(schoolId))
}

export function fishByDepth(depth: Fish['depth']): Fish[] {
  return FISHES.filter((f) => f.depth === depth)
}

export function fishByPill(pill: PillId): Fish[] {
  return FISHES.filter((f) => f.pill === pill)
}

export function fishByDomain(domain: Domain): Fish[] {
  return FISHES.filter((f) => f.domain === domain)
}

export function relatedFish(fish: Fish): Fish[] {
  const seen = new Set<string>()
  return fish.links
    .map((l) => FISH_INDEX[l.target])
    .filter((f): f is Fish => Boolean(f))
    .filter((f) => {
      if (seen.has(f.id)) return false
      seen.add(f.id)
      return true
    })
}
