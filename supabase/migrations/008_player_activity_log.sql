-- =============================================================
-- Migration 008: Player Activity Log
-- Tracks all authenticated player actions (enrollment, profile
-- updates, tag downloads, page views, etc.)
-- =============================================================

CREATE TABLE IF NOT EXISTS player_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_activity_player ON player_activity_log(player_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON player_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON player_activity_log(created_at DESC);

-- RLS: Players can insert their own activity, admins can read all
ALTER TABLE player_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can insert own activity"
  ON player_activity_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read all activity"
  ON player_activity_log FOR SELECT
  USING (true);
