require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log('Querying matches using public ANON key...');
  const { data, error } = await supabase.from('matches').select('*');
  if (error) {
    console.error('Error querying matches:', error);
  } else {
    console.log('Successfully fetched matches count:', data ? data.length : 0);
    console.log('First match data:', data?.[0]);
  }

  console.log('\nQuerying fixtures using public ANON key...');
  const { data: fixtures, error: fixError } = await supabase.from('fixtures').select('*').limit(2);
  if (fixError) {
    console.error('Error querying fixtures:', fixError);
  } else {
    console.log('Successfully fetched fixtures count:', fixtures ? fixtures.length : 0);
  }
}

test().catch(console.error);
