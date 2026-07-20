require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const seasonId = 'c4b66a32-116d-41b9-9ffa-9a2cf9e80518';
  const { data: gData, error: gError } = await supabase
    .from("fixtures")
    .select("*, home_player:players!home_player_id(*), away_player:players!away_player_id(*)")
    .limit(2);

  if (gError) console.error(gError);
  else console.log(JSON.stringify(gData, null, 2));
}

run().catch(console.error);
