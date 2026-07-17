require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Try player_registrations
  const tables = ['player_registrations', 'enrollments', 'season_registrations', 'tournament_registrations'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(5);
    if (!error) {
      console.log(`\n--- ${table.toUpperCase()} ---`);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`${table}: NOT FOUND`);
    }
  }
  
  // Also check for any test players
  const { data: players, error: pErr } = await supabase
    .from('players')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (!pErr) {
    console.log('\n--- RECENT PLAYERS ---');
    players.forEach(p => console.log(`ID: ${p.id} | Name: ${p.name} | Created: ${p.created_at}`));
  }
}

run().catch(console.error);
