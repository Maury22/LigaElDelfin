'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPlayer, deletePlayer } from '@/app/admin/actions'

interface Player {
  id: string
  name: string
  dni: string
  is_suspended: boolean
}

interface Props {
  teamId: string
  initialPlayers: Player[]
}

export default function TeamPlayersManager({ teamId, initialPlayers }: Props) {
  const [players, setPlayers] = useState(initialPlayers)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const [name, setName] = useState('')
  const [dni, setDni] = useState('')
  const [addStatus, setAddStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [addError, setAddError] = useState('')

  const router = useRouter()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !dni.trim()) return
    setAddStatus('loading')
    const result = await createPlayer({ name: name.trim(), dni: dni.trim(), team_id: teamId })
    if (result.error) {
      setAddError(result.error)
      setAddStatus('error')
    } else {
      setAddStatus('success')
      setName('')
      setDni('')
      setTimeout(() => setAddStatus('idle'), 1500)
      router.refresh()
    }
  }

  async function handleDelete(playerId: string) {
    setDeletingId(playerId)
    setDeleteError('')
    const result = await deletePlayer(playerId)
    if (result.error) {
      setDeleteError(result.error)
      setDeletingId(null)
    } else {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId))
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <h2 className="text-sm font-semibold text-gray-500 mb-3">Jugadores</h2>

      {/* Lista */}
      {players.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {players.map((player) => (
            <div key={player.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              {confirmId === player.id ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    ¿Eliminar a <strong>{player.name}</strong>?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(player.id)}
                      disabled={deletingId === player.id}
                      className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      {deletingId === player.id ? 'Eliminando...' : 'Sí, eliminar'}
                    </button>
                    <button
                      onClick={() => { setConfirmId(null); setDeleteError('') }}
                      className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                  {deleteError && <p className="text-red-500 text-xs mt-2">{deleteError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{player.name}</p>
                    <p className="text-xs text-gray-400">
                      DNI {player.dni}
                      {player.is_suspended && <span className="ml-2 text-red-500">· Suspendido</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmId(player.id)}
                    className="shrink-0 text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {players.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">Sin jugadores cargados.</p>
      )}

      {/* Formulario agregar */}
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
        <p className="text-xs font-medium text-gray-600">Nuevo jugador</p>
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div>
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="DNI"
            inputMode="numeric"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={addStatus === 'loading' || !name.trim() || !dni.trim()}
          className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50"
        >
          {addStatus === 'loading' ? 'Guardando...' : 'Agregar jugador'}
        </button>
        {addStatus === 'success' && <p className="text-green-600 text-xs text-center">Jugador agregado.</p>}
        {addStatus === 'error' && <p className="text-red-500 text-xs text-center">{addError}</p>}
      </form>
    </div>
  )
}
