const fs = require('fs');

let content = fs.readFileSync('src/app/fixtures/page.tsx', 'utf8');

// 1. Imports
content = content.replace(
  `import { useEffect, useState, Suspense } from "react";`,
  `import { useEffect, useState, Suspense, useRef } from "react";\nimport * as htmlToImage from "html-to-image";`
);

content = content.replace(
  `import { Loader2 } from "lucide-react";`,
  `import { Loader2, Share2, Download } from "lucide-react";`
);

// 2. States and share logic
const stateInsertionPoint = `  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);`;

const shareLogic = `  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const fixturesRef = useRef<HTMLDivElement>(null);
  const [sharingFixtures, setSharingFixtures] = useState(false);

  const handleShareFixtures = async () => {
    if (!fixturesRef.current) return;
    setSharingFixtures(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(fixturesRef.current, { 
        quality: 0.95,
        backgroundColor: '#0a0a0a',
        style: { display: 'block' }
      });
      
      if (navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'nfl-fixtures.jpg', { type: 'image/jpeg' });
          await navigator.share({
            title: 'NFL Fixtures',
            files: [file]
          });
        } catch (shareErr) {
          triggerDownload(dataUrl, 'nfl-fixtures.jpg');
        }
      } else {
        triggerDownload(dataUrl, 'nfl-fixtures.jpg');
      }
    } catch (err) {
      console.error("Error generating image:", err);
      alert("Could not generate image for sharing.");
    } finally {
      setSharingFixtures(false);
    }
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };`;

content = content.replace(stateInsertionPoint, shareLogic);

// 3. Header modification to add Share button
const oldHeader = `      {/* Page Header with local selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-8 border-primary pl-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-white uppercase tracking-tighter skew-x-[-10deg]">
            <span className="skew-x-[10deg] block md:inline">UPCOMING</span> <span className="text-primary skew-x-[10deg] block md:inline">FIXTURES</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-bold uppercase tracking-widest">
            Schedule for the upcoming matches.
          </p>
        </div>`;

const newHeader = `      {/* Page Header with local selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-8 border-primary pl-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-white uppercase tracking-tighter skew-x-[-10deg]">
              <span className="skew-x-[10deg] block md:inline">UPCOMING</span> <span className="text-primary skew-x-[10deg] block md:inline">FIXTURES</span>
            </h1>
            <Button 
              onClick={handleShareFixtures}
              disabled={sharingFixtures || fixtures.length === 0}
              size="sm"
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-[10px] h-8 rounded-sm shadow-[0_0_15px_rgba(225,6,0,0.4)] border border-red-500/50 skew-x-[-10deg] sm:ml-4"
            >
              <div className="flex items-center skew-x-[10deg]">
                {sharingFixtures ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Share2 className="w-3.5 h-3.5 mr-2" />}
                Share F1 Card
              </div>
            </Button>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl font-bold uppercase tracking-widest mt-2">
            Schedule for the upcoming matches.
          </p>
        </div>`;

content = content.replace(oldHeader, newHeader);

// 4. Add Hidden F1 Card
const f1FixtureCard = `
      {/* Hidden F1 Style Card for Image Generation */}
      <div className="absolute -left-[9999px] top-0">
        <div ref={fixturesRef} className="w-[1080px] h-[1920px] bg-[#0a0a0a] relative overflow-hidden flex flex-col p-16 font-sans">
          {/* Background Texture & Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#330000_0%,#0a0a0a_70%)] opacity-80" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute -right-64 top-32 w-[800px] h-[200px] bg-red-600/30 blur-[120px] rounded-full rotate-45" />
          <div className="absolute -left-64 bottom-32 w-[800px] h-[200px] bg-red-600/20 blur-[120px] rounded-full -rotate-45" />
          
          {/* Header */}
          <div className="relative z-10 border-l-[12px] border-red-600 pl-8 mb-24 mt-12 flex justify-between items-end">
            <div>
              <h1 className="text-white text-8xl font-black uppercase italic tracking-tighter leading-none m-0">
                MATCH<br/>DAY
              </h1>
              <p className="text-red-500 text-3xl font-bold uppercase tracking-[0.2em] mt-4">Namma Football League</p>
            </div>
            <div className="text-right pb-4">
              <p className="text-white/50 text-2xl font-black uppercase tracking-widest italic">{
                seasons.find(s => s.id === selectedSeasonId)?.name || 'Season'
              }</p>
            </div>
          </div>

          {/* Fixtures List */}
          <div className="relative z-10 flex-1 flex flex-col gap-10 mt-8">
            {fixtures.slice(0, 4).map((fixture, idx) => {
              const home = fixture.home_player;
              const away = fixture.away_player;
              
              if (!home || !away) return null;
              
              return (
                <div key={fixture.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent skew-x-[-15deg] transform -translate-x-4 opacity-50" />
                  <div className="relative flex items-center bg-[#151515] border border-white/10 skew-x-[-15deg] overflow-hidden p-1">
                    
                    {/* Home Player */}
                    <div className="flex-1 px-8 flex justify-end items-center bg-[#111] h-36">
                      <div className="skew-x-[15deg] flex items-center gap-6">
                         <div className="text-right">
                           <p className="text-white/50 text-xl font-bold uppercase tracking-widest">{home.favorite_team || 'IND'}</p>
                           <h2 className="text-white text-4xl font-black uppercase italic tracking-tight">{home.name}</h2>
                         </div>
                         {home.photo_url && (
                           <img src={home.photo_url} className="w-20 h-20 rounded-full border-2 border-white/20 object-cover grayscale contrast-125" />
                         )}
                      </div>
                    </div>
                    
                    {/* VS Box */}
                    <div className="w-24 h-36 bg-red-600 flex items-center justify-center border-x-4 border-black shrink-0">
                      <div className="skew-x-[15deg]">
                        <span className="text-4xl font-black italic text-white leading-none">VS</span>
                      </div>
                    </div>

                    {/* Away Player */}
                    <div className="flex-1 px-8 flex justify-start items-center bg-[#111] h-36">
                      <div className="skew-x-[15deg] flex items-center gap-6">
                         {away.photo_url && (
                           <img src={away.photo_url} className="w-20 h-20 rounded-full border-2 border-white/20 object-cover grayscale contrast-125" />
                         )}
                         <div className="text-left">
                           <p className="text-white/50 text-xl font-bold uppercase tracking-widest">{away.favorite_team || 'IND'}</p>
                           <h2 className="text-white text-4xl font-black uppercase italic tracking-tight">{away.name}</h2>
                         </div>
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
              <p className="text-white/50 text-xl font-bold tracking-widest uppercase">Official Matchday Fixtures</p>
              <p className="text-white text-2xl font-black italic tracking-tighter">NAMMAFOOTBALL.COM</p>
            </div>
            <img src="/logo_nfl.png" className="h-24 opacity-80 grayscale contrast-200" />
          </div>
        </div>
      </div>
`;

content = content.replace(
  `    </div>\n  );\n}`,
  `      ${f1FixtureCard}\n    </div>\n  );\n}`
);

fs.writeFileSync('src/app/fixtures/page.tsx', content, 'utf8');
console.log("Updated fixtures/page.tsx successfully.");
