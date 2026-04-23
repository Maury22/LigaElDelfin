'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createIncident } from '@/app/admin/actions'

interface Player {
  id: string
  name: string
  team_id: string
  is_suspended: boolean
}

interface Props {
  matchId: string
  homePlayers: Player[]
  awayPlayers: Player[]
  homeTeamName: string
  awayTeamName: string
}

const INCIDENT_TYPES = [
  { value: 'goal', label: '⚽ Gol' },
  { value: 'own_goal', label: '⚽ Gol en contra' },
  { value: 'yellow_card', label: '🟨 Amarilla' },
  { value: 'red_card', label: '🟥 Roja' },
] as const

export default function AddIncidentForm({
  matchId,
  homePlayers,
  awayPlayers,
  homeTeamName,
  awayTeamName,
}: Props) {
  const router = useRouter()
  const [type, setType] = useState<string>('')
  const [playerId, setPlayerId] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type || !playerId) return
    setStatus('loading')
    const result = await createIncident({ match_id: matchId, player_id: playerId, type })
    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
    } else {
      setStatus('success')
      setType('')
      setPlayerId('')
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Agregar incidencia
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2">
          {INCIDENT_TYPES.map((t) => (
            <label
              key={t.value}
              className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer transition-colors text-sm font-medium ${
                type === t.value
                  ? 'border-gray-900 bg-gray-50 text-gray-900'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={t.value}
                checked={type === t.value}
                onChange={(e) => setType(e.target.value)}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>

        {/* Jugador */}
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Seleccioná un jugador</option>
          <optgroup label={homeTeamName}>
            {homePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.is_suspended ? ' ⚠ Suspendido' : ''}
              </option>
            ))}
          </optgroup>
          <optgroup label={awayTeamName}>
            {awayPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.is_suspended ? ' ⚠ Suspendido' : ''}
              </option>
            ))}
          </optgroup>
        </select>

        <button
          type="submit"
          disabled={!type || !playerId || status === 'loading'}
          className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-semibold text-sm disabled:opacity-40 transition-opacity"
        >
          {status === 'loading' ? 'Guardando...' : 'Registrar'}
        </button>

        {status === 'success' && (
          <p className="text-green-600 text-xs text-center font-medium">Incidencia registrada.</p>
        )}
        {status === 'error' && (
          <p className="text-red-500 text-xs text-center">{errorMsg || 'Error al guardar.'}</p>
        )}
      </form>
    </div>
  )
}
