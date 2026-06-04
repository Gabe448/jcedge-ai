import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  try {
    const { user_id, ticker, entry, stop, tp1, tp2, tp3, plan_data } = await req.json()
    const { data: existing } = await supabase
      .from('followed_plans')
      .select('id')
      .eq('user_id', user_id)
      .eq('ticker', ticker)
      .single()

    if (existing) {
      await supabase.from('followed_plans').delete().eq('id', existing.id)
      return Response.json({ following: false })
    } else {
      await supabase.from('followed_plans').insert({
        user_id, ticker, entry, stop, tp1, tp2, tp3,
        plan_data,
        notified_levels: [],
        created_at: new Date().toISOString()
      })
      return Response.json({ following: true })
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  const { data } = await supabase
    .from('followed_plans')
    .select('ticker')
    .eq('user_id', user_id)
  return Response.json({ following: (data || []).map(r => r.ticker) })
}
