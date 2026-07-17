const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Data Aggregation
const oldLoadGlobalCompetitors = `  // Load Global Top Competitors 
  useEffect(() => {
    async function loadGlobalCompetitors() {
      setCompetitorsLoading(true);

      const { data: allPlayers } = await supabase
        .from('players')
        .select('*');

      const { data: allLeaderboards } = await supabase
        .from('leaderboards')
        .select('player_id, points, season_id, season:seasons(name)');

      const playerPointsMap: Record<string, number> = {};
      const seasonMaxPoints: Record<string, { player_id: string, points: number, season_name: string }> = {};

      if (allLeaderboards) {
        allLeaderboards.forEach((l: any) => {
          if (l.player_id) {
            playerPointsMap[l.player_id] = (playerPointsMap[l.player_id] || 0) + (l.points || 0);
          }
          
          if (!seasonMaxPoints[l.season_id] || (l.points > seasonMaxPoints[l.season_id].points)) {
            seasonMaxPoints[l.season_id] = { player_id: l.player_id, points: l.points, season_name: l.season?.name || 'Season' };
          }
        });
      }

      const playerTopsMap: Record<string, string[]> = {};
      Object.values(seasonMaxPoints).forEach(top => {
        if (!playerTopsMap[top.player_id]) playerTopsMap[top.player_id] = [];
        playerTopsMap[top.player_id].push(top.season_name);
      });

      let playersWithPoints = allPlayers ? allPlayers.map((p: any) => {
        return {
          ...p,
          allTimePoints: playerPointsMap[p.id] || 0,
          toppedSeasons: playerTopsMap[p.id] || []
        };
      }).filter((p: any) => p.allTimePoints > 0) : [];

      playersWithPoints.sort((a: any, b: any) => b.allTimePoints - a.allTimePoints);
      
      // We take top 3 for the main view
      setTopPlayers(playersWithPoints.slice(0, 3) as any);
      setCompetitorsLoading(false);
    }
    loadGlobalCompetitors();
  }, []);`;

const newLoadGlobalCompetitors = `  // Load Global Top Competitors 
  useEffect(() => {
    async function loadGlobalCompetitors() {
      setCompetitorsLoading(true);

      const { data: allPlayers } = await supabase
        .from('players')
        .select('*');

      const { data: allLeaderboards } = await supabase
        .from('leaderboards')
        .select('player_id, points, goals_for, season_id, season:seasons(name)');

      const playerPointsMap: Record<string, number> = {};
      const playerGoalsMap: Record<string, number> = {};
      const seasonMaxPoints: Record<string, { player_id: string, points: number, season_name: string }> = {};

      if (allLeaderboards) {
        allLeaderboards.forEach((l: any) => {
          if (l.player_id) {
            playerPointsMap[l.player_id] = (playerPointsMap[l.player_id] || 0) + (l.points || 0);
            playerGoalsMap[l.player_id] = (playerGoalsMap[l.player_id] || 0) + (l.goals_for || 0);
          }
          
          if (!seasonMaxPoints[l.season_id] || (l.points > seasonMaxPoints[l.season_id].points)) {
            seasonMaxPoints[l.season_id] = { player_id: l.player_id, points: l.points, season_name: l.season?.name || 'Season' };
          }
        });
      }

      const playerTopsMap: Record<string, string[]> = {};
      Object.values(seasonMaxPoints).forEach(top => {
        if (!playerTopsMap[top.player_id]) playerTopsMap[top.player_id] = [];
        playerTopsMap[top.player_id].push(top.season_name);
      });

      let playersWithPoints = allPlayers ? allPlayers.map((p: any) => {
        return {
          ...p,
          allTimePoints: playerPointsMap[p.id] || 0,
          allTimeGoals: playerGoalsMap[p.id] || 0,
          toppedSeasons: playerTopsMap[p.id] || []
        };
      }).filter((p: any) => p.allTimePoints > 0) : [];

      playersWithPoints.sort((a: any, b: any) => b.allTimePoints - a.allTimePoints);
      
      // We take top 3 for the main view
      setTopPlayers(playersWithPoints.slice(0, 3) as any);
      setCompetitorsLoading(false);
    }
    loadGlobalCompetitors();
  }, []);`;

content = content.replace(oldLoadGlobalCompetitors, newLoadGlobalCompetitors);

// 2. State & Button logic
const oldStateLogic = `  const competitorsRef = useRef<HTMLDivElement>(null);
  const [sharingCompetitors, setSharingCompetitors] = useState(false);

  const handleShareCompetitors = async () => {
    if (!competitorsRef.current) return;
    setSharingCompetitors(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(competitorsRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
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
  };`;

const newStateLogic = `  const competitorsRef = useRef<HTMLDivElement>(null);
  const [sharingPlayerId, setSharingPlayerId] = useState<string | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<any>(null);

  const handleDownloadCard = async (player: any) => {
    setSelectedPlayerForCard(player);
    setSharingPlayerId(player.id);
    
    // Wait for state to apply and DOM to render the hidden card with new data
    setTimeout(async () => {
      if (!competitorsRef.current) {
        setSharingPlayerId(null);
        return;
      }
      
      try {
        const dataUrl = await htmlToImage.toJpeg(competitorsRef.current, { 
          quality: 1.0, // Maximum quality
          canvasWidth: 2160,
          canvasHeight: 3840,
          pixelRatio: 1,
          style: { display: 'block' }
        });
        
        triggerDownload(dataUrl, \`\${player.name.replace(/\\s+/g, '-').toLowerCase()}-nfl-4k-card.jpg\`);
      } catch (err) {
        console.error("Error generating image:", err);
        alert("Could not generate 4K image for downloading.");
      } finally {
        setSharingPlayerId(null);
        setSelectedPlayerForCard(null);
      }
    }, 500);
  };`;

content = content.replace(oldStateLogic, newStateLogic);

// 3. Remove global share button & update header
const oldHeader = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-8">
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

const newHeader = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Global Top Competitors</h3>
        </div>`;
content = content.replace(oldHeader, newHeader);

// 4. Inject download button in player loop
const oldPlayerCardStart = `<div key={player.id} className="relative flex items-center bg-white border border-gray-200 shadow-sm overflow-hidden p-6 hover:shadow-xl transition-shadow rounded-2xl">`;

const newPlayerCardStart = `<div key={player.id} className="relative flex flex-col md:flex-row md:items-center bg-white border border-gray-200 shadow-sm overflow-hidden p-6 hover:shadow-xl transition-shadow rounded-2xl gap-6">`;
content = content.replace(oldPlayerCardStart, newPlayerCardStart); // Will only replace first instance but let's do a better regex or string replacement

// Need a robust replacement for the player list
const oldPlayersListBlock = `            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {top3.map((item, idx) => {
              if (!item.player) return null;
              const config = getTeamConfig(item.player.favorite_team || "", item.rank);
              const nameParts = item.player.name.split(" ");
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";
              
              return (
                <div 
                  key={item.player.id}
                  className="bg-[#13131a] border border-border rounded-lg p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  {/* ... */}
                </div>
              );
            })}
            </div>`;
// Wait, the current file has the old `top3` map or the new `topPlayers` map?
// Ah! `top3` was the old code. I replaced it with `topPlayers.map` in the previous edit!
// Let's use regex to replace the entire grid.

const oldGridStart = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">`;
// Wait, in my previous edit, did I replace the grid? I didn't!
// Let me look at the previous script. `const f1CardCode = ...`
// Oh, I only added the F1 card AT THE END of the section! I didn't touch the `top3` rendering on the page!
// Oh wow, so the page still renders `top3` using `season_enrollments`. But `loadGlobalCompetitors` doesn't populate `top3`, it populates `topPlayers`.
// Let me fix that. The page UI was broken if `top3` was undefined or derived from something else.
// I need to replace the entire competitor rendering block.

const competitorsUIRegex = /<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">[\s\S]*?<\/section>/;

const newCompetitorsUI = `<div className="flex flex-col gap-6">
            {topPlayers.map((player, idx) => {
              const isFirst = idx === 0;
              const toppedSeasons = (player as any).toppedSeasons || [];
              const isGenerating = sharingPlayerId === player.id;
              
              return (
                <div key={player.id} className="relative flex flex-col md:flex-row items-center justify-between bg-[#13131a] border border-border rounded-xl p-6 hover:border-primary/50 transition-colors gap-6 group">
                  
                  {/* Left Side: Rank & Info */}
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={\`w-16 h-16 rounded-full flex items-center justify-center shrink-0 \${isFirst ? 'bg-primary text-white shadow-[0_0_20px_rgba(225,6,0,0.5)]' : 'bg-white/5 text-white/50'}\`}>
                      <span className="text-3xl font-black">{idx + 1}</span>
                    </div>

                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{player.favorite_team || 'IND'}</p>
                      <h2 className="text-white text-3xl font-black uppercase tracking-tight">{player.name}</h2>
                      
                      {toppedSeasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            Winner
                          </span>
                          {toppedSeasons.map((sName: string, sIdx: number) => (
                            <span key={sIdx} className="bg-white/10 text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                              {sName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Stats & Action */}
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-t border-border md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className="text-center md:text-right">
                      <p className="text-white text-4xl font-black tracking-tighter">{(player as any).allTimePoints}</p>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Total PTS</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-white text-4xl font-black tracking-tighter">{(player as any).allTimeGoals}</p>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Total Gs</p>
                    </div>
                    
                    <Button 
                      onClick={() => handleDownloadCard(player)}
                      disabled={isGenerating}
                      className="bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-lg border-0 shrink-0 shadow-lg ml-4"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      4K Card
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Hidden Unity 4K Aesthetic Card for Image Generation */}
        {selectedPlayerForCard && (
          <div className="overflow-hidden w-0 h-0 absolute -left-[9999px] top-0 pointer-events-none">
            <div ref={competitorsRef} className="w-[2160px] h-[3840px] bg-black relative flex flex-col font-sans tracking-tight">
              
              {/* Unity Cinematic Lighting & Textures */}
              <div className="absolute inset-0 bg-[#050508] z-0" />
              {/* Massive glowing orb behind player */}
              <div className="absolute -right-[400px] top-[200px] w-[1800px] h-[1800px] bg-red-600/40 rounded-full blur-[200px] z-0 mix-blend-screen" />
              <div className="absolute -left-[200px] bottom-[400px] w-[1200px] h-[1200px] bg-blue-600/20 rounded-full blur-[200px] z-0 mix-blend-screen" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-0" />
              <div className="absolute inset-0 border-[40px] border-white/5 z-20 pointer-events-none mix-blend-overlay" />
              
              {/* Massive Player Portrait */}
              <div className="absolute top-0 right-0 w-[1800px] h-[2200px] z-10 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}>
                {selectedPlayerForCard.photo_url ? (
                  <img src={selectedPlayerForCard.photo_url} className="w-full h-full object-cover object-top opacity-90 contrast-125 saturate-50 drop-shadow-[0_0_100px_rgba(225,6,0,0.8)]" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-bl from-gray-800 to-black" />
                )}
              </div>

              {/* Grid / Tech Overlays */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.02)_2px,transparent_2px)] bg-[size:100px_100px] z-0" />

              {/* Official Seal Watermark */}
              <div className="absolute top-32 left-32 z-20 flex flex-col items-center">
                <div className="w-80 h-80 rounded-full border-[12px] border-red-600/80 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xl p-4 text-center shadow-[0_0_80px_rgba(225,6,0,0.4)]">
                  <div className="absolute inset-4 border-[4px] border-dashed border-white/30 rounded-full animate-[spin_20s_linear_infinite]" />
                  <img src="/logo_nfl.png" className="w-32 h-32 object-contain mb-2 opacity-100" />
                  <p className="text-2xl font-black uppercase tracking-[0.4em] text-white leading-tight mt-2 text-center w-full">
                    TOP 1%<br/><span className="text-red-500">ELITE</span>
                  </p>
                </div>
              </div>

              {/* Center Tech HUD Content */}
              <div className="relative z-20 mt-auto px-32 pb-[600px] flex flex-col">
                <p className="text-red-500 text-6xl font-black uppercase tracking-[0.5em] mb-4 drop-shadow-[0_0_20px_rgba(225,6,0,0.8)]">
                  {selectedPlayerForCard.favorite_team || 'IND'}
                </p>
                <h1 className="text-white text-[250px] font-black uppercase tracking-tighter leading-[0.8] mb-12 drop-shadow-2xl mix-blend-overlay opacity-90">
                  {selectedPlayerForCard.name}
                </h1>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 text-[250px] font-black uppercase tracking-tighter leading-[0.8] absolute top-[-5px] left-32 pointer-events-none">
                  {selectedPlayerForCard.name}
                </h1>
                
                {/* HUD Stats Row */}
                <div className="flex gap-24 mt-32 border-t-[4px] border-white/10 pt-16">
                  <div className="flex flex-col">
                    <p className="text-white/50 text-4xl font-bold uppercase tracking-widest mb-4">Total Points</p>
                    <p className="text-white text-[150px] font-black leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                      {(selectedPlayerForCard as any).allTimePoints}
                    </p>
                  </div>
                  <div className="w-[4px] bg-white/10" />
                  <div className="flex flex-col">
                    <p className="text-white/50 text-4xl font-bold uppercase tracking-widest mb-4">Total Goals</p>
                    <p className="text-white text-[150px] font-black leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                      {(selectedPlayerForCard as any).allTimeGoals}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer / Quote */}
              <div className="absolute bottom-0 left-0 w-full h-[450px] bg-gradient-to-t from-red-950 via-black to-transparent z-10 flex items-end justify-between px-32 pb-32">
                <div className="max-w-[1200px]">
                  <p className="text-white/40 text-5xl font-medium italic tracking-wide leading-relaxed font-serif">
                    "Legends are forged in the shadows,<br/>but crowned in the lights."
                  </p>
                  <p className="text-red-500 text-3xl font-black uppercase tracking-[0.3em] mt-8">
                    NAMMAFOOTBALL.COM
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {selectedPlayerForCard.toppedSeasons?.length > 0 && (
                    <div className="flex gap-4 mb-8">
                      {selectedPlayerForCard.toppedSeasons.map((s: string, i: number) => (
                        <div key={i} className="bg-red-600 border border-red-400 px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(225,6,0,0.5)]">
                          <p className="text-white text-3xl font-black uppercase tracking-widest">{s}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <img src="/logo_nfl.png" className="h-40 opacity-50 grayscale contrast-200" />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
`;

content = content.replace(competitorsUIRegex, newCompetitorsUI);

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log("Updated page.tsx with 4K Unity design successfully.");
