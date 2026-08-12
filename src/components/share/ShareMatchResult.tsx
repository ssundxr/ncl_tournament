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
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div
          ref={ref}
          className="flex flex-col relative overflow-hidden bg-[#0A0A0A]"
          style={{
            width: '1080px',
            height: '1350px', // 4:5 Instagram Post format
            fontFamily: 'var(--font-sans), system-ui, sans-serif'
          }}
        >
          {/* F1 Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[size:100px_100px] z-0 pointer-events-none" />
          
          {/* Diagonal Cuts */}
          <div className="absolute top-0 right-0 w-[800px] h-[1350px] bg-red-600 z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 30% 100%, 80% 0)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white z-0" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />
          
          {/* Noise */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-40 mix-blend-overlay z-0 pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-start justify-start pt-20 pl-20 z-10 w-full relative">
            <h2 className="bg-red-600 text-white font-black tracking-[0.4em] text-2xl uppercase px-4 py-2 border-l-[8px] border-white skew-x-[-10deg] mb-6 inline-block">
              <span className="skew-x-[10deg] block">Namma Football League</span>
            </h2>
            <h1 className="text-white font-black text-[90px] uppercase tracking-tighter leading-none skew-x-[-10deg]">
              MATCH <span className="text-red-600 bg-white px-4">RESULT</span>
            </h1>
            {groupName && (
              <div className="mt-8 px-6 py-2 bg-black border-4 border-white inline-block skew-x-[-10deg]">
                <span className="text-white font-black text-3xl tracking-widest uppercase skew-x-[10deg] block">{groupName}</span>
              </div>
            )}
          </div>

          {/* Score Container */}
          <div className="flex-1 flex flex-col items-center justify-center z-10 w-full px-20 mt-12">
            <div className="flex items-center justify-between w-full bg-black border-8 border-white p-12 shadow-[20px_20px_0px_0px_rgba(220,38,38,1)] relative skew-x-[-5deg]">
              
              {/* Home Player */}
              <div className="flex flex-col items-center gap-6 w-[35%] skew-x-[5deg]">
                <div className="w-64 h-64 bg-gray-900 flex items-center justify-center overflow-hidden border-8 border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)]" style={{ clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)' }}>
                  {homePhoto ? (
                    <img src={homePhoto} alt="" className="w-full h-full object-cover contrast-125 saturate-50" />
                  ) : (
                    <span className="text-[120px] text-white font-black uppercase">{homeName.charAt(0)}</span>
                  )}
                </div>
                <div className="bg-white px-6 py-2 border-b-8 border-red-600">
                  <span className="text-4xl font-black text-black uppercase text-center tracking-tighter">{homeName}</span>
                </div>
                {homeScore > awayScore && <span className="text-green-500 font-black tracking-widest text-3xl uppercase bg-black px-4 py-1 border-2 border-green-500">Winner</span>}
              </div>

              {/* Score */}
              <div className="flex flex-col items-center justify-center w-[30%] gap-4 skew-x-[5deg]">
                <div className="flex items-center gap-6 bg-red-600 px-8 py-4 border-4 border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)]">
                  <span className={`text-[120px] font-black leading-none ${homeScore > awayScore ? 'text-white' : 'text-white/60'}`}>{homeScore}</span>
                  <span className="text-[80px] font-black text-white/50 leading-none">-</span>
                  <span className={`text-[120px] font-black leading-none ${awayScore > homeScore ? 'text-white' : 'text-white/60'}`}>{awayScore}</span>
                </div>
                <div className="px-6 py-2 bg-black border-2 border-white mt-6">
                  <span className="text-white font-black text-2xl tracking-[0.3em] uppercase">Full Time</span>
                </div>
              </div>

              {/* Away Player */}
              <div className="flex flex-col items-center gap-6 w-[35%] skew-x-[5deg]">
                <div className="w-64 h-64 bg-gray-900 flex items-center justify-center overflow-hidden border-8 border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)]" style={{ clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)' }}>
                  {awayPhoto ? (
                    <img src={awayPhoto} alt="" className="w-full h-full object-cover contrast-125 saturate-50" />
                  ) : (
                    <span className="text-[120px] text-white font-black uppercase">{awayName.charAt(0)}</span>
                  )}
                </div>
                <div className="bg-white px-6 py-2 border-b-8 border-red-600">
                  <span className="text-4xl font-black text-black uppercase text-center tracking-tighter">{awayName}</span>
                </div>
                {awayScore > homeScore && <span className="text-green-500 font-black tracking-widest text-3xl uppercase bg-black px-4 py-1 border-2 border-green-500">Winner</span>}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto py-12 px-20 flex justify-between items-end z-10 w-full relative">
            <p className="text-white font-black text-3xl tracking-[0.3em] uppercase">NCL.SUNDXR.DEV</p>
            <img src="/logo_ncl.png" className="w-24 h-24 object-contain brightness-0 invert" />
          </div>
        </div>
      </div>
    );
  }
);
ShareMatchResult.displayName = 'ShareMatchResult';
