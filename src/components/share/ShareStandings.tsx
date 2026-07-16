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
      <div
        style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
      >
        <div
          ref={ref}
          className="flex flex-col relative overflow-hidden"
          style={{
            width: '1080px',
            height: '1920px',
            background: 'linear-gradient(135deg, #0B0E14 0%, #1A1F2C 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Background Elements */}
          <div className="absolute top-[-20%] left-[-20%] w-[1000px] h-[1000px] bg-red-600 rounded-full blur-[400px] opacity-20" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[1000px] h-[1000px] bg-blue-600 rounded-full blur-[400px] opacity-20" />
          
          {/* Header */}
          <div className="flex flex-col items-center justify-center pt-32 pb-16 z-10">
            <h2 className="text-red-500 font-bold tracking-[0.3em] text-3xl uppercase mb-6">Namma Champions League</h2>
            <h1 className="text-white font-black text-8xl uppercase tracking-tighter italic">
              {groupName} <span className="text-red-600">STANDINGS</span>
            </h1>
          </div>

          {/* Table Container */}
          <div className="flex-1 px-24 py-12 z-10 w-full">
            <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-2xl">
              
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-6 text-white/50 text-2xl font-bold uppercase tracking-wider mb-8 px-8">
                <div className="col-span-1 text-center">POS</div>
                <div className="col-span-5">PLAYER</div>
                <div className="col-span-1 text-center">P</div>
                <div className="col-span-1 text-center">W</div>
                <div className="col-span-1 text-center">D</div>
                <div className="col-span-1 text-center">L</div>
                <div className="col-span-1 text-center">GD</div>
                <div className="col-span-1 text-center text-white">PTS</div>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col gap-6">
                {standings.map((s, idx) => (
                  <div 
                    key={idx}
                    className={`grid grid-cols-12 gap-6 items-center px-8 py-8 rounded-3xl border ${idx === 0 ? 'bg-gradient-to-r from-red-600/20 to-transparent border-red-500/50' : 'bg-white/5 border-white/5'}`}
                  >
                    <div className="col-span-1 text-center text-4xl font-black text-white/50">
                      {idx + 1}
                    </div>
                    <div className="col-span-5 flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                        {s.player.photo_url ? (
                           <img src={s.player.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl text-white font-bold">{s.player.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-4xl font-bold text-white uppercase">{s.player.name}</span>
                    </div>
                    <div className="col-span-1 text-center text-3xl font-medium text-white/70">{s.played}</div>
                    <div className="col-span-1 text-center text-3xl font-medium text-white/70">{s.wins}</div>
                    <div className="col-span-1 text-center text-3xl font-medium text-white/70">{s.draws}</div>
                    <div className="col-span-1 text-center text-3xl font-medium text-white/70">{s.losses}</div>
                    <div className="col-span-1 text-center text-3xl font-medium text-white/70">{s.goals_for - s.goals_against}</div>
                    <div className="col-span-1 text-center text-5xl font-black text-white">{s.points}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="py-24 text-center z-10">
            <p className="text-white/40 text-3xl font-bold tracking-widest">NCL.SUNDXR.DEV</p>
          </div>
        </div>
      </div>
    );
  }
);
ShareStandings.displayName = 'ShareStandings';
