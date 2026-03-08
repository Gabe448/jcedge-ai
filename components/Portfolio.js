'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Portfolio({ user, profile }) {
  const [positions, setPositions] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ ticker: '', type: 'Calls', expiry: '', strike: '', contracts: '', avg_cost: '', current_price: '' })

  const inp = { width: '100%', background: '#f8fafc', border: '1px solid #e8ecf0', color: '#111', padding: '8px 11px', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Geist', sans-serif" }

  useEffect(() => {
    supabase.from('positions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setPositions(data || []); setLoaded(true) })
  }, [user.id])

  const enriched = positions.map(p => {
    const cost = p.avg_cost * p.contracts * (p.type !== 'Stock' ? 100 : 1)
    const val  = p.current_price * p.contracts * (p.type !== 'Stock' ? 100 : 1)
    const pnl  = val - cost
    const pct  = cost > 0 ? (pnl / cost) * 100 : 0
    return { ...p, cost, val, pnl, pct }
  })

  const open   = enriched.filter(p => p.status === 'open')
  const closed = enriched.filter(p => p.status === 'closed')
  const totalVal  = open.reduce((a, p) => a + p.val, 0)
  const totalCost = open.reduce((a, p) => a + p.cost, 0)
  const totalPnl  = open.reduce((a, p) => a + p.pnl, 0)
  const totalRet  = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const closedWins = closed.filter(p => p.pnl > 0).length
  const winRate    = closed.length > 0 ? Math.round((closedWins / closed.length) * 100) : 0

  const addPosition = async () => {
    if (!form.ticker || !form.avg_cost || !form.contracts) return
    const { data } = await supabase.from('positions').insert({
      user_id: user.id,
      ticker: form.ticker.toUpperCase(),
      type: form.type,
      expiry: form.expiry || null,
      strike: form.strike ? +form.strike : null,
      contracts: +form.contracts,
      avg_cost: +form.avg_cost,
      current_price: +form.current_price || +form.avg_cost,
      status: 'open'
    }).select().single()
    if (data) setPositions(prev => [data, ...prev])
    setForm({ ticker: '', type: 'Calls', expiry: '', strike: '', contracts: '', avg_cost: '', current_price: '' })
    setShowAdd(false)
  }

  const closePosition = async (id) => {
    await supabase.from('positions').update({ status: 'closed' }).eq('id', id)
    setPositions(prev => prev.map(p => p.id === id ? { ...p, status: 'closed' } : p))
  }

  const updatePrice = async (id, price) => {
    await supabase.from('positions').update({ current_price: +price }).eq('id', id)
    setPositions(prev => prev.map(p => p.id === id ? { ...p, current_price: +price } : p))
  }

  if (!loaded) return <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading portfolio...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#111', marginBottom: 4 }}>My Portfolio</h2>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Your positions · @{profile?.username}</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          style={{ background: '#111', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Position
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { l: 'Open Portfolio Value', v: `$${totalVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
          { l: 'Unrealized P&L', v: `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: totalPnl >= 0 ? '#059669' : '#ef4444', sub: `${totalRet >= 0 ? '+' : ''}${totalRet.toFixed(1)}%` },
          { l: 'Closed Win Rate', v: `${winRate}%`, color: '#059669', sub: `${closedWins}/${closed.length} trades` },
        ].map(({ l, v, color, sub }) => (
          <div key={l} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{l}</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: color || '#111', lineHeight: 1, marginBottom: sub ? 4 : 0 }}>{v}</div>
            {sub && <div style={{ fontSize: 12, color: color || '#94a3b8' }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 16 }}>New Position</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            {[['Ticker', 'ticker', 'text'], ['Expiry', 'expiry', 'text'], ['Strike $', 'strike', 'number'], ['Type', 'type', 'select']].map(([l, k, t]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                {t === 'select' ? (
                  <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option>Calls</option><option>Puts</option><option>LEAPs</option><option>Stock</option>
                  </select>
                ) : (
                  <input style={inp} type={t} placeholder={k === 'ticker' ? 'COIN' : ''} value={form[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: k === 'ticker' ? e.target.value.toUpperCase() : e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
            {[['Contracts / Shares', 'contracts'], ['Avg Cost $', 'avg_cost'], ['Current Price $', 'current_price']].map(([l, k]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                <input style={inp} type="number" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addPosition} style={{ background: '#111', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>Add</button>
            <button onClick={() => setShowAdd(false)} style={{ background: '#f8fafc', color: '#6b7280', border: '1px solid #e8ecf0', padding: '9px 20px', borderRadius: 8, fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {positions.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, padding: '48px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>No positions yet</div>
          <button onClick={() => setShowAdd(true)} style={{ background: '#111', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>Add your first position</button>
        </div>
      )}

      {/* Open positions */}
      {open.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Open Positions</div>
          <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Ticker', 'Type', 'Strike / Expiry', 'Contracts', 'Avg Cost', 'Current', 'Value', 'P&L', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {open.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < open.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 14, color: '#111' }}>{p.ticker}</td>
                    <td style={{ padding: '12px 14px' }}><span style={{ fontSize: 11, background: '#f3f4f6', color: '#374151', padding: '2px 7px', borderRadius: 4 }}>{p.type}</span></td>
                    <td style={{ padding: '12px 14px', fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#6b7280' }}>{p.strike ? `$${p.strike}` : '—'} {p.expiry ? `· ${p.expiry}` : ''}</td>
                    <td style={{ padding: '12px 14px', fontFamily: "'Geist Mono', monospace", fontSize: 13, color: '#374151' }}>{p.contracts}</td>
                    <td style={{ padding: '12px 14px', fontFamily: "'Geist Mono', monospace", fontSize: 13, color: '#374151' }}>${p.avg_cost}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <input type="number" defaultValue={p.current_price}
                        onBlur={e => updatePrice(p.id, e.target.value)}
                        style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: '#374151', background: 'transparent', border: 'none', outline: 'none', width: 70 }} />
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: "'Geist Mono', monospace", fontSize: 13, color: '#111', fontWeight: 500 }}>${p.val.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 600, color: p.pnl >= 0 ? '#059669' : '#ef4444' }}>{p.pnl >= 0 ? '+' : ''}${Math.abs(p.pnl).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                      <div style={{ fontSize: 11, color: p.pnl >= 0 ? '#059669' : '#ef4444' }}>{p.pct >= 0 ? '+' : ''}{p.pct.toFixed(1)}%</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => closePosition(p.id)} style={{ fontSize: 11, color: '#6b7280', background: '#f8fafc', border: '1px solid #e8ecf0', padding: '4px 8px', borderRadius: 6 }}>Close</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Closed positions */}
      {closed.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Closed Positions</div>
          <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Ticker', 'Type', 'Contracts', 'Cost Basis', 'Realized P&L', 'Return'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {closed.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < closed.length - 1 ? '1px solid #f8fafc' : 'none', opacity: 0.7 }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, fontSize: 14, color: '#374151' }}>{p.ticker}</td>
                    <td style={{ padding: '11px 14px' }}><span style={{ fontSize: 11, background: '#f3f4f6', color: '#374151', padding: '2px 7px', borderRadius: 4 }}>{p.type}</span></td>
                    <td style={{ padding: '11px 14px', fontFamily: "'Geist Mono', monospace", fontSize: 13, color: '#6b7280' }}>{p.contracts}</td>
                    <td style={{ padding: '11px 14px', fontFamily: "'Geist Mono', monospace", fontSize: 13, color: '#6b7280' }}>${p.cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: '11px 14px', fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 600, color: p.pnl >= 0 ? '#059669' : '#ef4444' }}>{p.pnl >= 0 ? '+' : ''}${Math.abs(p.pnl).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: '11px 14px', fontFamily: "'Instrument Serif', serif", fontSize: 18, color: p.pnl >= 0 ? '#059669' : '#ef4444' }}>{p.pct >= 0 ? '+' : ''}{p.pct.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
