'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Posiciones', key: 'posiciones' },
  { label: 'Fixture', key: 'fixture' },
  { label: 'Estadísticas', key: 'estadisticas' },
]

export default function TournamentNav({ tournamentId }: { tournamentId: string }) {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex gap-1">
        {tabs.map((tab) => {
          const href = `/torneos/${tournamentId}/${tab.key}`
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={tab.key}
              href={href}
              className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                active
                  ? 'border-amber-500 text-[#0f2d4a]'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
