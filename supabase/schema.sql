-- Core tables with RLS policies

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT CHECK (role IN ('public','organizer','admin')) DEFAULT 'public',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('draft','active','completed')) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  status TEXT CHECK (status IN ('upcoming','active','completed')) DEFAULT 'upcoming',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  overall_rating INTEGER,
  favorite_team TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  short_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE group_players (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, player_id)
);

CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id),
  round TEXT,
  matchday INTEGER,
  home_player_id UUID REFERENCES players(id),
  away_player_id UUID REFERENCES players(id),
  scheduled_at TIMESTAMPTZ,
  venue TEXT,
  status TEXT CHECK (status IN ('scheduled','live','completed','cancelled')) DEFAULT 'scheduled',
  stage TEXT CHECK (stage IN ('group','quarter_final','semi_final','final')) DEFAULT 'group',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID UNIQUE REFERENCES fixtures(id) ON DELETE CASCADE,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  home_team TEXT,
  away_team TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  player_of_match UUID REFERENCES players(id),
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  home_possession NUMERIC(5,2),
  away_possession NUMERIC(5,2),
  home_shots INTEGER DEFAULT 0,
  away_shots INTEGER DEFAULT 0,
  home_shots_on_target INTEGER DEFAULT 0,
  away_shots_on_target INTEGER DEFAULT 0,
  home_passes INTEGER DEFAULT 0,
  away_passes INTEGER DEFAULT 0,
  home_pass_accuracy NUMERIC(5,2),
  away_pass_accuracy NUMERIC(5,2),
  home_corners INTEGER DEFAULT 0,
  away_corners INTEGER DEFAULT 0,
  home_fouls INTEGER DEFAULT 0,
  away_fouls INTEGER DEFAULT 0,
  home_yellow_cards INTEGER DEFAULT 0,
  away_yellow_cards INTEGER DEFAULT 0,
  home_red_cards INTEGER DEFAULT 0,
  away_red_cards INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE player_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  avg_possession NUMERIC(5,2),
  avg_pass_accuracy NUMERIC(5,2),
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  UNIQUE(player_id, season_id)
);

CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id),
  played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points INTEGER DEFAULT 0,
  form TEXT[] DEFAULT '{}',
  UNIQUE(season_id, player_id, group_id)
);

CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('youtube','instagram','custom')),
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('match_report','instagram','twitter','headline','biography','summary')),
  headline TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE season_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  player_id UUID REFERENCES players(id),
  value NUMERIC,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id),
  type TEXT CHECK (type IN ('screenshot','graphic','photo')),
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE season_enrollments (
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  transaction_id TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (season_id, player_id)
);

-- Note: RLS policies should be added here to restrict access appropriately
