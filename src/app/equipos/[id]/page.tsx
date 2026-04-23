import { supabase } from '@/lib/supabase'
import PublicLayout from '@/components/layouts/PublicLayout'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [{ data: team }, { data: players }, { data: matches }] = await Promise.all([
    supabase.from('teams').select('*').eq('id', id).single(),
    supabase
      .from('players')
      .select('id, name, goals_scored, yellow_cards, red_cards, is_suspended')
      .eq('team_id', id)
      .order('name'),
    supabase
      .from('matches')
      .select(`
        id, date, status, score_home, score_away, home_team_id, away_team_id,
        home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
        away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
      `)
      .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
      .eq('status', 'finished')
      .order('date', { ascending: false })
      .limit(15),
  ])

  if (!team) notFound()

  const teamPlayers = players ?? []
  const teamMatches = matches ?? []

  function getResult(match: any): 'W' | 'D' | 'L' {
    const isHome = match.home_team_id === id
    const teamScore = isHome ? match.score_home : match.score_away
    const oppScore = isHome ? match.score_away : match.score_home
    if (teamScore > oppScore) return 'W'
    if (teamScore === oppScore) return 'D'
    return 'L'
  }

  const resultColors = {
    W: 'bg-green-100 text-green-700',
    D: 'bg-gray-100 text-gray-500',
    L: 'bg-red-100 text-red-600',
  }
  const resultLabels = { W: 'G', D: 'E', L: 'P' }

  return (
    <PublicLayout>
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6 inline-block">
        ← Posiciones
      </Link>

      {/* Header del equipo */}
      <div className="flex items-center gap-5 mb-8">
        {team.logo_url ? (
          <img src={team.logo_url} alt={team.name} className="w-20 h-20 rounded-full object-cover border border-gray-200" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
            {team.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>{team.matches_played} PJ</span>
            <span>·</span>
            <span>{team.wins}G {team.draws}E {team.losses}P</span>
            <span>·</span>
            <span className="font-semibold text-gray-700">{team.points} pts</span>
          </div>
        </div>
      </div>

      {/* Jugadores */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Plantel</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Jugador</th>
                <th className="text-center px-3 py-3">⚽</th>
                <th className="text-center px-3 py-3">🟨</th>
                <th className="text-center px-3 py-3">🟥</th>
              </tr>
            </thead>
            <tbody>
              {teamPlayers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                    Sin jugadores registrados
                  </td>
                </tr>
              ) : (
                teamPlayers.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.name}
                      {p.is_suspended && (
                        <span className="ml-2 text-xs text-red-500 font-normal">Suspendido</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-3 text-gray-600">{p.goals_scored || '—'}</td>
                    <td className="text-center px-3 py-3 text-gray-600">{p.yellow_cards || '—'}</td>
                    <td className="text-center px-3 py-3 text-gray-600">{p.red_cards || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historial de partidos */}
      {teamMatches.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Últimos partidos</h2>
          <div className="flex flex-col gap-2">
            {teamMatches.map((m: any) => {
              const isHome = m.home_team_id === id
              const opponent = isHome ? m.away_team : m.home_team
              const teamScore = isHome ? m.score_home : m.score_away
              const oppScore = isHome ? m.score_away : m.score_home
              const result = getResult(m)
              const date = new Date(m.date).toLocaleDateString('es-AR', {
                day: 'numeric', month: 'short',
              })
              return (
                <Link
                  key={m.id}
                  href={`/fixture/${m.id}`}
                  className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 hover:border-gray-300 transition-colors"
                >
                  <span className={`text-xs font-bold w-6 text-center rounded px-1 py-0.5 ${resultColors[result]}`}>
                    {resultLabels[result]}
                  </span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {opponent?.logo_url ? (
                      <img src={opponent.logo_url} alt={opponent.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                        {opponent?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-gray-700 truncate">{opponent?.name}</span>
                    <span className="text-xs text-gray-400 ml-auto shrink-0">{isHome ? 'vs' : 'en'}</span>
                  </div>
                  <span className="font-bold text-gray-900 text-sm shrink-0">{teamScore} — {oppScore}</span>
                  <span className="text-xs text-gray-400 shrink-0 w-14 text-right">{date}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </PublicLayout>
  )
}
