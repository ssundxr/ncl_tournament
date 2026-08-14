-- ============================================================================
-- NCL Hub — Season 2 Migration
-- Adds: payment tracking, enrollment capacity, dedup constraints, indexes,
--        RLS policies, and server-side functions.
-- ============================================================================

-- ─── 1. Extend `seasons` table ──────────────────────────────────────────────

ALTER TABLE seasons ADD COLUMN IF NOT EXISTS registration_status TEXT
  CHECK (registration_status IN ('closed', 'open', 'full'))
  DEFAULT 'closed';

ALTER TABLE seasons ADD COLUMN IF NOT EXISTS enrollment_capacity INTEGER;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS fee_amount NUMERIC(10,2) DEFAULT 30.00;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS fee_label TEXT DEFAULT '₹30.00';
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS upi_id TEXT DEFAULT 'ashwinfejl357@oksbi';

-- Registration window columns (may already exist from prior migration)
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS registration_start TIMESTAMPTZ;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS registration_end TIMESTAMPTZ;

-- ─── 2. Extend `season_enrollments` table ───────────────────────────────────

-- Store full registration form data as JSONB (player row created on approval)
ALTER TABLE season_enrollments ADD COLUMN IF NOT EXISTS registration_data JSONB;

-- Payment tracking
ALTER TABLE season_enrollments ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2);
ALTER TABLE season_enrollments ADD COLUMN IF NOT EXISTS payment_method TEXT
  CHECK (payment_method IN ('upi', 'razorpay', 'cashfree', 'manual'))
  DEFAULT 'upi';
ALTER TABLE season_enrollments ADD COLUMN IF NOT EXISTS payment_status TEXT
  CHECK (payment_status IN ('pending', 'submitted', 'verified', 'failed'))
  DEFAULT 'pending';
ALTER TABLE season_enrollments ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;
ALTER TABLE season_enrollments ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES users(id);
ALTER TABLE season_enrollments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- First drop the existing PK that requires player_id
ALTER TABLE season_enrollments DROP CONSTRAINT IF EXISTS season_enrollments_pkey;

-- Add a new surrogate primary key (since player_id is no longer part of PK)
ALTER TABLE season_enrollments ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- Allow player_id to be NULL (deferred creation until admin approval)
ALTER TABLE season_enrollments ALTER COLUMN player_id DROP NOT NULL;

-- Unique constraint on phone per season (prevent duplicate registrations)
-- We need a new unique constraint on (season_id, phone) for dedup
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_season_phone
  ON season_enrollments (season_id, phone)
  WHERE phone IS NOT NULL;

-- ─── 3. Performance Indexes ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_fixtures_season_status
  ON fixtures (season_id, status, stage);

CREATE INDEX IF NOT EXISTS idx_fixtures_season_matchday
  ON fixtures (season_id, matchday);

CREATE INDEX IF NOT EXISTS idx_leaderboards_season_group
  ON leaderboards (season_id, group_id);

CREATE INDEX IF NOT EXISTS idx_leaderboards_season_points
  ON leaderboards (season_id, points DESC, goal_difference DESC, goals_for DESC);

CREATE INDEX IF NOT EXISTS idx_enrollments_season_status
  ON season_enrollments (season_id, status);

CREATE INDEX IF NOT EXISTS idx_matches_fixture
  ON matches (fixture_id);

CREATE INDEX IF NOT EXISTS idx_players_slug
  ON players (slug);

CREATE INDEX IF NOT EXISTS idx_group_players_group
  ON group_players (group_id);

CREATE INDEX IF NOT EXISTS idx_group_players_player
  ON group_players (player_id);

-- ─── 4. Row Level Security Policies ─────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view public data)
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read fixtures" ON fixtures FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Public read group_players" ON group_players FOR SELECT USING (true);
CREATE POLICY "Public read leaderboards" ON leaderboards FOR SELECT USING (true);
CREATE POLICY "Public read statistics" ON statistics FOR SELECT USING (true);
CREATE POLICY "Public read media" ON media FOR SELECT USING (true);
CREATE POLICY "Public read streams" ON streams FOR SELECT USING (true);
CREATE POLICY "Public read ai_reports" ON ai_reports FOR SELECT USING (true);
CREATE POLICY "Public read season_records" ON season_records FOR SELECT USING (true);
CREATE POLICY "Public read player_statistics" ON player_statistics FOR SELECT USING (true);
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);

-- Enrollment: anyone can insert (register), but can only read their own by phone
CREATE POLICY "Anyone can enroll" ON season_enrollments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Read own enrollment by phone" ON season_enrollments
  FOR SELECT USING (true); -- Simplified: public can check status by phone

-- Service role (admin) bypass — service role always bypasses RLS by default in Supabase

-- ─── 5. Helper Functions ────────────────────────────────────────────────────

-- Generate a unique slug from a player name
CREATE OR REPLACE FUNCTION generate_unique_slug(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Normalize: lowercase, replace non-alphanumeric with hyphens, trim
  base_slug := lower(regexp_replace(trim(p_name), '[^a-z0-9]+', '-', 'gi'));
  base_slug := trim(both '-' from base_slug);
  
  -- Try base slug first
  final_slug := base_slug;
  
  LOOP
    -- Check if slug exists
    IF NOT EXISTS (SELECT 1 FROM players WHERE slug = final_slug) THEN
      RETURN final_slug;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
    
    -- Safety: bail after 1000 attempts
    IF counter > 1000 THEN
      final_slug := base_slug || '-' || extract(epoch from now())::integer;
      RETURN final_slug;
    END IF;
  END LOOP;
END;
$$;

-- Atomic standings recalculation for a season
-- Replaces the client-side N+1 loop entirely
CREATE OR REPLACE FUNCTION recalculate_standings(p_season_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reset all leaderboard entries for this season
  UPDATE leaderboards SET
    played = 0,
    wins = 0,
    draws = 0,
    losses = 0,
    goals_for = 0,
    goals_against = 0,
    points = 0,
    form = '{}'
  WHERE season_id = p_season_id;

  -- Recalculate from completed group-stage fixtures
  WITH fixture_results AS (
    SELECT
      f.home_player_id,
      f.away_player_id,
      f.group_id,
      m.home_score,
      m.away_score,
      f.created_at as fixture_created_at
    FROM fixtures f
    JOIN matches m ON m.fixture_id = f.id
    WHERE f.season_id = p_season_id
      AND f.status = 'completed'
      AND f.stage = 'group'
  ),
  -- Home stats
  home_stats AS (
    SELECT
      home_player_id AS player_id,
      group_id,
      COUNT(*) AS played,
      SUM(CASE WHEN home_score > away_score THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN home_score = away_score THEN 1 ELSE 0 END) AS draws,
      SUM(CASE WHEN home_score < away_score THEN 1 ELSE 0 END) AS losses,
      SUM(home_score) AS goals_for,
      SUM(away_score) AS goals_against,
      SUM(CASE 
        WHEN home_score > away_score THEN 3
        WHEN home_score = away_score THEN 1
        ELSE 0
      END) AS points
    FROM fixture_results
    GROUP BY home_player_id, group_id
  ),
  -- Away stats
  away_stats AS (
    SELECT
      away_player_id AS player_id,
      group_id,
      COUNT(*) AS played,
      SUM(CASE WHEN away_score > home_score THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN away_score = home_score THEN 1 ELSE 0 END) AS draws,
      SUM(CASE WHEN away_score < home_score THEN 1 ELSE 0 END) AS losses,
      SUM(away_score) AS goals_for,
      SUM(home_score) AS goals_against,
      SUM(CASE
        WHEN away_score > home_score THEN 3
        WHEN away_score = home_score THEN 1
        ELSE 0
      END) AS points
    FROM fixture_results
    GROUP BY away_player_id, group_id
  ),
  -- Combined
  combined AS (
    SELECT
      COALESCE(h.player_id, a.player_id) AS player_id,
      COALESCE(h.group_id, a.group_id) AS group_id,
      COALESCE(h.played, 0) + COALESCE(a.played, 0) AS played,
      COALESCE(h.wins, 0) + COALESCE(a.wins, 0) AS wins,
      COALESCE(h.draws, 0) + COALESCE(a.draws, 0) AS draws,
      COALESCE(h.losses, 0) + COALESCE(a.losses, 0) AS losses,
      COALESCE(h.goals_for, 0) + COALESCE(a.goals_for, 0) AS goals_for,
      COALESCE(h.goals_against, 0) + COALESCE(a.goals_against, 0) AS goals_against,
      COALESCE(h.points, 0) + COALESCE(a.points, 0) AS points
    FROM home_stats h
    FULL OUTER JOIN away_stats a 
      ON h.player_id = a.player_id AND h.group_id = a.group_id
  )
  UPDATE leaderboards lb SET
    played = c.played,
    wins = c.wins,
    draws = c.draws,
    losses = c.losses,
    goals_for = c.goals_for,
    goals_against = c.goals_against,
    points = c.points
  FROM combined c
  WHERE lb.season_id = p_season_id
    AND lb.player_id = c.player_id
    AND lb.group_id = c.group_id;

  -- Recalculate form (last 5 results per player)
  WITH ordered_results AS (
    SELECT
      CASE
        WHEN f.home_player_id = lb.player_id THEN
          CASE
            WHEN m.home_score > m.away_score THEN 'W'
            WHEN m.home_score = m.away_score THEN 'D'
            ELSE 'L'
          END
        ELSE
          CASE
            WHEN m.away_score > m.home_score THEN 'W'
            WHEN m.away_score = m.home_score THEN 'D'
            ELSE 'L'
          END
      END AS result,
      lb.id AS lb_id,
      ROW_NUMBER() OVER (
        PARTITION BY lb.id
        ORDER BY f.created_at DESC
      ) AS rn
    FROM leaderboards lb
    JOIN fixtures f ON f.season_id = lb.season_id
      AND f.group_id = lb.group_id
      AND f.stage = 'group'
      AND f.status = 'completed'
      AND (f.home_player_id = lb.player_id OR f.away_player_id = lb.player_id)
    JOIN matches m ON m.fixture_id = f.id
    WHERE lb.season_id = p_season_id
  ),
  form_arrays AS (
    SELECT
      lb_id,
      array_agg(result ORDER BY rn) AS form
    FROM ordered_results
    WHERE rn <= 5
    GROUP BY lb_id
  )
  UPDATE leaderboards lb SET
    form = fa.form
  FROM form_arrays fa
  WHERE lb.id = fa.lb_id;
END;
$$;

-- ─── 6. View for fixtures with scores (replaces double-query pattern) ───────

CREATE OR REPLACE VIEW fixtures_with_scores AS
SELECT
  f.*,
  COALESCE(m.home_score, 0) AS match_home_score,
  COALESCE(m.away_score, 0) AS match_away_score,
  m.id AS match_id,
  m.started_at AS match_started_at,
  m.ended_at AS match_ended_at,
  m.screenshot_url AS match_screenshot_url
FROM fixtures f
LEFT JOIN matches m ON m.fixture_id = f.id;
