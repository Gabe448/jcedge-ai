const FMP = process.env.FMP_API_KEY

// Score a stock using the 4-layer system
function scoreStock(s) {
  let fund = 0
  if (s.eps_beat > 15) fund += 10; else if (s.eps_beat > 5) fund += 6; else if (s.eps_beat > 0) fund += 3
  if (s.rev_growth > 20) fund += 8; else if (s.rev_growth > 10) fund += 5; else if (s.rev_growth > 0) fund += 2
  if (s.margin > 20) fund += 7; else if (s.margin > 10) fund += 4; else if (s.margin > 0) fund += 1
  if (s.roe > 20) fund += 5
  const fundamentals = Math.min(fund, 30)

  // Macro/sentiment proxy: revenue growth momentum + margin quality
  let mac = 0
  if (s.rev_growth > 30) mac += 20; else if (s.rev_growth > 15) mac += 15; else if (s.rev_growth > 5) mac += 10; else mac += 5
  const macro = Math.min(mac, 25)

  // Mispricing: down from highs despite strong fundamentals
  let mis = 0
  if (s.from52h < -15) mis += 10
  if (s.from52h < -30) mis += 5
  if (s.eps_beat > 0 && s.from52h < -10) mis += 8
  if (s.pe > 0 && s.pe < 20 && s.rev_growth > 10) mis += 7 // value + growth
  const mispricing = Math.min(mis, 25)

  // Technical: RSI sweet spot, volume
  let tech = 0
  if (s.rsi > 35 && s.rsi < 60) tech += 8
  if (s.rsi < 35) tech += 5 // oversold
  if (s.vol_ratio > 1.5) tech += 6
  if (s.vol_ratio > 2.0) tech += 6
  const technical = Math.min(tech, 20)

  const score = fundamentals + macro + mispricing + technical

  // Archetype classification
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
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`FMP error: ${res.status}`)
  return res.json()
}

// Top QQQ + SPY holdings — hardcoded (free tier friendly)
const TICKERS = [
  'AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','COST',
  'NFLX','TMUS','AMD','PEP','ADBE','CSCO','TXN','QCOM','AMGN','HON',
  'INTU','AMAT','BKNG','SBUX','GILD','ADI','VRTX','REGN','PANW','MDLZ',
  'ADP','LRCX','MU','KLAC','SNPS','CDNS','MRVL','ORLY','ASML','ABNB',
  'FTNT','CTAS','MNST','PCAR','PAYX','CPRT','ROST','KDP','ODFL','DXCM',
  'JPM','V','MA','UNH','JNJ','WMT','PG','HD','BAC','XOM',
  'CVX','LLY','ABBV','MRK','PFE','TMO','ABT','ACN','CRM','ORCL',
  'INTC','IBM','NOW','UBER','SHOP','COIN','PLTR','APP','HOOD','SOFI',
  'HIMS','DUOL','DDOG','SNOW','CRWD','ZS','NET','GTLB','BILL','RXRX',
  'PYPL','SQ','AFRM','MELI','SE','GRAB','RBLX','U','DOCS','SMAR'
]

export async function GET() {
  try {
    const tickers = TICKERS

    // 2. Batch fetch key metrics + quote in parallel (groups of 50)
    const chunks = []
    for (let i = 0; i < tickers.length; i += 50) {
      chunks.push(tickers.slice(i, i + 50))
    }

    const [metricsResults, quoteResults] = await Promise.all([
      Promise.all(chunks.map(chunk =>
        fetchJSON(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${chunk.join(',')}?apikey=${FMP}`)
          .catch(() => [])
      )),
      Promise.all(chunks.map(chunk =>
        fetchJSON(`https://financialmodelingprep.com/api/v3/quote/${chunk.join(',')}?apikey=${FMP}`)
          .catch(() => [])
      ))
    ])

    const metrics = metricsResults.flat()
    const quotes = quoteResults.flat()

    // Index by ticker
    const metricsMap = {}
    metrics.forEach(m => { if (m.symbol) metricsMap[m.symbol] = m })
    const quoteMap = {}
    quotes.forEach(q => { if (q.symbol) quoteMap[q.symbol] = q })

    // 3. Fetch earnings surprises for all tickers
    const earningsResults = await Promise.all(
      chunks.map(chunk =>
        fetchJSON(`https://financialmodelingprep.com/api/v3/earnings-surprises/${chunk[0]}?apikey=${FMP}&limit=1`)
          .catch(() => [])
      )
    )

    // Build stock objects
    const stocks = []
    for (const ticker of tickers) {
      const m = metricsMap[ticker]
      const q = quoteMap[ticker]
      if (!m || !q || !q.price) continue

      const price = q.price || 0
      const high52 = q.yearHigh || price
      const from52h = high52 > 0 ? +((( price - high52) / high52) * 100).toFixed(1) : 0
      const avgVol = q.avgVolume || 1
      const vol = q.volume || avgVol
      const vol_ratio = avgVol > 0 ? +(vol / avgVol).toFixed(2) : 1

      // RSI approximation from price vs 52w range
      const low52 = q.yearLow || price * 0.7
      const range = high52 - low52
      const rsi = range > 0 ? Math.round(((price - low52) / range) * 100) : 50

      const stock = {
        ticker,
        name: q.name || ticker,
        sector: m.sector || 'Unknown',
        price: +price.toFixed(2),
        pe: +(m.peRatioTTM || 0).toFixed(1),
        eps_beat: 0, // will update below
        rev_growth: +((m.revenueGrowth || 0) * 100).toFixed(1),
        margin: +((m.netProfitMarginTTM || 0) * 100).toFixed(1),
        roe: +((m.roeTTM || 0) * 100).toFixed(1),
        debt_eq: +(m.debtToEquityTTM || 0).toFixed(2),
        rsi,
        from52h,
        vol_ratio,
        pattern: `${from52h < -20 ? 'Deep pullback' : from52h < -10 ? 'Pullback' : 'Near highs'} · RSI ${rsi}`,
        overhang: 'See AI analysis',
        macro: 'See AI analysis',
        sentiment: Math.min(100, Math.max(0, 50 + rsi * 0.3 + (m.revenueGrowth || 0) * 50)),
      }
      stocks.push(stock)
    }

    // 4. Score and sort, return top 60
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
