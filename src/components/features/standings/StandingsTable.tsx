'use client'

import Link from 'next/link'
import { Team } from '@/types/database.types'

type FormResult = 'V' | 'E' | 'D'

interface Props {
  teams: Team[]
  formMap?: Record<string, FormResult[]>
}

const formColors: Record<FormResult, string> = {
  V: 'bg-green-500 text-white',
  E: 'bg-gray-400 text-white',
  D: 'bg-red-500 text-white',
}

export default function StandingsTable({ teams, formMap = {} }: Props) {
  const sorted = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goals_for - a.goals_against
    const gdB = b.goals_for - b.goals_against
    if (gdB !== gdA) return gdB - gdA
    return b.goals_for - a.goals_for
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-4 py-3 w-8">#</th>
              <th className="text-left px-4 py-3">Equipo</th>
              <th className="text-center px-2 py-3">PJ</th>
              <th className="text-center px-2 py-3">G</th>
              <th className="text-center px-2 py-3">E</th>
              <th className="text-center px-2 py-3">P</th>
              <th className="text-center px-2 py-3">GF</th>
              <th className="text-center px-2 py-3">GC</th>
              <th className="text-center px-2 py-3">DG</th>
              <th className="text-center px-3 py-3 font-bold text-gray-700">Pts</th>
              <th className="text-center px-3 py-3 hidden sm:table-cell">Últimos 5</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, index) => (
              <tr
                key={team.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-400 text-xs">{index + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/equipos/${team.id}`} className="flex items-center gap-2 hover:underline">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt={team.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold">
                        {team.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{team.name}</span>
                  </Link>
                </td>
                <td className="text-center px-2 py-3 text-gray-600">{team.matches_played}</td>
                <td className="text-center px-2 py-3 text-gray-600">{team.wins}</td>
                <td className="text-center px-2 py-3 text-gray-600">{team.draws}</td>
                <td className="text-center px-2 py-3 text-gray-600">{team.losses}</td>
                <td className="text-center px-2 py-3 text-gray-600">{team.goals_for}</td>
                <td className="text-center px-2 py-3 text-gray-600">{team.goals_against}</td>
                <td className="text-center px-2 py-3 text-gray-600">
                  {team.goals_for - team.goals_against > 0 ? '+' : ''}
                  {team.goals_for - team.goals_against}
                </td>
                <td className="text-center px-3 py-3 font-bold text-gray-900">{team.points}</td>
                <td className="text-center px-3 py-3 hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    {(formMap[team.id] ?? []).map((r, i) => (
                      <span key={i} className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${formColors[r]}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-10 text-gray-400 text-sm">
                  Sin equipos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
