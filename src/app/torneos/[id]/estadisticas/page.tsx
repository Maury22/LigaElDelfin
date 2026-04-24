import { supabase } from '@/lib/supabase'
import TopScorers from '@/components/features/players/TopScorers'
import BestDefense from '@/components/features/teams/BestDefense'

export const revalidate = 60

export default async function EstadisticasTorneoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [{ data: players }, { data: teams }] = await Promise.all([
    supabase.from('players')
      .select('*, team:teams!inner(name, tournament_id)')
      .eq('teams.tournament_id', id)
      .order('goals_scored', { ascending: false }) as any,
    supabase.from('teams').select('*').eq('tournament_id', id).order('goals_against', { ascending: true }),
  ])

  const allPlayers = (players ?? []) as any[]
  const suspended = allPlayers.filter((p: any) => p.is_suspended)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Goleadores</h3>
        <TopScorers players={allPlayers} />
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Valla Menos Vencida</h3>
        <BestDefense teams={teams ?? []} />
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Suspendidos</h3>
        {suspended.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin jugadores suspendidos.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {suspended.map((player: any) => (
              <div key={player.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{player.name}</p>
                  <p className="text-xs text-gray-400">{player.team?.name}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-full font-medium">Suspendido</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
