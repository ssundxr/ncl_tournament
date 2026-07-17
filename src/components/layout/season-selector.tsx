"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ChevronDown, Trophy } from "lucide-react";

export function SeasonSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Read current season from URL
  const urlSeasonId = searchParams.get("season");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const { data, error } = await supabase
          .from("seasons")
          .select("*, tournament:tournaments(*)")
          .order("number", { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setSeasons(data);
          
          // Determine initial selected season
          let initialId = "";
          if (urlSeasonId) {
            const exists = data.some(s => s.id === urlSeasonId);
            if (exists) initialId = urlSeasonId;
          }

          if (!initialId) {
            // Fallback: active season, then fallback to first (latest) season
            const activeSeason = data.find(s => s.status === "active" || s.status === "in_progress");
            initialId = activeSeason ? activeSeason.id : data[0].id;
          }

          setSelectedSeasonId(initialId);

          // If there was no season in the URL, set it so that all links and subcomponents align
          if (!urlSeasonId && initialId) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("season", initialId);
            router.replace(`${pathname}?${params.toString()}`);
          }
        }
      } catch (err) {
        console.error("Error loading seasons in selector:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSeasons();
  }, [urlSeasonId, pathname]);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = e.target.value;
    setSelectedSeasonId(nextId);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", nextId);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-9 w-32 bg-white/5 animate-pulse rounded-md border border-border" />
    );
  }

  if (seasons.length === 0) return null;

  return (
    <div className="relative inline-flex items-center">
      <Trophy className="absolute left-3 w-4 h-4 text-primary pointer-events-none" />
      <select
        value={selectedSeasonId}
        onChange={handleSeasonChange}
        className="h-9 pl-9 pr-8 bg-[#1a1a24] hover:bg-[#222230] border border-border rounded-md text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
      >
        {seasons.map((season) => (
          <option key={season.id} value={season.id} className="bg-[#15151e] text-white">
            {season.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 w-3 h-3 text-muted-foreground pointer-events-none" />
    </div>
  );
}
