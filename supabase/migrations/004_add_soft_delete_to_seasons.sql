-- Migration 004: Soft Delete Architecture for Seasons
-- Preserves 100% of historical matches, leaderboards, goals, and player stats in PostgreSQL,
-- while filtering out soft-deleted seasons from the public website view.

ALTER TABLE seasons ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- High-performance B-tree index for filtering active vs soft-deleted seasons
CREATE INDEX IF NOT EXISTS idx_seasons_deleted_at ON seasons (deleted_at);
