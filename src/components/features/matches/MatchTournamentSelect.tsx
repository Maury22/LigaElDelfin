'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateMatchTournament } from '@/app/admin/actions'

interface Tournament {
  id: string
  name: string
}

interface Props {
  matchId: string
  currentTournamentId: string | null
  tournaments: Tournament[]
}

export default function MatchTournamentSelect({ matchId, currentTournamentId, tournaments }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(currentTournamentId ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = e.target.value
    setValue(newVal)
    if (!newVal) return
    setSaving(true)
    await updateMatchTournament(matchId, newVal)
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 mt-3 justify-center">
      <select
        value={value}
        onChange={handleChange}
        disabled={saving}
        className={`text-xs border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 ${
          !value ? 'border-orange-300 text-orange-600' : 'border-gray-200 text-gray-500'
        }`}
      >
        <option value="">Sin torneo asignado</option>
        {tournaments.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-gray-400">Guardando...</span>}
      {saved && <span className="text-xs text-green-600">Guardado</span>}
    </div>
  )
}
