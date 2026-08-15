import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function generateToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like I, 1, O, 0
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function run() {
  console.log("Generating Temporary IDs for all unmapped players...");

  const { data: players, error: fetchError } = await supabase
    .from("players")
    .select("id, name, claim_token")
    .is("user_id", null);

  if (fetchError) {
    console.error("Error fetching players:", fetchError);
    return;
  }

  if (!players || players.length === 0) {
    console.log("No unmapped players found.");
    return;
  }

  const results = [];

  for (const player of players) {
    let token = player.claim_token;
    if (!token) {
      token = generateToken();
      const { error: updateError } = await supabase
        .from("players")
        .update({ claim_token: token })
        .eq("id", player.id);
      
      if (updateError) {
        console.error(`Failed to update token for ${player.name}:`, updateError);
        continue;
      }
    }
    results.push({ name: player.name, temporary_id: token });
  }

  console.log("\n======================================");
  console.log("TEMPORARY IDs GENERATED SUCCESSFULLY");
  console.log("======================================\n");
  
  results.forEach(r => {
    console.log(`${r.name.padEnd(20)} : ${r.temporary_id}`);
  });
  
  console.log("\nShare these codes with the players!");
}

run().catch(console.error);
