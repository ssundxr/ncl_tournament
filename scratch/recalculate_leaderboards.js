require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function recalculate() {
  console.log('Fetching all seasons...');
  const { data: seasons } = await supabase.from('seasons').select('*');
  if (!seasons || seasons.length === 0) {
    console.log('No seasons found.');
    return;
  }

  for (const season of seasons) {
    console.log(`\nProcessing Season: ${season.name} (ID: ${season.id})...`);

    // Fetch all leaderboard entries for this season
    const { data: leaderboards, error: lbError } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('season_id', season.id);

    if (lbError) {
      console.error(`Error fetching leaderboards for season ${season.id}:`, lbError);
      continue;
    }

    if (!leaderboards || leaderboards.length === 0) {
      console.log('No leaderboard entries found for this season. Skipping...');
      continue;
    }

    // Reset stats map
    const boardMap = {};
    leaderboards.forEach(b => {
      boardMap[`${b.player_id}_${b.group_id}`] = {
        id: b.id,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        points: 0,
        form: []
      };
    });

    // Fetch completed group stage fixtures for this season
    const { data: fixtures, error: fixError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('season_id', season.id)
      .eq('status', 'completed')
      .eq('stage', 'group');

    if (fixError) {
      console.error(`Error fetching fixtures for season ${season.id}:`, fixError);
      continue;
    }

    // Fetch all match scores
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('*');

    if (matchError) {
      console.error(`Error fetching matches:`, matchError);
      continue;
    }

    // Map match scores by fixture_id
    const matchMap = {};
    matches.forEach(m => {
      matchMap[m.fixture_id] = m;
    });

    console.log(`Found ${fixtures ? fixtures.length : 0} completed group fixtures.`);

    if (fixtures) {
      fixtures.forEach(f => {
        const match = matchMap[f.id];
        if (!match) {
          console.warn(`Warning: Fixture ${f.id} status is completed but has no match score record.`);
          return;
        }

        const homeBoard = boardMap[`${f.home_player_id}_${f.group_id}`];
        const awayBoard = boardMap[`${f.away_player_id}_${f.group_id}`];

        if (homeBoard && awayBoard) {
          const hs = match.home_score ?? 0;
          const as = match.away_score ?? 0;

          homeBoard.played++;
          awayBoard.played++;
          homeBoard.goals_for += hs;
          homeBoard.goals_against += as;
          awayBoard.goals_for += as;
          awayBoard.goals_against += hs;

          if (hs > as) {
            homeBoard.wins++;
            homeBoard.points += 3;
            homeBoard.form.push('W');

            awayBoard.losses++;
            awayBoard.form.push('L');
          } else if (as > hs) {
            awayBoard.wins++;
            awayBoard.points += 3;
            awayBoard.form.push('W');

            homeBoard.losses++;
            homeBoard.form.push('L');
          } else {
            homeBoard.draws++;
            homeBoard.points += 1;
            homeBoard.form.push('D');

            awayBoard.draws++;
            awayBoard.points += 1;
            awayBoard.form.push('D');
          }
        }
      });
    }

    // Update leaderboards in Supabase
    console.log('Updating leaderboard entries in Supabase...');
    for (const key of Object.keys(boardMap)) {
      const b = boardMap[key];
      const { error: updateError } = await supabase
        .from('leaderboards')
        .update({
          played: b.played,
          wins: b.wins,
          draws: b.draws,
          losses: b.losses,
          goals_for: b.goals_for,
          goals_against: b.goals_against,
          points: b.points,
          form: b.form.slice(-5) // Store last 5 matches
        })
        .eq('id', b.id);

      if (updateError) {
        console.error(`Error updating leaderboard row ${b.id}:`, updateError);
      }
    }
    console.log(`Season ${season.name} standings recalculated successfully!`);
  }

  console.log('\nRecalculation complete.');
}

recalculate().catch(console.error);
