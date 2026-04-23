import { supabase } from '@/lib/supabase'
import PublicLayout from '@/components/layouts/PublicLayout'
import StandingsTable from '@/components/features/standings/StandingsTable'
import TournamentTabs from '@/components/features/standings/TournamentTabs'

export const revalidate = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ torneo?: string }>
}) {
  const { torneo } = await searchParams

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const activeTournaments = tournaments ?? []
  const selectedId = torneo ?? activeTournaments[0]?.id ?? null

  const { data: teams } = selectedId
    ? await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', selectedId)
        .order('points', { ascending: false })
    : { data: [] }

  return (
    <PublicLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tabla de Posiciones</h1>

      {activeTournaments.length > 1 && (
        <TournamentTabs tournaments={activeTournaments} selectedId={selectedId} />
      )}

      {activeTournaments.length === 0 ? (
        <p className="text-gray-400 text-sm">Sin torneos activos.</p>
      ) : (
        <StandingsTable teams={teams ?? []} />
      )}
    </PublicLayout>
  )
}
