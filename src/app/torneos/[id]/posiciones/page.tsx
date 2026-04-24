import { supabase } from '@/lib/supabase'
import StandingsTable from '@/components/features/standings/StandingsTable'

export const revalidate = 60

export default async function PosicionesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [{ data: teams }, { data: matches }] = await Promise.all([
    supabase.from('teams').select('*').eq('tournament_id', id).order('points', { ascending: false }),
    supabase.from('matches').select('id, home_team_id, away_team_id, score_home, score_away, date')
      .eq('tournament_id', id).eq('status', 'finished').order('date', { ascending: false }),
  ])

  const formMap: Record<string, ('V' | 'E' | 'D')[]> = {}
  for (const m of (matches ?? [])) {
    const add = (teamId: string, result: 'V' | 'E' | 'D') => {
      if (!formMap[teamId]) formMap[teamId] = []
      if (formMap[teamId].length < 5) formMap[teamId].push(result)
    }
    if (m.score_home > m.score_away) { add(m.home_team_id, 'V'); add(m.away_team_id, 'D') }
    else if (m.score_home < m.score_away) { add(m.home_team_id, 'D'); add(m.away_team_id, 'V') }
    else { add(m.home_team_id, 'E'); add(m.away_team_id, 'E') }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Tabla de Posiciones</h2>
      <StandingsTable teams={teams ?? []} formMap={formMap} />
    </div>
  )
}
