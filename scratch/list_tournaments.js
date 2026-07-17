require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('id, name, slug, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  console.log('--- TOURNAMENTS ---');
  data.forEach(t => {
    console.log(`ID: ${t.id} | Name: ${t.name} | Slug: ${t.slug} | Status: ${t.status} | Created: ${t.created_at}`);
  });
}

run().catch(console.error);
