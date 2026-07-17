require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPhone() {
  console.log('Fetching columns from players table...');
  const { data, error } = await supabase.from('players').select('*').limit(1);
  if (error) {
    console.error('Error fetching players:', error);
  } else {
    console.log('Player row fields:', Object.keys(data[0] || {}));
  }
}

checkPhone().catch(console.error);
