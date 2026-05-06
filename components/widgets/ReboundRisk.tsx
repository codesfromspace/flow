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
          tips: ['Ideální čas na zahájení nové dávky', 'Stabilní mood a soustředění'],
        };
      case 'low':
        return {
          title: '🟢 Nízké riziko',
          message: 'Efekt se pomalu stírá. Rebound bude mírný.',
          tips: ['Hydratuj se', 'Vyhni se dalším stimulantům', 'Zvažuj proteinový snack'],
        };
      case 'medium':
        return {
          title: '🟡 Střední riziko',
          message: 'Významný pokles dopaminu se blíží. Buď připravený.',
          tips: ['Oznámení na pozadí', 'Plánuj lehčí úkoly na později', 'Voda, spánek, pohyb', 'Vyhni se dalším stimulantům'],
        };
      case 'high':
        return {
          title: '🔴 Vysoké riziko',
          message: 'Rebound je NYNÍ nebo začal. Očekávej pokles energie.',
          tips: ['Pauza a relaxace (medatce/Walk)', '15-30 min spánku nebo lehu', 'Voda a potravina s proteiny', 'Bez dalších stimulantů', 'Empatický postoj k sobě - je to normální'],
        };
    }
  };

  const rec = getRecommendation();

  return (
    <div className={`card-base p-4 space-y-3 border bg-gradient-to-br ${getRiskColor()}`}>
      <p className="text-label">Rebound Risk</p>
      <p className={`text-headline font-light ${getRiskTextColor()}`}>{getRiskLabel()}</p>
      {timeToRebound && (
        <p className="text-xs text-muted">Očekáváno za {Math.round(timeToRebound / 60)}h {Math.round(timeToRebound % 60)}m</p>
      )}

      <div className="bg-card-border/10 p-2 rounded space-y-2 border border-card-border/20">
        <p className="text-xs font-medium">{rec.title}</p>
        <p className="text-xs text-muted leading-relaxed">{rec.message}</p>
        <ul className="text-xs text-muted space-y-1">
          {rec.tips.map((tip, i) => (
            <li key={i} className="flex gap-2">
              <span>•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-card-border/20 pt-2">
        <p className="text-xs text-muted">
          <strong>ℹ️ Co to je:</strong> Rebound je pokles dopaminu POD baseline po odeznění léku. Psychicky: únava, deprese, nedostatek motivace. Je to normální a přejde.
        </p>
      </div>
    </div>
  );
}
