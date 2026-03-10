'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'


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

const C = {
  catalyst_surprise:   { label: 'Catalyst Surprise',   color: '#2563eb', bg: '#eff6ff' },
  earnings_mispricing: { label: 'Earnings Mispricing', color: '#059669', bg: '#ecfdf5' },
  macro_pattern:       { label: 'Macro + Pattern',     color: '#7c3aed', bg: '#f5f3ff' },
  deep_value:          { label: 'Deep Value',          color: '#b45309', bg: '#fffbeb' },
}
const CONV = { HIGH: { color: '#059669', bg: '#ecfdf5' }, MEDIUM: { color: '#b45309', bg: '#fffbeb' }, LOW: { color: '#6b7280', bg: '#f3f4f6' } }

function Tag({ label, color, bg }) {
  return <span style={{ fontSize: 10, fontWeight: 500, color, background: bg, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap' }}>{label}</span>
}

function ScoreBar({ val, max, color }) {
  return (
    <div style={{ height: 3, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min((val / max) * 100, 100)}%`, background: color, borderRadius: 2 }} />
    </div>
  )
}

function Spinner({ message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#111', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <div style={{ fontSize: 13, color: '#94a3b8' }}>{message || 'Loading...'}</div>
    </div>
  )
}


function LevelChart({ stock }) {
  const [prices, setPrices] = useState([])
  const price = stock.price
  const stop = +(price * (1 - stock.stopPct / 100)).toFixed(2)
  const tp1 = +(price * 1.08).toFixed(2)
  const tp2 = +(price * 1.15).toFixed(2)
  const tp3 = +(price * (1 + stock.upside / 100)).toFixed(2)

  useEffect(() => {
    fetch(`/api/chart?ticker=${stock.ticker}`)
      .then(r => r.json())
      .then(d => { if (d.prices) setPrices(d.prices) })
      .catch(() => {})
  }, [stock.ticker])

  const W = 608, H = 200, PAD_L = 62, PAD_R = 40, PAD_T = 14, PAD_B = 14
  const chartH = H - PAD_T - PAD_B
  const chartW = W - PAD_L - PAD_R

  const allPrices = [stop, price, tp1, tp2, tp3, ...(prices.length ? prices : [price])]
  const minP = Math.min(...allPrices) * 0.993
  const maxP = Math.max(...allPrices) * 1.007
  const range = maxP - minP

  const toY = p => PAD_T + chartH - ((p - minP) / range) * chartH
  const toX = i => PAD_L + (i / Math.max(prices.length - 1, 1)) * chartW

  const levels = [
    { price: stop,  color: '#ef4444', label: 'Stop',  dash: false },
    { price: price, color: '#eab308', label: 'Entry', dash: true  },
    { price: tp1,   color: '#4ade80', label: 'TP1',   dash: false },
    { price: tp2,   color: '#22c55e', label: 'TP2',   dash: false },
    { price: tp3,   color: '#059669', label: 'TP3',   dash: false },
  ]

  const linePath = prices.length > 1
    ? prices.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p).toFixed(1)}`).join(' ')
    : null

  const areaPath = linePath
    ? `${linePath} L ${toX(prices.length - 1).toFixed(1)} ${H} L ${PAD_L} ${H} Z`
    : null

  const lastColor = prices.length > 1 && prices[prices.length - 1] > prices[0] ? '#22c55e' : '#ef4444'

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
      <svg width="100%" height={H} viewBox={"0 0 " + W + " " + H} style={{ display: "block" }}>
        <defs>
          <linearGradient id={"grad_" + stock.ticker} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lastColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={lastColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Price area fill */}
        {areaPath && <path d={areaPath} fill={"url(#grad_" + stock.ticker + ")"} />}

        {/* Price line */}
        {linePath && <path d={linePath} fill="none" stroke={lastColor} strokeWidth={1.5} opacity={0.8} />}

        {/* Level lines */}
        {levels.map(({ price: p, color, label, dash }) => {
          const y = toY(p)
          return (
            <g key={label}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke={color} strokeWidth={1.2} strokeDasharray={dash ? '6 4' : 'none'} opacity={0.9} />
              <text x={PAD_L - 5} y={y + 4} textAnchor="end" fill={color} fontSize={9} fontFamily="monospace">{"$"}{p}</text>
              <text x={W - PAD_R + 5} y={y + 4} textAnchor="start" fill={color} fontSize={9} fontFamily="monospace" opacity={0.85}>{label}</text>
            </g>
          )
        })}

        {/* Current price dot */}
        {prices.length > 0 && (
          <circle cx={toX(prices.length - 1)} cy={toY(price)} r={3.5} fill="#eab308" />
        )}
      </svg>
    </div>
  )
}

function _OldLevelChart({ stock }) {
  const price = stock.price
  const stop = +(price * (1 - stock.stopPct / 100)).toFixed(2)
  const tp1 = +(price * 1.08).toFixed(2)
  const tp2 = +(price * 1.15).toFixed(2)
  const tp3 = +(price * (1 + stock.upside / 100)).toFixed(2)

  const allPrices = [stop, price, tp1, tp2, tp3]
  const minP = Math.min(...allPrices) * 0.995
  const maxP = Math.max(...allPrices) * 1.005
  const range = maxP - minP

  const W = 608, H = 160, PAD_L = 62, PAD_R = 40, PAD_T = 14, PAD_B = 14
  const chartH = H - PAD_T - PAD_B

  const toY = p => PAD_T + chartH - ((p - minP) / range) * chartH

  const levels = [
    { price: stop,  color: '#ef4444', label: 'Stop',  dash: false },
    { price: price, color: '#eab308', label: 'Entry', dash: true  },
    { price: tp1,   color: '#4ade80', label: 'TP1',   dash: false },
    { price: tp2,   color: '#22c55e', label: 'TP2',   dash: false },
    { price: tp3,   color: '#059669', label: 'TP3',   dash: false },
  ]

  return (
    <div style={{ background: '#0f0f0f', borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
      <svg width="100%" height={H} viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none" style={{ display: "block" }}>
        {levels.map(({ price: p, color, label, dash }) => {
          const y = toY(p)
          return (
            <g key={label}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke={color} strokeWidth={1.5} strokeDasharray={dash ? '6 4' : 'none'} opacity={0.85} />
              <text x={PAD_L - 5} y={y + 4} textAnchor="end" fill={color} fontSize={9} fontFamily="monospace">{"$"}{p}</text>
              <text x={W - PAD_R + 5} y={y + 4} textAnchor="start" fill={color} fontSize={9} fontFamily="monospace" opacity={0.8}>{label}</text>
            </g>
          )
        })}
        <circle cx={PAD_L + (W - PAD_L - PAD_R) * 0.35} cy={toY(price)} r={3.5} fill="#eab308" />
      </svg>
    </div>
  )
}


function FollowButton({ stock, plan, userId }) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId || !stock.ticker) return
    fetch(`/api/follow?user_id=${userId}`)
      .then(r => r.json())
      .then(d => setFollowing((d.following || []).includes(stock.ticker)))
  }, [stock.ticker, userId])

  const toggle = async () => {
    if (!userId) return
    setLoading(true)
    const entry = +(stock.price).toFixed(2)
    const stop = +(stock.price * (1 - stock.stopPct / 100)).toFixed(2)
    const tp1 = +(stock.price * 1.08).toFixed(2)
    const tp2 = +(stock.price * 1.15).toFixed(2)
    const tp3 = +(stock.price * (1 + stock.upside / 100)).toFixed(2)
    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ticker: stock.ticker, entry, stop, tp1, tp2, tp3, active: true })
    })
    const data = await res.json()
    setFollowing(data.following)
    if (data.following) registerPush(userId)
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      style={{ background: following ? '#ecfdf5' : '#111', color: following ? '#059669' : '#fff', border: following ? '1px solid #bbf7d0' : 'none', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
      {loading ? '...' : following ? '✓ Following' : '+ Follow & Alert'}
    </button>
  )
}

function PlanModal({ stock, onClose, userId }) {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const arch = C[stock.archetype] || C.catalyst_surprise

  const load = () => {
    setLoading(true); setError(false)
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stock)
    })
      .then(r => r.json())
      .then(p => { setPlan(p); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

  useEffect(() => { load() }, [stock.ticker])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 660, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: '#111' }}>{stock.ticker}</span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 16, color: '#374151', fontWeight: 600 }}>${stock.price}</span>
              <Tag {...arch} />
              {plan && <span style={{ fontSize: 10, fontWeight: 500, color: CONV[plan.conviction]?.color, background: CONV[plan.conviction]?.bg, padding: '2px 7px', borderRadius: 4 }}>{plan.conviction}</span>}
            </div>
            {plan && <FollowButton stock={stock} plan={plan} userId={userId} />}
            <div style={{ display: 'none' }}>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{stock.name} · {stock.sector} · Score {stock.score}/100 · ~{stock.rr}R</div>
          </div>
          <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e8ecf0', color: '#6b7280', width: 30, height: 30, borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '22px 26px' }}>
          {loading ? <Spinner message="AI analyzing setup..." /> : error ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>Could not load AI plan</div>
              <button onClick={load} style={{ background: '#f8fafc', border: '1px solid #e8ecf0', color: '#374151', padding: '7px 16px', borderRadius: 8, fontSize: 13 }}>Retry</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <LevelChart stock={stock} />
              <div style={{ background: plan.overhang_rational === false ? '#ecfdf5' : '#fffbeb', border: `1px solid ${plan.overhang_rational === false ? '#bbf7d0' : '#fde68a'}`, borderRadius: 8, padding: '13px 15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{plan.overhang_rational === false ? '🟢' : '🟡'}</span>
                  <div style={{ fontSize: 10, color: plan.overhang_rational === false ? '#059669' : '#b45309', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    {plan.overhang_rational === false ? 'Selloff is irrational — mispricing confirmed' : 'Selloff has merit — monitor closely'}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{plan.overhang_reasoning}</div>
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#111', lineHeight: 1.65, fontStyle: 'italic' }}>{plan.thesis}</div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Why the overhang resolves</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{plan.overhang_resolution}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ l: 'Instrument', v: plan.instrument, accent: '#7c3aed' }, { l: 'Timeframe', v: plan.timeframe, accent: '#2563eb' }].map(({ l, v, accent }) => (
                  <div key={l} style={{ background: '#f8fafc', borderRadius: 8, padding: '11px 13px', borderTop: `2px solid ${accent}` }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 5 }}>Entry trigger</div>
                <div style={{ fontSize: 13, color: '#111', lineHeight: 1.55, marginBottom: 4 }}>{plan.entry_logic}</div>
                <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>{plan.entry_price_note}</div>
              </div>
              <div style={{ background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 8, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>Stop loss · ~{stock.stopPct}% risk</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{plan.stop_logic}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[['TP1 — Trim ⅓', plan.tp1], ['TP2 — Trim ⅓', plan.tp2], ['TP3 — Runner', plan.tp3]].map(([l, v]) => (
                  <div key={l} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 11px' }}>
                    <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 11, color: '#059669', lineHeight: 1.4 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, color: '#b45309', textTransform: 'uppercase', marginBottom: 4 }}>Invalidation risk</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{plan.risk_note}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CACHE_TTL = 24 * 60 * 60 * 1000

export default function Scanner({ profile }) {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadMsg, setLoadMsg] = useState('Checking cache...')
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('score')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  const loadStocks = async (forceRefresh = false) => {
    setLoading(true); setError(null)

    if (!forceRefresh) {
      try {
        const { data: cached } = await supabase
          .from('scanner_cache')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (cached) {
          const age = Date.now() - new Date(cached.created_at).getTime()
          if (age < CACHE_TTL) {
            setStocks(cached.data)
            setUpdatedAt(cached.created_at)
            setLoading(false)
            return
          }
        }
      } catch (e) {
        // No cache yet
      }
    }

    setLoadMsg('Fetching QQQ + SPY universe...')
    try {
      const res = await fetch('/api/scanner')
      if (!res.ok) throw new Error('Failed to fetch scanner data')
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      await supabase.from('scanner_cache').insert({
        data: json.stocks,
        created_at: new Date().toISOString()
      })

      setStocks(json.stocks)
      setUpdatedAt(json.updatedAt)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => { loadStocks() }, [])

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'catalyst_surprise', label: 'Catalyst Surprise' },
    { id: 'earnings_mispricing', label: 'Earnings Mispricing' },
    { id: 'macro_pattern', label: 'Macro + Pattern' },
    { id: 'deep_value', label: 'Deep Value' },
  ]

  const displayed = [...stocks]
    .filter(s => filter === 'all' || s.archetype === filter)
    .filter(s => !search || s.ticker.includes(search.toUpperCase()) || s.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'rr' ? b.rr - a.rr : sort === 'growth' ? b.rev_growth - a.rev_growth : b.score - a.score)

  return (
    <div>
      {expanded && <PlanModal stock={expanded} onClose={() => setExpanded(null)} userId={profile?.id} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#111', marginBottom: 4 }}>Top Setups</h2>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            QQQ + SPY universe · scored on fundamentals · macro · mispricing · technical
            {updatedAt && <span> · Updated {new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>
        <button onClick={() => loadStocks(true)}
          style={{ background: '#f8fafc', border: '1px solid #e8ecf0', color: '#374151', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500 }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <Spinner message={loadMsg} />
      ) : error ? (
        <div style={{ background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 12, padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>Error: {error}</div>
          <button onClick={() => loadStocks(true)} style={{ background: '#111', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13 }}>Retry</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 2, background: '#f8fafc', borderRadius: 10, padding: 3, flexWrap: 'wrap' }}>
              {filters.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  style={{ background: filter === f.id ? '#fff' : 'none', border: 'none', boxShadow: filter === f.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', color: filter === f.id ? '#111' : '#6b7280', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: filter === f.id ? 500 : 400, whiteSpace: 'nowrap' }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ticker..."
                style={{ background: '#fff', border: '1px solid #e8ecf0', color: '#111', padding: '7px 12px', borderRadius: 8, fontSize: 13, outline: 'none', width: 150 }} />
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ background: '#fff', border: '1px solid #e8ecf0', color: '#374151', padding: '7px 12px', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                <option value="score">Edge Score</option>
                <option value="rr">R:R Ratio</option>
                <option value="growth">Rev Growth</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12, fontSize: 12, color: '#94a3b8' }}>Showing {displayed.length} setups</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
            {displayed.map((s, i) => {
              const arch = C[s.archetype] || C.catalyst_surprise
              return (
                <div key={s.ticker} onClick={() => setExpanded(s)}
                  style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8ecf0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{s.ticker}</span>
                        <Tag {...arch} />
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.name} · {s.sector}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 14, fontWeight: 600, color: '#111' }}>${s.price}</div>
                      <div style={{ fontSize: 11, color: s.from52h < -10 ? '#ef4444' : '#94a3b8' }}>{s.from52h}% off high</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>Edge Score</div>
                      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: '#111', lineHeight: 1 }}>{s.score}<span style={{ fontSize: 12, color: '#d1d5db', fontFamily: "'Geist', sans-serif" }}>/100</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>Est. R:R</div>
                      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: s.rr >= 4 ? '#059669' : '#111', lineHeight: 1 }}>{s.rr}R</div>
                    </div>
                  </div>

                  <ScoreBar val={s.score} max={100} color="#111" />

                  <div style={{ display: 'flex', gap: 10, marginTop: 12, marginBottom: 12 }}>
                    {[['Fund.', s.breakdown.fundamentals, 30, '#2563eb'], ['Macro', s.breakdown.macro, 25, '#7c3aed'], ['Misprice', s.breakdown.mispricing, 25, '#059669'], ['Tech', s.breakdown.technical, 20, '#b45309']].map(([l, v, m, c]) => (
                      <div key={l} style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{l}</div>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 3 }}>{v}<span style={{ fontSize: 9, color: '#d1d5db' }}>/{m}</span></div>
                        <ScoreBar val={v} max={m} color={c} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
                    {[
                      ['Rev Grw', `${s.rev_growth > 0 ? '+' : ''}${s.rev_growth}%`, s.rev_growth > 0],
                      ['Margin', `${s.margin}%`, s.margin > 10],
                      ['P/E', s.pe > 0 ? `${s.pe}x` : 'N/A', false]
                    ].map(([l, v, pos]) => (
                      <div key={l} style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 8px' }}>
                        <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'Geist Mono', monospace", color: pos ? '#059669' : '#374151' }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderLeft: `2px solid ${arch.color}`, paddingLeft: 8 }}>
                    <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.4 }}>{s.pattern}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
