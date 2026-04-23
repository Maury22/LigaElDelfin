import { supabase } from '@/lib/supabase'
import PublicLayout from '@/components/layouts/PublicLayout'
import MatchCard from '@/components/features/matches/MatchCard'
import TournamentTabs from '@/components/features/standings/TournamentTabs'

export const revalidate = 60

export default async function FixturePage({
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

  const query = supabase
    .from('matches')
    .select(`*, home_team:teams!matches_home_team_id_fkey(id, name, logo_url), away_team:teams!matches_away_team_id_fkey(id, name, logo_url)`)
    .order('date', { ascending: true })

  if (selectedId) query.eq('tournament_id', selectedId)

  const { data: matches } = await query

  const upcoming = (matches ?? []).filter((m: any) => m.status === 'scheduled')
  const finished = (matches ?? []).filter((m: any) => m.status === 'finished').reverse()

  return (
    <PublicLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fixture</h1>

      {activeTournaments.length > 1 && (
        <TournamentTabs tournaments={activeTournaments} selectedId={selectedId} baseHref="/fixture" />
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Próximos partidos
          </h2>
          <div className="flex flex-col gap-3">
            {upcoming.map((match: any) => <MatchCard key={match.id} match={match} />)}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Resultados
          </h2>
          <div className="flex flex-col gap-3">
            {finished.map((match: any) => <MatchCard key={match.id} match={match} />)}
          </div>
        </section>
      )}

      {(matches ?? []).length === 0 && (
        <p className="text-gray-400 text-sm">Sin partidos en este torneo.</p>
      )}
    </PublicLayout>
  )
}
