require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('season_enrollments')
    .select('payment_status, amount_paid, payment_ref')
    .limit(1);
  if (error) console.error("Error:", error.message);
  else console.log("Columns exist:", JSON.stringify(data, null, 2));
}

run().catch(console.error);
