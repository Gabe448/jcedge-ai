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

    // Generate fresh plan with web search for news context
    const price = stock.price
    const high52 = +(price / (1 + stock.from52h / 100)).toFixed(2)

    const systemPrompt = `You are a senior equity analyst and trader. You identify HIGH CONVICTION setups in both directions — long and short.

CRITICAL FIRST STEP: Before building any plan, search for recent news on the ticker. You must understand WHY the stock is at its current price. A stock down 50% due to accounting fraud, SEC investigation, or existential business threat is NOT the same as a stock down 50% due to macro rotation or temporary sentiment.

NEWS ASSESSMENT RULES:
- Fraud, accounting restatement, SEC investigation, DOJ probe → HIGH RISK, be very cautious with longs, consider short
- CEO departure, earnings miss, guidance cut → assess severity, may still be buyable at right price  
- Macro/sector rotation, rate fears, general market selloff → often creates opportunity
- Competition threats, margin compression → structural problem, avoid long
- Regulatory risk (especially for crypto, pharma, fintech) → depends on resolution timeline

Only after understanding the news context should you determine direction and build the plan.

BULLISH edge: fundamentally strong stocks mispriced by a RESOLVABLE overhang.
BEARISH edge: overvalued, deteriorating, or news-damaged stocks.

Respond ONLY with valid JSON, no markdown.`

    const userPrompt = `Build a complete trade plan for ${stock.ticker}.

STOCK: ${stock.ticker} (${stock.name}) | Sector: ${stock.sector} | Archetype: ${stock.archetype}

FUNDAMENTALS:
- Revenue growth: ${stock.rev_growth}% | Net margin: ${stock.margin}% | ROE: ${stock.roe}%
- P/E: ${stock.pe}x | Debt/Equity: ${stock.debt_eq}

PRICE ACTION:
- Current price: $${price}
- 52-week high: $${high52} | Distance from 52w high: ${stock.from52h}%
- RSI: ${stock.rsi} | Volume ratio: ${stock.vol_ratio}x
- Pattern: ${stock.pattern}
- MA20: ${stock.ma20Pct > 0 ? '+' : ''}${stock.ma20Pct}% | MA50: ${stock.ma50Pct > 0 ? '+' : ''}${stock.ma50Pct}%
${stock.goldenCross ? '- Golden cross detected' : ''}${stock.deathCross ? '- Death cross detected' : ''}
${stock.isBreakingOut ? '- Breaking out on volume' : ''}${stock.isBreakingDown ? '- Breaking down on volume' : ''}
${stock.bullishDiv ? '- Bullish RSI divergence detected' : ''}

STEP 1 — Search for recent news: Search "${stock.ticker} stock news" and "${stock.ticker} ${new Date().getFullYear()}" to understand what is driving price action. Look for any red flags: fraud, investigations, restatements, existential threats.

STEP 2 — Assess tradability: Is this stock currently safe to trade? Rate the news risk: LOW / MEDIUM / HIGH

STEP 3 — Determine direction: LONG or SHORT based on fundamentals + technicals + news

STEP 4 — Build the plan with realistic entry based on news context:
- If HIGH news risk on long: either recommend avoiding entirely OR set a very wide stop to account for uncertainty
- Entry can be at or below current price for longs, at or above for shorts
- Stop: 4-7% from entry at structural invalidation
- TPs: TP1 +8-12%, TP2 +18-25%, TP3 +35-65%
- All prices must be specific dollar amounts

Return ONLY this JSON:
{
  "direction": "LONG or SHORT",
  "news_risk": "LOW or MEDIUM or HIGH",
  "news_summary": "1-2 sentences on what recent news is driving price action",
  "overhang_rational": false,
  "overhang_reasoning": "2-3 sentences: why is the stock at this price?",
  "thesis": "2-3 sentences: direction + catalyst + why now",
  "overhang_resolution": "what resolves the overhang (longs) or triggers decline (shorts)",
  "entry_price": 123.45,
  "entry_logic": "why this specific price is the right entry",
  "entry_price_note": "what this level represents technically",
  "stop_price": 115.00,
  "stop_logic": "why this is the invalidation point",
  "tp1_price": 134.00,
  "tp1_logic": "why trim here",
  "tp2_price": 148.00,
  "tp2_logic": "why trim here",
  "tp3_price": 175.00,
  "tp3_logic": "runner target",
  "rr": 3.2,
  "instrument": "Calls/LEAPs/Stock for longs, Puts/Stock short for shorts",
  "timeframe": "specific timeframe",
  "risk_note": "the one thing that invalidates this trade",
  "conviction": "HIGH or MEDIUM or LOW"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: userPrompt }]
    })

    // Extract final text block (after tool use)
    const textBlock = message.content.filter(b => b.type === 'text').pop()
    if (!textBlock) throw new Error('No text response from AI')

    const raw = textBlock.text.trim()
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
