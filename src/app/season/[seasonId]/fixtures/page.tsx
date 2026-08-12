"use client";

import { use, useEffect, useState, useRef } from "react";
import { useSeason } from "@/contexts/season-context";
import { getFixturesWithScores, getKnockouts } from "@/lib/supabase/queries";
import { MatchBox } from "@/components/match/match-box";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as htmlToImage from "html-to-image";
import { cleanBranding } from "@/lib/utils/branding";

export default function SeasonFixturesPage({
  params,
}: {
  params: Promise<{ seasonId: string }>;
}) {
  const { seasonId } = use(params);
  const { season, isLoading: seasonLoading } = useSeason();

  const [fixtures, setFixtures] = useState<any[]>([]);
  const [knockouts, setKnockouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharingFixtures, setSharingFixtures] = useState(false);
  const fixturesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!seasonId) return;
    setLoading(true);
    Promise.all([
      getFixturesWithScores(seasonId, 'all'),
      getKnockouts(seasonId),
    ])
      .then(([f, k]) => {
        setFixtures(f);
        setKnockouts(k);
      })
      .finally(() => setLoading(false));
  }, [seasonId]);

  const handleDownload = async () => {
    if (!fixturesRef.current) return;
    setSharingFixtures(true);
    setTimeout(async () => {
      try {
        const dataUrl = await htmlToImage.toJpeg(fixturesRef.current!, {
          quality: 1.0, pixelRatio: 2, backgroundColor: "#0a0a0a",
        });
        const link = document.createElement("a");
        link.download = "nfl-fixtures.jpg";
        link.href = dataUrl;
        link.click();
      } catch (e) { console.error(e); }
      finally { setSharingFixtures(false); }
    }, 300);
  };

  const groupFixtures = fixtures.filter((f) => f.stage === "group");
  const semis = knockouts.filter((k) => k.stage === "semi_final");
  const quarters = knockouts.filter((k) => k.stage === "quarter_final");
  const finals = knockouts.filter((k) => k.stage === "final");

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-8 border-primary pl-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black font-heading uppercase tracking-tighter text-foreground skew-x-[-10deg]">
            <span className="block skew-x-[10deg]">UPCOMING</span>
            <span className="text-primary block skew-x-[10deg]">FIXTURES</span>
          </h1>
          {season && (
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-2">
              {cleanBranding(season.name)}
            </p>
          )}
        </div>
        <Button
          onClick={handleDownload}
          disabled={sharingFixtures || fixtures.length === 0}
          className="rounded-none bg-foreground text-background font-black uppercase tracking-widest border-2 border-foreground hover:bg-primary hover:border-primary transition-colors"
        >
          {sharingFixtures ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Download Card
        </Button>
      </div>

      {loading || seasonLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : fixtures.length === 0 && knockouts.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground font-bold uppercase tracking-wider">
          No upcoming fixtures for this season.
        </div>
      ) : (
        <div ref={fixturesRef} className="flex flex-col gap-12">
          {/* Knockout Bracket */}
          {(quarters.length > 0 || semis.length > 0 || finals.length > 0) && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-yellow-500" />
                <h2 className="text-2xl font-black uppercase tracking-tight font-heading">Knockout Stage</h2>
              </div>
              <div className="bg-card border-2 border-border p-8 overflow-x-auto">
                <div className="flex items-center justify-center gap-16 min-w-max mx-auto py-4">
                  {quarters.length > 0 && (
                    <div className="flex flex-col gap-8 w-[300px]">
                      <p className="text-xs font-black uppercase text-primary tracking-widest text-center">Quarter-Finals</p>
                      {quarters.map((m) => <MatchBox key={m.id} fixture={m} />)}
                    </div>
                  )}
                  {semis.length > 0 && (
                    <div className="flex flex-col gap-16 w-[300px]">
                      <p className="text-xs font-black uppercase text-primary tracking-widest text-center">Semi-Finals</p>
                      {semis.map((m) => <MatchBox key={m.id} fixture={m} />)}
                    </div>
                  )}
                  {finals.length > 0 && (
                    <div className="flex flex-col justify-center w-[320px] scale-110">
                      <p className="text-xs font-black uppercase text-yellow-500 tracking-widest text-center mb-4">Grand Final</p>
                      <div className="relative">
                        <div className="absolute -inset-3 bg-yellow-500/10 blur-xl rounded-full z-[-1]" />
                        {finals.map((m) => <MatchBox key={m.id} fixture={m} />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Group Stage */}
          {groupFixtures.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight font-heading">Group Stage Fixtures</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {groupFixtures.map((f) => <MatchBox key={f.id} fixture={f} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
