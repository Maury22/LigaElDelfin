'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateTeam } from '@/app/admin/actions'
import { LogoInput } from './CreateTeamForm'

interface Tournament { id: string; name: string }
interface Team {
  id: string
  name: string
  logo_url: string | null
  tournament_id: string | null
}

export default function EditTeamForm({
  team,
  tournaments,
}: {
  team: Team
  tournaments: Tournament[]
}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRef.current) return
    setStatus('loading')
    const formData = new FormData(formRef.current)
    const result = await updateTeam(formData)
    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
    } else {
      setStatus('success')
      setPreview(null)
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white border border-gray-200 rounded-xl p-4">
      <input type="hidden" name="team_id" value={team.id} />

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Torneo</label>
        <select
          name="tournament_id"
          defaultValue={team.tournament_id ?? ''}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Sin torneo</option>
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
        <input
          name="name"
          required
          defaultValue={team.name}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <LogoInput preview={preview} onPreview={setPreview} currentUrl={team.logo_url} />

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50"
      >
        {status === 'loading' ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {status === 'success' && <p className="text-green-600 text-xs text-center">Cambios guardados.</p>}
      {status === 'error' && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
    </form>
  )
}
