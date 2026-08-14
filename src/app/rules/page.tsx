"use client";

import { useEffect, useState, Suspense } from "react";
import { Loader2, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { SeasonFilterBar } from "@/components/common/season-filter-bar";
import { getSeasons } from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

function RulesContent() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rulesLoading, setRulesLoading] = useState(false);

  const [selectedTournament, setSelectedTournament] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [openCategory, setOpenCategory] = useState<string>("");

  const [displayRuleCategories, setDisplayRuleCategories] = useState<any[]>([]);

  useEffect(() => {
    getSeasons()
      .then((sData) => {
        setSeasons(sData);
        if (sData.length > 0) {
          const active = sData.find((s) => s.status === "active") || sData[0];
          setSelectedSeason(active.id);
          if (active.tournament_id) setSelectedTournament(active.tournament_id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    async function fetchRulesForSeason() {
      setRulesLoading(true);
      try {
        let query = supabase.from("tournament_rules").select("*");
        if (selectedSeason !== "all") {
          query = query.or(`season_id.eq.${selectedSeason},season_id.is.null`);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          // Group DB rules by category
          const categoryMap: Record<string, any[]> = {};
          data.forEach((r) => {
            const cat = r.category.toUpperCase();
            if (!categoryMap[cat]) categoryMap[cat] = [];
            categoryMap[cat].push({ title: r.title, content: r.content });
          });

          const formatted = Object.keys(categoryMap).map((cat) => ({
            category: cat,
            items: categoryMap[cat],
          }));

          setDisplayRuleCategories(formatted);
          if (formatted.length > 0) setOpenCategory(formatted[0].category);
        } else {
          setDisplayRuleCategories([]);
          setOpenCategory("");
        }
      } catch (err) {
        console.error("Error fetching rules:", err);
      } finally {
        setRulesLoading(false);
      }
    }

    fetchRulesForSeason();
  }, [selectedSeason]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const activeCategoryData = displayRuleCategories.find(
    (c) => c.category.toUpperCase() === openCategory.toUpperCase()
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground pb-20 print:bg-white print:text-black print:pb-0">
      <SeasonFilterBar
        title="Tournament Rules"
        subtitle="Official Match Regulations, Guidelines & Fair Play Code"
        seasons={seasons}
        selectedTournamentId={selectedTournament}
        selectedSeasonId={selectedSeason}
        onTournamentChange={(tId) => setSelectedTournament(tId)}
        onSeasonChange={(sId) => setSelectedSeason(sId)}
      />

      <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32 py-10">
        {displayRuleCategories.length === 0 && !rulesLoading ? (
          <div className="max-w-xl mx-auto py-16 text-center border-4 border-dashed border-border p-8 bg-card">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase font-heading text-foreground mb-2">
              No Rules Configured
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Rules have not been configured for the selected season in the Admin CMS yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Category Selectors */}
            <div className="space-y-2 print:hidden">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                Rule Categories
              </h3>
              {displayRuleCategories.map((cat) => {
                const catName = cat.category.toUpperCase();
                const isActive = openCategory.toUpperCase() === catName;
                return (
                  <button
                    key={catName}
                    onClick={() => setOpenCategory(catName)}
                    className={`w-full text-left px-4 py-3 font-bold text-xs uppercase tracking-wider border-2 transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-card text-foreground border-border hover:border-foreground"
                    }`}
                  >
                    <span>{catName}</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Main Rule Details Container */}
            <div className="lg:col-span-3 space-y-6">
              <div className="border-b-2 border-border pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary" />
                  <h2 className="text-2xl font-black uppercase tracking-tight font-heading text-foreground">
                    {openCategory}
                  </h2>
                </div>

                <button
                  onClick={() => window.print()}
                  className="hidden md:flex items-center gap-2 bg-foreground text-background font-black uppercase tracking-widest text-xs px-4 py-2 hover:bg-primary transition-colors border-2 border-foreground skew-x-[-10deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
                >
                  <span className="skew-x-[10deg] flex items-center gap-2">
                    <FileText className="w-4 h-4" /> 
                    <span>Download PDF</span>
                  </span>
                </button>
              </div>

              {rulesLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Updating Rules...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeCategoryData?.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-card border-2 border-border p-6 relative group hover:border-primary transition-all shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <span className="w-8 h-8 bg-primary/10 border-2 border-primary text-primary font-mono font-black text-sm flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="space-y-2">
                          <h4 className="font-black text-lg uppercase tracking-tight text-foreground font-heading">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RulesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <RulesContent />
    </Suspense>
  );
}
