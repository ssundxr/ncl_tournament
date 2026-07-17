require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: leaderboards, error } = await supabase
    .from('leaderboards')
    .select('*, player:players(name)');

  if (error) {
    console.error(error);
    return;
  }

  console.log('--- LEADERBOARDS ---');
  leaderboards.forEach(l => {
    console.log(`Player: ${l.player.name} | Group ID: ${l.group_id} | P: ${l.played} | W: ${l.wins} | D: ${l.draws} | L: ${l.losses} | GF: ${l.goals_for} | GA: ${l.goals_against} | GD: ${l.goal_difference} | PTS: ${l.points}`);
  });
}

run().catch(console.error);
