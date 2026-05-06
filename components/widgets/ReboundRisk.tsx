'use client';

interface ReboundRiskProps {
  level: 'none' | 'low' | 'medium' | 'high';
  timeToRebound?: number;
}

export default function ReboundRisk({ level, timeToRebound }: ReboundRiskProps) {
  const getRiskColor = () => {
    switch (level) {
      case 'none': return 'from-status-green/10 to-status-green/5 border-status-green/20';
      case 'low': return 'from-status-blue/10 to-status-blue/5 border-status-blue/20';
      case 'medium': return 'from-status-amber/10 to-status-amber/5 border-status-amber/20';
      case 'high': return 'from-status-red/10 to-status-red/5 border-status-red/20';
    }
  };

  const getRiskTextColor = () => {
    switch (level) {
      case 'none': return 'text-status-green';
      case 'low': return 'text-status-blue';
      case 'medium': return 'text-status-amber';
      case 'high': return 'text-status-red';
    }
  };

  const getRiskLabel = () => {
    switch (level) {
      case 'none': return 'No Risk';
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
    }
  };

  const getRecommendation = () => {
    switch (level) {
      case 'none':
        return {
          title: '✅ Bez rizika',
          message: 'Medicína není aktivní. Žádný rebound efekt.',
          tip: 'Stabilní mood a soustředění.',
        };
      case 'low':
        return {
          title: '🟢 Nízké riziko',
          message: 'Efekt se pomalu stírá. Rebound bude mírný.',
          tip: 'Hydratace a lehký snack stačí.',
        };
      case 'medium':
        return {
          title: '🟡 Střední riziko',
          message: 'Významný pokles dopaminu se blíží. Buď připravený.',
          tip: 'Plánuj lehčí úkoly, voda a pauza.',
        };
      case 'high':
        return {
          title: '🔴 Vysoké riziko',
          message: 'Rebound je NYNÍ nebo začal. Očekávej pokles energie.',
          tip: 'Pauza, voda, protein, bez dalších stimulantů.',
        };
    }
  };

  const rec = getRecommendation();

  return (
    <div className={`card-base h-full min-h-[220px] p-4 border bg-gradient-to-br ${getRiskColor()} flex flex-col justify-between gap-3`}>
      <p className="text-label">Rebound Risk</p>
      <p className={`text-headline font-light ${getRiskTextColor()}`}>{getRiskLabel()}</p>
      {timeToRebound && (
        <p className="text-xs text-muted">Očekáváno za {Math.round(timeToRebound / 60)}h {Math.round(timeToRebound % 60)}m</p>
      )}

      <div className="bg-card-border/10 p-2 rounded space-y-2 border border-card-border/20">
        <p className="text-xs font-medium">{rec.title}</p>
        <p className="text-xs text-muted leading-relaxed">{rec.message}</p>
        <p className="text-xs text-muted leading-relaxed">{rec.tip}</p>
      </div>
    </div>
  );
}
