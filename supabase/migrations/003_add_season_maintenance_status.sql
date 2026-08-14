-- Drop the old constraint
ALTER TABLE seasons DROP CONSTRAINT IF EXISTS seasons_status_check;

-- Add the new constraint allowing 'maintenance'
ALTER TABLE seasons ADD CONSTRAINT seasons_status_check CHECK (status IN ('upcoming', 'active', 'completed', 'maintenance'));
