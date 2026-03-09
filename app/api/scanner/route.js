const FMP = process.env.FMP_API_KEY

function scoreStock(s) {
  let fund = 0
  if (s.eps_beat > 15) fund += 10; else if (s.eps_beat > 5) fund += 6; else if (s.eps_beat > 0) fund += 3
  if (s.rev_growth > 20) fund += 8; else if (s.rev_growth > 10) fund += 5; else if (s.rev_growth > 0) fund += 2
  if (s.margin > 20) fund += 7; else if (s.margin > 10) fund += 4; else if (s.margin > 0) fund += 1
  if (s.roe > 20) fund += 5
  const fundamentals = Math.min(fund, 30)
  let mac = 0
  if (s.rev_growth > 30) mac += 20; else if (s.rev_growth > 15) mac += 15; else if (s.rev_growth > 5) mac += 10; else mac += 5
  const macro = Math.min(mac, 25)
  let mis = 0
  if (s.from52h < -15) mis += 10
  if (s.from52h < -30) mis += 5
  if (s.eps_beat > 0 && s.from52h < -10) mis += 8
  if (s.pe > 0 && s.pe < 20 && s.rev_growth > 10) mis += 7
  const mispricing = Math.min(mis, 25)
  let tech = 0
  if (s.rsi > 35 && s.rsi < 60) tech += 8
  if (s.rsi < 35) tech += 5
  if (s.vol_ratio > 1.5) tech += 6
  if (s.vol_ratio > 2.0) tech += 6
  const technical = Math.min(tech, 20)
  const score = fundamentals + macro + mispricing + technical
  let archetype = 'catalyst_surprise'
  if (s.eps_beat > 20 && s.from52h < -15) archetype = 'earnings_mispricing'
  else if (s.pe > 0 && s.pe < 15 && s.rev_growth > 5) archetype = 'deep_value'
  else if (s.rev_growth > 25 && s.rsi < 60) archetype = 'macro_pattern'
  const upside = Math.abs(s.from52h) * 0.65
  const stopPct = s.rsi < 40 ? 4 : 6
  const rr = stopPct > 0 ? +(upside / stopPct).toFixed(1) : 0
  return { ...s, score, breakdown: { fundamentals, macro, mispricing, technical }, archetype, upside: +upside.toFixed(1), stopPct, rr }
}

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`FMP error: ${res.status}`)
  return res.json()
}

export async function GET() {
  try {
    const [qqq, spy] = await Promise.all([
      fetchJSON(`https://financialmodelingprep.com/api/v3/etf-holder/QQQ?apikey=${FMP}`),
      fetchJSON(`https://financialmodelingprep.com/api/v3/etf-holder/SPY?apikey=${FMP}`)
    ])

    const tickerSet = new Map()
    ;[...qqq, ...spy].forEach(h => {
      if (h.asset && h.weightPercentage) {
        const existing = tickerSet.get(h.asset) || 0
        tickerSet.set(h.asset, existing + parseFloat(h.weightPercentage || 0))
      }
    })
    const tickers = [...tickerSet.keys()].slice(0, 200)

    const chunks = []
    for (let i = 0; i < tickers.length; i += 50) chunks.push(tickers.slice(i, i + 50))

    const [metricsResults, quoteResults] = await Promise.all([
      Promise.all(chunks.map(chunk =>
        fetchJSON(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${chunk.join(',')}?apikey=${FMP}`).catch(() => [])
      )),
      Promise.all(chunks.map(chunk =>
        fetchJSON(`https://financialmodelingprep.com/api/v3/quote/${chunk.join(',')}?apikey=${FMP}`).catch(() => [])
      ))
    ])

    const metricsMap = {}
    metricsResults.flat().forEach(m => { if (m.symbol) metricsMap[m.symbol] = m })
    const quoteMap = {}
    quoteResults.flat().forEach(q => { if (q.symbol) quoteMap[q.symbol] = q })

    const stocks = []
    for (const ticker of tickers) {
      const m = metricsMap[ticker]
      const q = quoteMap[ticker]
      if (!m || !q || !q.price) continue
      const price = q.price || 0
      const high52 = q.yearHigh || price
      const from52h = high52 > 0 ? +((( price - high52) / high52) * 100).toFixed(1) : 0
      const avgVol = q.avgVolume || 1
      const vol_ratio = avgVol > 0 ? +(( q.volume || avgVol) / avgVol).toFixed(2) : 1
      const low52 = q.yearLow || price * 0.7
      const range = high52 - low52
      const rsi = range > 0 ? Math.round(((price - low52) / range) * 100) : 50
      stocks.push({
        ticker, name: q.name || ticker, sector: m.sector || 'Unknown',
        price: +price.toFixed(2),
        pe: +(m.peRatioTTM || 0).toFixed(1),
        eps_beat: 0,
        rev_growth: +((m.revenueGrowth || 0) * 100).toFixed(1),
        margin: +((m.netProfitMarginTTM || 0) * 100).toFixed(1),
        roe: +((m.roeTTM || 0) * 100).toFixed(1),
        debt_eq: +(m.debtToEquityTTM || 0).toFixed(2),
        rsi, from52h, vol_ratio,
        pattern: `${from52h < -20 ? 'Deep pullback' : from52h < -10 ? 'Pullback' : 'Near highs'} · RSI ${rsi}`,
        overhang: 'See AI analysis', macro: 'See AI analysis',
        sentiment: Math.min(100, Math.max(0, 50 + rsi * 0.3 + (m.revenueGrowth || 0) * 50)),
      })
    }

    const scored = stocks
      .map(scoreStock)
      .filter(s => s.score > 20 && s.pe > 0 && s.rev_growth > -20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)

    return Response.json({ stocks: scored, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Scanner API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
