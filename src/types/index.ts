// ─── Core Domain Types ───────────────────────────────────────────────────────

export type Player = {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  overall_rating: number | null;
  favorite_team: string | null;
  bio: string | null;
  created_at?: string;
};

export type Tournament = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  status: "draft" | "active" | "completed";
  created_at: string;
};

export type Season = {
  id: string;
  tournament_id: string;
  name: string;
  number: number;
  status: "upcoming" | "active" | "completed" | "maintenance";
  start_date?: string | null;
  end_date?: string | null;
  registration_start?: string | null;
  registration_end?: string | null;
  registration_status?: "closed" | "open" | "full";
  enrollment_capacity?: number | null;
  fee_amount?: number | null;
  fee_label?: string | null;
  upi_id?: string | null;
  created_at: string;
  tournament?: Tournament;
};

// ─── Enrollment & Registration ──────────────────────────────────────────────

export type EnrollmentStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "submitted" | "verified" | "failed";
export type PaymentMethod = "upi" | "razorpay" | "cashfree" | "manual";

export type RegistrationData = {
  name: string;
  favorite_team: string;
  phone: string;
  bio?: string;
  photo_url?: string;
};

export type Enrollment = {
  season_id: string;
  player_id: string | null;
  status: EnrollmentStatus;
  phone: string | null;
  transaction_id: string | null;
  registration_data: RegistrationData | null;
  payment_amount: number | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  player?: Player | null;
};

// ─── Fixtures & Matches ─────────────────────────────────────────────────────

export type FixtureStage = "group" | "round_of_16" | "quarter_final" | "semi_final" | "final";
export type FixtureStatus = "scheduled" | "live" | "completed" | "cancelled";

export type Fixture = {
  id: string;
  season_id: string;
  group_id?: string | null;
  round?: string | null;
  matchday: number;
  home_player_id?: string | null;
  away_player_id?: string | null;
  scheduled_at?: string | null;
  venue?: string | null;
  status: FixtureStatus;
  stage: FixtureStage;
  created_at?: string;
  home_player?: Player;
  away_player?: Player;
  home_score?: number;
  away_score?: number;
};

export type Match = {
  id: string;
  fixture_id: string;
  home_score: number;
  away_score: number;
  home_team?: string | null;
  away_team?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  player_of_match?: string | null;
  screenshot_url?: string | null;
  created_at?: string;
};

export type MatchStats = {
  home_possession: number;
  away_possession: number;
  home_shots: number;
  away_shots: number;
  home_shots_on_target: number;
  away_shots_on_target: number;
  home_passes: number;
  away_passes: number;
  home_pass_accuracy: number;
  away_pass_accuracy: number;
  home_corners: number;
  away_corners: number;
  home_fouls: number;
  away_fouls: number;
  home_yellow_cards: number;
  away_yellow_cards: number;
  home_red_cards: number;
  away_red_cards: number;
};

// ─── Standings ──────────────────────────────────────────────────────────────

export type StandingsRow = {
  player: Player;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
};

export type Group = {
  id: string;
  season_id: string;
  name: string;
  sort_order: number;
  created_at?: string;
};

export type GroupWithPlayers = Group & {
  players: Player[];
};

export type LeaderboardEntry = {
  id: string;
  season_id: string;
  player_id: string;
  group_id: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string[];
  player?: Player;
  group?: Group;
};

// ─── Fixture Generation Engine ──────────────────────────────────────────────

export type FixtureGenerationConfig = {
  seasonId: string;
  players: Player[];
  groupSize: number;
  seed?: number;
};

export type GeneratedGroup = {
  name: string;
  sortOrder: number;
  players: Player[];
};

export type GeneratedFixture = {
  seasonId: string;
  groupIndex: number;
  homePlayerId: string;
  awayPlayerId: string;
  matchday: number;
  stage: FixtureStage;
};

export type FixtureGenerationResult = {
  groups: GeneratedGroup[];
  fixtures: GeneratedFixture[];
  totalFixtures: number;
  totalGroups: number;
};

// ─── API Response Types ─────────────────────────────────────────────────────

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type EnrollmentResponse = ApiResponse<{
  enrollmentId: string;
  status: EnrollmentStatus;
}>;

export type FixtureGenerationResponse = ApiResponse<{
  groupsCreated: number;
  fixturesCreated: number;
  leaderboardsCreated: number;
}>;

// ─── Player Statistics ──────────────────────────────────────────────────────

export type PlayerSeasonStats = {
  id: string;
  player_id: string;
  season_id: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  assists: number;
  clean_sheets: number;
  avg_possession: number | null;
  avg_pass_accuracy: number | null;
  yellow_cards: number;
  red_cards: number;
  season?: Pick<Season, "name" | "number">;
};

// ─── Match Detail (Composed) ────────────────────────────────────────────────

export type MatchDetail = {
  fixture: Fixture & {
    season?: Season;
  };
  match: (Match & {
    statistics?: MatchStats;
    ai_reports?: Array<{
      id: string;
      report_type: string;
      headline: string | null;
      content: string | null;
    }>;
    media?: Array<{
      id: string;
      type: string;
      url: string;
      caption: string | null;
    }>;
  }) | null;
};
