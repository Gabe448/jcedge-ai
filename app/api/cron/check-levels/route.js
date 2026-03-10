import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

webpush.setVapidDetails(
  'mailto:' + (process.env.RESEND_FROM_EMAIL || 'alerts@jcedge.ai'),
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

async function getPrice(ticker) {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    )
    const data = await res.json()
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice || null
  } catch { return null }
}

export async function GET(req) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: plans } = await supabase
    .from('followed_plans')
    .select('*, profiles(email, username)')
    .eq('active', true)

  if (!plans?.length) return Response.json({ checked: 0 })

  const tickerPrices = {}
  const tickers = [...new Set(plans.map(p => p.ticker))]
  await Promise.all(tickers.map(async t => { tickerPrices[t] = await getPrice(t) }))

  let alertsSent = 0

  for (const plan of plans) {
    const price = tickerPrices[plan.ticker]
    if (!price) continue

    const notified = plan.notified_levels || []
    const newAlerts = []

    const levels = [
      { key: 'entry', price: plan.entry, label: 'Entry', emoji: '🟡', direction: 'below' },
      { key: 'tp1',   price: plan.tp1,   label: 'TP1',   emoji: '🟢', direction: 'above' },
      { key: 'tp2',   price: plan.tp2,   label: 'TP2',   emoji: '🟢', direction: 'above' },
      { key: 'tp3',   price: plan.tp3,   label: 'TP3',   emoji: '🟢', direction: 'above' },
      { key: 'stop',  price: plan.stop,  label: 'Stop',  emoji: '🔴', direction: 'below' },
    ]

    for (const level of levels) {
      if (notified.includes(level.key) || !level.price) continue
      const hit = level.direction === 'above' ? price >= level.price : price <= level.price
      if (hit) newAlerts.push(level)
    }

    if (!newAlerts.length) continue

    const { data: pushSub } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', plan.user_id)
      .single()

    const userEmail = plan.profiles?.email
    const username = plan.profiles?.username || 'Trader'

    for (const alert of newAlerts) {
      const title = `${alert.emoji} ${plan.ticker} hit ${alert.label}`
      const body = `$${plan.ticker} @ $${price.toFixed(2)} — ${alert.label} at $${alert.price} reached`

      if (pushSub?.subscription) {
        try {
          await webpush.sendNotification(JSON.parse(pushSub.subscription), JSON.stringify({ title, body, url: '/dashboard' }))
        } catch (e) { console.error('Push failed:', e.message) }
      }

      if (userEmail) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'alerts@jcedge.ai',
            to: userEmail,
            subject: title,
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <div style="font-size:22px;font-weight:700;margin-bottom:4px">${alert.emoji} ${plan.ticker} — ${alert.label} Hit</div>
              <div style="color:#6b7280;font-size:14px;margin-bottom:20px">JCedge.ai Alert for ${username}</div>
              <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:16px">
                <div style="font-size:28px;font-weight:700;color:#111">$${price.toFixed(2)}</div>
                <div style="color:#6b7280;font-size:13px">${plan.ticker} current price</div>
              </div>
              <table style="width:100%;font-size:13px;margin-bottom:20px">
                <tr><td style="color:#6b7280;padding:4px 0">Level hit</td><td style="font-weight:600">${alert.label} @ $${alert.price}</td></tr>
                <tr><td style="color:#6b7280;padding:4px 0">Stop loss</td><td style="color:#ef4444">$${plan.stop}</td></tr>
                <tr><td style="color:#6b7280;padding:4px 0">Remaining TPs</td><td>${[plan.tp1,plan.tp2,plan.tp3].filter(Boolean).map(t=>'$'+t).join(' · ')}</td></tr>
              </table>
              <a href="https://jcedge.ai/dashboard" style="background:#111;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">Open Dashboard</a>
              <div style="margin-top:24px;font-size:11px;color:#9ca3af">JCedge.ai · Private trading intelligence</div>
            </div>`
          })
        } catch (e) { console.error('Email failed:', e.message) }
      }

      await supabase.from('notifications').insert({
        user_id: plan.user_id,
        ticker: plan.ticker,
        level: alert.key,
        label: alert.label,
        price_at_alert: price,
        read: false,
        created_at: new Date().toISOString()
      })

      alertsSent++
    }

    if (newAlerts.length) {
      await supabase.from('followed_plans')
        .update({ notified_levels: [...notified, ...newAlerts.map(a => a.key)] })
        .eq('id', plan.id)
    }
  }

  return Response.json({ checked: plans.length, alertsSent })
}
