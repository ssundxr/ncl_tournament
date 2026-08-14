-- ============================================================================
-- NCL Hub — Player Portal Migration
-- Adds: user_id to players, strict constraints on enrollments, updated RLS.
-- ============================================================================

-- ─── 1. Add Auth User ID to Players ─────────────────────────────────────────
-- We link the `players` table to the authenticated `auth.users` via `user_id`.
-- This allows a player to log in and have a permanent "Gamer Card" profile.

ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id TEXT UNIQUE;

-- Create an index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);

-- ─── 2. Enhance season_enrollments for strict portal flow ───────────────────
-- If `player_id` is provided (as it will be from the Portal), it MUST be valid.
-- The existing column `player_id` is UUID, but currently didn't enforce a hard
-- constraint on new UI flows in all cases. Let's ensure it's strictly linked.

-- (First drop the constraint if it exists just to be safe in case of re-run)
ALTER TABLE season_enrollments DROP CONSTRAINT IF EXISTS fk_enrollment_player;

ALTER TABLE season_enrollments ADD CONSTRAINT fk_enrollment_player 
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL;

-- Enforce strict 1-enrollment-per-player-per-season rule for portal users
-- (Players cannot apply twice to the same season if logged in)
CREATE UNIQUE INDEX IF NOT EXISTS idx_strict_player_season_enrollment 
  ON season_enrollments (season_id, player_id) 
  WHERE player_id IS NOT NULL;

-- ─── 3. Row Level Security Policies for Portal ──────────────────────────────

-- Allow authenticated users to view their own player profile securely
CREATE POLICY "Users can read own player profile" ON players
  FOR SELECT USING (user_id = auth.uid()::text);

-- Allow authenticated users to insert their own player profile during onboarding
CREATE POLICY "Users can create own player profile" ON players
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Allow authenticated users to update their own player profile
CREATE POLICY "Users can update own player profile" ON players
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Enrollments RLS for the Portal
-- Users can read their own enrollments linked to their player profile
CREATE POLICY "Users can read own enrollments by player_id" ON season_enrollments
  FOR SELECT USING (
    player_id IN (SELECT id FROM players WHERE user_id = auth.uid()::text)
  );

-- Note: "Anyone can enroll" policy still exists from 001_season2_schema.sql
-- We will keep it for backwards compatibility but portal enrollment will enforce auth.
