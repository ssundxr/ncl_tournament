require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Test each valid status against the actual row
const SEASON_ID = 'c4b66a32-116d-41b9-9ffa-9a2cf9e80518'; // NCL Season 1

async function tryStatus(s) {
  const { error } = await supabase
    .from('seasons')
    .update({ status: s })
    .eq('id', SEASON_ID);
  if (error) {
    console.log(`❌ ${s}: ${error.message}`);
    return false;
  }
  console.log(`✅ ${s}: OK`);
  return true;
}

async function run() {
  const statuses = ['upcoming', 'active', 'in_progress', 'completed', 'cancelled', 'closed', 'paused'];
  for (const s of statuses) {
    const ok = await tryStatus(s);
    if (ok) {
      // Restore to active after success
      await supabase.from('seasons').update({ status: 'active' }).eq('id', SEASON_ID);
    }
  }
}

run().catch(console.error);
