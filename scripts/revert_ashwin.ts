import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = "ashwinfejl6@gmail.com";
  const playerName = "ashwin";

  console.log(`Reverting migration for ${playerName}...`);

  // 1. Reset user_id in players table
  const { data: players, error: fetchError } = await supabase
    .from("players")
    .select("id, user_id")
    .ilike("name", playerName);

  if (!fetchError && players && players.length > 0) {
    const player = players[0];
    if (player.user_id) {
      const { error: updateError } = await supabase
        .from("players")
        .update({ user_id: null })
        .eq("id", player.id);
      
      if (!updateError) {
        console.log(`Reset user_id to null for player ${player.id}`);
      } else {
        console.error("Error resetting user_id:", updateError);
      }
    } else {
      console.log("Player already has null user_id.");
    }
  }

  // 2. Delete the Supabase Auth user if it exists
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (!listError && usersData && usersData.users) {
    const existingUser = usersData.users.find(u => u.email === email);
    if (existingUser) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
      if (!deleteError) {
        console.log(`Deleted Supabase Auth user ${existingUser.id}`);
      } else {
        console.error("Error deleting auth user:", deleteError);
      }
    } else {
      console.log(`No Supabase Auth user found for ${email}`);
    }
  }
}

run().catch(console.error);
