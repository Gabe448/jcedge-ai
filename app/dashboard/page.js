'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { isAdmin } from '../../lib/admin'
import Scanner from '../../components/Scanner'
import TradePlans from '../../components/TradePlans'
import Portfolio from '../../components/Portfolio'
import Chat from '../../components/Chat'
import AdminPanel from '../../components/AdminPanel'

const NAV = [
  { id: 'scanner',   label: 'Scanner' },
  { id: 'plans',     label: 'Plans' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'chat',      label: 'Room' },
]

// Ticker tape data (static for now — can be made live later)
const TAPE = [
  'SPY','QQQ','NVDA','TSLA','AAPL','META','COIN','PLTR','MSFT','AMZN','GOOGL','AMD'
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [tab, setTab]         = useState('scanner')
  const [showAdmin, setShowAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tapeData, setTapeData] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      if (!prof || prof.status === 'pending') { router.push('/auth'); return }
      setProfile(prof)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') router.push('/auth')
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fetch tape prices
  useEffect(() => {
    async function fetchTape() {
      try {
        const res = await fetch('/api/scanner')
        const data = await res.json()
        if (data?.results) setTapeData(data.results.slice(0, 16))
      } catch {}
    }
    fetchTape()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--cream)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12
    }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 300, color: 'var(--ink)' }}>
        JC<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>edge</em>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginLeft: 2 }}>.ai</span>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        Loading…
      </div>
    </div>
  )

  const admin = isAdmin(profile)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* ── NAV ────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--cream)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px', height: 58,
      }}>
        {/* Logo */}
        <div style={{ fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 600, letterSpacing: '0.03em', display: 'flex', alignItems: 'baseline', gap: 1 }}>
          JC
          <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>edge</em>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginLeft: 2 }}>.ai</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 500,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              padding: '7px 18px', border: 'none', borderRadius: 40,
              background: tab === n.id ? 'var(--ink)' : 'transparent',
              color: tab === n.id ? 'var(--gold2)' : 'var(--muted)',
              transition: 'all 0.18s',
            }}>
              {n.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {admin && (
            <button onClick={() => setShowAdmin(true)} style={{
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
              textTransform: 'uppercase', background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--muted)',
              padding: '6px 14px', borderRadius: 40, transition: 'all 0.18s',
            }}>
              Admin
            </button>
          )}

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: admin ? 'var(--ink)' : 'var(--cream2)',
              border: `1px solid ${admin ? 'var(--ink)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 600, color: admin ? 'var(--gold2)' : 'var(--muted)', fontStyle: 'italic' }}>
                {profile?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink2)', letterSpacing: '0.05em' }}>
              {profile?.username}
            </span>
          </div>

          <button onClick={logout} style={{
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
            textTransform: 'uppercase', background: 'none', border: 'none',
            color: 'var(--muted)', transition: 'color 0.18s',
          }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* ── TICKER TAPE ────────────────────── */}
      <div style={{
        background: 'var(--ink)', height: 30,
        display: 'flex', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        {/* fade edges */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to right, var(--ink), transparent)', zIndex: 2 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left, var(--ink), transparent)', zIndex: 2 }} />

        <div style={{
          display: 'flex', gap: 48, whiteSpace: 'nowrap',
          animation: 'tape 32s linear infinite', paddingLeft: '100%',
          fontFamily: 'var(--mono)', fontSize: 10,
        }}>
          {[...tapeData, ...tapeData].map((s, i) => (
            <span key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#8a8070', letterSpacing: '0.06em' }}>{s.ticker}</span>
              <span style={{ color: s.change_pct >= 0 ? 'var(--gold2)' : '#e07060' }}>
                {s.change_pct >= 0 ? '▲' : '▼'}{Math.abs(s.change_pct || 0).toFixed(1)}%
              </span>
            </span>
          ))}
          {/* fallback static if no data */}
          {tapeData.length === 0 && TAPE.concat(TAPE).map((sym, i) => (
            <span key={i} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#8a8070' }}>{sym}</span>
              <span style={{ color: 'var(--gold2)' }}>▲ —</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── CONTENT ────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        {tab === 'scanner'   && <Scanner   profile={profile} />}
        {tab === 'plans'     && <TradePlans profile={profile} />}
        {tab === 'portfolio' && <Portfolio  user={user} profile={profile} />}
        {tab === 'chat'      && <Chat       profile={profile} />}
      </div>

      {/* ── MOBILE BOTTOM NAV ──────────────── */}
      <div style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'var(--cream)', borderTop: '1px solid var(--border)',
        padding: '8px 0 20px',
      }} className="mobile-nav">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            flex: 1, background: 'none', border: 'none',
            fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: tab === n.id ? 'var(--ink)' : 'var(--muted)',
            padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: tab === n.id ? 'var(--gold)' : 'transparent',
              border: `1px solid ${tab === n.id ? 'var(--gold)' : 'var(--border)'}`,
            }} />
            {n.label}
          </button>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
