'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { isAdmin } from '../lib/admin'

const C = {
  catalyst_surprise:   { label: 'Catalyst Surprise',   color: '#2563eb', bg: '#eff6ff' },
  earnings_mispricing: { label: 'Earnings Mispricing', color: '#059669', bg: '#ecfdf5' },
  macro_pattern:       { label: 'Macro + Pattern',     color: '#7c3aed', bg: '#f5f3ff' },
  deep_value:          { label: 'Deep Value',          color: '#b45309', bg: '#fffbeb' },
}

const STATUS = {
  open_win:    { label: 'Open · Winning', color: '#059669', bg: '#ecfdf5' },
  open_loss:   { label: 'Open · Losing',  color: '#ef4444', bg: '#fff5f5' },
  closed_win:  { label: 'Closed · Win',   color: '#111',    bg: '#f3f4f6' },
  closed_loss: { label: 'Closed · Loss',  color: '#6b7280', bg: '#f9fafb' },
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Tag({ label, color, bg }) {
  return <span style={{ fontSize: 10, fontWeight: 500, color, background: bg, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap' }}>{label}</span>
}

// ── Plan Detail Modal ────────────────────────────────────────────────────
function PlanModal({ plan, profile, onClose }) {
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const arch = C[plan.archetype] || C.catalyst_surprise
  const status = STATUS[plan.status] || STATUS.closed_win
  const riskAmt = plan.entry && plan.stop ? ((plan.entry - plan.stop) / plan.entry * 100).toFixed(1) : '—'

  useEffect(() => {
    supabase.from('comments').select('*').eq('plan_id', plan.id).order('created_at', { ascending: true })
      .then(({ data }) => setComments(data || []))
  }, [plan.id])

  const submitComment = async () => {
    if (!commentText.trim()) return
    const c = { plan_id: plan.id, username: profile.username, role: profile.role, text: commentText.trim() }
    const { data } = await supabase.from('comments').insert(c).select().single()
    if (data) setComments(prev => [...prev, data])
    setCommentText('')
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.18)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: '#111' }}>{plan.ticker}</span>
              <Tag {...arch} />
              <span style={{ fontSize: 10, fontWeight: 500, color: status.color, background: status.bg, padding: '2px 7px', borderRadius: 4 }}>{status.label}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{plan.instrument} · {plan.timeframe} · {timeAgo(plan.created_at)}</div>
          </div>
          <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e8ecf0', color: '#6b7280', width: 30, height: 30, borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: '#111', lineHeight: 1.7, fontStyle: 'italic' }}>{plan.thesis}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid #ef4444' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Overhang</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{plan.overhang}</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid #7c3aed' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Macro tailwind</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{plan.macro}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Trade Structure</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 8 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '11px 13px', borderTop: '2px solid #111' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 3 }}>Entry</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: '#111' }}>${plan.entry}</div>
              </div>
              <div style={{ background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 8, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, color: '#ef4444', textTransform: 'uppercase', marginBottom: 3 }}>Stop · {riskAmt}% risk</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: '#ef4444' }}>${plan.stop}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 3 }}>Est. R:R</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Instrument Serif', serif", color: plan.rr >= 4 ? '#059669' : '#111' }}>{plan.rr}R</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['TP1 — Trim ⅓', plan.tp1], ['TP2 — Trim ⅓', plan.tp2], ['TP3 — Runner', plan.tp3]].map(([l, v]) => (
                <div key={l} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: '#059669' }}>${v}</div>
                </div>
              ))}
            </div>
          </div>

          {plan.catalysts?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Key Catalysts</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {plan.catalysts.map(c => <span key={c} style={{ fontSize: 12, color: arch.color, background: arch.bg, padding: '4px 10px', borderRadius: 6 }}>⚡ {c}</span>)}
              </div>
            </div>
          )}

          {plan.result_pct != null && (
            <div style={{ background: plan.result_pct > 0 ? '#ecfdf5' : '#fff5f5', borderRadius: 8, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Options result</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: plan.result_pct > 0 ? '#059669' : '#ef4444' }}>{plan.result_pct > 0 ? '+' : ''}{plan.result_pct}%</div>
            </div>
          )}

          {/* Comments */}
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Discussion{comments.length > 0 ? ` · ${comments.length}` : ''}
            </div>
            {comments.length === 0 && (
              <div style={{ fontSize: 13, color: '#c4cdd6', textAlign: 'center', padding: '14px 0' }}>No comments yet.</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.role === 'admin' ? '#111' : '#f1f5f9', border: c.role === 'admin' ? 'none' : '1px solid #e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.role === 'admin' ? '#fff' : '#374151' }}>{c.username[0].toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{c.username}</span>
                      {c.role === 'admin' && <span style={{ fontSize: 9, fontWeight: 600, color: '#fff', background: '#111', padding: '1px 5px', borderRadius: 3 }}>ADMIN</span>}
                      <span style={{ fontSize: 11, color: '#c4cdd6' }}>{timeAgo(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                placeholder="Add a comment..."
                style={{ flex: 1, background: '#f8fafc', border: '1px solid #e8ecf0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#111', outline: 'none', fontFamily: "'Geist', sans-serif" }} />
              <button onClick={submitComment} disabled={!commentText.trim()}
                style={{ background: '#111', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, opacity: commentText.trim() ? 1 : 0.4, whiteSpace: 'nowrap' }}>
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── New Plan Modal (admin only) ──────────────────────────────────────────
function NewPlanModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({ ticker: '', archetype: 'catalyst_surprise', instrument: 'Calls', timeframe: '2-6 weeks', entry: '', stop: '', tp1: '', tp2: '', tp3: '', thesis: '', overhang: '', macro: '', catalysts: '', tags: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const inp = { background: '#f8fafc', border: '1px solid #e8ecf0', color: '#111', padding: '8px 11px', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%', fontFamily: "'Geist', sans-serif" }
  const lbl = { fontSize: 11, color: '#6b7280', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }

  const handleSave = async () => {
    if (!form.ticker || !form.entry || !form.thesis) return
    setSaving(true)
    const entry = parseFloat(form.entry), stop = parseFloat(form.stop), tp3 = parseFloat(form.tp3)
    const rr = stop && tp3 ? +((tp3 - entry) / (entry - stop)).toFixed(1) : 0
    const plan = {
      ticker: form.ticker.toUpperCase(), archetype: form.archetype, instrument: form.instrument,
      timeframe: form.timeframe, entry: +form.entry, stop: +form.stop, tp1: +form.tp1,
      tp2: +form.tp2, tp3: +form.tp3, rr, thesis: form.thesis, overhang: form.overhang,
      macro: form.macro, catalysts: form.catalysts.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      status: 'open_win', result_pct: null, posted_by: profile.username
    }
    const { data } = await supabase.from('trade_plans').insert(plan).select().single()
    if (data) onSave(data)
    onClose()
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: '#111' }}>Post a Trade Plan</span>
          <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e8ecf0', color: '#6b7280', width: 30, height: 30, borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={lbl}>Ticker</label><input style={inp} value={form.ticker} onChange={e => set('ticker', e.target.value.toUpperCase())} placeholder="e.g. COIN" /></div>
            <div><label style={lbl}>Archetype</label>
              <select style={inp} value={form.archetype} onChange={e => set('archetype', e.target.value)}>
                <option value="catalyst_surprise">Catalyst Surprise</option>
                <option value="earnings_mispricing">Earnings Mispricing</option>
                <option value="macro_pattern">Macro + Pattern</option>
                <option value="deep_value">Deep Value</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={lbl}>Instrument</label>
              <select style={inp} value={form.instrument} onChange={e => set('instrument', e.target.value)}>
                <option>Calls</option><option>LEAPs</option><option>Stock</option><option>Puts</option>
              </select>
            </div>
            <div><label style={lbl}>Timeframe</label><input style={inp} value={form.timeframe} onChange={e => set('timeframe', e.target.value)} placeholder="e.g. 2-6 weeks" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {[['Entry $', 'entry'], ['Stop $', 'stop'], ['TP1 $', 'tp1'], ['TP2 $', 'tp2'], ['TP3 $', 'tp3']].map(([l, k]) => (
              <div key={k}><label style={lbl}>{l}</label><input style={inp} type="number" value={form[k]} onChange={e => set(k, e.target.value)} /></div>
            ))}
          </div>
          <div><label style={lbl}>Thesis</label><textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={form.thesis} onChange={e => set('thesis', e.target.value)} placeholder="Connect the fundamentals, overhang, macro, and technical trigger..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={lbl}>Overhang</label><input style={inp} value={form.overhang} onChange={e => set('overhang', e.target.value)} placeholder="What's keeping it down?" /></div>
            <div><label style={lbl}>Macro tailwind</label><input style={inp} value={form.macro} onChange={e => set('macro', e.target.value)} placeholder="What's the wind behind it?" /></div>
          </div>
          <div><label style={lbl}>Catalysts (comma separated)</label><input style={inp} value={form.catalysts} onChange={e => set('catalysts', e.target.value)} placeholder="Earnings beat, Product launch, Acquisition rumor" /></div>
          <div><label style={lbl}>Tags (comma separated)</label><input style={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="tech, breakout, earnings" /></div>
          <button onClick={handleSave} disabled={saving} style={{ background: '#111', color: '#fff', border: 'none', padding: 11, borderRadius: 10, fontSize: 14, fontWeight: 500, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Posting...' : 'Post Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main TradePlans component ────────────────────────────────────────────
export default function TradePlans({ profile }) {
  const [plans, setPlans] = useState([])
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [loaded, setLoaded] = useState(false)
  const admin = isAdmin(profile)

  useEffect(() => {
    supabase.from('trade_plans').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setPlans(data || []); setLoaded(true) })
  }, [])

  const displayed = plans.filter(p =>
    filterStatus === 'all' ||
    (filterStatus === 'open' && p.status?.startsWith('open')) ||
    (filterStatus === 'closed' && p.status?.startsWith('closed'))
  )

  const wins = plans.filter(p => p.status === 'closed_win').length
  const total = plans.filter(p => p.status?.startsWith('closed')).length
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  const returns = plans.filter(p => p.result_pct != null)
  const avgReturn = returns.length > 0 ? Math.round(returns.reduce((a, p) => a + p.result_pct, 0) / returns.length) : 0

  if (!loaded) return <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading plans...</div>

  return (
    <div>
      {selected && <PlanModal plan={selected} profile={profile} onClose={() => setSelected(null)} />}
      {showNew && <NewPlanModal profile={profile} onClose={() => setShowNew(false)} onSave={p => setPlans(prev => [p, ...prev])} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#111', marginBottom: 4 }}>Trade Plans</h2>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Public setups — thesis, levels, and outcomes</p>
        </div>
        {admin && (
          <button onClick={() => setShowNew(true)} style={{ background: '#111', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Post Plan
          </button>
        )}
      </div>

      {plans.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
          {[{ l: 'Total Plans', v: plans.length }, { l: 'Win Rate', v: `${winRate}%`, color: '#059669' }, { l: 'Avg Options Return', v: avgReturn > 0 ? `+${avgReturn}%` : '—', color: '#059669' }].map(({ l, v, color }) => (
            <div key={l} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: color || '#111' }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 2, background: '#f8fafc', borderRadius: 10, padding: 3, marginBottom: 18, width: 'fit-content' }}>
        {[['all', 'All'], ['open', 'Open'], ['closed', 'Closed']].map(([id, label]) => (
          <button key={id} onClick={() => setFilterStatus(id)}
            style={{ background: filterStatus === id ? '#fff' : 'none', border: 'none', boxShadow: filterStatus === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', color: filterStatus === id ? '#111' : '#6b7280', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: filterStatus === id ? 500 : 400 }}>
            {label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, padding: '64px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>No trade plans yet</div>
          {admin && <div style={{ fontSize: 12, color: '#c4cdd6' }}>Post your first setup above</div>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map(p => {
            const arch = C[p.archetype] || C.catalyst_surprise
            const status = STATUS[p.status] || STATUS.closed_win
            return (
              <div key={p.id} onClick={() => setSelected(p)}
                style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, padding: '20px 22px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8ecf0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>{p.ticker}</span>
                      <Tag {...arch} />
                      <span style={{ fontSize: 10, fontWeight: 500, color: status.color, background: status.bg, padding: '2px 7px', borderRadius: 4 }}>{status.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.instrument} · {p.timeframe} · {timeAgo(p.created_at)}</div>
                  </div>
                  {p.result_pct != null && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>Result</div>
                      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: p.result_pct > 0 ? '#059669' : '#ef4444' }}>{p.result_pct > 0 ? '+' : ''}{p.result_pct}%</div>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.thesis}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {[['Entry', `$${p.entry}`], ['Stop', `$${p.stop}`], ['TP1', `$${p.tp1}`], ['R:R', `${p.rr}R`]].map(([l, v]) => (
                    <div key={l} style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 8px' }}>
                      <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'Geist Mono', monospace", color: '#111' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
