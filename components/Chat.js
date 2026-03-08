'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const CHAT_TAGS = ['General', 'Setup', 'Macro', 'Question', 'News']
const TAG_COLORS = {
  General:  { color: '#6b7280', bg: '#f3f4f6' },
  Setup:    { color: '#2563eb', bg: '#eff6ff' },
  Macro:    { color: '#7c3aed', bg: '#f5f3ff' },
  Question: { color: '#b45309', bg: '#fffbeb' },
  News:     { color: '#059669', bg: '#ecfdf5' },
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Chat({ profile }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [tag, setTag] = useState('General')
  const [filterTag, setFilterTag] = useState('All')
  const bottomRef = useRef(null)

  useEffect(() => {
    // Load initial messages
    supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(100)
      .then(({ data }) => { if (data) setMessages(data) })

    // Subscribe to new messages in real time
    const channel = supabase.channel('chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        payload => setMessages(prev => [...prev, payload.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        payload => setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m)))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!text.trim()) return
    const msg = { username: profile.username, role: profile.role, tag, text: text.trim(), likes: 0 }
    setText('')
    await supabase.from('chat_messages').insert(msg)
  }

  const like = async (msg) => {
    await supabase.from('chat_messages').update({ likes: msg.likes + 1 }).eq('id', msg.id)
  }

  const displayed = filterTag === 'All' ? messages : messages.filter(m => m.tag === filterTag)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', maxHeight: 800 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#111', marginBottom: 4 }}>Trading Room</h2>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>Share ideas, setups, and market thoughts</p>
      </div>

      {/* Tag filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['All', ...CHAT_TAGS].map(t => {
          const tc = TAG_COLORS[t] || { color: '#6b7280', bg: '#f3f4f6' }
          const active = filterTag === t
          return (
            <button key={t} onClick={() => setFilterTag(t)}
              style={{ fontSize: 11, fontWeight: 500, color: active ? tc.color : '#6b7280', background: active ? tc.bg : '#f8fafc', border: `1px solid ${active ? tc.color + '33' : '#e8ecf0'}`, padding: '4px 10px', borderRadius: 6 }}>
              {t}
            </button>
          )
        })}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {displayed.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4cdd6', fontSize: 13 }}>
            No messages yet. Be the first.
          </div>
        )}
        {displayed.map((m, i) => {
          const tc = TAG_COLORS[m.tag] || TAG_COLORS.General
          const isAdminUser = m.role === 'admin'
          const isMe = m.username === profile.username
          const showAvatar = i === 0 || displayed[i - 1]?.username !== m.username
          return (
            <div key={m.id} style={{ display: 'flex', gap: 10, padding: '6px 4px', borderRadius: 8, background: isMe ? 'rgba(0,0,0,0.01)' : 'transparent' }}>
              <div style={{ width: 32, flexShrink: 0, paddingTop: 2 }}>
                {showAvatar && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: isAdminUser ? '#111' : '#f1f5f9', border: isAdminUser ? 'none' : '1px solid #e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isAdminUser ? '#fff' : '#374151' }}>{m.username[0].toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {showAvatar && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isAdminUser ? '#111' : '#374151' }}>{m.username}</span>
                    {isAdminUser && <span style={{ fontSize: 9, fontWeight: 600, color: '#fff', background: '#111', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.06em' }}>ADMIN</span>}
                    <span style={{ fontSize: 11, color: tc.color, background: tc.bg, padding: '1px 6px', borderRadius: 4 }}>{m.tag}</span>
                    <span style={{ fontSize: 11, color: '#c4cdd6' }}>{timeAgo(m.created_at)}</span>
                  </div>
                )}
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, wordBreak: 'break-word' }}>{m.text}</div>
                <button onClick={() => like(m)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 11, marginTop: 4, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                  ♡ {m.likes > 0 && m.likes}
                </button>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ marginTop: 10, background: '#fff', border: '1px solid #e8ecf0', borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {CHAT_TAGS.map(t => {
            const tc = TAG_COLORS[t]
            return (
              <button key={t} onClick={() => setTag(t)}
                style={{ fontSize: 11, color: tag === t ? tc.color : '#6b7280', background: tag === t ? tc.bg : '#f8fafc', border: `1px solid ${tag === t ? tc.color + '44' : '#e8ecf0'}`, padding: '3px 9px', borderRadius: 5, fontWeight: tag === t ? 500 : 400 }}>
                {t}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Share a setup, idea, or market thought... (Enter to send)"
            style={{ flex: 1, background: '#f8fafc', border: '1px solid #e8ecf0', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#111', outline: 'none', resize: 'none', minHeight: 38, maxHeight: 120, fontFamily: "'Geist', sans-serif", lineHeight: 1.5 }} rows={1} />
          <button onClick={send} disabled={!text.trim()}
            style={{ background: '#111', color: '#fff', border: 'none', width: 38, height: 38, borderRadius: 8, fontSize: 18, opacity: text.trim() ? 1 : 0.4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
