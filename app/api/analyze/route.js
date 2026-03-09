import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PLAN_TTL = 48 * 60 * 60 * 1000 // 48 hours

async function getLivePrice(ticker) {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice || null
  } catch { return null }
}

export async function POST(req) {
  try {
    const stock = await req.json()

    // Check cache first
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
        // Return cached plan with updated live price
        const livePrice = await getLivePrice(stock.ticker)
        return Response.json({
          ...cached.plan,
          _cached: true,
          _cachedAt: cached.created_at,
          _livePrice: livePrice || stock.price
        })
      }
    }

    // No cache or expired — generate new plan
    const price = stock.price
    const stopPrice = +(price * (1 - stock.stopPct / 100)).toFixed(2)
    const tp1Price = +(price * 1.08).toFixed(2)
    const tp2Price = +(price * 1.15).toFixed(2)
    const tp3Price = +(price * (1 + stock.upside / 100)).toFixed(2)
    const high52 = +(price / (1 + stock.from52h / 100)).toFixed(2)

    const systemPrompt = `You are a senior buy-side equity analyst and trader. Your edge: find fundamentally strong stocks temporarily mispriced by a RESOLVABLE overhang, at a key structural level, with a macro tailwind.

Real trades this strategy produced:
- COIN: Platform expansion missed by market. First green candle at $155 key level. +1100% on calls.
- HIMS: 100% earnings surprise, sold off on legal overhang. Entered at $13.97. +1400% on calls.
- PLTR: Triangle compression + Iran war tailwind. 6.4R, +850%.
- PYPL: 7x PE anomaly. Double bottom. LEAPs for position trade.

CRITICAL REASONING — stress-test the overhang before building the plan:
1. Is the selloff rational given actual fundamentals?
2. Can the stated reason actually impair the business long-term?
3. Temporary/sentiment overhang + intact fundamentals = HIGH conviction.

IMPORTANT: Use ONLY the exact price levels provided. Do not invent or round numbers.
Respond ONLY with a valid JSON object, no markdown, no backticks.`

    const userPrompt = `Analyze ${stock.ticker} and build a trade plan using EXACTLY these levels.

STOCK: ${stock.ticker} (${stock.name}) | Sector: ${stock.sector} | Archetype: ${stock.archetype}

FUNDAMENTALS:
- Revenue growth: ${stock.rev_growth}% | Net margin: ${stock.margin}% | ROE: ${stock.roe}%
- P/E: ${stock.pe}x | Debt/Equity: ${stock.debt_eq}

TECHNICAL:
- Current price: $${price}
- 52-week high: $${high52} | Distance from high: ${stock.from52h}%
- RSI: ${stock.rsi} | Volume ratio: ${stock.vol_ratio}x
- Pattern: ${stock.pattern}

LEVELS (use these exactly):
- Entry: ~$${price}
- Stop: $${stopPrice} (${stock.stopPct}% risk)
- TP1: $${tp1Price} (+8%)
- TP2: $${tp2Price} (+15%)
- TP3: $${tp3Price} (${stock.upside}% upside toward 52w high)
- Est R:R: ${stock.rr}R

Return ONLY this JSON:
{
  "overhang_rational": false,
  "overhang_reasoning": "2-3 sentences stress-testing the selloff",
  "thesis": "2-3 sentences: fundamentals + overhang resolution + macro tailwind",
  "overhang_resolution": "why and when this resolves",
  "entry_logic": "exact chart trigger near $${price}",
  "entry_price_note": "what $${price} represents technically",
  "stop_logic": "stop at $${stopPrice} — why this is the invalidation point",
  "tp1": "$${tp1Price} — why trim here",
  "tp2": "$${tp2Price} — why trim here",
  "tp3": "$${tp3Price} — runner target rationale",
  "instrument": "Calls or LEAPs or Stock",
  "timeframe": "specific timeframe e.g. 2-4 weeks",
  "risk_note": "the one thing that invalidates this trade",
  "conviction": "HIGH or MEDIUM or LOW"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
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
