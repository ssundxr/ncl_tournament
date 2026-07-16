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
      <Card className="glass border-border hover:border-primary/50 transition-all hover:-translate-y-1 cursor-pointer overflow-hidden group">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] bg-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            
            {/* Overall Rating Badge */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-black/60 backdrop-blur-md rounded-lg p-2 border border-primary/30">
              <span className="text-xl font-heading font-black text-primary leading-none">{player.overall_rating ?? '--'}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">OVR</span>
            </div>

            {/* Photo / Avatar */}
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                <Shield className="w-24 h-24 text-primary" />
              </div>
            )}

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="font-heading font-bold text-2xl text-foreground truncate">{player.name}</h3>
              <p className="text-sm text-primary font-medium">{player.favorite_team}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
