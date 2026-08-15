-- ============================================================================
-- NCL Hub — Player Tag, Unique NCL ID, Match Code & Tournament Tag Migration
-- Adds: ncl_id, short_tag to players; match_code to fixtures; number, tag to tournaments.
-- ============================================================================

-- ─── 1. Add ncl_id and short_tag to Players ────────────────────────────────
ALTER TABLE players ADD COLUMN IF NOT EXISTS ncl_id TEXT UNIQUE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS short_tag TEXT DEFAULT 'IND';

CREATE INDEX IF NOT EXISTS idx_players_ncl_id ON players(ncl_id);

-- ─── 2. Add match_code to Fixtures ──────────────────────────────────────────
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS match_code TEXT;

CREATE INDEX IF NOT EXISTS idx_fixtures_match_code ON fixtures(match_code);

-- ─── 3. Add number and tag to Tournaments ───────────────────────────────────
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS number INTEGER DEFAULT 1;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'T1';

-- ─── 4. Auto-generation Postgres Function & Triggers ────────────────────────
CREATE OR REPLACE FUNCTION generate_unique_ncl_id()
RETURNS TRIGGER AS $$
DECLARE
  v_random_id TEXT;
  v_exists BOOLEAN;
BEGIN
  IF NEW.ncl_id IS NULL OR NEW.ncl_id = '' THEN
    LOOP
      v_random_id := 'NCL-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5));
      SELECT EXISTS(SELECT 1 FROM players WHERE ncl_id = v_random_id) INTO v_exists;
      EXIT WHEN NOT v_exists;
    END LOOP;
    NEW.ncl_id := v_random_id;
  END IF;

  IF NEW.short_tag IS NULL OR NEW.short_tag = '' THEN
    NEW.short_tag := 'IND';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_player_ncl_id ON players;
CREATE TRIGGER trg_generate_player_ncl_id
  BEFORE INSERT ON players
  FOR EACH ROW
  EXECUTE FUNCTION generate_unique_ncl_id();

-- Backfill existing players with NCL IDs and short_tag if null
UPDATE players 
SET ncl_id = 'NCL-' || UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 5))
WHERE ncl_id IS NULL OR ncl_id = '';

UPDATE players 
SET short_tag = 'IND'
WHERE short_tag IS NULL OR short_tag = '';
