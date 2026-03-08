'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    await supabase.from('profiles').update({ status: 'approved' }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'approved' } : u))
  }

  const remove = async (id) => {
    await supabase.from('profiles').delete().eq('id', id)
    // Also delete auth user via admin API — requires service role key on backend
    // For now just remove profile which blocks access
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const pending = users.filter(u => u.status === 'pending')
  const approved = users.filter(u => u.status === 'approved')

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.18)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff' }}>
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: '#111', marginBottom: 2 }}>Admin Panel</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{pending.length} pending · {approved.length} approved</div>
          </div>
          <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e8ecf0', color: '#6b7280', width: 30, height: 30, borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: 2, background: '#f8fafc', borderRadius: 10, padding: 3, marginBottom: 18, width: 'fit-content' }}>
            {[['pending', `Pending (${pending.length})`], ['approved', 'Approved']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ background: tab === id ? '#fff' : 'none', border: 'none', boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', color: tab === id ? '#111' : '#6b7280', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: tab === id ? 500 : 400 }}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(tab === 'pending' ? pending : approved).length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  {tab === 'pending' ? 'No pending requests' : 'No approved members yet'}
                </div>
              ) : (tab === 'pending' ? pending : approved).map(u => (
                <div key={u.id} style={{ background: '#f8fafc', border: '1px solid #e8ecf0', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14, color: '#111', marginBottom: 2 }}>@{u.username}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {u.email} · {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {u.status === 'pending' && (
                      <button onClick={() => approve(u.id)}
                        style={{ background: '#111', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500 }}>
                        Approve
                      </button>
                    )}
                    <button onClick={() => remove(u.id)}
                      style={{ background: '#fff', color: '#ef4444', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: 7, fontSize: 12 }}>
                      {u.status === 'approved' ? 'Remove' : 'Deny'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
