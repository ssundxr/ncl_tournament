const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'fixtures'");
  console.log('Fixtures columns:', res.rows.map(r => r.column_name));
  
  const res2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'matches'");
  console.log('Matches columns:', res2.rows.map(r => r.column_name));
  
  await client.query("NOTIFY pgrst, 'reload schema'");
  await client.end();
}
run().catch(console.error);
