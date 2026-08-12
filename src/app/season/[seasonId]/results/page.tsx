"use client";

import { use, useEffect, useState } from "react";
import { useSeason } from "@/contexts/season-context";
import { getFixturesWithScores } from "@/lib/supabase/queries";
import { MatchBox } from "@/components/match/match-box";
import { Loader2 } from "lucide-react";
import { cleanBranding } from "@/lib/utils/branding";

export default function SeasonResultsPage({
  params,
}: {
  params: Promise<{ seasonId: string }>;
}) {
  const { seasonId } = use(params);
  const { season, isLoading: seasonLoading } = useSeason();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seasonId) return;
    setLoading(true);
    getFixturesWithScores(seasonId, true)
      .then((data) => setResults(data))
      .finally(() => setLoading(false));
  }, [seasonId]);

  const groupResults = results.filter((r) => r.stage === "group");
  const knockoutResults = results.filter(
    (r) => r.stage === "quarter_final" || r.stage === "semi_final" || r.stage === "final"
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-8 border-primary pl-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black font-heading uppercase tracking-tighter text-foreground skew-x-[-10deg]">
            <span className="block skew-x-[10deg]">MATCH</span>
            <span className="text-primary block skew-x-[10deg]">RESULTS</span>
          </h1>
          {season && (
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-2">
              {cleanBranding(season.name)} • Latest scores and match history
            </p>
          )}
        </div>
      </div>

      {loading || seasonLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground font-bold uppercase tracking-wider border-2 border-dashed border-border">
          No results yet for this season.
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {knockoutResults.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-yellow-500" />
                <h2 className="text-2xl font-black uppercase tracking-tight font-heading">Knockout Results</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {knockoutResults.map((f) => <MatchBox key={f.id} fixture={f} />)}
              </div>
            </div>
          )}

          {groupResults.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight font-heading">Group Stage Results</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {groupResults.map((f) => <MatchBox key={f.id} fixture={f} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
