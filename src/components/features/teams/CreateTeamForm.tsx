'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createTeam } from '@/app/admin/actions'

interface Tournament { id: string; name: string }

export default function CreateTeamForm({ tournaments }: { tournaments: Tournament[] }) {
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
    const result = await createTeam(formData)
    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
    } else {
      setStatus('success')
      formRef.current.reset()
      setPreview(null)
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white border border-gray-200 rounded-xl p-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Torneo</label>
        <select name="tournament_id" required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option value="">Seleccioná</option>
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
        <input
          name="name"
          required
          placeholder="Ej: Deportivo Delfin"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <LogoInput preview={preview} onPreview={setPreview} />

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50"
      >
        {status === 'loading' ? 'Guardando...' : 'Crear equipo'}
      </button>

      {status === 'success' && <p className="text-green-600 text-xs text-center">Equipo creado.</p>}
      {status === 'error' && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
    </form>
  )
}

export function LogoInput({ preview, onPreview, currentUrl }: {
  preview: string | null
  onPreview: (url: string | null) => void
  currentUrl?: string | null
}) {
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) { onPreview(null); return }
    onPreview(URL.createObjectURL(file))
  }

  const shown = preview ?? currentUrl ?? null

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Escudo (opcional)</label>
      <div className="flex items-center gap-3">
        {shown ? (
          <img src={shown} alt="preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
            Logo
          </div>
        )}
        <label className="cursor-pointer px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Elegir archivo
          <input type="file" name="logo" accept="image/*" className="sr-only" onChange={handleFile} />
        </label>
        {preview && (
          <button type="button" onClick={() => onPreview(null)} className="text-xs text-gray-400 hover:text-red-500">
            Quitar
          </button>
        )}
      </div>
    </div>
  )
}
