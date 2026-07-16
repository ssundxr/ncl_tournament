export type Player = {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  overall_rating: number | null;
  favorite_team: string | null;
  bio: string | null;
};

export type Match = {
  id: string;
  fixture_id: string;
  home_score: number;
  away_score: number;
  home_team: string;
  away_team: string;
  started_at: string | null;
  ended_at: string | null;
  status: "scheduled" | "live" | "completed" | "cancelled";
  home_player: Player;
  away_player: Player;
};

export type Fixture = {
  id: string;
  round: string;
  matchday: number;
  scheduled_at: string | null;
  status: "scheduled" | "live" | "completed" | "cancelled";
  home_player: Player;
  away_player: Player;
  home_score?: number;
  away_score?: number;
};

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
  form: string[]; // e.g. ["W", "D", "L", "W", "W"]
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
