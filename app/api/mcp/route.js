/**
 * app/api/mcp/route.js
 *
 * Remote MCP server for Claude custom connectors.
 * Implements JSON-RPC 2.0 over HTTP (MCP protocol spec 2024-11-05).
 *
 * Add to Claude at: https://claude.ai → Settings → Connectors
 * Remote MCP server URL: https://jcedge-ai.vercel.app/api/mcp
 */

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const SCANNER_URL = 'https://jcedge-ai.vercel.app/api/scanner'

const TOOLS = [
  {
    name: 'get_top_stocks',
    description:
      'Fetch the top-scored stocks from the JCedge AI scanner. ' +
      'Returns ticker, name, sector, price, score, RSI, archetype, direction, R/R ratio, and key fundamentals.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'How many stocks to return. Allowed values: 3, 5, or 10. Defaults to 5.',
          default: 5,
        },
      },
    },
  },
]

async function callGetTopStocks(args) {
  const raw = Number(args?.limit ?? 5)
  const limit = [3, 5, 10].includes(raw) ? raw : 5

  const res = await fetch(`${SCANNER_URL}?limit=${limit}`, { cache: 'no-store' })
  const data = await res.json()

  if (data.error) throw new Error(data.error)

  const lines = data.stocks.map(
    (s, i) =>
      `${i + 1}. ${s.ticker} (${s.name}) | Score: ${s.score} | $${s.price} | ` +
      `RSI: ${s.rsi} | ${s.archetype} | ${s.direction.toUpperCase()} | ` +
      `Sector: ${s.sector} | RR: ${s.rr} | PE: ${s.pe ?? 'N/A'} | ` +
      `Rev Growth: ${s.rev_growth ?? 'N/A'}% | Margin: ${s.margin ?? 'N/A'}%`
  )

  return [
    `JCedge Top ${limit} Stocks — ${new Date(data.updatedAt).toLocaleString()}`,
    '',
    ...lines,
  ].join('\n')
}

function ok(id, result) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, result }, { headers: CORS })
}

function err(id, code, message) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }, { headers: CORS })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return err(null, -32700, 'Parse error')
  }

  const { method, id, params } = body

  // Notifications (no id) require no response
  if (id === undefined || id === null) {
    return new Response(null, { status: 202, headers: CORS })
  }

  if (method === 'initialize') {
    return ok(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'jcedge-scanner', version: '1.0.0' },
    })
  }

  if (method === 'tools/list') {
    return ok(id, { tools: TOOLS })
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params ?? {}

    if (name === 'get_top_stocks') {
      try {
        const text = await callGetTopStocks(args)
        return ok(id, { content: [{ type: 'text', text }] })
      } catch (e) {
        return ok(id, { content: [{ type: 'text', text: `Scanner error: ${e.message}` }], isError: true })
      }
    }

    return err(id, -32601, `Unknown tool: ${name}`)
  }

  // Other methods — return empty result for forward-compatibility
  return ok(id, {})
}
