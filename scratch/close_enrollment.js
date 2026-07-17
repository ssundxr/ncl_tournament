require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase
    .from('seasons')
    .update({ status: 'completed' })
    .eq('id', 'c4b66a32-116d-41b9-9ffa-9a2cf9e80518'); // NCL Season 1

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ NCL Season 1 enrollment closed (status: completed).');
  }
}

run().catch(console.error);
