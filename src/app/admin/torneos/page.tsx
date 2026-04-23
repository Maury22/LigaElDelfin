'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { tournamentSchema, TournamentFormValues } from '@/lib/validators'
import { Tournament } from '@/types/database.types'
import { createTournament } from '@/app/admin/actions'
import AdminLayout from '@/components/layouts/AdminLayout'

export default function AdminTorneosPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema),
  })

  async function fetchTournaments() {
    const { data } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false })
    setTournaments(data ?? [])
  }

  useEffect(() => { fetchTournaments() }, [])

  async function onSubmit(values: TournamentFormValues) {
    setStatus('loading')
    const result = await createTournament(values)
    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
    } else {
      setStatus('success')
      reset()
      fetchTournaments()
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Torneos</h1>

      {/* Formulario nuevo torneo */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del torneo</label>
          <input
            {...register('name')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Ej: División A — Sábados"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-gray-900 text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-50"
        >
          {status === 'loading' ? 'Guardando...' : 'Crear Torneo'}
        </button>

        {status === 'success' && <p className="text-green-600 text-sm text-center">Torneo creado.</p>}
        {status === 'error' && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}
      </form>

      {/* Lista de torneos */}
      <div className="flex flex-col gap-2">
        {tournaments.map((t) => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="font-medium text-gray-900 text-sm">{t.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              t.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {t.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        ))}
        {tournaments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">Sin torneos creados.</p>
        )}
      </div>
    </AdminLayout>
  )
}
