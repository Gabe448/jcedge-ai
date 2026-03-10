'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function NotificationBell({ userId }) {
  const [notifs, setNotifs] = useState([])
  const [open, setOpen] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifs(data || [])
  }

  useEffect(() => {
    if (!userId) return
    load()
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId])

  const unread = notifs.filter(n => !n.read).length

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const levelColor = (level) => {
    if (level === 'stop') return '#ef4444'
    if (level === 'entry') return '#eab308'
    return '#22c55e'
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(o => !o); if (!open && unread > 0) markAllRead() }}
        style={{ position: 'relative', background: 'none', border: '1px solid #e8ecf0', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#374151' }}>
        🔔
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{ position: 'absolute', right: 0, top: 44, width: 320, background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Alerts</div>
              {unread > 0 && <button onClick={markAllRead} style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {notifs.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>No alerts yet</div>
              ) : notifs.map(n => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', background: n.read ? '#fff' : '#f8fafc', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: levelColor(n.level), marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>{n.ticker} — {n.label} Hit</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Price at alert: ${n.price_at_alert?.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
