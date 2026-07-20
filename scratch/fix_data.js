require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixLeaderboards() {
  console.log("Fetching all leaderboards...");
  const { data: leaderboards } = await supabase.from('leaderboards').select('*');
  
  const boardMap = {};
  leaderboards.forEach(b => {
    boardMap[`${b.player_id}_${b.group_id}`] = {
      id: b.id, played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0, form: []
    };
  });

  const { data: fixturesList } = await supabase.from('fixtures').select('*').eq('status', 'completed').eq('stage', 'group');
  const { data: matchesList } = await supabase.from('matches').select('*');

  const matchMap = {};
  matchesList.forEach(m => matchMap[m.fixture_id] = m);

  fixturesList.forEach(f => {
    const match = matchMap[f.id];
    if (!match) return;

    const homeBoard = boardMap[`${f.home_player_id}_${f.group_id}`];
    const awayBoard = boardMap[`${f.away_player_id}_${f.group_id}`];

    if (homeBoard && awayBoard) {
      const hs = match.home_score || 0;
      const as = match.away_score || 0;

      homeBoard.played++; awayBoard.played++;
      homeBoard.goals_for += hs; homeBoard.goals_against += as;
      awayBoard.goals_for += as; awayBoard.goals_against += hs;

      if (hs > as) {
        homeBoard.wins++; homeBoard.points += 3; homeBoard.form.push('W');
        awayBoard.losses++; awayBoard.form.push('L');
      } else if (as > hs) {
        awayBoard.wins++; awayBoard.points += 3; awayBoard.form.push('W');
        homeBoard.losses++; homeBoard.form.push('L');
      } else {
        homeBoard.draws++; homeBoard.points += 1; homeBoard.form.push('D');
        awayBoard.draws++; awayBoard.points += 1; awayBoard.form.push('D');
      }
    }
  });

  for (const key of Object.keys(boardMap)) {
    const b = boardMap[key];
    await supabase.from('leaderboards').update({
      played: b.played, wins: b.wins, draws: b.draws, losses: b.losses,
      goals_for: b.goals_for, goals_against: b.goals_against,
      goal_difference: b.goals_for - b.goals_against,
      points: b.points, form: b.form.slice(-5)
    }).eq('id', b.id);
  }
  console.log("Leaderboards fixed!");
}

async function fixSemiFinals() {
  console.log("Fetching completed semi-finals...");
  const { data: semis } = await supabase.from('fixtures').select('*').eq('stage', 'semi_final').eq('status', 'completed');
  const { data: matches } = await supabase.from('matches').select('*');
  const matchMap = {};
  matches.forEach(m => matchMap[m.fixture_id] = m);

  for (const fixture of semis) {
    const match = matchMap[fixture.id];
    if (!match) continue;

    const hs = match.home_score || 0;
    const as = match.away_score || 0;
    const winnerId = hs > as ? fixture.home_player_id : as > hs ? fixture.away_player_id : null;

    if (winnerId) {
      const { data: finalFixture } = await supabase.from('fixtures')
        .select('*').eq('season_id', fixture.season_id).eq('stage', 'final').single();

      if (finalFixture) {
        if (!finalFixture.home_player_id || finalFixture.home_player_id === winnerId) {
          await supabase.from('fixtures').update({ home_player_id: winnerId }).eq('id', finalFixture.id);
        } else if (!finalFixture.away_player_id || finalFixture.away_player_id === winnerId) {
          await supabase.from('fixtures').update({ away_player_id: winnerId }).eq('id', finalFixture.id);
        }
      } else {
        await supabase.from('fixtures').insert({
          season_id: fixture.season_id,
          stage: 'final',
          home_player_id: winnerId,
          matchday: (fixture.matchday || 100) + 1,
          status: 'scheduled'
        });
      }
    }
  }
  console.log("Semi-finals advanced!");
}

async function run() {
  await fixLeaderboards();
  await fixSemiFinals();
}

run();
