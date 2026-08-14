const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeTestKnockouts() {
  const seasonId = 'b6f062b7-d047-4045-bb0b-277d21e9faff'; // Test season
  console.log("Wiping all knockouts for test season...");
  const { data, error } = await supabase
    .from('fixtures')
    .delete()
    .eq('season_id', seasonId)
    .in('stage', ['round_of_16', 'quarter_final', 'semi_final', 'final'])
    .select();
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Deleted ${data?.length || 0} knockout matches.`);
  }
}
wipeTestKnockouts();
