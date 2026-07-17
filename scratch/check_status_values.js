require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Try each possible status value
  const statuses = ['upcoming', 'active', 'completed', 'cancelled', 'in_progress', 'closed', 'inactive', 'enrollment_closed', 'draft'];
  for (const s of statuses) {
    // Just test by doing a dry update check via rpc or just print them
    console.log(`Testing: ${s}`);
  }
  // The real check - try to get constraint info via a test update
  const { error } = await supabase
    .from('seasons')
    .update({ status: 'completed' })
    .eq('id', 'non-existent-id-test'); // Won't match anything
  console.log('completed test:', error ? error.message : 'OK (no match)');

  const { error: e2 } = await supabase
    .from('seasons')
    .update({ status: 'in_progress' })
    .eq('id', 'non-existent-id-test');
  console.log('in_progress test:', e2 ? e2.message : 'OK (no match)');
}

run().catch(console.error);
