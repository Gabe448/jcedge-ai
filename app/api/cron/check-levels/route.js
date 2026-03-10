import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

  webpush.setVapidDetails(
    'mailto:admin@jcedge.ai',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  const { data: plans } = await supabase
    .from('followed_plans')
    .select('*')
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

    for (const alert of newAlerts) {
      const title = `${alert.emoji} ${plan.ticker} — ${alert.label} Hit`
      const body = `$${plan.ticker} @ $${price.toFixed(2)} · ${alert.label} at $${alert.price}`

      if (pushSub?.subscription) {
        try {
          await webpush.sendNotification(
            JSON.parse(pushSub.subscription),
            JSON.stringify({ title, body, url: '/dashboard' })
          )
        } catch (e) { console.error('Push failed:', e.message) }
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
