import { supabase } from "@/lib/supabase/client";

// ─── Seasons ────────────────────────────────────────────────────────────────

export async function getSeasons() {
  const { data, error } = await supabase
    .from("seasons")
    .select("*, tournament:tournaments(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSeasonById(id: string) {
  const { data, error } = await supabase
    .from("seasons")
    .select("*, tournament:tournaments(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getActiveSeason() {
  const { data } = await supabase
    .from("seasons")
    .select("*, tournament:tournaments(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data ?? null;
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

export async function getFixtures(seasonId: string, status?: string) {
  let query = supabase
    .from("fixtures")
    .select(`
      *,
      home_player:players!home_player_id(*),
      away_player:players!away_player_id(*)
    `)
    .eq("season_id", seasonId)
    .order("matchday", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getFixturesWithScores(seasonId: string, statusFilter: 'completed' | 'upcoming' | 'all' = 'all') {
  let query = supabase
    .from("fixtures")
    .select(`
      *,
      home_player:players!home_player_id(*),
      away_player:players!away_player_id(*)
    `)
    .eq("season_id", seasonId)
    .order("matchday", { ascending: true });

  if (statusFilter === 'completed') {
    query = query.eq("status", "completed");
  } else if (statusFilter === 'upcoming') {
    query = query.neq("status", "completed");
  }

  const { data: fixturesData } = await query;
  const { data: matchesData } = await supabase.from("matches").select("*");

  if (!fixturesData) return [];

  const matchMap: Record<string, any> = {};
  (matchesData ?? []).forEach((m) => { matchMap[m.fixture_id] = m; });

  return fixturesData.map((f: any) => {
    const match = matchMap[f.id];
    return {
      ...f,
      home_score: match?.home_score ?? 0,
      away_score: match?.away_score ?? 0,
    };
  });
}

// ─── Standings ───────────────────────────────────────────────────────────────

export async function getGroups(seasonId: string) {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("season_id", seasonId)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getLeaderboards(seasonId: string) {
  const { data, error } = await supabase
    .from("leaderboards")
    .select("*, player:players(*)")
    .eq("season_id", seasonId)
    .order("points", { ascending: false })
    .order("goal_difference", { ascending: false })
    .order("goals_for", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getKnockouts(seasonId: string) {
  const { data: fixturesData, error } = await supabase
    .from("fixtures")
    .select(
      "*, matches(*), home_player:players!home_player_id(*), away_player:players!away_player_id(*)"
    )
    .eq("season_id", seasonId)
    .in("stage", ["quarter_final", "semi_final", "final"])
    .order("created_at");
  if (error) throw error;

  const { data: matchesData } = await supabase.from("matches").select("*");
  const matchMap: Record<string, any> = {};
  (matchesData ?? []).forEach((m) => { matchMap[m.fixture_id] = m; });

  return (fixturesData ?? []).map((f: any) => {
    const rawMatch = Array.isArray(f.matches) ? f.matches[0] : f.matches;
    const match = rawMatch || matchMap[f.id];
    const homeP = f.home_player;
    const awayP = f.away_player;
    return {
      ...f,
      home_player: homeP,
      away_player: awayP,
      home: homeP,
      away: awayP,
      home_score: match?.home_score ?? 0,
      away_score: match?.away_score ?? 0,
      matches: match ? [match] : [],
    };
  });
}

// ─── Players ─────────────────────────────────────────────────────────────────

export async function getSeasonPlayers(seasonId: string) {
  const { data, error } = await supabase
    .from("season_enrollments")
    .select("player:players(*)")
    .eq("season_id", seasonId)
    .eq("status", "approved"); // Only show approved players
  if (error) throw error;
  const players = (data ?? [])
    .map((e: any) => e.player)
    .filter(Boolean)
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
  return players;
}

export async function getSeasonEnrollments(seasonId: string) {
  const { data, error } = await supabase
    .from("season_enrollments")
    .select("*, player:players(*)")
    .eq("season_id", seasonId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function checkEnrollmentStatus(seasonId: string, phone: string) {
  const { data, error } = await supabase
    .from("season_enrollments")
    .select("*, player:players(*)")
    .eq("season_id", seasonId)
    .eq("phone", phone)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return data;
}

export async function getPlayerById(id: string) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getPlayerStatsBySlug(slug: string) {
  const { data: player, error: playerErr } = await supabase
    .from("players")
    .select("*")
    .eq("slug", slug)
    .single();
  if (playerErr) throw playerErr;

  const { data: stats } = await supabase
    .from("player_statistics")
    .select("*, season:seasons(name, number)")
    .eq("player_id", player.id);

  const { data: leaderboards } = await supabase
    .from("leaderboards")
    .select("*, season:seasons(name)")
    .eq("player_id", player.id);

  const { data: recentFixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      home_player:players!home_player_id(*),
      away_player:players!away_player_id(*),
      matches(*)
    `)
    .or(`home_player_id.eq.${player.id},away_player_id.eq.${player.id}`)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  return { player, stats: stats ?? [], leaderboards: leaderboards ?? [], recentFixtures: recentFixtures ?? [] };
}

// ─── Match Detail ─────────────────────────────────────────────────────────────

export async function getMatchDetail(fixtureId: string) {
  const { data: fixture, error: fErr } = await supabase
    .from("fixtures")
    .select(`
      *,
      home_player:players!home_player_id(*),
      away_player:players!away_player_id(*),
      season:seasons(*, tournament:tournaments(*))
    `)
    .eq("id", fixtureId)
    .single();
  if (fErr) throw fErr;

  const { data: match } = await supabase
    .from("matches")
    .select("*, statistics(*), ai_reports(*), media(*)")
    .eq("fixture_id", fixtureId)
    .single();

  return { fixture, match: match ?? null };
}

// ─── Global Stats ─────────────────────────────────────────────────────────────

export async function getAllTimeLeaderboard() {
  const { data: players } = await supabase.from("players").select("*");
  const { data: leaderboards } = await supabase
    .from("leaderboards")
    .select("player_id, points, goals_for, season_id, season:seasons(name)");
  const { data: completedFixtures } = await supabase
    .from("fixtures")
    .select("*, matches(*), season:seasons(name)")
    .eq("status", "completed");
  const { data: matchesData } = await supabase.from("matches").select("*");

  const matchMap: Record<string, any> = {};
  (matchesData ?? []).forEach((m) => { matchMap[m.fixture_id] = m; });

  const pointsMap: Record<string, number> = {};
  const goalsMap: Record<string, number> = {};
  const seasonChampions: Record<string, { player_id: string; season_name: string }> = {};
  const seasonMaxPoints: Record<string, { player_id: string; points: number; season_name: string }> = {};

  (leaderboards ?? []).forEach((l: any) => {
    if (l.player_id) {
      pointsMap[l.player_id] = (pointsMap[l.player_id] || 0) + (l.points || 0);
      goalsMap[l.player_id] = (goalsMap[l.player_id] || 0) + (l.goals_for || 0);
    }
    if (
      !seasonMaxPoints[l.season_id] ||
      (l.points || 0) > seasonMaxPoints[l.season_id].points
    ) {
      seasonMaxPoints[l.season_id] = {
        player_id: l.player_id,
        points: l.points || 0,
        season_name: l.season?.name || "Season",
      };
    }
  });

  (completedFixtures ?? []).forEach((f: any) => {
    const rawMatch = Array.isArray(f.matches) ? f.matches[0] : f.matches;
    const match = rawMatch || matchMap[f.id];
    if (!match) return;

    const hs = match.home_score ?? 0;
    const as = match.away_score ?? 0;

    if (f.stage && f.stage !== "group") {
      if (f.home_player_id) {
        goalsMap[f.home_player_id] = (goalsMap[f.home_player_id] || 0) + hs;
        if (hs > as) pointsMap[f.home_player_id] = (pointsMap[f.home_player_id] || 0) + 3;
        else if (hs === as) pointsMap[f.home_player_id] = (pointsMap[f.home_player_id] || 0) + 1;
      }
      if (f.away_player_id) {
        goalsMap[f.away_player_id] = (goalsMap[f.away_player_id] || 0) + as;
        if (as > hs) pointsMap[f.away_player_id] = (pointsMap[f.away_player_id] || 0) + 3;
        else if (hs === as) pointsMap[f.away_player_id] = (pointsMap[f.away_player_id] || 0) + 1;
      }
    }

    if (f.stage === "final") {
      const winnerId = hs > as ? f.home_player_id : as > hs ? f.away_player_id : null;
      if (winnerId) {
        seasonChampions[f.season_id] = {
          player_id: winnerId,
          season_name: f.season?.name || "Season",
        };
      }
    }
  });

  const topsMap: Record<string, string[]> = {};
  const allSeasonIds = new Set([
    ...Object.keys(seasonMaxPoints),
    ...Object.keys(seasonChampions),
  ]);

  allSeasonIds.forEach((sId) => {
    const top = seasonChampions[sId] || seasonMaxPoints[sId];
    if (top?.player_id) {
      if (!topsMap[top.player_id]) topsMap[top.player_id] = [];
      if (!topsMap[top.player_id].includes(top.season_name)) {
        topsMap[top.player_id].push(top.season_name);
      }
    }
  });

  return (players ?? [])
    .map((p: any) => ({
      ...p,
      allTimePoints: pointsMap[p.id] || 0,
      allTimeGoals: goalsMap[p.id] || 0,
      toppedSeasons: topsMap[p.id] || [],
    }))
    .filter((p: any) => p.allTimePoints > 0)
    .sort((a: any, b: any) => b.allTimePoints - a.allTimePoints || b.allTimeGoals - a.allTimeGoals);
}

export async function getQuickStats() {
  const [
    { count: totalMatches },
    { count: totalPlayers },
    { data: goalsData },
  ] = await Promise.all([
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("home_score, away_score"),
  ]);

  const totalGoals = (goalsData ?? []).reduce(
    (sum: number, m: any) => sum + (m.home_score || 0) + (m.away_score || 0),
    0
  );

  return {
    totalMatches: totalMatches ?? 0,
    totalPlayers: totalPlayers ?? 0,
    totalGoals,
  };
}
