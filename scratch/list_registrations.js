require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // List all tables by checking registrations/enrollments
  const { data: regs, error: regsErr } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (!regsErr) {
    console.log('--- REGISTRATIONS ---');
    console.log(JSON.stringify(regs, null, 2));
  } else {
    console.log('registrations table error:', regsErr.message);
  }
}

run().catch(console.error);
