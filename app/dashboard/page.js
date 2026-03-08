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

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('scanner')
  const [showAdmin, setShowAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: '#111' }}>JCedge.ai</div>
    </div>
  )

  const admin = isAdmin(profile)
  const NAV = [
    { id: 'scanner', label: 'Scanner' },
    { id: 'plans', label: 'Trade Plans' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'chat', label: 'Trading Room' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: '#111' }}>JC</span>
            <span style={{ fontWeight: 600, fontSize: 20, color: '#111' }}>edge</span>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400, marginLeft: 2 }}>.ai</span>
          </div>
          <div style={{ display: 'flex' }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)}
                style={{ background: 'none', border: 'none', borderBottom: tab === n.id ? '2px solid #111' : '2px solid transparent', color: tab === n.id ? '#111' : '#6b7280', padding: '0 16px', height: 58, fontSize: 13, fontWeight: tab === n.id ? 500 : 400, transition: 'color 0.1s', whiteSpace: 'nowrap' }}>
                {n.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {admin && (
              <button onClick={() => setShowAdmin(true)}
                style={{ background: '#f8fafc', border: '1px solid #e8ecf0', color: '#374151', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500 }}>
                Admin
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: admin ? '#111' : '#f1f5f9', border: admin ? 'none' : '1px solid #e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: admin ? '#fff' : '#374151' }}>
                  {profile?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{profile?.username}</span>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 12 }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px' }}>
        {tab === 'scanner'   && <Scanner />}
        {tab === 'plans'     && <TradePlans profile={profile} />}
        {tab === 'portfolio' && <Portfolio user={user} profile={profile} />}
        {tab === 'chat'      && <Chat profile={profile} />}
      </div>
    </div>
  )
}