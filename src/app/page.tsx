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

  const [{ data: teams }, { data: matches }] = await Promise.all([
    selectedId
      ? supabase.from('teams').select('*').eq('tournament_id', selectedId).order('points', { ascending: false })
      : { data: [] },
    selectedId
      ? supabase.from('matches').select('id, home_team_id, away_team_id, score_home, score_away, date').eq('tournament_id', selectedId).eq('status', 'finished').order('date', { ascending: false })
      : { data: [] },
  ])

  // Últimos 5 resultados por equipo
  const formMap: Record<string, ('V' | 'E' | 'D')[]> = {}
  for (const m of (matches ?? [])) {
    const addResult = (teamId: string, result: 'V' | 'E' | 'D') => {
      if (!formMap[teamId]) formMap[teamId] = []
      if (formMap[teamId].length < 5) formMap[teamId].push(result)
    }
    if (m.score_home > m.score_away) {
      addResult(m.home_team_id, 'V'); addResult(m.away_team_id, 'D')
    } else if (m.score_home < m.score_away) {
      addResult(m.home_team_id, 'D'); addResult(m.away_team_id, 'V')
    } else {
      addResult(m.home_team_id, 'E'); addResult(m.away_team_id, 'E')
    }
  }

  return (
    <PublicLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tabla de Posiciones</h1>

      {activeTournaments.length > 1 && (
        <TournamentTabs tournaments={activeTournaments} selectedId={selectedId} />
      )}

      {activeTournaments.length === 0 ? (
        <p className="text-gray-400 text-sm">Sin torneos activos.</p>
      ) : (
        <StandingsTable teams={teams ?? []} formMap={formMap} />
      )}
    </PublicLayout>
  )
}
