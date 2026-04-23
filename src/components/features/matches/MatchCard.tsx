import Link from 'next/link'
import { Match, Team } from '@/types/database.types'

interface Props {
  match: Match & {
    home_team: Pick<Team, 'id' | 'name' | 'logo_url'>
    away_team: Pick<Team, 'id' | 'name' | 'logo_url'>
  }
}

function TeamLogo({ team }: { team: Pick<Team, 'name' | 'logo_url'> }) {
  if (team.logo_url) {
    return <img src={team.logo_url} alt={team.name} className="w-8 h-8 rounded-full object-cover" />
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
      {team.name.charAt(0)}
    </div>
  )
}

export default function MatchCard({ match }: Props) {
  const isFinished = match.status === 'finished'
  const date = new Date(match.date)

  const dateStr = date.toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const timeStr = date.toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <Link
      href={`/fixture/${match.id}`}
      className="block bg-white rounded-xl border border-gray-200 px-4 py-4 hover:border-gray-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
        <span className="capitalize">{dateStr}</span>
        <span>·</span>
        <span>{timeStr}</span>
        {isFinished ? (
          <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
            Final
          </span>
        ) : (
          <span className="ml-auto px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-xs">
            Programado
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <TeamLogo team={match.home_team} />
          <span className="font-medium text-gray-900 text-sm truncate">{match.home_team.name}</span>
        </div>

        {isFinished ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-gray-900 w-6 text-center">{match.score_home}</span>
            <span className="text-gray-300">—</span>
            <span className="text-xl font-bold text-gray-900 w-6 text-center">{match.score_away}</span>
          </div>
        ) : (
          <div className="shrink-0 text-sm text-gray-300 font-medium">vs</div>
        )}

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-medium text-gray-900 text-sm truncate text-right">{match.away_team.name}</span>
          <TeamLogo team={match.away_team} />
        </div>
      </div>
    </Link>
  )
}
