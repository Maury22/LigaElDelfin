-- ============================================================
-- DELFIN — News / Noticias
-- ============================================================

CREATE TABLE news (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  excerpt       TEXT,
  content       TEXT,
  image_url     TEXT,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  instagram_url TEXT,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_published ON news(published_at DESC);
CREATE INDEX idx_news_tournament ON news(tournament_id);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_news" ON news FOR SELECT USING (TRUE);
CREATE POLICY "auth_write_news"  ON news FOR ALL  USING (auth.role() = 'authenticated');
