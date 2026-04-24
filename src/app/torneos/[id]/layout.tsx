import { supabase } from '@/lib/supabase'
import TournamentLayout from '@/components/layouts/TournamentLayout'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!tournament) notFound()

  return <TournamentLayout tournament={tournament}>{children}</TournamentLayout>
}
