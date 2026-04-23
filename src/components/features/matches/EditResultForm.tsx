'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { closeMatch } from '@/app/admin/actions'

interface Props {
  matchId: string
  scoreHome: number
  scoreAway: number
}

export default function EditResultForm({ matchId, scoreHome, scoreAway }: Props) {
  const router = useRouter()
  const [home, setHome] = useState(String(scoreHome))
  const [away, setAway] = useState(String(scoreAway))
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [open, setOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const h = parseInt(home, 10)
    const a = parseInt(away, 10)
    if (isNaN(h) || isNaN(a)) return
    setStatus('loading')
    const result = await closeMatch(matchId, h, a)
    if (result.error) {
      setStatus('error')
    } else {
      setStatus('success')
      setOpen(false)
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  if (!open) {
    return (
      <div className="flex items-center justify-end mt-2">
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
        >
          Editar resultado
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mt-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Editar resultado
      </h3>
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="number"
          min={0}
          value={home}
          onChange={(e) => setHome(e.target.value)}
          className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <span className="text-gray-400">—</span>
        <input
          type="number"
          min={0}
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="ml-auto px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-700"
        >
          Cancelar
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-500 text-xs mt-2">Error al guardar.</p>
      )}
    </div>
  )
}
