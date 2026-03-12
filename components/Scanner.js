'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Push registration ─────────────────────────────────────────
async function registerPush(userId) {
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    const existing = await reg.pushManager.getSubscription()
    const sub = existing || await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub, user_id: userId })
    })
  } catch (e) { console.error('Push registration failed:', e) }
}

// ── Design tokens ─────────────────────────────────────────────
const ARCH = {
  catalyst_surprise:   { label: 'Catalyst',  color: '#2563eb' },
  earnings_mispricing: { label: 'Earnings',  color: '#1e6b4a' },
  macro_pattern:       { label: 'Macro',     color: '#7c3aed' },
  deep_value:          { label: 'Deep Value',color: '#9a6b10' },
}

const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X',
  'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX',
  'XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX']

// ── Spinner ───────────────────────────────────────────────────
function Spinner({ message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--gold)',
            animation: 'breathe 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.18}s`
          }} />
        ))}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {message || 'Loading…'}
      </div>
    </div>
  )
}

// ── Level Chart ───────────────────────────────────────────────
function LevelChart({ stock, plan }) {
  const [prices, setPrices] = useState([])
  const price = stock.price
  const stop  = plan?.stop_price  || +(price * (1 - stock.stopPct / 100)).toFixed(2)
  const entry = plan?.entry_price || price
  const tp1   = plan?.tp1_price   || +(price * 1.08).toFixed(2)
  const tp2   = plan?.tp2_price   || +(price * 1.15).toFixed(2)
  const tp3   = plan?.tp3_price   || +(price * (1 + stock.upside / 100)).toFixed(2)

  useEffect(() => {
    fetch(`/api/chart?ticker=${stock.ticker}`)
      .then(r => r.json())
      .then(d => { if (d.prices) setPrices(d.prices) })
      .catch(() => {})
  }, [stock.ticker])

  const W = 608, H = 180, PAD_L = 62, PAD_R = 44, PAD_T = 14, PAD_B = 14
  const chartH = H - PAD_T - PAD_B
  const chartW = W - PAD_L - PAD_R
  const allP = [stop, entry, tp1, tp2, tp3, ...(prices.length ? prices : [price])]
  const minP = Math.min(...allP) * 0.992
  const maxP = Math.max(...allP) * 1.008
  const range = maxP - minP
  const toY = p => PAD_T + chartH - ((p - minP) / range) * chartH
  const toX = i => PAD_L + (i / Math.max(prices.length - 1, 1)) * chartW

  const levels = [
    { p: stop,  color: '#c0392b', label: 'Stop',  dash: false },
    { p: entry, color: '#c4a35a', label: 'Entry', dash: true  },
    { p: tp1,   color: '#1e6b4a', label: 'TP1',   dash: false },
    { p: tp2,   color: '#1e6b4a', label: 'TP2',   dash: false },
    { p: tp3,   color: '#1e6b4a', label: 'TP3',   dash: false },
  ]

  const linePath = prices.length > 1
    ? prices.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p).toFixed(1)}`).join(' ')
    : null

  const areaPath = linePath
    ? `${linePath} L ${toX(prices.length - 1).toFixed(1)} ${H} L ${PAD_L} ${H} Z`
    : null

  const lineColor = prices.length > 1 && prices[prices.length-1] > prices[0] ? '#1e6b4a' : '#c0392b'

  return (
    <div style={{ background: '#0e0d0b', borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`g_${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill={`url(#g_${stock.ticker})`} />}
        {linePath && <path d={linePath} fill="none" stroke={lineColor} strokeWidth={1.5} opacity={0.85} />}
        {levels.map(({ p, color, label, dash }) => {
          const y = toY(p)
          return (
            <g key={label}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke={color} strokeWidth={1} strokeDasharray={dash ? '5 4' : 'none'} opacity={0.85} />
              <text x={PAD_L - 5} y={y + 4} textAnchor="end" fill={color} fontSize={8.5} fontFamily="monospace">${p}</text>
              <text x={W - PAD_R + 5} y={y + 4} textAnchor="start" fill={color} fontSize={8.5} fontFamily="monospace" opacity={0.75}>{label}</text>
            </g>
          )
        })}
        {prices.length > 0 && (
          <circle cx={toX(prices.length - 1)} cy={toY(price)} r={3} fill="var(--gold2)" />
        )}
      </svg>
    </div>
  )
}

// ── Follow Button ─────────────────────────────────────────────
function FollowButton({ stock, plan, userId }) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (!userId || !stock.ticker) return
    fetch(`/api/follow?user_id=${userId}`)
      .then(r => r.json())
      .then(d => setFollowing((d.following || []).includes(stock.ticker)))
  }, [stock.ticker, userId])

  const toggle = async () => {
    if (!userId) return
    setLoading(true)
    const entry = plan?.entry_price || +(stock.price).toFixed(2)
    const stop  = plan?.stop_price  || +(stock.price * (1 - stock.stopPct / 100)).toFixed(2)
    const tp1   = plan?.tp1_price   || +(stock.price * 1.08).toFixed(2)
    const tp2   = plan?.tp2_price   || +(stock.price * 1.15).toFixed(2)
    const tp3   = plan?.tp3_price   || +(stock.price * (1 + stock.upside / 100)).toFixed(2)
    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ticker: stock.ticker, entry, stop, tp1, tp2, tp3, active: true, plan_data: plan })
    })
    const data = await res.json()
    setFollowing(data.following)
    if (data.following) registerPush(userId)
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading} style={{
      width: '100%',
      background: following ? 'transparent' : 'var(--ink)',
      color: following ? 'var(--green)' : 'var(--gold2)',
      border: following ? '1px solid var(--green)' : 'none',
      padding: '15px', borderRadius: 6,
      fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      cursor: 'pointer', opacity: loading ? 0.6 : 1,
      transition: 'all 0.18s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {!following && <span style={{ width: 6, height: 6, background: 'var(--gold2)', transform: 'rotate(45deg)', display: 'inline-block' }} />}
      {loading ? '…' : following ? '✓ Following' : 'Follow & Alert'}
      {!following && <span style={{ width: 6, height: 6, background: 'var(--gold2)', transform: 'rotate(45deg)', display: 'inline-block' }} />}
    </button>
  )
}

// ── Plan Modal ────────────────────────────────────────────────
function PlanModal({ stock, onClose, userId }) {
  const [plan, setPlan]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const load = () => {
    setLoading(true); setError(false)
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...stock, user_id: userId })
    })
      .then(r => r.json())
      .then(p => { setPlan(p); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

  useEffect(() => { load() }, [stock.ticker])

  const arch = ARCH[stock.archetype] || ARCH.catalyst_surprise
  const isShort = plan?.direction === 'SHORT'

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(14,13,11,0.65)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--cream)', width: '100%', maxWidth: 660,
        maxHeight: '90vh', overflowY: 'auto',
        borderTop: '2px solid var(--gold)', borderRadius: '12px 12px 0 0',
        position: 'relative',
      }}>
        {/* decorative arc */}
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 180, height: 180, borderRadius: '50%',
          border: '1px solid var(--cream2)', pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{
          padding: '26px 30px 20px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--cream)', zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 58, fontWeight: 300, lineHeight: 0.92, letterSpacing: '0.02em' }}>
              {stock.ticker}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {plan?.direction && (
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '4px 12px', borderRadius: 40,
                  background: isShort ? '#fdf0ee' : '#e8f5ed',
                  color: isShort ? 'var(--red)' : 'var(--green)',
                }}>
                  {isShort ? '▼ Short' : '▲ Long'}
                </span>
              )}
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '4px 12px', borderRadius: 40,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--muted)',
              }}>
                {arch.label}
              </span>
              {plan?.conviction && (
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}>
                  {plan.conviction} Conviction
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'transparent', border: '1px solid var(--border)',
            padding: '8px 16px', borderRadius: 40, color: 'var(--muted)',
            transition: 'all 0.18s',
          }}>
            Close ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '26px 30px 30px' }}>
          {loading ? (
            <Spinner message="AI analyzing setup…" />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.08em', marginBottom: 14 }}>
                Could not load AI plan
              </div>
              <button onClick={load} style={{
                fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'var(--ink)', color: 'var(--gold2)', border: 'none',
                padding: '10px 20px', borderRadius: 40, cursor: 'pointer',
              }}>Retry</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Chart */}
              <LevelChart stock={stock} plan={plan} />

              {/* Thesis */}
              <div style={{
                fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 300,
                lineHeight: 1.75, color: 'var(--ink2)',
                paddingBottom: 18, borderBottom: '1px solid var(--border)',
              }}>
                {plan.thesis}
              </div>

              {/* Overhang */}
              <div style={{
                background: plan.overhang_rational === false ? '#e8f5ed' : '#fdf5e8',
                borderLeft: `3px solid ${plan.overhang_rational === false ? 'var(--green)' : 'var(--gold)'}`,
                padding: '14px 16px', borderRadius: '0 6px 6px 0',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: plan.overhang_rational === false ? 'var(--green)' : 'var(--gold)', marginBottom: 6 }}>
                  {plan.overhang_rational === false ? 'Selloff Irrational — Mispricing Confirmed' : 'Selloff Has Merit — Monitor Closely'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>{plan.overhang_reasoning}</div>
              </div>

              {/* Resolution */}
              <div style={{ background: 'var(--cream2)', padding: '14px 16px', borderRadius: 6 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                  Catalyst / Resolution
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>{plan.overhang_resolution}</div>
              </div>

              {/* Levels grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                {[
                  { label: 'Stop',  price: plan.stop_price,  note: plan.stop_logic,  color: 'var(--red)',   dark: false },
                  { label: 'Entry', price: plan.entry_price, note: plan.entry_price_note, color: 'var(--gold2)', dark: true  },
                  { label: 'TP1',   price: plan.tp1_price,   note: plan.tp1_logic,   color: 'var(--green)', dark: false },
                  { label: 'TP2',   price: plan.tp2_price,   note: plan.tp2_logic,   color: 'var(--green)', dark: false },
                  { label: 'TP3',   price: plan.tp3_price,   note: plan.tp3_logic,   color: 'var(--green)', dark: false },
                ].map(({ label, price, note, color, dark }) => (
                  <div key={label} style={{
                    padding: '14px 10px 12px', borderRadius: 8, textAlign: 'center',
                    background: dark ? 'var(--ink)' : 'var(--cream2)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {dark && <div style={{ position: 'absolute', bottom: -16, right: -16, width: 52, height: 52, borderRadius: '50%', border: '1px solid var(--gold)', opacity: 0.4 }} />}
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7, color: dark ? 'rgba(255,255,255,0.4)' : 'var(--muted)' }}>
                      {label}
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, lineHeight: 1, color }}>
                      ${price}
                    </div>
                    {note && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 7, marginTop: 5, color: dark ? 'rgba(255,255,255,0.3)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {note}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Meta row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Instrument', val: plan.instrument },
                  { label: 'Timeframe',  val: plan.timeframe  },
                  { label: 'Risk / Reward', val: null, big: `${plan.rr}R` },
                ].map(({ label, val, big }) => (
                  <div key={label} style={{ padding: '13px 15px', background: 'var(--cream2)', borderRadius: 8 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>{label}</div>
                    {big
                      ? <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 300, color: 'var(--ink)', lineHeight: 1 }}>{big}</div>
                      : <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{val}</div>
                    }
                  </div>
                ))}
              </div>

              {/* Risk note */}
              <div style={{
                background: '#fdf5ee', borderLeft: '3px solid var(--gold)',
                padding: '14px 18px', borderRadius: '0 6px 6px 0',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 5 }}>Risk Note</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink2)' }}>{plan.risk_note}</div>
                </div>
              </div>

              {/* Follow button */}
              <FollowButton stock={stock} plan={plan} userId={userId} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Scanner ───────────────────────────────────────────────────
const CACHE_TTL = 24 * 60 * 60 * 1000

export default function Scanner({ profile }) {
  const [stocks, setStocks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [loadMsg, setLoadMsg] = useState('Checking cache…')
  const [error, setError]     = useState(null)
  const [filter, setFilter]   = useState('all')
  const [sort, setSort]       = useState('score')
  const [search, setSearch]   = useState('')
  const [expanded, setExpanded] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  const loadStocks = async (forceRefresh = false) => {
    setLoading(true); setError(null)
    if (!forceRefresh) {
      try {
        const { data: cached } = await supabase
          .from('scanner_cache').select('*')
          .order('created_at', { ascending: false }).limit(1).single()
        if (cached) {
          const age = Date.now() - new Date(cached.created_at).getTime()
          if (age < CACHE_TTL) {
            setStocks(cached.data); setUpdatedAt(cached.created_at)
            setLoading(false); return
          }
        }
      } catch {}
    }
    setLoadMsg('Fetching live data…')
    try {
      const res = await fetch('/api/scanner')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      await supabase.from('scanner_cache').insert({ data: json.stocks, created_at: new Date().toISOString() })
      setStocks(json.stocks); setUpdatedAt(json.updatedAt)
      setLoading(false)
    } catch (err) {
      setError(err.message); setLoading(false)
    }
  }

  useEffect(() => { loadStocks() }, [])

  const FILTERS = [
    { id: 'all',                label: 'All' },
    { id: 'long',               label: '▲ Long' },
    { id: 'short',              label: '▼ Short' },
    { id: 'oversold',           label: 'Oversold' },
    { id: 'overbought',         label: 'Overbought' },
    { id: 'earnings_mispricing',label: 'Earnings' },
    { id: 'macro_pattern',      label: 'Macro' },
    { id: 'deep_value',         label: 'Deep Value' },
  ]

  const displayed = [...stocks]
    .filter(s => {
      if (filter === 'all')        return true
      if (filter === 'long')       return s.direction === 'long'
      if (filter === 'short')      return s.direction === 'short'
      if (filter === 'oversold')   return s.rsi < 35
      if (filter === 'overbought') return s.rsi > 70
      return s.archetype === filter
    })
    .filter(s => !search || s.ticker.includes(search.toUpperCase()) || s.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'rr' ? b.rr - a.rr : sort === 'growth' ? b.rev_growth - a.rev_growth : b.score - a.score)

  return (
    <div style={{ paddingBottom: 60 }}>
      {expanded && <PlanModal stock={expanded} onClose={() => setExpanded(null)} userId={profile?.id} />}

      {/* ── Hero ──────────────────────────── */}
      <div style={{
        padding: '44px 0 36px', borderBottom: '1px solid var(--border)',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'flex-end',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', right: -100, top: -80, width: 360, height: 360, borderRadius: '50%', border: '1px solid var(--border)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 80, top: -20, width: 160, height: 160, borderRadius: '50%', border: '1px solid var(--cream2)', pointerEvents: 'none' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 24, height: 1, background: 'var(--gold)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Edge Scanner — Live
            </span>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
            Today's<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>High Conviction</em><br />
            Setups
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)', letterSpacing: '0.03em', lineHeight: 1.6 }}>
            150-stock universe · scored on fundamentals, macro, mispricing & technicals
            {updatedAt && (
              <span> · Updated {new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 300, lineHeight: 1, color: 'var(--ink)' }}>
              {displayed.length}<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}></em>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 3 }}>Setups Found</div>
          </div>
          <button onClick={() => loadStocks(true)} style={{
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--muted)', padding: '8px 16px', borderRadius: 40,
            cursor: 'pointer', transition: 'all 0.18s',
          }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading ? <Spinner message={loadMsg} /> : error ? (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 16 }}>Error: {error}</div>
          <button onClick={() => loadStocks(true)} style={{
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
            background: 'var(--ink)', color: 'var(--gold2)', border: 'none',
            padding: '10px 22px', borderRadius: 40, cursor: 'pointer',
          }}>Retry</button>
        </div>
      ) : (
        <>
          {/* ── Controls ────────────────── */}
          <div style={{ padding: '18px 0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{
                  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.09em', textTransform: 'uppercase',
                  padding: '5px 13px', border: '1px solid', borderRadius: 40,
                  borderColor: filter === f.id ? 'var(--ink)' : 'var(--border)',
                  background: filter === f.id ? 'var(--ink)' : 'transparent',
                  color: filter === f.id ? 'var(--gold2)' : 'var(--muted)',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                style={{
                  fontFamily: 'var(--mono)', fontSize: 10, background: 'transparent',
                  border: '1px solid var(--border)', color: 'var(--ink)',
                  padding: '6px 12px', borderRadius: 40, outline: 'none', width: 120,
                  letterSpacing: '0.06em',
                }} />
              <select value={sort} onChange={e => setSort(e.target.value)} style={{
                fontFamily: 'var(--mono)', fontSize: 9, background: 'var(--cream)',
                border: '1px solid var(--border)', color: 'var(--muted)',
                padding: '6px 12px', borderRadius: 40, outline: 'none',
                letterSpacing: '0.06em',
              }}>
                <option value="score">Edge Score</option>
                <option value="rr">R/R Ratio</option>
                <option value="growth">Rev Growth</option>
              </select>
            </div>
          </div>

          {/* ── Column headers ──────────── */}
          <div style={{
            display: 'grid', gridTemplateColumns: '36px 1fr 80px 70px 70px 96px',
            gap: 16, padding: '10px 0 8px',
            borderBottom: '1px solid var(--ink)',
            fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--muted)',
          }}>
            <div>#</div>
            <div>Stock</div>
            <div style={{ textAlign: 'right' }}>Score</div>
            <div style={{ textAlign: 'right' }}>RSI</div>
            <div style={{ textAlign: 'right' }}>R/R</div>
            <div />
          </div>

          {/* ── Rows ────────────────────── */}
          {displayed.map((s, i) => {
            const arch = ARCH[s.archetype] || ARCH.catalyst_surprise
            return (
              <div key={s.ticker} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr 80px 70px 70px 96px',
                gap: 16, alignItems: 'center', padding: '18px 0',
                borderBottom: '1px solid var(--border)', cursor: 'pointer',
                animation: `fadeUp 0.4s ease ${Math.min(i * 0.04, 0.3)}s both`,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream2)'; e.currentTarget.style.marginLeft = '-32px'; e.currentTarget.style.paddingLeft = '32px'; e.currentTarget.style.marginRight = '-32px'; e.currentTarget.style.paddingRight = '32px' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.marginLeft = '0'; e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.marginRight = '0'; e.currentTarget.style.paddingRight = '0' }}
                onClick={() => setExpanded(s)}
              >
                {/* Rank */}
                <div style={{ fontFamily: 'var(--serif)', fontSize: 12, fontStyle: 'italic', color: 'var(--border)' }}>
                  {roman[i] || i + 1}
                </div>

                {/* Ticker + info */}
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1, color: 'var(--ink)' }}>
                    {s.ticker}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontWeight: 400 }}>{s.name}</div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 40,
                      background: s.direction === 'short' ? '#fdf0ee' : '#e8f5ed',
                      color: s.direction === 'short' ? 'var(--red)' : 'var(--green)',
                    }}>
                      {s.direction === 'short' ? '▼ Short' : '▲ Long'}
                    </span>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.07em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 40,
                      background: 'var(--cream2)', color: arch.color,
                    }}>
                      {arch.label}
                    </span>
                    {s.rsi < 35 && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 40, background: '#f0ecf9', color: '#5b3a9e' }}>
                        Oversold
                      </span>
                    )}
                    {s.rsi > 70 && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 40, background: '#fdf5e8', color: '#9a6b10' }}>
                        Overbought
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Score</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 300, lineHeight: 1, color: 'var(--ink)' }}>{s.score}</div>
                  <div style={{ height: 2, background: 'var(--cream2)', borderRadius: 1, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.score}%`, background: 'linear-gradient(to right, var(--gold), var(--gold2))', borderRadius: 1 }} />
                  </div>
                </div>

                {/* RSI */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>RSI</div>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500,
                    color: s.rsi < 35 ? '#5b3a9e' : s.rsi > 70 ? '#9a6b10' : 'var(--ink)',
                  }}>
                    {s.rsi}
                  </div>
                </div>

                {/* R/R */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>R/R</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 14 }}>{s.rr}×</div>
                </div>

                {/* Analyze btn */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{
                    fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: 'transparent', border: '1px solid var(--ink)',
                    color: 'var(--ink)', padding: '8px 13px', borderRadius: 40,
                    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.18s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--gold2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink)' }}
                  >
                    Analyze →
                  </button>
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
