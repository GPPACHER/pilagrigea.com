// ============================================================================
// TREE EXPLORER — the pharmacology of ideas.
// A vertical tree (fruits at the canopy, roots in the soil). Click a part to
// see its pills; click a pill to read its description and which parts + fish
// it lives in. The tree and the skool are the same system, drawn twice.
// ============================================================================

import { useMemo, useState } from 'react'
import { PILLS, TREE_PARTS } from '../data/ontology'
import type { PillId } from '../data/ontology'
import { FISHES } from '../data/fishes'

const PILL_ORDER: PillId[] = ['white', 'blue', 'red', 'black', 'grey']

export default function TreeExplorer() {
  const [selectedPill, setSelectedPill] = useState<PillId | null>(null)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)

  const pillCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const f of FISHES) counts[f.pill] = (counts[f.pill] || 0) + 1
    return counts
  }, [])

  const pill = selectedPill ? PILLS[selectedPill] : null

  const partsInPill = (pillId: PillId) =>
    TREE_PARTS.filter((p) => p.pillIds.includes(pillId))

  return (
    <div class="grid grid--2">
      {/* The tree itself */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[...TREE_PARTS]
            .sort((a, b) => partIndex(b.id) - partIndex(a.id))
            .map((part) => (
              <button
                key={part.id}
                class="btn"
                style={selectedPart === part.id
                  ? { borderColor: 'var(--cyan)', color: 'var(--cyan)', textAlign: 'left' }
                  : { textAlign: 'left' }}
                onClick={() => setSelectedPart(selectedPart === part.id ? null : part.id)}
                aria-pressed={selectedPart === part.id}
              >
                <span class="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.26em', display: 'block', marginBottom: '4px' }}>
                  {part.id}
                </span>
                <span style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {part.pillIds.map((pid) => (
                    <span
                      key={pid}
                      class="pill-badge"
                      style={{ color: PILLS[pid].color, borderColor: PILLS[pid].color, cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPill(selectedPill === pid ? null : pid)
                        setSelectedPart(null)
                      }}
                      role="button"
                      aria-label={`Pill ${PILLS[pid].name}`}
                    >
                      <span class="pill-badge__dot" style={{ background: PILLS[pid].color }}></span>
                      {PILLS[pid].name}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {selectedPart && (
              <p class="muted mono" style={{ fontSize: '0.85rem', margin: 0 }}>
                {TREE_PARTS.find((p) => p.id === selectedPart)?.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* The pill readout */}
      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 'var(--space-5)', background: 'var(--bg-1)', minHeight: '260px' }}>
        {pill ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <span class="pill-badge" style={{ color: pill.color, borderColor: pill.color }}>
                <span class="pill-badge__dot" style={{ background: pill.color }}></span>
                {pill.name}
              </span>
              <span class="tag">{pill.state}</span>
              <span class="tag">{pill.maturity}</span>
            </div>
            <p style={{ marginBottom: 'var(--space-3)' }}>{pill.description}</p>
            <p class="mono faint" style={{ fontSize: '0.8rem', marginBottom: 'var(--space-4)' }}>
              {pill.relations}
            </p>
            <div class="fish-card__meta" style={{ marginBottom: 'var(--space-3)' }}>
              <span class="tag">LIVES IN: {partsInPill(pill.id).map((p) => p.id).join(' · ') || '—'}</span>
              <span class="tag">FISH: {pillCounts[pill.id] || 0}</span>
            </div>
            {pill.id === 'blue' && (
              <p class="mono" style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>
                "The fruit is the synthesis — the cure that emerges when all pills have been taken."
              </p>
            )}
            {pill.id === 'white' && (
              <p class="mono" style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>
                "The trunk does not judge. It simply supports."
              </p>
            )}
          </>
        ) : (
          <p class="muted" style={{ margin: 0 }}>
            <span class="mono" style={{ color: 'var(--cyan)' }}>// NO PILL SELECTED</span>
            <br />
            Tap a pill on the tree — or a tree part — to read its pharmacology.
            The pill matrix: BLUE truth/calm/verified, RED danger/awakening,
            BLACK void/unknown, WHITE pure/neutral control, GREY balance/bridge.
          </p>
        )}
      </div>
    </div>
  )
}

function partIndex(id: string): number {
  return TREE_PARTS.findIndex((p) => p.id === id)
}
