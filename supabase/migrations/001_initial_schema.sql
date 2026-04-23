-- ============================================================
-- DELFIN LIGA AMATEUR — Initial Schema
-- ============================================================

-- Cleanup (safe re-run)
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS matches   CASCADE;
DROP TABLE IF EXISTS players   CASCADE;
DROP TABLE IF EXISTS teams     CASCADE;
DROP TYPE  IF EXISTS match_status  CASCADE;
DROP TYPE  IF EXISTS incident_type CASCADE;

-- ENUMS
CREATE TYPE match_status AS ENUM ('scheduled', 'finished');
CREATE TYPE incident_type AS ENUM ('goal', 'own_goal', 'yellow_card', 'red_card');

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE teams (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL UNIQUE,
  logo_url       TEXT,
  points         INT  NOT NULL DEFAULT 0,
  matches_played INT  NOT NULL DEFAULT 0,
  wins           INT  NOT NULL DEFAULT 0,
  draws          INT  NOT NULL DEFAULT 0,
  losses         INT  NOT NULL DEFAULT 0,
  goals_for      INT  NOT NULL DEFAULT 0,
  goals_against  INT  NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PLAYERS
-- ============================================================
CREATE TABLE players (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  dni           TEXT NOT NULL UNIQUE,
  yellow_cards  INT  NOT NULL DEFAULT 0,
  red_cards     INT  NOT NULL DEFAULT 0,
  goals_scored  INT  NOT NULL DEFAULT 0,
  is_suspended  BOOL NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID NOT NULL REFERENCES teams(id),
  away_team_id UUID NOT NULL REFERENCES teams(id),
  date         TIMESTAMPTZ NOT NULL,
  status       match_status NOT NULL DEFAULT 'scheduled',
  score_home   INT NOT NULL DEFAULT 0,
  score_away   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT different_teams CHECK (home_team_id <> away_team_id)
);

-- ============================================================
-- INCIDENTS
-- ============================================================
CREATE TABLE incidents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES players(id),
  type       incident_type NOT NULL,
  minute     INT NOT NULL CHECK (minute BETWEEN 1 AND 120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_players_team_id    ON players(team_id);
CREATE INDEX idx_matches_home_team  ON matches(home_team_id);
CREATE INDEX idx_matches_away_team  ON matches(away_team_id);
CREATE INDEX idx_matches_date       ON matches(date);
CREATE INDEX idx_incidents_match    ON incidents(match_id);
CREATE INDEX idx_incidents_player   ON incidents(player_id);

-- ============================================================
-- TRIGGER: Recalculate team stats when match status → finished
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_team_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate when status changes to 'finished'
  IF NEW.status = 'finished' AND (OLD.status IS DISTINCT FROM 'finished') THEN

    -- Reset then recalculate from scratch (safe for re-runs)
    UPDATE teams SET
      matches_played = 0, wins = 0, draws = 0, losses = 0,
      goals_for = 0, goals_against = 0, points = 0
    WHERE id IN (NEW.home_team_id, NEW.away_team_id);

    -- Recalculate HOME team
    UPDATE teams t SET
      matches_played = sub.mp,
      wins           = sub.w,
      draws          = sub.d,
      losses         = sub.l,
      goals_for      = sub.gf,
      goals_against  = sub.ga,
      points         = sub.w * 3 + sub.d
    FROM (
      SELECT
        COUNT(*) AS mp,
        COUNT(*) FILTER (WHERE score_home > score_away) AS w,
        COUNT(*) FILTER (WHERE score_home = score_away) AS d,
        COUNT(*) FILTER (WHERE score_home < score_away) AS l,
        COALESCE(SUM(score_home), 0) AS gf,
        COALESCE(SUM(score_away), 0) AS ga
      FROM matches
      WHERE home_team_id = NEW.home_team_id AND status = 'finished'
    ) sub
    WHERE t.id = NEW.home_team_id;

    -- Add AWAY stats on top
    UPDATE teams t SET
      matches_played = t.matches_played + sub.mp,
      wins           = t.wins + sub.w,
      draws          = t.draws + sub.d,
      losses         = t.losses + sub.l,
      goals_for      = t.goals_for + sub.gf,
      goals_against  = t.goals_against + sub.ga,
      points         = t.points + sub.w * 3 + sub.d
    FROM (
      SELECT
        COUNT(*) AS mp,
        COUNT(*) FILTER (WHERE score_away > score_home) AS w,
        COUNT(*) FILTER (WHERE score_away = score_home) AS d,
        COUNT(*) FILTER (WHERE score_away < score_home) AS l,
        COALESCE(SUM(score_away), 0) AS gf,
        COALESCE(SUM(score_home), 0) AS ga
      FROM matches
      WHERE away_team_id = NEW.away_team_id AND status = 'finished'
    ) sub
    WHERE t.id = NEW.away_team_id;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_match_finished
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION recalculate_team_stats();

-- ============================================================
-- TRIGGER: Update player stats on incident INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION handle_incident_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Goals
  IF NEW.type = 'goal' THEN
    UPDATE players SET goals_scored = goals_scored + 1 WHERE id = NEW.player_id;

  -- Own goals don't count for scorer stats

  -- Yellow card
  ELSIF NEW.type = 'yellow_card' THEN
    UPDATE players SET
      yellow_cards = yellow_cards + 1,
      is_suspended = CASE WHEN yellow_cards + 1 >= 3 THEN TRUE ELSE is_suspended END
    WHERE id = NEW.player_id;

  -- Red card
  ELSIF NEW.type = 'red_card' THEN
    UPDATE players SET
      red_cards    = red_cards + 1,
      is_suspended = TRUE
    WHERE id = NEW.player_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incident_insert
  AFTER INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION handle_incident_insert();

-- ============================================================
-- TRIGGER: Reverse player stats on incident DELETE
-- (permite corregir errores de carga)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_incident_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.type = 'goal' THEN
    UPDATE players SET goals_scored = GREATEST(goals_scored - 1, 0) WHERE id = OLD.player_id;

  ELSIF OLD.type = 'yellow_card' THEN
    UPDATE players SET
      yellow_cards = GREATEST(yellow_cards - 1, 0),
      is_suspended = CASE WHEN yellow_cards - 1 < 3 AND red_cards = 0 THEN FALSE ELSE is_suspended END
    WHERE id = OLD.player_id;

  ELSIF OLD.type = 'red_card' THEN
    UPDATE players SET
      red_cards    = GREATEST(red_cards - 1, 0),
      is_suspended = CASE WHEN red_cards - 1 = 0 AND yellow_cards < 3 THEN FALSE ELSE is_suspended END
    WHERE id = OLD.player_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incident_delete
  AFTER DELETE ON incidents
  FOR EACH ROW EXECUTE FUNCTION handle_incident_delete();

-- ============================================================
-- RLS (Row Level Security)
-- Public: solo lectura en teams, players, matches, incidents
-- Autenticado: escritura en todas las tablas
-- ============================================================
ALTER TABLE teams     ENABLE ROW LEVEL SECURITY;
ALTER TABLE players   ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "public_read_teams"     ON teams     FOR SELECT USING (TRUE);
CREATE POLICY "public_read_players"   ON players   FOR SELECT USING (TRUE);
CREATE POLICY "public_read_matches"   ON matches   FOR SELECT USING (TRUE);
CREATE POLICY "public_read_incidents" ON incidents FOR SELECT USING (TRUE);

-- Escritura solo para usuarios autenticados (organizadores)
CREATE POLICY "auth_write_teams"     ON teams     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_players"   ON players   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_matches"   ON matches   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_incidents" ON incidents FOR ALL USING (auth.role() = 'authenticated');
