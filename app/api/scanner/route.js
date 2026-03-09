const TICKERS = [
  'AAPL','MSFT','NVDA','AMZN','META','GOOGL','TSLA','AVGO','COST','NFLX',
  'AMD','ADBE','CSCO','TXN','QCOM','AMGN','INTU','AMAT','BKNG','PANW',
  'SBUX','GILD','ADI','VRTX','REGN','MDLZ','ADP','LRCX','MU','KLAC',
  'JPM','V','MA','UNH','JNJ','WMT','PG','HD','BAC','XOM',
  'CVX','LLY','ABBV','MRK','PFE','TMO','ABT','ACN','CRM','ORCL',
  'NOW','UBER','SHOP','COIN','PLTR','APP','HOOD','HIMS','DUOL','DDOG',
  'SNOW','CRWD','ZS','NET','PYPL','MELI','TTD','CELH','NKE','LULU',
  'SPOT','ARM','INTC','IBM','SQ','AFRM','RBLX','SOFI','ABNB','FTNT'
]

function scoreStock(s) {
  // Technical only scoring since fundamentals need paid API
  // We score on: price vs 52w range (mispricing), RSI (technical), momentum
  let mis = 0
  if (s.from52h < -15) mis += 15
  if (s.from52h < -30) mis += 10
  if (s.from52h < -50) mis += 5
  const mispricing = Math.min(mis, 30)

  let tech = 0
  if (s.rsi > 35 && s.rsi < 60) tech += 15
  else if (s.rsi >= 60 && s.rsi < 70) tech += 10
  else if (s.rsi < 35 && s.rsi > 20) tech += 10
  else if (s.rsi <= 20) tech += 5
  const technical = Math.min(tech, 20)

  // Momentum: vol ratio as signal
  let mom = 0
  if (s.vol_ratio > 1.5) mom += 10
  if (s.vol_ratio > 2.0) mom += 10
  const momentum = Math.min(mom, 20)

  // Base score for being a major index component
  const base = 30

  const score = base + mispricing + technical + momentum

  let archetype = 'catalyst_surprise'
  if (s.from52h < -30 && s.rsi < 40) archetype = 'earnings_mispricing'
  else if (s.from52h < -20 && s.rsi < 35) archetype = 'deep_value'
  else if (s.rsi > 55 && s.from52h > -15) archetype = 'macro_pattern'

  const upside = Math.abs(s.from52h) * 0.65
  const stopPct = s.rsi < 40 ? 4 : 6
  const rr = stopPct > 0 ? +(upside / stopPct).toFixed(1) : 0

  return {
    ...s, score,
    breakdown: { fundamentals: base, macro: momentum, mispricing, technical },
    archetype, upside: +upside.toFixed(1), stopPct, rr
  }
}

async function fetchQuote(ticker) {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.chart?.result?.[0]?.meta || null
  } catch { return null }
}

export async function GET() {
  try {
    const concurrency = 15
    const stocks = []

    for (let i = 0; i < TICKERS.length; i += concurrency) {
      const chunk = TICKERS.slice(i, i + concurrency)
      const results = await Promise.all(chunk.map(async ticker => {
        const meta = await fetchQuote(ticker)
        if (!meta?.regularMarketPrice) return null

        const price = meta.regularMarketPrice || 0
        const high52 = meta.fiftyTwoWeekHigh || price
        const low52 = meta.fiftyTwoWeekLow || price * 0.7
        const from52h = high52 > 0 ? +((( price - high52) / high52) * 100).toFixed(1) : 0
        const avgVol = meta.averageDailyVolume3Month || meta.averageDailyVolume10Day || 1
        const curVol = meta.regularMarketVolume || avgVol
        const vol_ratio = avgVol > 0 ? +(curVol / avgVol).toFixed(2) : 1
        const range = high52 - low52
        const rsi = range > 0 ? Math.round(((price - low52) / range) * 100) : 50

        return {
          ticker,
          name: meta.longName || meta.shortName || ticker,
          sector: meta.sector || 'Technology',
          price: +price.toFixed(2),
          pe: 0, eps_beat: 0, rev_growth: 0, margin: 0, roe: 0, debt_eq: 0,
          rsi, from52h, vol_ratio,
          pattern: `${from52h < -20 ? 'Deep pullback' : from52h < -10 ? 'Pullback' : 'Near highs'} · RSI ${rsi}`,
          overhang: 'See AI analysis',
          macro: 'See AI analysis',
          sentiment: Math.min(100, Math.max(0, 50 + rsi * 0.3)),
        }
      }))
      stocks.push(...results.filter(Boolean))
    }

    const scored = stocks
      .map(scoreStock)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)

    return Response.json({ stocks: scored, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Scanner error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
