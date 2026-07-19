const fs = require('fs');
const { execSync } = require('child_process');

// 1. Revert the file to HEAD
const contentHead = execSync('git show HEAD:src/app/page.tsx', { encoding: 'utf8' });
let content = contentHead;

// 2. We need to find the "Global Top Competitors" section and replace its map
const globalTopCompetitorsIndex = content.indexOf('Global Top Competitors');
const mapStartIndex = content.indexOf('{topPlayers.map((player, idx) => {', globalTopCompetitorsIndex);

const mapOldStr = `{topPlayers.map((player, idx) => {
              const nameParts = player.name.split(" ");`;

const mapNewStr = `{(() => {
            const rankedPlayers = topPlayers.map((player, idx) => ({ player, rank: idx + 1 }));
            let displayPlayers = [...rankedPlayers];
            if (rankedPlayers.length === 3) {
              displayPlayers = [rankedPlayers[1], rankedPlayers[0], rankedPlayers[2]];
            } else if (rankedPlayers.length === 2) {
              displayPlayers = [rankedPlayers[0], rankedPlayers[1]];
            }
            return displayPlayers.map(({ player, rank }, idx) => {
              const nameParts = player.name.split(" ");`;

content = content.replace(mapOldStr, mapNewStr);

// Now fix the end of the map.
// The map for "Global Top Competitors" ends with:
/*
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Hidden Unity 4K Aesthetic Card for Image Generation *\/}
*/
const mapEndStr = `                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Hidden Unity 4K Aesthetic Card for Image Generation */`;

const mapEndNewStr = `                    </div>
                  </div>
                </div>
              );
            })})()}
          </div>

        {/* Hidden Unity 4K Aesthetic Card for Image Generation */`;

content = content.replace(mapEndStr, mapEndNewStr);

// We need to change idx + 1 to rank for the display.
// inside the Global Top Competitors grid, there is this span:
// <span className="text-white text-5xl font-black tabular-nums tracking-tighter leading-none">{idx + 1}</span>
const spanOld = `<span className="text-white text-5xl font-black tabular-nums tracking-tighter leading-none">{idx + 1}</span>`;
const spanNew = `<span className="text-white text-5xl font-black tabular-nums tracking-tighter leading-none">{rank}</span>`;
// We only want to replace it after globalTopCompetitorsIndex
const beforeSpan = content.substring(0, globalTopCompetitorsIndex);
const afterSpan = content.substring(globalTopCompetitorsIndex).replace(spanOld, spanNew);
content = beforeSpan + afterSpan;


// 3. Remove grayscale effect from frontend UI
// We only want to replace the `grayscale group-hover:grayscale-0` for the Global Top Competitors section.
const beforeGray = content.substring(0, globalTopCompetitorsIndex);
const afterGray = content.substring(globalTopCompetitorsIndex).replace(/grayscale group-hover:grayscale-0/g, 'grayscale-0');
content = beforeGray + afterGray;

// 4. Fix 4K card layout (replace the hidden card entirely)
const oldCardRegex = /\{\/\* Hidden Unity 4K Aesthetic Card for Image Generation \*\/\}[\s\S]*?(?=\{\/\* Standings \*\/)/;

const newCard = `{/* Hidden Unity 4K Aesthetic Card for Image Generation */}
        {selectedPlayerForCard && (
          <div className="fixed -left-[5000px] top-0 opacity-0 pointer-events-none z-[-100]">
            <div ref={competitorsRef} className="w-[1080px] h-[1920px] bg-[#050508] relative flex flex-col font-sans tracking-tight overflow-hidden">
              
              {/* Massive Player Portrait Background */}
              <div className="absolute inset-0 z-0">
                {selectedPlayerForCard.photo_url ? (
                  <img src={selectedPlayerForCard.photo_url} className="w-full h-full object-cover object-top opacity-90 contrast-125 saturate-50" crossOrigin="anonymous" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-bl from-gray-800 to-black" />
                )}
                {/* Fade out top and bottom */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/80 via-transparent to-[#050508]" />
              </div>

              {/* Grid / Tech Overlays */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.02)_2px,transparent_2px)] bg-[size:50px_50px] z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-10 pointer-events-none" />
              <div className="absolute inset-0 border-[20px] border-white/5 z-20 pointer-events-none mix-blend-overlay" />

              {/* Glowing Orbs */}
              <div className="absolute -right-[200px] top-[100px] w-[900px] h-[900px] bg-red-600/40 rounded-full blur-[100px] z-10 mix-blend-screen pointer-events-none" />
              <div className="absolute -left-[100px] bottom-[200px] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] z-10 mix-blend-screen pointer-events-none" />
              
              {/* Official Seal Watermark */}
              <div className="absolute top-16 left-16 z-30 flex flex-col items-center">
                <div className="w-40 h-40 rounded-full border-[6px] border-red-600/80 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xl p-2 text-center shadow-[0_0_40px_rgba(225,6,0,0.4)]">
                  <div className="absolute inset-2 border-[2px] border-dashed border-white/30 rounded-full animate-[spin_20s_linear_infinite]" />
                  <img src="/logo_nfl.png" className="w-16 h-16 object-contain mb-1 opacity-100" crossOrigin="anonymous" />
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-white leading-tight mt-1 text-center w-full">
                    TOP 1%<br/><span className="text-red-500">ELITE</span>
                  </p>
                </div>
              </div>

              {/* Center Tech HUD Content */}
              <div className="absolute bottom-[250px] left-16 right-16 z-30 flex flex-col">
                <p className="text-red-500 text-3xl font-black uppercase tracking-[0.5em] mb-2 drop-shadow-[0_0_10px_rgba(225,6,0,1)]">
                  {selectedPlayerForCard.favorite_team || 'IND'}
                </p>
                
                <div className="relative">
                  <h1 className="text-white text-[120px] font-black uppercase tracking-tighter leading-[0.85] mb-6 drop-shadow-2xl mix-blend-overlay opacity-90 break-words">
                    {selectedPlayerForCard.name}
                  </h1>
                  <h1 className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 text-[120px] font-black uppercase tracking-tighter leading-[0.85] absolute top-[-5px] left-0 pointer-events-none break-words">
                    {selectedPlayerForCard.name}
                  </h1>
                </div>
                
                {/* HUD Stats Row */}
                <div className="flex gap-12 mt-12 border-t-[4px] border-white/20 pt-8 bg-black/30 backdrop-blur-sm p-8 rounded-2xl w-max border border-white/10">
                  <div className="flex flex-col">
                    <p className="text-white/70 text-2xl font-bold uppercase tracking-widest mb-2">Total Points</p>
                    <p className="text-white text-[85px] font-black leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                      {(selectedPlayerForCard as any).allTimePoints}
                    </p>
                  </div>
                  <div className="w-[4px] bg-white/20 rounded-full" />
                  <div className="flex flex-col">
                    <p className="text-white/70 text-2xl font-bold uppercase tracking-widest mb-2">Total Goals</p>
                    <p className="text-white text-[85px] font-black leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                      {(selectedPlayerForCard as any).allTimeGoals}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer / Quote */}
              <div className="absolute bottom-0 left-0 w-full h-[250px] bg-gradient-to-t from-red-950 via-black to-black z-30 flex items-end justify-between px-16 pb-16">
                <div className="max-w-[600px]">
                  <p className="text-white/60 text-2xl font-medium italic tracking-wide leading-relaxed font-serif">
                    "Legends are forged in the shadows,<br/>but crowned in the lights."
                  </p>
                  <p className="text-red-500 text-xl font-black uppercase tracking-[0.3em] mt-6">
                    NCL.SUNDXR.DEV
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {selectedPlayerForCard.toppedSeasons?.length > 0 && (
                    <div className="flex gap-2 mb-6">
                      {selectedPlayerForCard.toppedSeasons.map((s: string, i: number) => (
                        <div key={i} className="bg-red-600 border border-red-400 px-4 py-2 rounded-md shadow-[0_0_15px_rgba(225,6,0,0.5)]">
                          <p className="text-white text-xl font-black uppercase tracking-widest">{s}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <img src="/logo_nfl.png" className="h-28 opacity-80" crossOrigin="anonymous" />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      `;

content = content.replace(oldCardRegex, newCard);

fs.writeFileSync('src/app/page.tsx', content);
