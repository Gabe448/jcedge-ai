const FMP = process.env.FMP_API_KEY
const BASE = 'https://financialmodelingprep.com/stable'

function scoreStock(s) {
  let fund = 0
  if (s.rev_growth > 20) fund += 10; else if (s.rev_growth > 10) fund += 6; else if (s.rev_growth > 0) fund += 3
  if (s.margin > 20) fund += 8; else if (s.margin > 10) fund += 5; else if (s.margin > 0) fund += 2
  if (s.roe > 20) fund += 7; else if (s.roe > 10) fund += 4
  if (s.pe > 0 && s.pe < 20) fund += 5
  const fundamentals = Math.min(fund, 30)
  let mac = 0
  if (s.rev_growth > 30) mac += 20; else if (s.rev_growth > 15) mac += 15; else if (s.rev_growth > 5) mac += 10; else mac += 5
  const macro = Math.min(mac, 25)
  let mis = 0
  if (s.from52h < -15) mis += 10
  if (s.from52h < -30) mis += 5
  if (s.from52h < -10 && s.rev_growth > 10) mis += 8
  if (s.pe > 0 && s.pe < 15 && s.rev_growth > 5) mis += 7
  const mispricing = Math.min(mis, 25)
  let tech = 0
  if (s.rsi > 35 && s.rsi < 60) tech += 8
  if (s.rsi < 35) tech += 5
  if (s.vol_ratio > 1.5) tech += 12
  const technical = Math.min(tech, 20)
  const score = fundamentals + macro + mispricing + technical
  let archetype = 'catalyst_surprise'
  if (s.from52h < -15 && s.rev_growth > 10) archetype = 'earnings_mispricing'
  else if (s.pe > 0 && s.pe < 15 && s.rev_growth > 5) archetype = 'deep_value'
  else if (s.rev_growth > 25 && s.rsi < 60) archetype = 'macro_pattern'
  const upside = Math.abs(s.from52h) * 0.65
  const stopPct = s.rsi < 40 ? 4 : 6
  const rr = stopPct > 0 ? +(upside / stopPct).toFixed(1) : 0
  return { ...s, score, breakdown: { fundamentals, macro, mispricing, technical }, archetype, upside: +upside.toFixed(1), stopPct, rr }
}

export async function GET() {
  try {
    // Use company screener - single call, returns fundamentals + price, free tier
    const url = `${BASE}/company-screener?exchange=nasdaq,nyse&limit=200&apikey=${FMP}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`FMP error: ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('Invalid response from FMP')

    const stocks = data
      .filter(s => s.symbol && s.price && s.marketCap > 1_000_000_000)
      .map(s => {
        const price = s.price || 0
        const high52 = s.yearHigh || price
        const low52 = s.yearLow || price * 0.7
        const from52h = high52 > 0 ? +((( price - high52) / high52) * 100).toFixed(1) : 0
        const avgVol = s.avgVolume || 1
        const vol_ratio = avgVol > 0 ? +((s.volume || avgVol) / avgVol).toFixed(2) : 1
        const range = high52 - low52
        const rsi = range > 0 ? Math.round(((price - low52) / range) * 100) : 50
        return {
          ticker: s.symbol,
          name: s.companyName || s.symbol,
          sector: s.sector || 'Unknown',
          price: +price.toFixed(2),
          pe: +(s.pe || 0).toFixed(1),
          eps_beat: 0,
          rev_growth: +(s.revenueGrowth * 100 || 0).toFixed(1),
          margin: +(s.netProfitMargin * 100 || 0).toFixed(1),
          roe: +(s.returnOnEquity * 100 || 0).toFixed(1),
          debt_eq: +(s.debtToEquity || 0).toFixed(2),
          rsi, from52h, vol_ratio,
          pattern: `${from52h < -20 ? 'Deep pullback' : from52h < -10 ? 'Pullback' : 'Near highs'} · RSI ${rsi}`,
          overhang: 'See AI analysis',
          macro: 'See AI analysis',
          sentiment: Math.min(100, Math.max(0, 50 + rsi * 0.3)),
        }
      })

    const scored = stocks
      .map(scoreStock)
      .filter(s => s.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)

    return Response.json({ stocks: scored, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Scanner error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
