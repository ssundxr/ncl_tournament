const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const regexToReplace = /<div className="flex flex-col gap-6">[\s\S]*?<\/section>/;

const newContent = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {topPlayers.map((player, idx) => {
              const nameParts = player.name.split(" ");
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";
              const isGenerating = sharingPlayerId === player.id;
              
              return (
                <div 
                  key={player.id}
                  className="bg-[#13131a] border border-border rounded-lg p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{player.favorite_team || 'IND'}</span>
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Rank</span>
                      <span className="text-white text-5xl font-black tabular-nums tracking-tighter leading-none">{idx + 1}</span>
                    </div>
                    {player.photo_url ? (
                      <img src={player.photo_url} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-border/50 shadow-lg grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-border/30 flex items-center justify-center border-2 border-border/50 shadow-lg">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight leading-none mb-1">{firstName}</h3>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-4">{lastName}</h3>
                    
                    <div className="flex items-end justify-between border-t border-white/5 pt-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Total PTS</span>
                        <span className="text-white text-3xl font-black tracking-tighter leading-none">{(player as any).allTimePoints}</span>
                      </div>
                      
                      <Button 
                        onClick={() => handleDownloadCard(player)}
                        disabled={isGenerating}
                        size="sm"
                        className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest text-[10px] h-8 rounded-sm"
                      >
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                        4K Card
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Hidden Unity 4K Aesthetic Card for Image Generation */}
        {selectedPlayerForCard && (
          <div className="fixed -left-[5000px] top-0 opacity-0 pointer-events-none z-[-100]">
            <div ref={competitorsRef} className="w-[1080px] h-[1920px] bg-black relative flex flex-col font-sans tracking-tight">
              
              {/* Unity Cinematic Lighting & Textures */}
              <div className="absolute inset-0 bg-[#050508] z-0" />
              {/* Massive glowing orb behind player */}
              <div className="absolute -right-[200px] top-[100px] w-[900px] h-[900px] bg-red-600/40 rounded-full blur-[100px] z-0 mix-blend-screen" />
              <div className="absolute -left-[100px] bottom-[200px] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] z-0 mix-blend-screen" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-0" />
              <div className="absolute inset-0 border-[20px] border-white/5 z-20 pointer-events-none mix-blend-overlay" />
              
              {/* Massive Player Portrait */}
              <div className="absolute top-0 right-0 w-[900px] h-[1100px] z-10 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}>
                {selectedPlayerForCard.photo_url ? (
                  <img src={selectedPlayerForCard.photo_url} className="w-full h-full object-cover object-top opacity-90 contrast-125 saturate-50 drop-shadow-[0_0_50px_rgba(225,6,0,0.8)]" crossOrigin="anonymous" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-bl from-gray-800 to-black" />
                )}
              </div>

              {/* Grid / Tech Overlays */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.02)_2px,transparent_2px)] bg-[size:50px_50px] z-0" />

              {/* Official Seal Watermark */}
              <div className="absolute top-16 left-16 z-20 flex flex-col items-center">
                <div className="w-40 h-40 rounded-full border-[6px] border-red-600/80 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xl p-2 text-center shadow-[0_0_40px_rgba(225,6,0,0.4)]">
                  <div className="absolute inset-2 border-[2px] border-dashed border-white/30 rounded-full animate-[spin_20s_linear_infinite]" />
                  <img src="/logo_nfl.png" className="w-16 h-16 object-contain mb-1 opacity-100" crossOrigin="anonymous" />
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-white leading-tight mt-1 text-center w-full">
                    TOP 1%<br/><span className="text-red-500">ELITE</span>
                  </p>
                </div>
              </div>

              {/* Center Tech HUD Content */}
              <div className="relative z-20 mt-auto px-16 pb-[300px] flex flex-col">
                <p className="text-red-500 text-3xl font-black uppercase tracking-[0.5em] mb-2 drop-shadow-[0_0_10px_rgba(225,6,0,0.8)]">
                  {selectedPlayerForCard.favorite_team || 'IND'}
                </p>
                <h1 className="text-white text-[120px] font-black uppercase tracking-tighter leading-[0.85] mb-6 drop-shadow-2xl mix-blend-overlay opacity-90 break-words">
                  {selectedPlayerForCard.name}
                </h1>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 text-[120px] font-black uppercase tracking-tighter leading-[0.85] absolute top-[-5px] left-16 pointer-events-none break-words">
                  {selectedPlayerForCard.name}
                </h1>
                
                {/* HUD Stats Row */}
                <div className="flex gap-12 mt-16 border-t-[2px] border-white/10 pt-8">
                  <div className="flex flex-col">
                    <p className="text-white/50 text-2xl font-bold uppercase tracking-widest mb-2">Total Points</p>
                    <p className="text-white text-[75px] font-black leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      {(selectedPlayerForCard as any).allTimePoints}
                    </p>
                  </div>
                  <div className="w-[2px] bg-white/10" />
                  <div className="flex flex-col">
                    <p className="text-white/50 text-2xl font-bold uppercase tracking-widest mb-2">Total Goals</p>
                    <p className="text-white text-[75px] font-black leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      {(selectedPlayerForCard as any).allTimeGoals}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer / Quote */}
              <div className="absolute bottom-0 left-0 w-full h-[250px] bg-gradient-to-t from-red-950 via-black to-transparent z-10 flex items-end justify-between px-16 pb-16">
                <div className="max-w-[600px]">
                  <p className="text-white/40 text-2xl font-medium italic tracking-wide leading-relaxed font-serif">
                    "Legends are forged in the shadows,<br/>but crowned in the lights."
                  </p>
                  <p className="text-red-500 text-xl font-black uppercase tracking-[0.3em] mt-4">
                    NAMMAFOOTBALL.COM
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {selectedPlayerForCard.toppedSeasons?.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {selectedPlayerForCard.toppedSeasons.map((s, i) => (
                        <div key={i} className="bg-red-600 border border-red-400 px-4 py-2 rounded-md shadow-[0_0_15px_rgba(225,6,0,0.5)]">
                          <p className="text-white text-xl font-black uppercase tracking-widest">{s}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <img src="/logo_nfl.png" className="h-20 opacity-50 grayscale contrast-200" crossOrigin="anonymous" />
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </section>`;

if (regexToReplace.test(content)) {
    content = content.replace(regexToReplace, newContent);
    fs.writeFileSync('src/app/page.tsx', content, 'utf8');
    console.log("Successfully reverted frontend design and fixed image card size.");
} else {
    console.error("Regex did not match anything.");
}
