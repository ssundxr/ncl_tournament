const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace loadGlobalCompetitors to include topped seasons logic
const oldLoadGlobalCompetitors = `  // Load Global Top Competitors 
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

const newLoadGlobalCompetitors = `  // Load Global Top Competitors 
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

content = content.replace(oldLoadGlobalCompetitors, newLoadGlobalCompetitors);

// Replace the Share card rendering
const oldCardRegex = /\{\/\* Hidden F1 Style Card for Image Generation \*\/\}[\s\S]*?className="absolute -left-\[9999px\] top-0"[\s\S]*?<\/div>\n        <\/div>/;

const newCardCode = `{/* Hidden F1 Style Card for Image Generation */}
        <div className="absolute -left-[9999px] top-0">
          <div ref={competitorsRef} className="w-[1080px] h-[1920px] bg-white relative overflow-hidden flex flex-col p-20 font-sans tracking-tight">
            {/* Minimalist Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,#f8f8f8_0%,#ffffff_100%)] opacity-100" />
            <div className="absolute -right-32 top-32 w-[600px] h-[600px] bg-gray-50 rounded-full blur-[80px]" />
            <div className="absolute top-0 right-0 w-1/3 h-full border-l border-gray-100" />
            
            {/* Header & Seal */}
            <div className="relative z-10 flex justify-between items-start mb-24 mt-12">
              <div>
                <h1 className="text-black text-7xl font-black uppercase tracking-tighter leading-none m-0">
                  NFL LEAGUE
                </h1>
                <p className="text-gray-500 text-3xl font-medium tracking-[0.3em] mt-6">GLOBAL COMPETITORS</p>
              </div>
              
              {/* NFL Official Seal */}
              <div className="w-48 h-48 rounded-full border-[6px] border-black flex flex-col items-center justify-center bg-white p-2 text-center rotate-[-15deg] shadow-2xl relative">
                <div className="absolute inset-2 border-[2px] border-dashed border-black rounded-full" />
                <img src="/logo_nfl.png" className="w-16 h-16 object-contain mb-1 opacity-90 grayscale contrast-125" />
                <p className="text-[10px] font-black uppercase tracking-widest text-black leading-tight mt-2 w-32">
                  Top 1 Player<br/>NFL League
                </p>
                <div className="w-12 h-1 bg-black mt-2 rounded-full" />
              </div>
            </div>

            {/* Players List Minimalist */}
            <div className="relative z-10 flex-1 flex flex-col gap-16 mt-12">
              {topPlayers.map((player, idx) => {
                const isFirst = idx === 0;
                const toppedSeasons = (player as any).toppedSeasons || [];
                return (
                  <div key={player.id} className="relative flex items-center bg-white border border-gray-200 shadow-sm overflow-hidden p-6 hover:shadow-xl transition-shadow rounded-2xl">
                    
                    {/* Position / Rank */}
                    <div className={\`w-24 h-24 rounded-full flex items-center justify-center shrink-0 \${isFirst ? 'bg-black text-white' : 'bg-gray-100 text-black'}\`}>
                      <span className="text-5xl font-black">{idx + 1}</span>
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 px-10 flex flex-col justify-center">
                      <p className="text-gray-400 text-lg font-bold uppercase tracking-widest mb-1">{player.favorite_team || 'IND'}</p>
                      <h2 className="text-black text-5xl font-black uppercase tracking-tight">{player.name}</h2>
                      
                      {/* Seasons Topped */}
                      {toppedSeasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-gray-100 text-gray-500 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Winner
                          </span>
                          {toppedSeasons.map((sName: string, sIdx: number) => (
                            <span key={sIdx} className="bg-black text-white text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {sName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0 border-l border-gray-100 pl-10 pr-6">
                      <p className="text-black text-7xl font-black tracking-tighter">{(player as any).allTimePoints}</p>
                      <p className="text-gray-400 text-lg font-bold uppercase tracking-widest mt-1">Total PTS</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-auto border-t-[3px] border-black pt-12 flex justify-between items-end">
              <div>
                <p className="text-gray-500 text-lg font-bold tracking-widest uppercase mb-2">Cumulative Seasons Leaderboard</p>
                <p className="text-black text-3xl font-black tracking-tight">nfl.sundxr.dev</p>
              </div>
              <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center p-4">
                 <img src="/logo_nfl.png" className="w-full h-full object-contain grayscale opacity-60" />
              </div>
            </div>
          </div>
        </div>`;

content = content.replace(oldCardRegex, newCardCode);

// Also need to change html-to-image config from toJpeg to toPng maybe for better white BG quality, or just update the backgroundColor in toJpeg to #ffffff
content = content.replace(
  `backgroundColor: '#0a0a0a',`,
  `backgroundColor: '#ffffff',`
);

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log("Updated page.tsx with minimalist F1 seal design successfully.");
