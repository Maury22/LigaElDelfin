'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTeam } from '@/app/admin/actions'

export default function DeleteTeamButton({ teamId, teamName }: { teamId: string; teamName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const result = await deleteTeam(teamId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin/equipos')
    }
  }

  return (
    <div className="mt-10 border-t border-gray-100 pt-6">
      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

      {confirming ? (
        <>
          <p className="text-sm text-gray-600 mb-3">
            ¿Seguro que querés eliminar <strong>{teamName}</strong>? Se borrarán también sus jugadores y partidos.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 active:opacity-80 transition-opacity"
            >
              {loading ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button
              onClick={() => { setConfirming(false); setError('') }}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium active:opacity-80 transition-opacity"
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="w-full border border-red-200 text-red-500 rounded-lg py-2.5 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Eliminar equipo
        </button>
      )}
    </div>
  )
}
