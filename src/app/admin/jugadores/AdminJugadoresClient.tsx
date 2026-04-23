'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { playerSchema, PlayerFormValues } from '@/lib/validators'
import { createPlayer, deletePlayer } from '@/app/admin/actions'
import { Team } from '@/types/database.types'

interface Player {
  id: string
  name: string
  dni: string
  is_suspended: boolean
  team: { name: string } | null
}

interface Props {
  players: Player[]
  teams: Pick<Team, 'id' | 'name'>[]
}

export default function AdminJugadoresClient({ players: initialPlayers, teams }: Props) {
  const [players, setPlayers] = useState(initialPlayers)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
  })

  async function onSubmit(values: PlayerFormValues) {
    setStatus('loading')
    const result = await createPlayer(values)
    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
    } else {
      setStatus('success')
      reset()
      setTimeout(() => { setStatus('idle'); router.refresh() }, 1500)
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
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Jugadores</h1>

      {/* Lista de jugadores */}
      {players.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Jugadores registrados</h2>
          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-white border border-gray-100 rounded-xl px-4 py-3"
              >
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
                      <p className="text-xs text-gray-400 truncate">
                        {player.team?.name ?? '—'} · DNI {player.dni}
                        {player.is_suspended && (
                          <span className="ml-2 text-red-500">· Suspendido</span>
                        )}
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
        </section>
      )}

      {/* Formulario nuevo jugador */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Nuevo jugador</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              {...register('name')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Ej: Juan Pérez"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
            <input
              {...register('dni')}
              inputMode="numeric"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="12345678"
            />
            {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
            <select
              {...register('team_id')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">Seleccioná un equipo</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {errors.team_id && <p className="text-red-500 text-xs mt-1">{errors.team_id.message}</p>}
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gray-900 text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-50 active:opacity-80 transition-opacity"
          >
            {status === 'loading' ? 'Guardando...' : 'Guardar Jugador'}
          </button>

          {status === 'success' && <p className="text-green-600 text-sm text-center">Jugador guardado.</p>}
          {status === 'error' && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}
        </form>
      </section>
    </>
  )
}
