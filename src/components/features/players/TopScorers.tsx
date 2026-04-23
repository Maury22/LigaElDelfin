import { Player, Team } from '@/types/database.types'

interface Props {
  players: (Player & { team: Pick<Team, 'name'> })[]
}

export default function TopScorers({ players }: Props) {
  const sorted = [...players]
    .filter((p) => p.goals_scored > 0)
    .sort((a, b) => b.goals_scored - a.goals_scored)
    .slice(0, 10)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
            <th className="text-left px-4 py-3 w-8">#</th>
            <th className="text-left px-4 py-3">Jugador</th>
            <th className="text-left px-4 py-3 hidden sm:table-cell">Equipo</th>
            <th className="text-center px-4 py-3">Goles</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((player, index) => (
            <tr key={player.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400 text-xs">{index + 1}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{player.name}</div>
                <div className="text-xs text-gray-400 sm:hidden">{player.team.name}</div>
              </td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{player.team.name}</td>
              <td className="text-center px-4 py-3 font-bold text-gray-900">{player.goals_scored}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-10 text-gray-400 text-sm">
                Sin goles registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
