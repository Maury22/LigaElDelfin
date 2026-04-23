import { createClient } from '@supabase/supabase-js'
import AdminLayout from '@/components/layouts/AdminLayout'
import AddIncidentForm from '@/components/features/matches/AddIncidentForm'
import EditResultForm from '@/components/features/matches/EditResultForm'
import MatchTournamentSelect from '@/components/features/matches/MatchTournamentSelect'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteIncident } from '@/app/admin/actions'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const ICONS: Record<string, string> = {
  goal: '⚽',
  own_goal: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
}

export default async function AdminMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = getAdminClient()

  const [{ data: match }, { data: incidents }] = await Promise.all([
    supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name),
        away_team:teams!matches_away_team_id_fkey(id, name)
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('incidents')
      .select('id, type, player:players(name, team_id)')
      .eq('match_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!match) notFound()

  const homeTeam = match.home_team
  const awayTeam = match.away_team
  const isFinished = match.status === 'finished'

  const [{ data: playersRaw }, { data: tournaments }] = await Promise.all([
    supabase
      .from('players')
      .select('id, name, team_id, is_suspended')
      .in('team_id', [homeTeam.id, awayTeam.id])
      .order('name'),
    supabase.from('tournaments').select('id, name').eq('is_active', true).order('name'),
  ])

  const players = playersRaw ?? []
  const homePlayers = players.filter((p) => p.team_id === homeTeam.id)
  const awayPlayers = players.filter((p) => p.team_id === awayTeam.id)

  const normalizeIncident = (i: any) => ({
    ...i,
    player: Array.isArray(i.player) ? i.player[0] : i.player,
  })

  const allIncidents = (incidents ?? []).map(normalizeIncident)
  const homeIncidents = allIncidents.filter((i) => i.player?.team_id === homeTeam.id)
  const awayIncidents = allIncidents.filter((i) => i.player?.team_id === awayTeam.id)

  return (
    <AdminLayout>
      <Link
        href="/admin/partidos"
        className="text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6 inline-block"
      >
        ← Volver a partidos
      </Link>

      {/* Encabezado del partido */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-gray-900 text-sm flex-1 text-center">
            {homeTeam.name}
          </span>
          <div className="shrink-0 text-center">
            {isFinished ? (
              <span className="text-2xl font-bold text-gray-900">
                {match.score_home} — {match.score_away}
              </span>
            ) : (
              <span className="text-lg text-gray-400">vs</span>
            )}
            <p className={`text-xs mt-1 px-2 py-0.5 rounded-full font-medium inline-block ${
              isFinished ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-500'
            }`}>
              {isFinished ? 'Final' : 'Programado'}
            </p>
          </div>
          <span className="font-semibold text-gray-900 text-sm flex-1 text-center">
            {awayTeam.name}
          </span>
        </div>
        <MatchTournamentSelect
          matchId={id}
          currentTournamentId={match.tournament_id ?? null}
          tournaments={tournaments ?? []}
        />
      </div>

      {/* Editar resultado (solo partidos finalizados) */}
      {isFinished && (
        <EditResultForm
          matchId={id}
          scoreHome={match.score_home}
          scoreAway={match.score_away}
        />
      )}

      {/* Incidencias */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <IncidentColumn title={homeTeam.name} items={homeIncidents} />
        <IncidentColumn title={awayTeam.name} items={awayIncidents} />
      </div>

      {/* Formulario para agregar */}
      {isFinished ? (
        <AddIncidentForm
          matchId={id}
          homePlayers={homePlayers}
          awayPlayers={awayPlayers}
          homeTeamName={homeTeam.name}
          awayTeamName={awayTeam.name}
        />
      ) : (
        <p className="text-sm text-gray-400 text-center mt-6">
          Cerrá el partido antes de cargar incidencias.
        </p>
      )}
    </AdminLayout>
  )
}

function IncidentColumn({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Sin incidencias</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((inc) => {
            const deleteAction = deleteIncident.bind(null, inc.id)
            return (
              <li key={inc.id} className="flex items-center gap-2 text-sm text-gray-700 group">
                <span>{ICONS[inc.type]}</span>
                <span className="font-medium flex-1 min-w-0 truncate">{inc.player?.name}</span>
                {inc.type === 'own_goal' && (
                  <span className="text-xs text-gray-400 shrink-0">(ec)</span>
                )}
                <form action={deleteAction as unknown as (formData: FormData) => Promise<void>}>
                  <button
                    type="submit"
                    title="Borrar incidencia"
                    className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
