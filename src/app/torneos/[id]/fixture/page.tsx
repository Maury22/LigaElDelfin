import { supabase } from '@/lib/supabase'
import MatchCard from '@/components/features/matches/MatchCard'

export const revalidate = 60

export default async function FixtureTorneoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(id, name, logo_url), away_team:teams!matches_away_team_id_fkey(id, name, logo_url)')
    .eq('tournament_id', id)
    .order('date', { ascending: true })

  const upcoming = (matches ?? []).filter((m: any) => m.status === 'scheduled')
  const finished = (matches ?? []).filter((m: any) => m.status === 'finished').reverse()

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Fixture</h2>

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Próximos partidos</h3>
          <div className="flex flex-col gap-3">
            {upcoming.map((m: any) => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Resultados</h3>
          <div className="flex flex-col gap-3">
            {finished.map((m: any) => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {(matches ?? []).length === 0 && (
        <p className="text-gray-400 text-sm">Sin partidos registrados.</p>
      )}
    </div>
  )
}
