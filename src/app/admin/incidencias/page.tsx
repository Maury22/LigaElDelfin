'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { incidentSchema, IncidentFormValues } from '@/lib/validators'
import { Match, Player, Team } from '@/types/database.types'
import { createIncident } from '@/app/admin/actions'
import AdminLayout from '@/components/layouts/AdminLayout'

type MatchOption = Match & {
  home_team: Pick<Team, 'name'>
  away_team: Pick<Team, 'name'>
}

const INCIDENT_LABELS: Record<string, string> = {
  goal: 'Gol',
  own_goal: 'Gol en contra',
  yellow_card: 'Amarilla',
  red_card: 'Roja',
}

export default function AdminIncidenciasPage() {
  const [matches, setMatches] = useState<MatchOption[]>([])
  const [players, setPlayers] = useState<(Player & { team: Pick<Team, 'name'> })[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: { minute: 1 },
  })

  useEffect(() => {
    supabase
      .from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
      .eq('status', 'finished')
      .order('date', { ascending: false })
      .limit(10)
      .then(({ data }) => setMatches((data as MatchOption[]) ?? []))
  }, [])

  useEffect(() => {
    if (!selectedMatch) { setPlayers([]); return }
    const match = matches.find((m) => m.id === selectedMatch)
    if (!match) return

    supabase
      .from('players')
      .select('*, team:teams(name)')
      .in('team_id', [match.home_team_id, match.away_team_id])
      .order('name')
      .then(({ data }) => setPlayers((data as any) ?? []))
  }, [selectedMatch, matches])

  async function onSubmit(values: IncidentFormValues) {
    setStatus('loading')
    const result = await createIncident(values)
    if (result.error) {
      setStatus('error')
    } else {
      setStatus('success')
      reset({ match_id: values.match_id, minute: 1 })
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  const matchId = watch('match_id')

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Cargar Incidencia</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Partido</label>
          <select
            {...register('match_id')}
            onChange={(e) => {
              setValue('match_id', e.target.value)
              setSelectedMatch(e.target.value)
              setValue('player_id', '')
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Seleccioná un partido</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.home_team.name} {m.score_home}–{m.score_away} {m.away_team.name}
              </option>
            ))}
          </select>
          {errors.match_id && <p className="text-red-500 text-xs mt-1">{errors.match_id.message}</p>}
          {matches.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Solo se muestran partidos finalizados.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            {(['goal', 'own_goal', 'yellow_card', 'red_card'] as const).map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer has-[:checked]:border-gray-900 has-[:checked]:bg-gray-50 transition-colors"
              >
                <input type="radio" value={type} {...register('type')} className="sr-only" />
                <span className="text-sm font-medium text-gray-700">{INCIDENT_LABELS[type]}</span>
              </label>
            ))}
          </div>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jugador</label>
          <select
            {...register('player_id')}
            disabled={!matchId}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
          >
            <option value="">Seleccioná un jugador</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({(p as any).team?.name})
                {p.is_suspended ? ' ⚠ Suspendido' : ''}
              </option>
            ))}
          </select>
          {errors.player_id && <p className="text-red-500 text-xs mt-1">{errors.player_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minuto</label>
          <input
            type="number"
            min={1}
            max={120}
            inputMode="numeric"
            {...register('minute', { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          {errors.minute && <p className="text-red-500 text-xs mt-1">{errors.minute.message}</p>}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-50 active:opacity-80 transition-opacity mt-2"
        >
          {status === 'loading' ? 'Guardando...' : 'Registrar Incidencia'}
        </button>

        {status === 'success' && (
          <p className="text-green-600 text-sm text-center font-medium">Incidencia registrada.</p>
        )}
        {status === 'error' && (
          <p className="text-red-500 text-sm text-center">Error al guardar. Intentá de nuevo.</p>
        )}
      </form>
    </AdminLayout>
  )
}
