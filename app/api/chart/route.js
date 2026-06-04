export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const ticker = searchParams.get('ticker')
  if (!ticker) return Response.json({ error: 'No ticker' }, { status: 400 })

  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' } }
    )
    if (!res.ok) throw new Error(`Yahoo error: ${res.status}`)
    const data = await res.json()
    const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || []
    return Response.json({ prices: closes.filter(Boolean) })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
