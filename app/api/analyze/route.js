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

async function getNewsHeadlines(ticker) {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=6&quotesCount=0`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, signal: AbortSignal.timeout(4000) }
    )
    if (!res.ok) return ''
    const data = await res.json()
    const news = data?.news || []
    if (!news.length) return ''
    return news.slice(0, 6).map(n => `- ${String(n.title || '').replace(/`/g, "'")} `).join('\n')
  } catch { return '' }
}

export async function POST(req) {
  try {
    const stock = await req.json()

    // Check if user is following this stock — return locked plan
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

    // Fetch news headlines cheaply before calling Claude
    const headlines = await getNewsHeadlines(stock.ticker)

    const price  = stock.price
    const high52 = +(price / (1 + stock.from52h / 100)).toFixed(2)

    const systemPrompt = `You are a senior equity analyst and trader. You identify HIGH CONVICTION setups in both directions — long and short.

NEWS ASSESSMENT — read the provided headlines carefully before building any plan:
- Fraud, accounting restatement, SEC/DOJ investigation → HIGH risk, avoid longs or strongly caveat
- CEO departure, earnings miss, guidance cut → MEDIUM risk, assess severity
- Macro/sector rotation, rate fears, market selloff → LOW risk, often creates opportunity
- Competition threats, margin compression, structural decline → HIGH risk, avoid longs

Only after assessing news context determine direction and conviction level.

Respond ONLY with valid JSON, no markdown.`

    const userPrompt = `Build a complete trade plan for ${stock.ticker}.

STOCK: ${stock.ticker} (${stock.name}) | Sector: ${stock.sector}

FUNDAMENTALS:
- Revenue growth: ${stock.rev_growth}% | Net margin: ${stock.margin}% | ROE: ${stock.roe}%
- P/E: ${stock.pe}x | Debt/Equity: ${stock.debt_eq}

PRICE ACTION:
- Current price: $${price} | 52w high: $${high52} | Distance from high: ${stock.from52h}%
- RSI: ${stock.rsi} | Volume ratio: ${stock.vol_ratio}x
- Pattern: ${stock.pattern}
${stock.ma20Pct != null ? `- MA20: ${stock.ma20Pct > 0 ? '+' : ''}${stock.ma20Pct}% | MA50: ${stock.ma50Pct > 0 ? '+' : ''}${stock.ma50Pct || 0}%` : ''}
${[stock.goldenCross && 'Golden cross', stock.deathCross && 'Death cross', stock.isBreakingOut && 'Breaking out on volume', stock.isBreakingDown && 'Breaking down on volume', stock.bullishDiv && 'Bullish RSI divergence'].filter(Boolean).map(x => '- ' + x).join('\n')}

RECENT NEWS HEADLINES:
${headlines || '- No recent headlines found'}

TASK:
1. Assess news risk: LOW / MEDIUM / HIGH based on headlines
2. Determine direction: LONG or SHORT
3. Find real entry (support for longs, resistance for shorts — not just current price)
4. Set stop 4-7% from entry at structural invalidation
5. TPs: TP1 +8-12%, TP2 +18-25%, TP3 +35-65% from entry
6. If HIGH news risk on a long: set LOW conviction and wide stop, flag clearly in risk_note

Return ONLY this JSON:
{
  "direction": "LONG or SHORT",
  "news_risk": "LOW or MEDIUM or HIGH",
  "news_summary": "1 sentence on what news is driving price action",
  "overhang_rational": false,
  "overhang_reasoning": "2-3 sentences on why stock is mispriced or extended",
  "thesis": "2-3 sentences: direction + catalyst + why now",
  "overhang_resolution": "what resolves the overhang or triggers the decline",
  "entry_price": 123.45,
  "entry_logic": "why this price is the right entry",
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

    const rawText = message.content[0].text.trim()
    // Extract JSON even if Claude adds preamble text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const raw = jsonMatch[0]
    const plan = JSON.parse(raw)
    // Validate required fields — if incomplete, still return what we have
    if (!plan.entry_price) plan.entry_price = stock.price
    if (!plan.stop_price) plan.stop_price = +(stock.price * 0.94).toFixed(2)
    if (!plan.tp1_price) plan.tp1_price = +(stock.price * 1.10).toFixed(2)
    if (!plan.tp2_price) plan.tp2_price = +(stock.price * 1.20).toFixed(2)
    if (!plan.tp3_price) plan.tp3_price = +(stock.price * 1.35).toFixed(2)
    if (!plan.thesis) plan.thesis = 'Analysis unavailable — please retry.'
    if (!plan.direction) plan.direction = 'LONG'
    if (!plan.conviction) plan.conviction = 'LOW'

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
