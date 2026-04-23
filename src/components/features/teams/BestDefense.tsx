import { Team } from '@/types/database.types'

interface Props {
  teams: Team[]
}

export default function BestDefense({ teams }: Props) {
  const sorted = [...teams]
    .filter((t) => t.matches_played > 0)
    .sort((a, b) => {
      if (a.goals_against !== b.goals_against) return a.goals_against - b.goals_against
      return b.matches_played - a.matches_played
    })

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
            <th className="text-left px-4 py-3 w-8">#</th>
            <th className="text-left px-4 py-3">Equipo</th>
            <th className="text-center px-4 py-3">PJ</th>
            <th className="text-center px-4 py-3">GC</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, index) => (
            <tr
              key={team.id}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-gray-400 text-xs">{index + 1}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{team.name}</td>
              <td className="text-center px-4 py-3 text-gray-500">{team.matches_played}</td>
              <td className="text-center px-4 py-3 font-bold text-gray-900">{team.goals_against}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-10 text-gray-400 text-sm">
                Sin partidos jugados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
