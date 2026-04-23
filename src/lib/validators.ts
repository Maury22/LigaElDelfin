import { z } from 'zod'

export const tournamentSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80),
})

export const teamSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  tournament_id: z.string().uuid('Seleccioná un torneo'),
})

export const playerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  dni: z.string().regex(/^\d{7,8}$/, 'DNI debe tener 7 u 8 dígitos'),
  team_id: z.string().uuid('Seleccioná un equipo'),
})

export const matchSchema = z.object({
  home_team_id: z.string().uuid('Seleccioná equipo local'),
  away_team_id: z.string().uuid('Seleccioná equipo visitante'),
  date: z.string().min(1, 'La fecha es requerida'),
  tournament_id: z.string().uuid('Seleccioná un torneo'),
}).refine((d) => d.home_team_id !== d.away_team_id, {
  message: 'Local y visitante no pueden ser el mismo equipo',
  path: ['away_team_id'],
})

export const matchResultSchema = z.object({
  score_home: z.number().int().min(0),
  score_away: z.number().int().min(0),
  status: z.literal('finished'),
})

export const incidentSchema = z.object({
  match_id: z.string().uuid(),
  player_id: z.string().uuid('Seleccioná un jugador'),
  type: z.enum(['goal', 'own_goal', 'yellow_card', 'red_card']),
  minute: z.number().int().min(1).max(120),
})

export type TournamentFormValues = z.infer<typeof tournamentSchema>
export type TeamFormValues       = z.infer<typeof teamSchema>
export type PlayerFormValues     = z.infer<typeof playerSchema>
export type MatchFormValues      = z.infer<typeof matchSchema>
export type IncidentFormValues   = z.infer<typeof incidentSchema>
