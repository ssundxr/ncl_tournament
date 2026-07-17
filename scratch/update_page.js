const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Imports
content = content.replace(
  `import { useEffect, useState, Suspense } from "react";`,
  `import { useEffect, useState, Suspense, useRef } from "react";\nimport * as htmlToImage from "html-to-image";`
);

content = content.replace(
  `import { PlayCircle, Calendar, Trophy, User, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";`,
  `import { PlayCircle, Calendar, Trophy, User, ChevronRight, ChevronLeft, Loader2, Share2, Download } from "lucide-react";`
);

// 2. States
content = content.replace(
  `  const [competitorsSeasonId, setCompetitorsSeasonId] = useState<string | null>(null);`,
  `  // const [competitorsSeasonId, setCompetitorsSeasonId] = useState<string | null>(null); // Removed: Global now
  const competitorsRef = useRef<HTMLDivElement>(null);
  const [sharingCompetitors, setSharingCompetitors] = useState(false);`
);

content = content.replace(
  `        // Use URL parameter or fallback to the latest active season
        const defaultSeason = data.find((s: any) => s.id === seasonParam) || 
                              data.find((s: any) => s.status === 'active') || 
                              data[0];
                              
        setCompetitorsSeasonId(defaultSeason.id);
        setStandingsSeasonId(defaultSeason.id);`,
  `        // Use URL parameter or fallback to the latest active season
        const defaultSeason = data.find((s: any) => s.id === seasonParam) || 
                              data.find((s: any) => s.status === 'active') || 
                              data[0];
                              
        setStandingsSeasonId(defaultSeason.id);`
);

// 3. Load Competitors
const oldLoadCompetitors = `  // Load Top Competitors when selection changes
  useEffect(() => {
    async function loadCompetitors() {
      if (!competitorsSeasonId) return;
      setCompetitorsLoading(true);

      const { data: enrollData } = await supabase
        .from('season_enrollments')
        .select('player:players(*)')
        .eq('season_id', competitorsSeasonId);

      const { data: allLeaderboards } = await supabase
        .from('leaderboards')
        .select('player_id, points');

      const playerPointsMap: Record<string, number> = {};
      if (allLeaderboards) {
        allLeaderboards.forEach((l: any) => {
          if (l.player_id) {
            playerPointsMap[l.player_id] = (playerPointsMap[l.player_id] || 0) + (l.points || 0);
          }
        });
      }

      let enrolledPlayers = enrollData ? enrollData.map((e: any) => {
        if (!e.player) return null;
        return {
          ...e.player,
          allTimePoints: playerPointsMap[e.player.id] || 0
        };
      }).filter(Boolean) : [];

      enrolledPlayers.sort((a: any, b: any) => b.allTimePoints - a.allTimePoints);
      setTopPlayers(enrolledPlayers.slice(0, 3) as any);
      setCompetitorsLoading(false);
    }
    loadCompetitors();
  }, [competitorsSeasonId]);`;

const newLoadCompetitors = `  const handleShareCompetitors = async () => {
    if (!competitorsRef.current) return;
    setSharingCompetitors(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(competitorsRef.current, { 
        quality: 0.95,
        backgroundColor: '#0a0a0a',
        style: { display: 'block' } // Ensure it's visible during render
      });
      
      // If Web Share API is available (usually mobile)
      if (navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'nfl-top-competitors.jpg', { type: 'image/jpeg' });
          await navigator.share({
            title: 'NFL Global Top Competitors',
            files: [file]
          });
        } catch (shareErr) {
          console.warn('Share API failed or cancelled, falling back to download', shareErr);
          triggerDownload(dataUrl, 'nfl-top-competitors.jpg');
        }
      } else {
        // Fallback for desktop
        triggerDownload(dataUrl, 'nfl-top-competitors.jpg');
      }
    } catch (err) {
      console.error("Error generating image:", err);
      alert("Could not generate image for sharing.");
    } finally {
      setSharingCompetitors(false);
    }
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  // Load Global Top Competitors 
  useEffect(() => {
    async function loadGlobalCompetitors() {
      setCompetitorsLoading(true);

      const { data: allPlayers } = await supabase
        .from('players')
        .select('*');

      const { data: allLeaderboards } = await supabase
        .from('leaderboards')
        .select('player_id, points');

      const playerPointsMap: Record<string, number> = {};
      if (allLeaderboards) {
        allLeaderboards.forEach((l: any) => {
          if (l.player_id) {
            playerPointsMap[l.player_id] = (playerPointsMap[l.player_id] || 0) + (l.points || 0);
          }
        });
      }

      let playersWithPoints = allPlayers ? allPlayers.map((p: any) => {
        return {
          ...p,
          allTimePoints: playerPointsMap[p.id] || 0
        };
      }).filter((p: any) => p.allTimePoints > 0) : [];

      playersWithPoints.sort((a: any, b: any) => b.allTimePoints - a.allTimePoints);
      
      // We take top 3 for the main view
      setTopPlayers(playersWithPoints.slice(0, 3) as any);
      setCompetitorsLoading(false);
    }
    loadGlobalCompetitors();
  }, []);`;

content = content.replace(oldLoadCompetitors, newLoadCompetitors);

// 4. Update Header and remove local season selector
const oldHeader = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Top Competitors</h3>
          
          {/* Local Season Selector for Top Competitors */}
          {seasonsList.length > 0 && (
            <div className="flex items-center gap-2 bg-[#1a1a24] border border-border rounded-md px-3 py-1.5 self-start sm:self-auto">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Season:</span>
              <select
                value={competitorsSeasonId || ""}
                onChange={(e) => setCompetitorsSeasonId(e.target.value)}
                className="bg-transparent text-white text-xs font-black uppercase tracking-widest outline-none border-0 cursor-pointer pr-4"
              >
                {seasonsList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#15151e] text-white">
                    {cleanBranding(s.name)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>`;

const newHeader = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Global Top Competitors</h3>
          
          <Button 
            onClick={handleShareCompetitors}
            disabled={sharingCompetitors || topPlayers.length === 0}
            size="sm"
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-[10px] h-8 rounded-sm shadow-[0_0_15px_rgba(225,6,0,0.4)] border border-red-500/50 skew-x-[-10deg]"
          >
            <div className="flex items-center skew-x-[10deg]">
              {sharingCompetitors ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Share2 className="w-3.5 h-3.5 mr-2" />}
              Share F1 Card
            </div>
          </Button>
        </div>`;

content = content.replace(oldHeader, newHeader);

// 5. Add Hidden F1 Card to render
const oldEmptyState = `No registered competitors found for the selected season.`;
const newEmptyState = `No competitors have earned points yet.`;
content = content.replace(oldEmptyState, newEmptyState);

// Add F1 card at the end of the competitors section
const f1CardCode = `
        {/* Hidden F1 Style Card for Image Generation */}
        <div className="absolute -left-[9999px] top-0">
          <div ref={competitorsRef} className="w-[1080px] h-[1920px] bg-[#0a0a0a] relative overflow-hidden flex flex-col p-16 font-sans">
            {/* Background Texture & Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#330000_0%,#0a0a0a_70%)] opacity-80" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute -right-64 top-32 w-[800px] h-[200px] bg-red-600/30 blur-[120px] rounded-full rotate-45" />
            <div className="absolute -left-64 bottom-32 w-[800px] h-[200px] bg-red-600/20 blur-[120px] rounded-full -rotate-45" />
            
            {/* Header */}
            <div className="relative z-10 border-l-[12px] border-red-600 pl-8 mb-24 mt-12">
              <h1 className="text-white text-8xl font-black uppercase italic tracking-tighter leading-none m-0">
                GLOBAL<br/>STANDINGS
              </h1>
              <p className="text-red-500 text-3xl font-bold uppercase tracking-[0.2em] mt-4">Namma Football League</p>
            </div>

            {/* Drivers / Players List */}
            <div className="relative z-10 flex-1 flex flex-col gap-12">
              {topPlayers.map((player, idx) => {
                const isFirst = idx === 0;
                return (
                  <div key={player.id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent skew-x-[-15deg] transform -translate-x-4 opacity-50" />
                    <div className="relative flex items-center bg-[#151515] border border-white/10 skew-x-[-15deg] overflow-hidden p-1">
                      
                      {/* Position / Rank */}
                      <div className={\`w-32 h-32 flex items-center justify-center \${isFirst ? 'bg-red-600 text-white' : 'bg-white/5 text-white/50'}\`}>
                        <div className="skew-x-[15deg]">
                          <span className="text-6xl font-black italic">{(idx + 1).toString().padStart(2, '0')}</span>
                        </div>
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 px-12 flex justify-between items-center bg-[#111] h-32 border-l-4 border-black">
                        <div className="skew-x-[15deg] flex items-center gap-8">
                           {player.photo_url && (
                             <img src={player.photo_url} className="w-20 h-20 rounded-full border-2 border-white/20 object-cover grayscale contrast-125" />
                           )}
                           <div>
                             <p className="text-white/50 text-2xl font-bold uppercase tracking-widest">{player.favorite_team || 'IND'}</p>
                             <h2 className="text-white text-5xl font-black uppercase italic tracking-tight">{player.name}</h2>
                           </div>
                        </div>
                        <div className="skew-x-[15deg] text-right">
                          <p className="text-red-500 text-6xl font-black italic">{(player as any).allTimePoints}</p>
                          <p className="text-white/40 text-xl font-bold uppercase tracking-widest">PTS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-auto border-t border-white/10 pt-12 flex justify-between items-end pb-8">
              <div>
                <p className="text-white/50 text-xl font-bold tracking-widest uppercase">Official Leaderboard</p>
                <p className="text-white text-2xl font-black italic tracking-tighter">NAMMAFOOTBALL.COM</p>
              </div>
              <img src="/logo_nfl.png" className="h-24 opacity-80 grayscale contrast-200" />
            </div>
          </div>
        </div>
`;

content = content.replace(
  `          </div>\n        )}\n      </section>`,
  `          </div>\n        )}\n${f1CardCode}      </section>`
);

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log("Updated page.tsx successfully.");
