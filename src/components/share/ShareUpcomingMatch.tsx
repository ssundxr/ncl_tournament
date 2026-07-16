import React, { forwardRef } from 'react';

interface ShareUpcomingMatchProps {
  homeName: string;
  awayName: string;
  homePhoto?: string;
  awayPhoto?: string;
  groupName?: string;
  matchday?: number;
}

export const ShareUpcomingMatch = forwardRef<HTMLDivElement, ShareUpcomingMatchProps>(
  ({ homeName, awayName, homePhoto, awayPhoto, groupName, matchday }, ref) => {
    return (
      <div
        style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
      >
        <div
          ref={ref}
          className="flex flex-col relative overflow-hidden"
          style={{
            width: '1080px',
            height: '1350px', // 4:5 Instagram Post format
            background: 'linear-gradient(135deg, #0B0E14 0%, #1A1F2C 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Background Elements */}
          <div className="absolute top-[-30%] left-[-20%] w-[1200px] h-[1200px] bg-red-600 rounded-full blur-[400px] opacity-30" />
          <div className="absolute bottom-[-30%] right-[-20%] w-[1200px] h-[1200px] bg-blue-600 rounded-full blur-[400px] opacity-30" />
          
          {/* Header */}
          <div className="flex flex-col items-center justify-center pt-24 pb-8 z-10">
            <h2 className="text-red-500 font-bold tracking-[0.4em] text-2xl uppercase mb-4">Namma Champions League</h2>
            <h1 className="text-white font-black text-6xl uppercase tracking-tighter italic text-center leading-tight">
              MATCH ABOUT TO <span className="text-red-600">START</span>
            </h1>
            <div className="flex gap-4 mt-8">
              {groupName && (
                <div className="px-8 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <span className="text-white font-bold text-2xl tracking-widest uppercase">{groupName}</span>
                </div>
              )}
              {matchday && (
                <div className="px-8 py-3 bg-red-600/20 backdrop-blur-md rounded-full border border-red-500/50">
                  <span className="text-red-500 font-bold text-2xl tracking-widest uppercase">Matchday {matchday}</span>
                </div>
              )}
            </div>
          </div>

          {/* VS Container */}
          <div className="flex-1 flex flex-col items-center justify-center z-10 w-full px-16 relative">
            <div className="flex items-center justify-between w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[4rem] p-16 shadow-2xl relative">
              
              {/* Home Player */}
              <div className="flex flex-col items-center gap-8 w-[40%]">
                <div className="w-64 h-64 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 to-transparent z-10 mix-blend-overlay"></div>
                  {homePhoto ? (
                    <img src={homePhoto} alt="" className="w-full h-full object-cover relative z-0" />
                  ) : (
                    <span className="text-9xl text-white font-bold relative z-0">{homeName.charAt(0)}</span>
                  )}
                </div>
                <span className="text-5xl font-black text-white uppercase text-center">{homeName}</span>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-[#1A1F2C]">
                  <span className="text-5xl font-black text-white italic tracking-tighter">VS</span>
                </div>
              </div>

              {/* Away Player */}
              <div className="flex flex-col items-center gap-8 w-[40%]">
                <div className="w-64 h-64 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-2xl relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent z-10 mix-blend-overlay"></div>
                  {awayPhoto ? (
                    <img src={awayPhoto} alt="" className="w-full h-full object-cover relative z-0" />
                  ) : (
                    <span className="text-9xl text-white font-bold relative z-0">{awayName.charAt(0)}</span>
                  )}
                </div>
                <span className="text-5xl font-black text-white uppercase text-center">{awayName}</span>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="py-20 text-center z-10">
            <p className="text-white/40 text-2xl font-bold tracking-widest">NCL.SUNDXR.DEV</p>
          </div>
        </div>
      </div>
    );
  }
);
ShareUpcomingMatch.displayName = 'ShareUpcomingMatch';
