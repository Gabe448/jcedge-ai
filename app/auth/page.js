'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inp = {
    width: '100%', background: '#f8fafc', border: '1px solid #e8ecf0',
    borderRadius: 8, padding: '10px 13px', fontSize: 14, color: '#111',
    outline: 'none', fontFamily: "'Geist', sans-serif"
  }

  const handleLogin = async () => {
    setError(''); setLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single()
    if (!profile) { setError('Profile not found. Contact admin.'); setLoading(false); return }
    if (profile.status === 'pending') {
      await supabase.auth.signOut()
      setError('Your account is pending approval. Check back soon.')
      setLoading(false); return
    }
    router.push('/dashboard')
  }

  const handleSignup = async () => {
    setError(''); setLoading(true)
    if (!form.username || !form.email || !form.password) {
      setError('All fields required.'); setLoading(false); return
    }
    const { data: existing } = await supabase
      .from('profiles').select('username').eq('username', form.username).single()
    if (existing) { setError('Username already taken.'); setLoading(false); return }
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.password
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    await supabase.from('profiles').insert({
      id: data.user.id, username: form.username, email: form.email,
      role: 'member', status: 'pending'
    })
    await supabase.auth.signOut()
    setSuccess("Account created! Waiting for approval.")
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#111' }}>JC</span>
            <span style={{ fontWeight: 700, fontSize: 28, color: '#111' }}>edge</span>
            <span style={{ fontSize: 16, color: '#94a3b8', fontWeight: 400 }}>.ai</span>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Private trading intelligence platform</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: '28px 28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: 2, background: '#f8fafc', borderRadius: 10, padding: 3, marginBottom: 24 }}>
            {[['login', 'Sign In'], ['signup', 'Request Access']].map(([id, label]) => (
              <button key={id} onClick={() => { setMode(id); setError(''); setSuccess('') }}
                style={{ flex: 1, background: mode === id ? '#fff' : 'none', border: 'none', boxShadow: mode === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', color: mode === id ? '#111' : '#6b7280', padding: '7px', borderRadius: 8, fontSize: 13, fontWeight: mode === id ? 500 : 400 }}>
                {label}
              </button>
            ))}
          </div>
          {success ? (
            <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>✓</div>
              <div style={{ fontSize: 13, color: '#059669', lineHeight: 1.6 }}>{success}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'signup' && (
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Username</div>
                  <input style={inp} placeholder="username" value={form.username} onChange={e => set('username', e.target.value)} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</div>
                <input style={inp} type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</div>
                <input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()} />
              </div>
              {error && (
                <div style={{ fontSize: 12, color: '#ef4444', background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 6, padding: '8px 11px' }}>{error}</div>
              )}
              <button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading}
                style={{ background: '#111', color: '#fff', border: 'none', padding: 11, borderRadius: 10, fontSize: 14, fontWeight: 500, marginTop: 4, opacity: loading ? 0.6 : 1 }}>
                {loading ? '...' : mode === 'login' ? 'Sign In' : 'Request Access'}
              </button>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
          Access is by approval only.
        </div>
      </div>
    </div>
  )
}