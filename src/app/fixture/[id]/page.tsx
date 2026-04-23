import { supabase } from '@/lib/supabase'
import PublicLayout from '@/components/layouts/PublicLayout'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

interface Incident {
  id: string
  type: 'goal' | 'own_goal' | 'yellow_card' | 'red_card'
  player: { name: string; team_id: string }
}

const ICONS: Record<string, string> = {
  goal:        '⚽',
  own_goal:    '⚽',
  yellow_card: '🟨',
  red_card:    '🟥',
}

const LABELS: Record<string, string> = {
  goal:        'Gol',
  own_goal:    'Gol en contra',
  yellow_card: 'Amarilla',
  red_card:    'Roja',
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [{ data: match }, { data: incidents }] = await Promise.all([
    supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
        away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
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

  // Separar incidencias por equipo (player puede venir como objeto o array según Supabase)
  const normalizeIncident = (i: any): Incident => ({
    ...i,
    player: Array.isArray(i.player) ? i.player[0] : i.player,
  })

  const allIncidents = (incidents ?? []).map(normalizeIncident)
  const homeIncidents = allIncidents.filter((i) => i.player?.team_id === homeTeam.id)
  const awayIncidents = allIncidents.filter((i) => i.player?.team_id === awayTeam.id)

  function TeamLogo({ team }: { team: { name: string; logo_url: string | null } }) {
    if (team.logo_url) {
      return <img src={team.logo_url} alt={team.name} className="w-12 h-12 rounded-full object-cover" />
    }
    return (
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
        {team.name.charAt(0)}
      </div>
    )
  }

  function IncidentList({ items }: { items: Incident[] }) {
    if (items.length === 0) return <p className="text-xs text-gray-400 italic">Sin incidencias</p>
    return (
      <ul className="flex flex-col gap-1.5">
        {items.map((inc) => (
          <li key={inc.id} className="flex items-center gap-2 text-sm text-gray-700">
            <span>{ICONS[inc.type]}</span>
            <span className="font-medium">{inc.player?.name}</span>
            {inc.type === 'own_goal' && (
              <span className="text-xs text-gray-400">(en contra)</span>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <PublicLayout>
      <Link href="/fixture" className="text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6 inline-block">
        ← Volver al fixture
      </Link>

      {/* Header del partido */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between gap-4">

          {/* Local */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo team={homeTeam} />
            <span className="font-semibold text-gray-900 text-sm text-center">{homeTeam.name}</span>
          </div>

          {/* Marcador */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            {isFinished ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-gray-900">{match.score_home}</span>
                <span className="text-2xl text-gray-300">—</span>
                <span className="text-4xl font-bold text-gray-900">{match.score_away}</span>
              </div>
            ) : (
              <span className="text-2xl font-light text-gray-400">vs</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
              isFinished
                ? 'bg-gray-100 text-gray-500'
                : 'bg-blue-50 text-blue-500'
            }`}>
              {isFinished ? 'Final' : 'Programado'}
            </span>
          </div>

          {/* Visitante */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo team={awayTeam} />
            <span className="font-semibold text-gray-900 text-sm text-center">{awayTeam.name}</span>
          </div>

        </div>
      </div>

      {/* Incidencias */}
      {isFinished && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {homeTeam.name}
            </h3>
            <IncidentList items={homeIncidents} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {awayTeam.name}
            </h3>
            <IncidentList items={awayIncidents} />
          </div>
        </div>
      )}

      {!isFinished && (
        <p className="text-sm text-gray-400 text-center">
          Las incidencias estarán disponibles cuando el partido finalice.
        </p>
      )}
    </PublicLayout>
  )
}
