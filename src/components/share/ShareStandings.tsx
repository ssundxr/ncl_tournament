import React, { forwardRef } from 'react';

type PlayerStanding = {
  player: { name: string; photo_url?: string };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
};

interface ShareStandingsProps {
  groupName: string;
  standings: PlayerStanding[];
}

export const ShareStandings = forwardRef<HTMLDivElement, ShareStandingsProps>(
  ({ groupName, standings }, ref) => {
    return (
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div
          ref={ref}
          className="flex flex-col relative overflow-hidden bg-[#0A0A0A]"
          style={{
            width: '1080px',
            height: '1920px',
            fontFamily: 'var(--font-sans), system-ui, sans-serif'
          }}
        >
          {/* F1 Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[size:100px_100px] z-0 pointer-events-none" />
          
          {/* Diagonal Cuts */}
          <div className="absolute top-0 right-0 w-[800px] h-[1920px] bg-red-600 z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 30% 100%, 80% 0)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white z-0" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />
          
          {/* Noise */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-40 mix-blend-overlay z-0 pointer-events-none" />
          
          {/* Header */}
          <div className="flex flex-col items-start justify-start pt-32 pl-24 z-10 w-full relative">
            <h2 className="bg-red-600 text-white font-black tracking-[0.4em] text-3xl uppercase px-4 py-2 border-l-[8px] border-white skew-x-[-10deg] mb-6 inline-block">
              <span className="skew-x-[10deg] block">Namma Football League</span>
            </h2>
            <h1 className="text-white font-black text-[110px] uppercase tracking-tighter leading-none skew-x-[-10deg]">
              {groupName} <span className="text-red-600 bg-white px-4">STANDINGS</span>
            </h1>
          </div>

          {/* Table Container */}
          <div className="flex-1 px-20 py-16 z-10 w-full">
            <div className="w-full bg-black border-8 border-white p-12 shadow-[20px_20px_0px_0px_rgba(220,38,38,1)] relative skew-x-[-2deg]">
              
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 text-white font-black text-2xl uppercase tracking-widest mb-6 px-6 pb-4 border-b-8 border-red-600 skew-x-[2deg]">
                <div className="col-span-1 text-center">POS</div>
                <div className="col-span-5">PLAYER</div>
                <div className="col-span-1 text-center">P</div>
                <div className="col-span-1 text-center">W</div>
                <div className="col-span-1 text-center">D</div>
                <div className="col-span-1 text-center">L</div>
                <div className="col-span-1 text-center">GD</div>
                <div className="col-span-1 text-center text-red-500">PTS</div>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col gap-4 skew-x-[2deg]">
                {standings.map((s, idx) => (
                  <div 
                    key={idx}
                    className={`grid grid-cols-12 gap-4 items-center px-6 py-5 border-4 ${idx === 0 ? 'bg-white text-black border-white' : 'bg-black text-white border-white/20'}`}
                  >
                    <div className={`col-span-1 text-center text-4xl font-black ${idx === 0 ? 'text-red-600' : 'text-white/50'}`}>
                      {idx + 1}
                    </div>
                    <div className="col-span-5 flex items-center gap-6">
                      <div className="w-16 h-16 bg-gray-900 flex items-center justify-center overflow-hidden border-4 border-white shadow-[5px_5px_0px_0px_rgba(220,38,38,1)]" style={{ clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)' }}>
                        {s.player.photo_url ? (
                           <img src={s.player.photo_url} alt="" className="w-full h-full object-cover contrast-125 saturate-50" />
                        ) : (
                          <span className="text-3xl text-white font-black uppercase">{s.player.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-3xl font-black uppercase tracking-tighter">{s.player.name}</span>
                    </div>
                    <div className={`col-span-1 text-center text-3xl font-bold ${idx === 0 ? 'text-black' : 'text-white/70'}`}>{s.played}</div>
                    <div className={`col-span-1 text-center text-3xl font-bold ${idx === 0 ? 'text-black' : 'text-white/70'}`}>{s.wins}</div>
                    <div className={`col-span-1 text-center text-3xl font-bold ${idx === 0 ? 'text-black' : 'text-white/70'}`}>{s.draws}</div>
                    <div className={`col-span-1 text-center text-3xl font-bold ${idx === 0 ? 'text-black' : 'text-white/70'}`}>{s.losses}</div>
                    <div className={`col-span-1 text-center text-3xl font-bold ${idx === 0 ? 'text-black' : 'text-white/70'}`}>{s.goals_for - s.goals_against}</div>
                    <div className={`col-span-1 text-center text-5xl font-black ${idx === 0 ? 'text-red-600' : 'text-white'}`}>{s.points}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto py-16 px-24 flex justify-between items-end z-10 w-full relative">
            <p className="text-white font-black text-3xl tracking-[0.3em] uppercase">NCL.SUNDXR.DEV</p>
            <img src="/logo_nfl.png" className="w-32 h-32 object-contain brightness-0 invert" />
          </div>
        </div>
      </div>
    );
  }
);
ShareStandings.displayName = 'ShareStandings';
