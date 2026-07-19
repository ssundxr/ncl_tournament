import { Player } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link href={`/players/${player.slug}`}>
      <Card className="bg-card border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] hover:shadow-[10px_10px_0px_0px_rgba(220,38,38,1)] hover:-translate-y-1 transition-all cursor-pointer overflow-hidden group rounded-none">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] bg-muted overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
            
            {/* Overall Rating Badge */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-white border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] p-2">
              <span className="text-2xl font-heading font-black text-foreground leading-none">{player.overall_rating ?? '--'}</span>
              <span className="text-[10px] uppercase tracking-widest text-foreground mt-1 font-black">OVR</span>
            </div>

            {/* Photo / Avatar */}
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-125 saturate-50" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors duration-500">
                <Shield className="w-24 h-24 text-foreground/20" />
              </div>
            )}

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-background via-background/90 to-transparent pt-12">
              <h3 className="font-heading font-black text-2xl md:text-3xl tracking-tighter text-foreground truncate uppercase">{player.name}</h3>
              <p className="text-[11px] font-black uppercase tracking-widest text-primary mt-1 truncate">{player.favorite_team || "Free Agent"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
