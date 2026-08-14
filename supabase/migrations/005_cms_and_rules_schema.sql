-- Migration 005: CMS, Rules & Organizers Architecture

-- 1. Site Content (Key-Value CMS Payload for About page & Site Announcements)
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tournament Rules
CREATE TABLE IF NOT EXISTS tournament_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'General',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Organizers Directory
CREATE TABLE IF NOT EXISTS organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Organizer',
  photo_url TEXT,
  bio TEXT,
  email TEXT,
  whatsapp_number TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tournament_rules_season ON tournament_rules (season_id);
CREATE INDEX IF NOT EXISTS idx_tournament_rules_category ON tournament_rules (category);
CREATE INDEX IF NOT EXISTS idx_organizers_sort ON organizers (sort_order);
