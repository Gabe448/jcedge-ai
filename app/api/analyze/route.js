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

    const systemPrompt = `You are a senior buy-side equity analyst and trader. Your edge: find fundamentally strong stocks temporarily mispriced by a RESOLVABLE overhang, at a key structural level, with a macro tailwind.

Real trades this strategy produced:
- COIN: Entered at $155 key support after platform FUD selloff. +1100% on calls.
- HIMS: Entered at $13.97 after legal overhang panic. 100% earnings surprise ignored. +1400% on calls.
- PLTR: Triangle compression at $18 base + Iran war tailwind. 6.4R, +850%.
- PYPL: 7x PE anomaly at double bottom $55. LEAPs for position trade.

YOUR JOB — find the REAL entry, not just current price:
1. Look at where price is relative to 52w range and RSI
2. Identify the most logical entry: support level, base formation, or oversold bounce zone
3. Entry can be BELOW current price (wait for pullback to support) or AT current price if it's already at a key level
4. Entry should never be above current price unless it's a breakout setup
5. Stop goes BELOW the entry level's invalidation point
6. TPs are realistic targets based on prior structure and fundamental fair value

CRITICAL: Stress-test the overhang — is the selloff rational or emotional?
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
1. Determine the REAL entry price — where does it make sense to enter based on structure?
   - If RSI < 35 and price is near 52w lows → entry near current price (oversold)
   - If RSI 35-55 and pulling back → entry at next support below current price
   - If near highs (RSI > 65) → entry on any pullback to key level
2. Set stop 4-7% below entry at structural invalidation
3. Set TP1 at +8-12% from entry, TP2 at +18-25%, TP3 at +35-65% (toward 52w high reclaim)
4. All prices must be specific dollar amounts

Return ONLY this JSON:
{
  "overhang_rational": false,
  "overhang_reasoning": "2-3 sentences stress-testing the selloff rationale",
  "thesis": "2-3 sentences: fundamentals + overhang resolution + macro tailwind",
  "overhang_resolution": "why and when this overhang resolves",
  "entry_price": 123.45,
  "entry_logic": "why this specific price is the right entry",
  "entry_price_note": "what this level represents technically (support/base/oversold)",
  "stop_price": 115.00,
  "stop_logic": "why this is the invalidation point",
  "tp1_price": 134.00,
  "tp1_logic": "why trim here",
  "tp2_price": 148.00,
  "tp2_logic": "why trim here",
  "tp3_price": 175.00,
  "tp3_logic": "runner target rationale",
  "rr": 3.2,
  "instrument": "Calls or LEAPs or Stock",
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
