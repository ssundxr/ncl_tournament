import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: players, error } = await supabase
    .from("players")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total players: ${players?.length}`);
  
  const playersWithUserId = players?.filter(p => p.user_id !== null);
  const playersWithoutUserId = players?.filter(p => p.user_id === null);
  
  console.log(`Players with user_id: ${playersWithUserId?.length}`);
  console.log(`Players without user_id: ${playersWithoutUserId?.length}`);
  
  // Show a sample of players with user_id to see if they are gmail users
  if (playersWithUserId && playersWithUserId.length > 0) {
    console.log("Sample players with user_id:");
    playersWithUserId.slice(0, 5).forEach(p => {
      console.log(`- ${p.name} (user_id: ${p.user_id})`);
    });
  }
}

run().catch(console.error);
