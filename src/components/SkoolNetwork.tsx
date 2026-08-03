// ============================================================================
// SKOOL NETWORK — the interactive heart of the deck.
// A dependency-free force-directed graph drawn on <canvas>: fish are emoji
// nodes (size + opacity = depth, ring = pill), edges are currents. Click a
// fish to open its bone; drag to disturb the school; chips to filter.
// The school drifts forever — it is alive, like the system it visualises.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react'
import { FISHES, FISH_INDEX } from '../data/fishes'
import { PILLS, SCHOOLS, DOMAIN_LABELS, FISH_DEPTHS } from '../data/ontology'
import type { Fish, FishLink } from '../data/fishes'
import type { Domain, FishDepth, PillId } from '../data/ontology'

// --- Filter state -----------------------------------------------------------

interface Filters {
  domains: Domain[]
  depths: FishDepth[]
  schools: string[]
  pills: PillId[]
}

const ALL_FILTERS: Filters = { domains: [], depths: [], schools: [], pills: [] }

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

// --- Node / edge model ------------------------------------------------------

interface SimNode {
  id: string
  fish: Fish
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

interface SimEdge {
  a: string
  b: string
}

// Depth → size & visibility. Surface fish are big and bright; hadal fish are
// small and dim — the deeper the truth, the harder it is to see from the deck.
const DEPTH_RADIUS: Record<FishDepth, number> = {
  SURFACE: 34,
  'MID-WATER': 28,
  ABYSSAL: 22,
  HADAL: 17,
}

const DEPTH_ALPHA: Record<FishDepth, number> = {
  SURFACE: 1,
  'MID-WATER': 0.85,
  ABYSSAL: 0.7,
  HADAL: 0.55,
}

const FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'

function makeEdges(): SimEdge[] {
  const edges: SimEdge[] = []
  const seen = new Set<string>()
  for (const fish of FISHES) {
    for (const link of fish.links) {
      if (!FISH_INDEX[link.target]) continue
      const key = [fish.id, link.target].sort().join('|')
      if (seen.has(key)) continue
      seen.add(key)
      edges.push({ a: fish.id, b: link.target })
    }
  }
  return edges
}

// Seed positions along the iceberg: y follows depth (surface high, hadal low).
function seedNodes(): SimNode[] {
  const depthOrder: FishDepth[] = ['SURFACE', 'MID-WATER', 'ABYSSAL', 'HADAL']
  const byDepth = new Map<FishDepth, Fish[]>()
  for (const d of depthOrder) byDepth.set(d, FISHES.filter((f) => f.depth === d))
  const nodes: SimNode[] = []
  for (const d of depthOrder) {
    const group = byDepth.get(d) ?? []
    group.forEach((fish, i) => {
      const spread = group.length > 1 ? i / (group.length - 1) - 0.5 : 0
      nodes.push({
        id: fish.id,
        fish,
        x: 0.5 + spread * 0.55 + (Math.random() - 0.5) * 0.08,
        y: 0.18 + (depthOrder.indexOf(d) / (depthOrder.length - 1)) * 0.6 + (Math.random() - 0.5) * 0.04,
        vx: 0,
        vy: 0,
        r: DEPTH_RADIUS[fish.depth],
      })
    })
  }
  return nodes
}

export default function SkoolNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<Filters>(ALL_FILTERS)
  const nodesRef = useRef<SimNode[]>(seedNodes())

  const [filters, setFilters] = useState<Filters>(ALL_FILTERS)
  const [selected, setSelected] = useState<Fish | null>(null)
  const [hovered, setHovered] = useState<Fish | null>(null)

  const edges = useMemo(makeEdges, [])
  const nodes = nodesRef.current
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])
  const edgesById = useMemo(() => new Map(edges.map((e) => [`${e.a}|${e.b}`, e])), [edges])

  useEffect(() => {
    filtersRef.current = filters
    // If the selected fish got filtered out, close its panel.
    if (selected) {
      const visible = isVisible(selected, filters)
      if (!visible) setSelected(null)
    }
  }, [filters, selected])

  // --- The sim --------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let raf = 0
    let running = true
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Physics tuning — gentle. The school should drift, not explode.
    const G = 2400 // repulsion strength
    const K = 0.02 // spring constant
    const REST = 190 // resting edge length
    const CENTER = 0.004 // pull toward the middle of the water
    const DAMP = 0.88
    const MAX_V = 3.2

    let hoverId: string | null = null
    let dragId: string | null = null

    const px = (v: number) => v * width
    const py = (v: number) => v * height

    const step = () => {
      if (!running) return
      const f = filtersRef.current

      const visible = nodes.filter((n) => isVisible(n.fish, f))
      const visibleIds = new Set(visible.map((n) => n.id))
      const pos = new Map(nodes.map((n) => [n.id, n]))

      // Pairwise repulsion (O(n²) — 10 fish, trivially cheap).
      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          const a = visible[i]
          const b = visible[j]
          let dx = a.x - b.x
          let dy = a.y - b.y
          let d2 = dx * dx + dy * dy
          if (d2 < 1e-6) {
            dx = Math.random() - 0.5
            dy = Math.random() - 0.5
            d2 = 1e-6
          }
          const d = Math.sqrt(d2)
          const fMag = Math.min(G / d2, 60)
          const fx = (dx / d) * fMag
          const fy = (dy / d) * fMag
          a.vx += fx
          a.vy += fy
          b.vx -= fx
          b.vy -= fy
        }
      }

      // Springs along the edges.
      for (const edge of edges) {
        const a = pos.get(edge.a)
        const b = pos.get(edge.b)
        if (!a || !b || !visibleIds.has(a.id) || !visibleIds.has(b.id)) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.sqrt(dx * dx + dy * dy) || 1e-4
        const pull = K * (d - REST / Math.max(width, 1))
        const fx = (dx / d) * pull
        const fy = (dy / d) * pull
        a.vx += fx
        a.vy += fy
        b.vx -= fx
        b.vy -= fy
      }

      // Centering + integrate.
      for (const n of visible) {
        n.vx += (0.5 - n.x) * CENTER
        n.vy += (0.42 - n.y) * CENTER
        n.vx += (Math.random() - 0.5) * 0.05 // life: a little wander
        n.vy += (Math.random() - 0.5) * 0.05
        n.vx *= DAMP
        n.vy *= DAMP
        const speed = Math.hypot(n.vx, n.vy)
        if (speed > MAX_V) {
          n.vx = (n.vx / speed) * MAX_V
          n.vy = (n.vy / speed) * MAX_V
        }
        n.x = Math.min(0.95, Math.max(0.05, n.x + n.vx * 0.004))
        n.y = Math.min(0.92, Math.max(0.06, n.y + n.vy * 0.004))
      }

      draw(ctx, f, hoverId, dragId)
      raf = requestAnimationFrame(step)
    }

    // --- Drawing -------------------------------------------------------------
    const draw = (
      c: CanvasRenderingContext2D,
      f: Filters,
      hover: string | null,
      drag: string | null
    ) => {
      c.clearRect(0, 0, width, height)

      const visible = nodes.filter((n) => isVisible(n.fish, f))
      const visibleIds = new Set(visible.map((n) => n.id))

      // Edge pass.
      for (const edge of edges) {
        const a = nodeById.get(edge.a)
        const b = nodeById.get(edge.b)
        if (!a || !b || !visibleIds.has(a.id) || !visibleIds.has(b.id)) continue
        const dim = hover && hover !== a.id && hover !== b.id
        c.beginPath()
        c.moveTo(px(a.x), py(a.y))
        c.lineTo(px(b.x), py(b.y))
        c.strokeStyle = dim ? 'rgba(0,240,255,0.04)' : 'rgba(0,240,255,0.14)'
        c.lineWidth = 1
        c.stroke()
      }

      // Node pass.
      for (const n of visible) {
        const isHover = hover === n.id
        const isSel = selected?.id === n.id
        const dim = hover && !isHover && !isLinked(n.id, hover)
        drawNode(c, n, { dim, isHover, isSel, isDrag: drag === n.id, isFiltered: false })
      }
    }

    const drawNode = (
      c: CanvasRenderingContext2D,
      n: SimNode,
      o: { dim: boolean; isHover: boolean; isSel: boolean; isDrag: boolean; isFiltered: boolean }
    ) => {
      const x = px(n.x)
      const y = py(n.y)
      const pill = PILLS[n.fish.pill]
      const alpha = DEPTH_ALPHA[n.fish.depth] * (o.dim ? 0.22 : 1)

      // Halo ring in pill color.
      c.save()
      c.globalAlpha = alpha * (o.isHover || o.isSel ? 1.15 : 0.9)
      c.shadowColor = pill.color
      c.shadowBlur = o.isHover || o.isSel ? 26 : 14
      c.beginPath()
      c.arc(x, y, n.r + 4, 0, Math.PI * 2)
      c.strokeStyle = pill.color
      c.lineWidth = o.isSel ? 2.5 : 1.5
      c.stroke()
      c.shadowBlur = 0

      // The fish itself (emoji).
      c.font = `${n.r * 1.5}px ${FONT}`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.globalAlpha = alpha
      c.fillText(n.fish.emoji, x, y + 1)

      // Label under the fish.
      c.font = '700 10px "SF Mono", "JetBrains Mono", Menlo, monospace'
      c.letterSpacing = '1px'
      c.globalAlpha = alpha * (o.isHover || o.isSel ? 1 : 0.5)
      c.fillStyle = o.isHover || o.isSel ? pill.color : '#8b949e'
      const label = n.fish.title.length > 22 ? `${n.fish.title.slice(0, 21)}…` : n.fish.title
      c.fillText(label.toUpperCase(), x, y + n.r + 16)
      c.restore()
    }

    const isLinked = (id: string, hoverId: string): boolean => {
      const fish = FISH_INDEX[id]
      return fish.links.some((l) => l.target === hoverId)
    }

    // --- Pointer interaction ---------------------------------------------------
    const hitTest = (clientX: number, clientY: number): SimNode | null => {
      const rect = canvas.getBoundingClientRect()
      const mx = (clientX - rect.left) / rect.width
      const my = (clientY - rect.top) / rect.height
      let best: SimNode | null = null
      let bestD = 32
      for (const n of nodes) {
        if (!isVisible(n.fish, filtersRef.current)) continue
        const d = Math.hypot(n.x - mx, n.y - my)
        if (d < bestD) {
          bestD = d
          best = n
        }
      }
      return best
    }

    const onPointerMove = (e: PointerEvent) => {
      const hit = hitTest(e.clientX, e.clientY)
      hoverId = hit?.id ?? null
      setHovered(hit ? hit.fish : null)
      canvas.style.cursor = hit ? 'pointer' : 'crosshair'
    }

    const onPointerDown = (e: PointerEvent) => {
      const hit = hitTest(e.clientX, e.clientY)
      if (!hit) {
        setSelected(null)
        return
      }
      dragId = hit.id
      canvas.setPointerCapture(e.pointerId)
    }

    const onPointerMoveDrag = (e: PointerEvent) => {
      if (!dragId) return
      const rect = canvas.getBoundingClientRect()
      const n = nodeById.get(dragId)
      if (!n) return
      n.x = (e.clientX - rect.left) / rect.width
      n.y = (e.clientY - rect.top) / rect.height
      n.vx = 0
      n.vy = 0
    }

    const onPointerUp = (e: PointerEvent) => {
      if (dragId) {
        const fish = nodeById.get(dragId)?.fish ?? null
        setSelected(fish)
        dragId = null
        try {
          canvas.releasePointerCapture(e.pointerId)
        } catch {
          /* noop */
        }
      }
    }

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointermove', onPointerMoveDrag)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', () => (dragId = null))

    raf = requestAnimationFrame(step)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointermove', onPointerMoveDrag)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges, nodeById])

  // --- Rendering -------------------------------------------------------------
  const toggleFilter = <T,>(key: keyof Filters, value: T) => {
    setFilters((prev) => ({ ...prev, [key]: toggle(prev[key] as unknown as T[], value) }))
  }

  const isActive = (key: keyof Filters, value: string) =>
    (filters[key] as unknown as string[]).includes(value)

  return (
    <div>
      <div class="network-toolbar" role="toolbar" aria-label="Skool filters">
        <span class="mono faint" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', alignSelf: 'center', marginRight: 'var(--space-2)' }}>
          FILTER
        </span>
        {FISH_DEPTHS.map((d) => (
          <button
            key={d.id}
            class={`btn ${isActive('depths', d.id) ? 'btn--active' : ''}`}
            onClick={() => toggleFilter('depths', d.id)}
            aria-pressed={isActive('depths', d.id)}
          >
            {d.meter} {d.label}
          </button>
        ))}
        {(Object.keys(DOMAIN_LABELS) as Domain[]).map((dom) => (
          <button
            key={dom}
            class={`btn ${isActive('domains', dom) ? 'btn--active' : ''}`}
            onClick={() => toggleFilter('domains', dom)}
            aria-pressed={isActive('domains', dom)}
          >
            {DOMAIN_LABELS[dom]}
          </button>
        ))}
        {(Object.keys(PILLS) as PillId[]).map((p) => (
          <button
            key={p}
            class={`btn ${isActive('pills', p) ? 'btn--active' : ''}`}
            onClick={() => toggleFilter('pills', p)}
            aria-pressed={isActive('pills', p)}
            style={isActive('pills', p) ? { borderColor: PILLS[p].color, color: PILLS[p].color } : undefined}
          >
            {PILLS[p].name}
          </button>
        ))}
      </div>

      <div class="network-chips">
        {SCHOOLS.map((s) => (
          <button
            key={s.id}
            class={`tag ${isActive('schools', s.id) ? 'tag--active' : ''}`}
            onClick={() => toggleFilter('schools', s.id)}
            aria-pressed={isActive('schools', s.id)}
            style={{ background: 'none', cursor: 'pointer' }}
          >
            {s.symbol} {s.name}
          </button>
        ))}
        <span class="mono faint" style={{ fontSize: '0.7rem', alignSelf: 'center' }}>
          {hovered ? `▲ ${hovered.title} — ${PILLS[hovered.pill].name} · ${hovered.depth}` : 'HOVER TO INSPECT · DRAG TO DISTURB'}
        </span>
      </div>

      <div class="network-wrap" ref={wrapRef}>
        <canvas class="network-canvas" ref={canvasRef} aria-label="Interactive network of the skool of fishes"></canvas>

        {selected && (
          <aside class="network-panel" role="dialog" aria-label={`${selected.title} fishbone`}>
            <button class="network-panel__close" onClick={() => setSelected(null)} aria-label="Close panel">
              CLOSE ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>{selected.emoji}</span>
              <div>
                <h3 style={{ marginBottom: '2px' }}>{selected.title}</h3>
                <span class="mono faint" style={{ fontSize: '0.72rem' }}>{selected.subtitle}</span>
              </div>
            </div>

            <div class="fish-card__meta" style={{ marginBottom: 'var(--space-4)' }}>
              <span class="pill-badge" style={{ color: PILLS[selected.pill].color, borderColor: PILLS[selected.pill].color }}>
                <span class="pill-badge__dot" style={{ background: PILLS[selected.pill].color }}></span>
                {PILLS[selected.pill].name}
              </span>
              <span class="tag">{DOMAIN_LABELS[selected.domain]}</span>
              <span class="depth-tag">⬇ {selected.depth}</span>
            </div>

            <p class="muted" style={{ fontSize: '0.92rem' }}>{selected.excerpt}</p>

            <div class="fishbone__spine" style={{ margin: 'var(--space-4) 0', fontSize: '0.78rem' }}>
              <span class="fishbone__label">SPINE</span>
              <span>{selected.anatomy.spine}</span>
            </div>

            <p class="mono" style={{ fontSize: '0.85rem', color: 'var(--cyan)', borderLeft: '2px solid var(--cyan)', paddingLeft: 'var(--space-3)' }}>
              {selected.anatomy.head}
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <a class="btn" href={`/fishes/${selected.id}/`}>READ THE FISHBONE →</a>
            </div>
          </aside>
        )}
      </div>

      <div class="network-legend">
        {SCHOOLS.map((s) => (
          <span key={s.id}>{s.symbol} {s.name}</span>
        ))}
        <span class="network-hint">SIZE + LIGHT = DEPTH · RING = PILL · EDGE = CURRENT</span>
      </div>
    </div>
  )
}

// --- Filter predicate --------------------------------------------------------

function isVisible(fish: Fish, f: Filters): boolean {
  if (f.depths.length && !f.depths.includes(fish.depth)) return false
  if (f.domains.length && !f.domains.includes(fish.domain)) return false
  if (f.pills.length && !f.pills.includes(fish.pill)) return false
  if (f.schools.length && !fish.schools.some((s) => f.schools.includes(s))) return false
  return true
}
