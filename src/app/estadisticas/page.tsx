import { supabase } from '@/lib/supabase'
import PublicLayout from '@/components/layouts/PublicLayout'
import TopScorers from '@/components/features/players/TopScorers'
import BestDefense from '@/components/features/teams/BestDefense'

export const revalidate = 60

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ torneo?: string }>
}) {
  const { torneo } = await searchParams

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  const activeTournaments = tournaments ?? []
  const selectedId = torneo ?? activeTournaments[0]?.id ?? null

  const [{ data: players }, { data: teams }] = await Promise.all([
    selectedId
      ? supabase
          .from('players')
          .select('*, team:teams!inner(name, tournament_id)')
          .eq('teams.tournament_id', selectedId)
          .order('goals_scored', { ascending: false })
      : supabase
          .from('players')
          .select('*, team:teams(name)')
          .order('goals_scored', { ascending: false }),
    selectedId
      ? supabase
          .from('teams')
          .select('*')
          .eq('tournament_id', selectedId)
          .order('goals_against', { ascending: true })
      : supabase
          .from('teams')
          .select('*')
          .order('goals_against', { ascending: true }),
  ])

  const allPlayers = (players ?? []) as any[]
  const allTeams = teams ?? []
  const suspended = allPlayers.filter((p) => p.is_suspended)

  return (
    <PublicLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Estadísticas</h1>

      {activeTournaments.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {activeTournaments.map((t) => (
            <a
              key={t.id}
              href={`/estadisticas?torneo=${t.id}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                t.id === selectedId
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {t.name}
            </a>
          ))}
        </div>
      )}

      {activeTournaments.length > 0 && <div className="mb-6" />}

      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Goleadores
        </h2>
        <TopScorers players={allPlayers} />
      </section>

      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Valla Menos Vencida
        </h2>
        <BestDefense teams={allTeams} />
      </section>

      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Suspendidos
        </h2>
        {suspended.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin jugadores suspendidos.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {suspended.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{player.name}</p>
                  <p className="text-xs text-gray-400">{player.team?.name}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-full font-medium">
                  Suspendido
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  )
}
