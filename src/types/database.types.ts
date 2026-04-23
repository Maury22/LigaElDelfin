export type MatchStatus = 'scheduled' | 'finished'
export type IncidentType = 'goal' | 'own_goal' | 'yellow_card' | 'red_card'

export interface Tournament {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface Team {
  id: string
  name: string
  logo_url: string | null
  tournament_id: string | null
  points: number
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  created_at: string
}

export interface Player {
  id: string
  team_id: string
  name: string
  dni: string
  yellow_cards: number
  red_cards: number
  goals_scored: number
  is_suspended: boolean
  created_at: string
}

export interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  tournament_id: string | null
  date: string
  status: MatchStatus
  score_home: number
  score_away: number
  created_at: string
}

export interface Incident {
  id: string
  match_id: string
  player_id: string
  type: IncidentType
  minute: number
  created_at: string
}
