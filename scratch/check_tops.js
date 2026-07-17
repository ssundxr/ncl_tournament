require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: allLeaderboards, error } = await supabase
    .from('leaderboards')
    .select('player_id, points, season_id, season:seasons(*)');

  if (error) console.error(error);
  else {
     // Find who topped each season
     const seasonTop = {};
     allLeaderboards.forEach(l => {
       if (!seasonTop[l.season_id] || l.points > seasonTop[l.season_id].points) {
         seasonTop[l.season_id] = { player_id: l.player_id, points: l.points, season_name: l.season?.name };
       }
     });
     console.log("Season Tops:", seasonTop);
  }
}

run().catch(console.error);
