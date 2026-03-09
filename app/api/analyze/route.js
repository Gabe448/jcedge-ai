import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const stock = await req.json()

    const systemPrompt = `You are a senior buy-side equity analyst and trader. Your edge: find fundamentally strong stocks temporarily mispriced by a RESOLVABLE overhang, at a key structural level, with a macro tailwind.

Real trades this strategy produced:
- COIN: Platform expansion missed by market. First green candle at $155 key level. +1100% on calls.
- HIMS: 100% earnings surprise, sold off on legal overhang. Entered at $13.97. +1400% on calls.
- PLTR: Triangle compression + Iran war tailwind. 6.4R, +850%.
- PYPL: 7x PE anomaly. Double bottom. LEAPs for position trade.

CRITICAL REASONING STEP — stress-test the overhang before building the plan:
1. Is the selloff rational given actual fundamentals? Run the numbers.
2. Can the stated reason actually impair the business long-term?
3. Example: "Claude Code caused cybersecurity crash" — does an AI coding tool eliminate enterprise security? No. Cybersecurity spend is non-discretionary. AI makes infrastructure MORE critical to protect. Selloff = narrative overreaction = mispricing.
4. Temporary/sentiment overhang + intact fundamentals = HIGH conviction.

Respond ONLY with a valid JSON object, no markdown.`

    const userPrompt = `Analyze this stock and build a trade plan.

STOCK: ${stock.ticker} (${stock.name}) | Sector: ${stock.sector} | Archetype: ${stock.archetype}

FUNDAMENTALS:
- EPS beat: ${stock.eps_beat}% | Revenue growth: ${stock.rev_growth}% | Net margin: ${stock.margin}%
- ROE: ${stock.roe}% | P/E: ${stock.pe}x | Debt/Equity: ${stock.debt_eq}

TECHNICAL:
- RSI: ${stock.rsi} | Distance from 52w high: ${stock.from52h}% | Volume ratio: ${stock.vol_ratio}x
- Pattern: ${stock.pattern}

CONTEXT:
- Overhang: ${stock.overhang}
- Macro tailwind: ${stock.macro}
- Sentiment: ${stock.sentiment}/100

Respond ONLY with this JSON:
{
  "overhang_rational": false,
  "overhang_reasoning": "2-3 sentences stress-testing the selloff",
  "thesis": "2-3 sentences connecting fundamentals + overhang resolution + macro",
  "overhang_resolution": "why and when this resolves",
  "entry_logic": "exact chart trigger",
  "entry_price_note": "where relative to pattern",
  "stop_logic": "exactly where and why",
  "tp1": "first trim target",
  "tp2": "second trim",
  "tp3": "runner target",
  "instrument": "Calls or LEAPs or Stock",
  "timeframe": "e.g. 2-6 weeks",
  "risk_note": "the one thing that invalidates this",
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

    return Response.json(JSON.parse(raw))
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
