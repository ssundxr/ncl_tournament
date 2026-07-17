require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('seasons')
    .select('id, name, tournament_id, status, created_at, tournaments(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  console.log('--- SEASONS ---');
  data.forEach(s => {
    console.log(`ID: ${s.id} | Name: ${s.name} | Tournament: ${s.tournaments?.name} | Status: ${s.status} | Created: ${s.created_at}`);
  });
}

run().catch(console.error);
