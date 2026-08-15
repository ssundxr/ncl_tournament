-- Add claim_token column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS claim_token TEXT UNIQUE;

-- Create an index for fast lookups
CREATE INDEX IF NOT EXISTS idx_players_claim_token ON players(claim_token);
