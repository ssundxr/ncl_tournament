require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: players } = await supabase.from('players').select('*');
  const playerMap = {};
  players.forEach(p => {
    playerMap[p.id] = p.name;
  });

  const { data: fixtures } = await supabase.from('fixtures').select('*');
  const fixtureMap = {};
  fixtures.forEach(f => {
    fixtureMap[f.id] = f;
  });

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  console.log('--- ACTUAL MATCHES IN DATABASE ---');
  matches.forEach(m => {
    const f = fixtureMap[m.fixture_id];
    if (f) {
      const homeName = playerMap[f.home_player_id] || f.home_player_id;
      const awayName = playerMap[f.away_player_id] || f.away_player_id;
      console.log(`Match ID: ${m.id} | Fixture ID: ${f.id} | ${homeName} vs ${awayName} | Score: [${m.home_score} - ${m.away_score}] | Stage: ${f.stage} | Status: ${f.status}`);
    } else {
      console.log(`Match ID: ${m.id} | Fixture NOT FOUND for fixture_id: ${m.fixture_id}`);
    }
  });
}

run().catch(console.error);
