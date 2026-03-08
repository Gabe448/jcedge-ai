// Admin username — change this to your Supabase registered username
export const ADMIN_USERNAME = 'JC'

export function isAdmin(profile) {
  return profile?.username === ADMIN_USERNAME || profile?.role === 'admin'
}
