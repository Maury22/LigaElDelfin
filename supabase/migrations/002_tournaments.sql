-- ============================================================
-- DELFIN — Tournaments
-- ============================================================

CREATE TABLE tournaments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  is_active  BOOL NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE teams   ADD COLUMN tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL;
ALTER TABLE matches ADD COLUMN tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL;

CREATE INDEX idx_teams_tournament   ON teams(tournament_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);

-- RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_tournaments" ON tournaments FOR SELECT USING (TRUE);
CREATE POLICY "auth_write_tournaments"  ON tournaments FOR ALL  USING (auth.role() = 'authenticated');
