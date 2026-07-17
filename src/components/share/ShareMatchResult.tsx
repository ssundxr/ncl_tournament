import React, { forwardRef } from 'react';

interface ShareMatchResultProps {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homePhoto?: string;
  awayPhoto?: string;
  groupName?: string;
}

export const ShareMatchResult = forwardRef<HTMLDivElement, ShareMatchResultProps>(
  ({ homeName, awayName, homeScore, awayScore, homePhoto, awayPhoto, groupName }, ref) => {
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
            <h2 className="text-red-500 font-bold tracking-[0.4em] text-2xl uppercase mb-4">Namma Football League</h2>
            <h1 className="text-white font-black text-7xl uppercase tracking-tighter italic">
              MATCH <span className="text-red-600">RESULT</span>
            </h1>
            {groupName && (
              <div className="mt-6 px-8 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-white font-bold text-2xl tracking-widest uppercase">{groupName}</span>
              </div>
            )}
          </div>

          {/* Score Container */}
          <div className="flex-1 flex flex-col items-center justify-center z-10 w-full px-16">
            <div className="flex items-center justify-between w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[4rem] p-16 shadow-2xl relative">
              
              {/* Home Player */}
              <div className="flex flex-col items-center gap-8 w-1/3">
                <div className="w-56 h-56 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-2xl">
                  {homePhoto ? (
                    <img src={homePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-8xl text-white font-bold">{homeName.charAt(0)}</span>
                  )}
                </div>
                <span className="text-5xl font-black text-white uppercase text-center">{homeName}</span>
                {homeScore > awayScore && <span className="text-green-400 font-bold tracking-widest text-2xl uppercase">Winner</span>}
              </div>

              {/* Score */}
              <div className="flex flex-col items-center justify-center w-1/3 gap-4">
                <div className="flex items-center gap-8">
                  <span className={`text-9xl font-black ${homeScore > awayScore ? 'text-white' : 'text-white/60'}`}>{homeScore}</span>
                  <span className="text-6xl font-black text-white/30">-</span>
                  <span className={`text-9xl font-black ${awayScore > homeScore ? 'text-white' : 'text-white/60'}`}>{awayScore}</span>
                </div>
                <div className="px-8 py-2 bg-red-600/20 border border-red-500/50 rounded-full mt-4">
                  <span className="text-red-500 font-bold text-xl tracking-[0.2em] uppercase">Full Time</span>
                </div>
              </div>

              {/* Away Player */}
              <div className="flex flex-col items-center gap-8 w-1/3">
                <div className="w-56 h-56 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-2xl">
                  {awayPhoto ? (
                    <img src={awayPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-8xl text-white font-bold">{awayName.charAt(0)}</span>
                  )}
                </div>
                <span className="text-5xl font-black text-white uppercase text-center">{awayName}</span>
                {awayScore > homeScore && <span className="text-green-400 font-bold tracking-widest text-2xl uppercase">Winner</span>}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="py-20 text-center z-10">
            <p className="text-white/40 text-2xl font-bold tracking-widest">NFL.SUNDXR.DEV</p>
          </div>
        </div>
      </div>
    );
  }
);
ShareMatchResult.displayName = 'ShareMatchResult';
