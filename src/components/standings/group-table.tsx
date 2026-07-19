import { StandingsRow } from "@/types";
import { Shield, Trophy, User, Share2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { ShareStandings } from "@/components/share/ShareStandings";
import { exportAsImage } from "@/lib/exportImage";
import { Button } from "@/components/ui/button";

interface GroupTableProps {
  groupName: string;
  standings: StandingsRow[];
}

export function GroupTable({ groupName, standings }: GroupTableProps) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleShare = async () => {
    setIsExporting(true);
    await exportAsImage(shareRef, `${groupName.replace(/\s+/g, '-').toLowerCase()}-standings`);
    setIsExporting(false);
  };

  const shareData = standings.map(s => ({
    player: { name: s.player.name, photo_url: s.player.photo_url || undefined },
    played: s.played,
    wins: s.wins,
    draws: s.draws,
    losses: s.losses,
    goals_for: s.goalsFor,
    goals_against: s.goalsAgainst,
    points: s.points,
  }));

  return (
    <div className="w-full">
      <ShareStandings ref={shareRef} groupName={groupName} standings={shareData} />
      
      {/* Group Title Block */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <h3 className="font-heading font-bold text-2xl md:text-3xl text-foreground tracking-tight">
            {groupName}
          </h3>
          <div className="flex-1 h-px bg-border mt-1 hidden sm:block" />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4 font-semibold tracking-wider uppercase border-primary/20 text-primary hover:bg-primary/5 hover:text-primary rounded-full shadow-sm"
          onClick={handleShare}
          disabled={isExporting}
        >
          <Share2 className="w-4 h-4 mr-2" />
          {isExporting ? 'Generating...' : 'Share'}
        </Button>
      </div>
      
      {/* Table Container */}
      <div className="bg-card border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-foreground text-background border-b-4 border-foreground">
              <tr className="font-black text-xs uppercase tracking-widest font-heading">
                <th scope="col" className="px-6 py-5 text-center w-20">Pos</th>
                <th scope="col" className="px-6 py-5">Player</th>
                <th scope="col" className="px-3 py-5 text-center" title="Played">P</th>
                <th scope="col" className="px-3 py-5 text-center" title="Wins">W</th>
                <th scope="col" className="px-3 py-5 text-center" title="Draws">D</th>
                <th scope="col" className="px-3 py-5 text-center" title="Losses">L</th>
                <th scope="col" className="px-3 py-5 text-center hidden sm:table-cell" title="Goals For">GF</th>
                <th scope="col" className="px-3 py-5 text-center hidden sm:table-cell" title="Goals Against">GA</th>
                <th scope="col" className="px-3 py-5 text-center" title="Goal Difference">GD</th>
                <th scope="col" className="px-6 py-5 text-center text-primary font-black">Pts</th>
                <th scope="col" className="px-6 py-5 text-center hidden md:table-cell">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground">
              {standings.map((row, index) => {
                const isFirst = index === 0;
                const isQualified = index < 2; 
                return (
                  <tr 
                    key={row.player.id}
                    className="group transition-colors hover:bg-muted"
                  >
                    <td className="px-6 py-4 text-center relative border-r-2 border-foreground/10">
                      {isQualified && (
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
                      )}
                      <span className="font-black text-2xl text-foreground font-heading">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/players/${row.player.slug}`} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white flex items-center justify-center shrink-0 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] overflow-hidden group-hover:shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] group-hover:-translate-y-0.5 transition-all">
                          {row.player.photo_url ? (
                            <img src={row.player.photo_url} alt={row.player.name} className="w-full h-full object-cover filter contrast-125 saturate-50" />
                          ) : (
                            <User className="w-6 h-6 text-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-lg tracking-tight text-foreground uppercase group-hover:text-primary transition-colors font-heading leading-tight">
                            {row.player.name}
                          </span>
                          {row.player.favorite_team && (
                            <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">
                              {row.player.favorite_team}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-center text-base text-muted-foreground font-bold">{row.played}</td>
                    <td className="px-3 py-4 text-center text-xl text-foreground font-black">{row.wins}</td>
                    <td className="px-3 py-4 text-center text-xl text-foreground font-black">{row.draws}</td>
                    <td className="px-3 py-4 text-center text-xl text-foreground font-black">{row.losses}</td>
                    <td className="px-3 py-4 text-center hidden sm:table-cell text-base text-muted-foreground font-bold">{row.goalsFor}</td>
                    <td className="px-3 py-4 text-center hidden sm:table-cell text-base text-muted-foreground font-bold">{row.goalsAgainst}</td>
                    <td className="px-3 py-4 text-center font-black text-xl">
                      <span className={row.goalDifference > 0 ? 'text-success' : row.goalDifference < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center border-l-2 border-foreground/10 bg-primary/5">
                      <span className="font-black text-4xl text-primary font-heading tracking-tighter drop-shadow-sm">
                        {row.points}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1.5">
                        {row.form.map((result, i) => (
                          <div 
                            key={i} 
                            className={`w-7 h-7 flex items-center justify-center text-xs font-black border-2 border-foreground shadow-[1px_1px_0px_0px_rgba(17,24,39,1)]
                              ${result === 'W' ? 'bg-success text-white border-success' : 
                                result === 'D' ? 'bg-white text-foreground' : 
                                'bg-destructive text-white border-destructive'}`}
                          >
                            <span>{result}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
