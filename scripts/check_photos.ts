import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name, photo_url, user_id");

  if (error) {
    console.error(error);
    return;
  }

  const withPhoto = players.filter(p => p.photo_url !== null && p.photo_url !== "");
  const withoutPhoto = players.filter(p => p.photo_url === null || p.photo_url === "");

  console.log(`Total players remaining: ${players.length}`);
  console.log(`Players WITH photo: ${withPhoto.length}`);
  console.log(`Players WITHOUT photo: ${withoutPhoto.length}`);

  console.log("\nSample players without photo:");
  withoutPhoto.slice(0, 10).forEach(p => console.log(`- ${p.name}`));
}

run().catch(console.error);
