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

async function fetchQuote(ticker) {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta) return null
    return meta
  } catch { return null }
}

async function fetchSummary(ticker) {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,summaryDetail,assetProfile`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.quoteSummary?.result?.[0] || null
  } catch { return null }
}

export async function GET() {
  try {
    // Fetch all tickers in parallel with a concurrency limit
    const concurrency = 10
    const stocks = []

    for (let i = 0; i < TICKERS.length; i += concurrency) {
      const chunk = TICKERS.slice(i, i + concurrency)
      const results = await Promise.all(chunk.map(async ticker => {
        const [meta, summary] = await Promise.all([
          fetchQuote(ticker),
          fetchSummary(ticker)
        ])
        if (!meta) return null

        const price = meta.regularMarketPrice || 0
        const high52 = meta.fiftyTwoWeekHigh || price
        const low52 = meta.fiftyTwoWeekLow || price * 0.7
        const from52h = high52 > 0 ? +((( price - high52) / high52) * 100).toFixed(1) : 0
        const avgVol = meta.averageDailyVolume3Month || 1
        const vol_ratio = avgVol > 0 ? +((meta.regularMarketVolume || avgVol) / avgVol).toFixed(2) : 1
        const range = high52 - low52
        const rsi = range > 0 ? Math.round(((price - low52) / range) * 100) : 50

        const fin = summary?.financialData || {}
        const stats = summary?.defaultKeyStatistics || {}
        const profile = summary?.assetProfile || {}

        return {
          ticker,
          name: meta.longName || meta.shortName || ticker,
          sector: profile.sector || 'Unknown',
          price: +price.toFixed(2),
          pe: +(stats.forwardPE?.raw || 0).toFixed(1),
          eps_beat: 0,
          rev_growth: +((fin.revenueGrowth?.raw || 0) * 100).toFixed(1),
          margin: +((fin.profitMargins?.raw || 0) * 100).toFixed(1),
          roe: +((fin.returnOnEquity?.raw || 0) * 100).toFixed(1),
          debt_eq: +(fin.debtToEquity?.raw || 0).toFixed(2),
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
      .filter(s => s.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)

    return Response.json({ stocks: scored, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Scanner error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
