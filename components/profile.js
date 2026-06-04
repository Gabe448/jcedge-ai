'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CHAT_COLORS = [
  { label: 'Gold',    value: '#c4a35a' },
  { label: 'Sage',    value: '#1e6b4a' },
  { label: 'Ink',     value: '#0e0d0b' },
  { label: 'Crimson', value: '#c0392b' },
  { label: 'Violet',  value: '#5b3a9e' },
  { label: 'Steel',   value: '#3b5a7a' },
  { label: 'Copper',  value: '#b45309' },
  { label: 'Rose',    value: '#9d3060' },
]

export default function Profile({ profile, onProfileUpdate }) {
  const [settings, setSettings] = useState({
    dark_mode: false,
    chat_color: '#c4a35a',
    show_tape: true,
    compact_scanner: false,
    notify_push: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [editName, setEditName] = useState('')
  const [nameError, setNameError] = useState('')

  // Load saved settings from profile
  useEffect(() => {
    if (profile?.settings) {
      setSettings(s => ({ ...s, ...profile.settings }))
    }
    if (profile?.username) setEditName(profile.username)
  }, [profile])

  // Apply dark mode to document
  useEffect(() => {
    if (settings.dark_mode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [settings.dark_mode])

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const save = async () => {
    setSaving(true)
    const updates = { settings }
    if (editName && editName !== profile?.username) {
      // Check username not taken
      const { data: existing } = await supabase
        .from('profiles').select('username').eq('username', editName).neq('id', profile.id).single()
      if (existing) { setNameError('Username already taken.'); setSaving(false); return }
      updates.username = editName
      setNameError('')
    }
    await supabase.from('profiles').update(updates).eq('id', profile.id)
    if (onProfileUpdate) onProfileUpdate({ ...profile, ...updates })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const S = {
    section: {
      paddingBottom: 32, marginBottom: 32,
      borderBottom: '1px solid var(--border)',
    },
    sectionTitle: {
      fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em',
      textTransform: 'uppercase', color: 'var(--gold)',
      marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
    },
    row: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid var(--cream2)',
    },
    rowLabel: { fontSize: 13, color: 'var(--ink)', fontWeight: 500 },
    rowSub: { fontSize: 11, color: 'var(--muted)', marginTop: 2 },
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* ── Hero ─────────────────────── */}
      <div style={{
        padding: '44px 0 36px', borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -80, top: -60, width: 280, height: 280, borderRadius: '50%', border: '1px solid var(--border)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 24, height: 1, background: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Profile & Settings
          </span>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 300, lineHeight: 0.95, color: 'var(--ink)' }}>
          Your<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Account</em>
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--ink)', border: '2px solid var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: 'var(--gold2)', fontStyle: 'italic' }}>
              {profile?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>{profile?.username}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginTop: 2 }}>{profile?.email}</div>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 36, maxWidth: 600 }}>

        {/* ── Account ──────────────────── */}
        <div style={S.section}>
          <div style={S.sectionTitle}>
            <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            Account
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 7 }}>
              Display Name
            </div>
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              style={{
                width: '100%', fontFamily: 'var(--sans)', fontSize: 14,
                background: 'var(--cream2)', border: '1px solid var(--border)',
                color: 'var(--ink)', padding: '10px 14px', borderRadius: 6,
                outline: 'none', letterSpacing: '0.02em',
              }}
            />
            {nameError && <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--red)', marginTop: 5 }}>{nameError}</div>}
          </div>

          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em' }}>
            Role: <span style={{ color: 'var(--ink)', textTransform: 'capitalize' }}>{profile?.role || 'member'}</span>
            &nbsp;·&nbsp;
            Status: <span style={{ color: profile?.status === 'approved' ? 'var(--green)' : 'var(--red)', textTransform: 'capitalize' }}>{profile?.status}</span>
          </div>
        </div>

        {/* ── Appearance ───────────────── */}
        <div style={S.section}>
          <div style={S.sectionTitle}>
            <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            Appearance
          </div>

          {/* Dark mode */}
          <div style={S.row}>
            <div>
              <div style={S.rowLabel}>Dark Mode</div>
              <div style={S.rowSub}>Switch to a dark background</div>
            </div>
            <Toggle value={settings.dark_mode} onChange={v => set('dark_mode', v)} />
          </div>

          {/* Compact scanner */}
          <div style={S.row}>
            <div>
              <div style={S.rowLabel}>Compact Scanner</div>
              <div style={S.rowSub}>Reduce row height in the scanner</div>
            </div>
            <Toggle value={settings.compact_scanner} onChange={v => set('compact_scanner', v)} />
          </div>

          {/* Ticker tape */}
          <div style={{ ...S.row, borderBottom: 'none' }}>
            <div>
              <div style={S.rowLabel}>Ticker Tape</div>
              <div style={S.rowSub}>Show scrolling price tape at the top</div>
            </div>
            <Toggle value={settings.show_tape} onChange={v => set('show_tape', v)} />
          </div>
        </div>

        {/* ── Chat color ───────────────── */}
        <div style={S.section}>
          <div style={S.sectionTitle}>
            <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            Chat Name Color
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
            Your name will appear in this color in the Trading Room.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CHAT_COLORS.map(c => (
              <button key={c.value} onClick={() => set('chat_color', c.value)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: c.value,
                  border: settings.chat_color === c.value ? '2px solid var(--ink)' : '2px solid transparent',
                  outline: settings.chat_color === c.value ? '2px solid var(--gold)' : 'none',
                  outlineOffset: 2, transition: 'all 0.15s',
                }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.06em' }}>{c.label}</span>
              </button>
            ))}
          </div>
          {/* Preview */}
          <div style={{ marginTop: 18, padding: '12px 16px', background: 'var(--cream2)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em' }}>Preview:</span>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: settings.chat_color }}>
              {profile?.username || 'You'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Nice setup on COIN 🔥</span>
          </div>
        </div>

        {/* ── Notifications ────────────── */}
        <div style={S.section}>
          <div style={S.sectionTitle}>
            <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            Notifications
          </div>
          <div style={{ ...S.row, borderBottom: 'none' }}>
            <div>
              <div style={S.rowLabel}>Push Alerts</div>
              <div style={S.rowSub}>Get notified when a followed plan hits entry, TP, or stop</div>
            </div>
            <Toggle value={settings.notify_push} onChange={v => set('notify_push', v)} />
          </div>
        </div>

        {/* ── Save ─────────────────────── */}
        <button onClick={save} disabled={saving} style={{
          fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          background: saved ? 'var(--green)' : 'var(--ink)',
          color: saved ? '#fff' : 'var(--gold2)',
          border: 'none', padding: '16px 40px', borderRadius: 6,
          cursor: 'pointer', opacity: saving ? 0.6 : 1,
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {saving ? '…' : saved ? '✓ Saved' : (
            <>
              <span style={{ width: 6, height: 6, background: 'var(--gold2)', transform: 'rotate(45deg)', display: 'inline-block' }} />
              Save Settings
              <span style={{ width: 6, height: 6, background: 'var(--gold2)', transform: 'rotate(45deg)', display: 'inline-block' }} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Toggle component ──────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 40,
      background: value ? 'var(--ink)' : 'var(--cream2)',
      border: `1px solid ${value ? 'var(--ink)' : 'var(--border)'}`,
      position: 'relative', cursor: 'pointer',
      transition: 'all 0.2s', flexShrink: 0,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: value ? 'var(--gold2)' : 'var(--muted)',
        position: 'absolute', top: 3,
        left: value ? 24 : 4,
        transition: 'all 0.2s',
      }} />
    </button>
  )
}
