import Link from 'next/link'
import { Tournament } from '@/types/database.types'

interface Props {
  tournaments: Tournament[]
  selectedId: string | null
  baseHref?: string
}

export default function TournamentTabs({ tournaments, selectedId, baseHref = '' }: Props) {
  return (
    <div className="flex gap-2 flex-wrap mb-5">
      {tournaments.map((t) => (
        <Link
          key={t.id}
          href={`${baseHref}?torneo=${t.id}`}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedId === t.id
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          {t.name}
        </Link>
      ))}
    </div>
  )
}
