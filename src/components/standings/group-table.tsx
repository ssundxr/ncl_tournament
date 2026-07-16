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

  // Convert StandingsRow to the format expected by ShareStandings
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
          <h3 className="font-heading font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
            {groupName}
          </h3>
          <div className="flex-1 h-px bg-border mt-1 hidden sm:block" />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4 font-bold tracking-widest uppercase border-primary/50 text-primary hover:bg-primary hover:text-white"
          onClick={handleShare}
          disabled={isExporting}
        >
          <Share2 className="w-4 h-4 mr-2" />
          {isExporting ? 'Generating...' : 'Share IG Story'}
        </Button>
      </div>
      
      {/* Table Container */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-background text-muted-foreground border-b border-border">
              <tr className="font-bold text-sm uppercase tracking-widest">
                <th scope="col" className="px-6 py-5 text-center w-20">Pos</th>
                <th scope="col" className="px-6 py-5">Player</th>
                <th scope="col" className="px-3 py-4 text-center" title="Played">P</th>
                <th scope="col" className="px-3 py-4 text-center" title="Wins">W</th>
                <th scope="col" className="px-3 py-4 text-center" title="Draws">D</th>
                <th scope="col" className="px-3 py-4 text-center" title="Losses">L</th>
                <th scope="col" className="px-3 py-4 text-center hidden sm:table-cell" title="Goals For">GF</th>
                <th scope="col" className="px-3 py-4 text-center hidden sm:table-cell" title="Goals Against">GA</th>
                <th scope="col" className="px-3 py-4 text-center" title="Goal Difference">GD</th>
                <th scope="col" className="px-6 py-4 text-center text-white">Pts</th>
                <th scope="col" className="px-6 py-4 text-center hidden md:table-cell">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {standings.map((row, index) => {
                const isFirst = index === 0;
                const isQualified = index < 2; 
                return (
                  <tr 
                    key={row.player.id}
                    className="group transition-colors hover:bg-white/5"
                  >
                    <td className="px-6 py-6 text-center relative">
                      {isQualified && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      <span className="font-black text-2xl text-white">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <Link href={`/players/${row.player.slug}`} className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center shrink-0 border border-border overflow-hidden">
                          {row.player.photo_url ? (
                            <img src={row.player.photo_url} alt={row.player.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-7 h-7 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-lg uppercase tracking-wide text-white group-hover:text-primary transition-colors">
                            {row.player.name}
                          </span>
                          {row.player.favorite_team && (
                            <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">
                              {row.player.favorite_team}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-6 text-center text-lg text-muted-foreground font-bold">{row.played}</td>
                    <td className="px-3 py-6 text-center text-xl text-white font-black">{row.wins}</td>
                    <td className="px-3 py-6 text-center text-xl text-white font-black">{row.draws}</td>
                    <td className="px-3 py-6 text-center text-xl text-white font-black">{row.losses}</td>
                    <td className="px-3 py-6 text-center hidden sm:table-cell text-lg text-muted-foreground font-bold">{row.goalsFor}</td>
                    <td className="px-3 py-6 text-center hidden sm:table-cell text-lg text-muted-foreground font-bold">{row.goalsAgainst}</td>
                    <td className="px-3 py-6 text-center font-black text-xl">
                      <span className={row.goalDifference > 0 ? 'text-success' : row.goalDifference < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="font-black text-3xl text-white">
                        {row.points}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1.5">
                        {row.form.map((result, i) => (
                          <div 
                            key={i} 
                            className={`w-7 h-7 rounded flex items-center justify-center text-xs font-black
                              ${result === 'W' ? 'bg-success text-black' : 
                                result === 'D' ? 'bg-muted text-white' : 
                                'bg-destructive text-white'}`}
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
