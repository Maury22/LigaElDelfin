import { createClient } from '@supabase/supabase-js'
import AdminLayout from '@/components/layouts/AdminLayout'
import AdminNoticiasClient from './AdminNoticiasClient'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function AdminNoticiasPage() {
  const supabase = getAdminClient()

  const [{ data: news }, { data: tournaments }] = await Promise.all([
    supabase.from('news').select('id, title, excerpt, image_url, published_at, tournament_id').order('published_at', { ascending: false }),
    supabase.from('tournaments').select('id, name').eq('is_active', true).order('name'),
  ])

  return (
    <AdminLayout>
      <AdminNoticiasClient news={news ?? []} tournaments={tournaments ?? []} />
    </AdminLayout>
  )
}
