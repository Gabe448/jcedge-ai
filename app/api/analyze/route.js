import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PLAN_TTL = 48 * 60 * 60 * 1000

async function getLivePrice(ticker) {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    )
    const data = await res.json()
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice || null
  } catch { return null }
}

export async function POST(req) {
  try {
    const stock = await req.json()

    // Check if user is following this stock — if so, return locked plan
    if (stock.user_id) {
      const { data: followed } = await supabase
        .from('followed_plans')
        .select('*')
        .eq('user_id', stock.user_id)
        .eq('ticker', stock.ticker)
        .eq('active', true)
        .single()

      if (followed?.plan_data) {
        const livePrice = await getLivePrice(stock.ticker)
        return Response.json({
          ...followed.plan_data,
          _cached: true,
          _locked: true,
          _livePrice: livePrice || stock.price
        })
      }
    }

    // Check 48h AI cache
    const { data: cached } = await supabase
      .from('ai_plans')
      .select('*')
      .eq('ticker', stock.ticker)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime()
      if (age < PLAN_TTL) {
        const livePrice = await getLivePrice(stock.ticker)
        return Response.json({
          ...cached.plan,
          _cached: true,
          _cachedAt: cached.created_at,
          _livePrice: livePrice || stock.price
        })
      }
    }

    // Generate fresh plan — Claude determines entry
    const price = stock.price
    const high52 = +(price / (1 + stock.from52h / 100)).toFixed(2)
    const low52 = +(high52 * (1 + stock.from52h / 100) * (stock.rsi / 100) * 0.7).toFixed(2)

    const systemPrompt = `You are a senior equity analyst and trader. You identify HIGH CONVICTION setups in both directions — long and short.

BULLISH edge: fundamentally strong stocks mispriced by a resolvable overhang at a key structural level.
BEARISH edge: overvalued, deteriorating, or news-damaged stocks at distribution tops or breakdown levels.

Real trades:
- COIN long: Entered $155 support after FUD selloff. +1100% on calls.
- HIMS long: Entered $13.97 on legal panic, 100% EPS surprise ignored. +1400% on calls.
- PLTR long: Triangle compression + macro tailwind. 6.4R.
- PYPL long: 7x PE double bottom. LEAPs.
- Bearish example: Stock at 52w high, PE 80x, revenue decelerating, insider selling — short the breakdown.

YOUR JOB:
1. Determine direction: LONG or SHORT based on fundamentals + technicals + news/macro
2. LONG signals: oversold, strong fundamentals, irrational selloff, resolvable overhang
3. SHORT signals: overvalued (high PE + decelerating growth), near 52w high with deteriorating fundamentals, negative catalyst (regulation, competition, margin compression), RSI > 70 with weak fundamentals
4. Find the REAL entry — support for longs, resistance/breakdown for shorts
5. Stop above entry resistance (shorts) or below entry support (longs)
6. TPs based on structure and fair value

Respond ONLY with valid JSON, no markdown.`

    const userPrompt = `Build a complete trade plan for ${stock.ticker}.

STOCK: ${stock.ticker} (${stock.name}) | Sector: ${stock.sector} | Archetype: ${stock.archetype}

FUNDAMENTALS:
- Revenue growth: ${stock.rev_growth}% | Net margin: ${stock.margin}% | ROE: ${stock.roe}%
- P/E: ${stock.pe}x | Debt/Equity: ${stock.debt_eq}

PRICE ACTION:
- Current price: $${price}
- 52-week high: $${high52} | Distance from 52w high: ${stock.from52h}%
- RSI (price-range proxy): ${stock.rsi} | Volume ratio: ${stock.vol_ratio}x
- Pattern: ${stock.pattern}

TASK:
1. Determine direction — LONG or SHORT:
   - SHORT if: RSI > 65 AND (PE > 60 or rev_growth declining) AND near 52w high — stock is extended and fundamentals don't justify valuation
   - SHORT if: negative catalyst (margin collapse, regulation, losing market share) with stock still elevated
   - LONG if: RSI < 50, strong fundamentals, oversold or at support, resolvable overhang
   - LONG if: deeply mispriced relative to earnings power

2. Entry:
   - LONG: support level, base, or oversold zone — can be at or below current price
   - SHORT: resistance level, distribution zone, or breakdown confirmation — at or above current price

3. Stop:
   - LONG: below entry support (4-7% risk)
   - SHORT: above entry resistance (4-7% risk)

4. TPs (% move from entry in the trade direction):
   - TP1: +8-12%, TP2: +18-25%, TP3: +35-65%
   - All prices must be specific dollar amounts

Return ONLY this JSON:
{
  "direction": "LONG or SHORT",
  "overhang_rational": false,
  "overhang_reasoning": "2-3 sentences: why is the stock mispriced or overpriced?",
  "thesis": "2-3 sentences: direction + catalyst + why now",
  "overhang_resolution": "for longs: what resolves the overhang. for shorts: what triggers the decline",
  "entry_price": 123.45,
  "entry_logic": "why this specific price is the right entry",
  "entry_price_note": "what this level represents (support/resistance/base/breakdown)",
  "stop_price": 115.00,
  "stop_logic": "why this is the invalidation point",
  "tp1_price": 134.00,
  "tp1_logic": "why cover/trim here",
  "tp2_price": 148.00,
  "tp2_logic": "why cover/trim here",
  "tp3_price": 175.00,
  "tp3_logic": "runner/full cover target",
  "rr": 3.2,
  "instrument": "Calls/LEAPs/Stock for longs, Puts/Stock short for shorts",
  "timeframe": "specific timeframe e.g. 2-6 weeks",
  "risk_note": "the one thing that invalidates this trade",
  "conviction": "HIGH or MEDIUM or LOW"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })

    const raw = message.content[0].text.trim()
      .replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim()
    const plan = JSON.parse(raw)

    // Save to cache
    await supabase.from('ai_plans').insert({
      ticker: stock.ticker,
      plan,
      created_at: new Date().toISOString()
    })

    return Response.json(plan)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
