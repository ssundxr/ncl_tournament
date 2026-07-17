require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from("group_players")
    .select("*");

  if (error) console.error(error);
  else console.log("group_players:", data.length > 0 ? data.slice(0, 5) : "Empty");
}

run().catch(console.error);
