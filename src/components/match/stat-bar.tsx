interface StatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
}

export function StatBar({ label, homeValue, awayValue, isPercentage = false }: StatBarProps) {
  const total = homeValue + awayValue;
  const homePercentage = total === 0 ? 50 : (homeValue / total) * 100;
  const awayPercentage = total === 0 ? 50 : (awayValue / total) * 100;

  const displayHome = isPercentage ? `${homeValue}%` : homeValue;
  const displayAway = isPercentage ? `${awayValue}%` : awayValue;

  return (
    <div className="flex flex-col gap-2 w-full py-2">
      <div className="flex justify-between items-center text-sm font-bold font-heading">
        <span className={homeValue > awayValue ? "text-primary" : "text-foreground"}>{displayHome}</span>
        <span className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">{label}</span>
        <span className={awayValue > homeValue ? "text-primary" : "text-foreground"}>{displayAway}</span>
      </div>
      
      <div className="flex h-4 w-full rounded-none overflow-hidden bg-white border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${homeValue > awayValue ? 'bg-primary' : 'bg-primary/50'}`} 
          style={{ width: `${homePercentage}%` }} 
        />
        <div 
          className={`h-full transition-all duration-1000 ease-out ${awayValue > homeValue ? 'bg-foreground' : 'bg-foreground/20'}`} 
          style={{ width: `${awayPercentage}%` }} 
        />
      </div>
    </div>
  );
}
