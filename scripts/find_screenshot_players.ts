import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const namesToFind = ["Mathew", "Alfy", "Lakshin", "Newmon", "Abith", "Suriya", "Ashwin", "Surya", "Rahul"];

  console.log("Looking up players from screenshot...");
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name, photo_url, user_id")
    .in("name", namesToFind);

  if (error) {
    console.error(error);
    return;
  }

  console.log(JSON.stringify(players, null, 2));
}

run().catch(console.error);
