require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: players } = await supabase.from('players').select('*');
  const playerMap = {};
  players.forEach(p => {
    playerMap[p.id] = p.name;
  });

  const { data: groups } = await supabase.from('groups').select('*');
  const groupMap = {};
  groups.forEach(g => {
    groupMap[g.id] = g.name;
  });

  const { data: fixtures, error } = await supabase
    .from('fixtures')
    .select(`
      id,
      group_id,
      matchday,
      home_player_id,
      away_player_id,
      status,
      stage,
      matches (
        home_score,
        away_score,
        home_team,
        away_team
      )
    `);

  if (error) {
    console.error(error);
    return;
  }

  console.log('--- ALL FIXTURES ---');
  fixtures.forEach(f => {
    const homeName = playerMap[f.home_player_id] || f.home_player_id;
    const awayName = playerMap[f.away_player_id] || f.away_player_id;
    const groupName = groupMap[f.group_id] || 'Unknown Group';
    const score = f.matches ? `[${f.matches.home_score} - ${f.matches.away_score}]` : '(No Score)';
    console.log(`${groupName} | Matchday ${f.matchday} | ${homeName} vs ${awayName} | Status: ${f.status} | Score: ${score}`);
  });
}

run().catch(console.error);
