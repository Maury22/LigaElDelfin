'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { matchSchema, MatchFormValues } from '@/lib/validators'
import { Team, Match, Tournament } from '@/types/database.types'
import { createMatch, closeMatch } from '@/app/admin/actions'
import AdminLayout from '@/components/layouts/AdminLayout'

type MatchWithTeams = Match & {
  home_team: Pick<Team, 'name'>
  away_team: Pick<Team, 'name'>
}

export default function AdminPartidosPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [closingId, setClosingId] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({})

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
  })

  const selectedTournamentId = watch('tournament_id')
  const filteredTeams = selectedTournamentId
    ? teams.filter((t) => t.tournament_id === selectedTournamentId)
    : teams

  async function fetchData() {
    const [{ data: t }, { data: m }, { data: trn }] = await Promise.all([
      supabase.from('teams').select('*').order('name'),
      supabase
        .from('matches')
        .select('*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
        .order('date', { ascending: false })
        .limit(20),
      supabase.from('tournaments').select('*').eq('is_active', true).order('name'),
    ])
    setTeams(t ?? [])
    setMatches((m as MatchWithTeams[]) ?? [])
    setTournaments(trn ?? [])
  }

  useEffect(() => { fetchData() }, [])

  async function onSubmit(values: MatchFormValues) {
    setStatus('loading')
    const result = await createMatch(values)
    if (result.error) {
      setStatus('error')
    } else {
      setStatus('success')
      reset()
      fetchData()
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  async function handleCloseMatch(matchId: string) {
    const s = scores[matchId]
    if (!s?.home || !s?.away) return
    const scoreHome = parseInt(s.home, 10)
    const scoreAway = parseInt(s.away, 10)
    if (isNaN(scoreHome) || isNaN(scoreAway)) return

    setClosingId(matchId)
    await closeMatch(matchId, scoreHome, scoreAway)
    setClosingId(null)
    fetchData()
  }

  const scheduled = matches.filter((m) => m.status === 'scheduled')
  const finished = matches.filter((m) => m.status === 'finished')

  const selectClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900'

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Partidos</h1>

      {/* Crear partido */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Nuevo partido</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 bg-white border border-gray-200 rounded-xl p-4">

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Torneo</label>
            <select {...register('tournament_id')} className={selectClass}>
              <option value="">Seleccioná</option>
              {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.tournament_id && <p className="text-red-500 text-xs mt-1">{errors.tournament_id.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Local</label>
            <select {...register('home_team_id')} className={selectClass}>
              <option value="">Seleccioná</option>
              {filteredTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.home_team_id && <p className="text-red-500 text-xs mt-1">{errors.home_team_id.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Visitante</label>
            <select {...register('away_team_id')} className={selectClass}>
              <option value="">Seleccioná</option>
              {filteredTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.away_team_id && <p className="text-red-500 text-xs mt-1">{errors.away_team_id.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha y hora</label>
            <input type="datetime-local" {...register('date')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <button type="submit" disabled={status === 'loading'} className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50">
            {status === 'loading' ? 'Guardando...' : 'Crear Partido'}
          </button>
          {status === 'success' && <p className="text-green-600 text-xs text-center">Partido creado.</p>}
          {status === 'error' && <p className="text-red-500 text-xs text-center">Error al guardar.</p>}
        </form>
      </section>

      {/* Cerrar partidos pendientes */}
      {scheduled.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Cargar resultado</h2>
          <div className="flex flex-col gap-3">
            {scheduled.map((m) => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {m.home_team.name} vs {m.away_team.name}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={scores[m.id]?.home ?? ''}
                    onChange={(e) => setScores((s) => ({ ...s, [m.id]: { ...s[m.id], home: e.target.value } }))}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={scores[m.id]?.away ?? ''}
                    onChange={(e) => setScores((s) => ({ ...s, [m.id]: { ...s[m.id], away: e.target.value } }))}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    onClick={() => handleCloseMatch(m.id)}
                    disabled={closingId === m.id}
                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    {closingId === m.id ? '...' : 'Cerrar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Historial */}
      {finished.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Últimos resultados</h2>
          <div className="flex flex-col gap-2">
            {finished.map((m) => (
              <Link
                key={m.id}
                href={`/admin/partidos/${m.id}`}
                className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between text-sm hover:border-gray-300 transition-colors"
              >
                <span className="text-gray-700">{m.home_team.name}</span>
                <span className="font-bold text-gray-900 mx-2">{m.score_home} — {m.score_away}</span>
                <span className="text-gray-700">{m.away_team.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AdminLayout>
  )
}
