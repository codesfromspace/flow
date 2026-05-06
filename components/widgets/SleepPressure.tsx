'use client';

interface SleepPressureProps {
  pressure: number;
  hoursAwake: number;
}

export default function SleepPressure({ pressure, hoursAwake }: SleepPressureProps) {
  const getHealthStatus = () => {
    if (pressure < 30) return 'Low';
    if (pressure < 60) return 'Moderate';
    if (pressure < 80) return 'High';
    return 'Critical';
  };

  const getStatusColor = () => {
    if (pressure < 30) return 'from-status-green/10 to-status-green/5';
    if (pressure < 60) return 'from-status-blue/10 to-status-blue/5';
    if (pressure < 80) return 'from-status-amber/10 to-status-amber/5';
    return 'from-status-red/10 to-status-red/5';
  };

  const getTextColor = () => {
    if (pressure < 30) return 'text-status-green';
    if (pressure < 60) return 'text-status-blue';
    if (pressure < 80) return 'text-status-amber';
    return 'text-status-red';
  };

  const getRecommendation = () => {
    if (pressure < 30) {
      return {
        title: '✅ Odpočinutý',
        message: 'Dostatečně jsi spali. Tvůj mozek je svěží.',
        tips: ['Ideální čas pro náročnou práci', 'Vysoká kvalita rozhodování', 'Dobré chování proti medicíně'],
      };
    }
    if (pressure < 60) {
      return {
        title: '🟢 Normální',
        message: 'Spánkový tlak je přiměřený. Dobrá pracovní kapacita.',
        tips: ['Buď normální v práci', 'Zvažuj malou přestávku na později', 'Bez spánkového deficitu'],
      };
    }
    if (pressure < 80) {
      return {
        title: '🟡 Vysoký tlak',
        message: 'Jsi vzhůru příliš dlouho. Spánek by byl dobrý.',
        tips: ['Skoč si 20 min (power nap)', 'Kofein POUZE do 15:00', 'Voda a zdravé jídlo', 'Zmiňuj si pracovní tempo'],
      };
    }
    return {
      title: '🔴 Kritický deficit',
      message: 'MUSÍŠ SPÁT. Tvůj mozek je podstatně zhoršen.',
      tips: ['30-90 min spánek ASAP', 'Medicína nebude fungovat správně', 'Nesuď své schopnosti - jsi únava', 'Bezpečnost: Neřídí, neoperuj stroje'],
    };
  };

  const rec = getRecommendation();

  return (
    <div className={`card-base p-4 space-y-3 bg-gradient-to-br ${getStatusColor()}`}>
      <p className="text-label">Sleep Pressure</p>
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-headline font-light">{Math.round(pressure)}%</span>
          <span className={`text-xs font-medium ${getTextColor()}`}>{getHealthStatus()}</span>
        </div>
        <div className="w-full h-2 bg-card-border/20 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 ${pressure < 30 ? 'bg-status-green' : pressure < 60 ? 'bg-status-blue' : pressure < 80 ? 'bg-status-amber' : 'bg-status-red'}`} style={{ width: `${pressure}%` }} />
        </div>
      </div>
      <p className="text-xs text-muted">Vzhůru {Math.floor(hoursAwake)}h {Math.round((hoursAwake % 1) * 60)}m</p>

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
          <strong>ℹ️ Co to je:</strong> Spánkový tlak se zvyšuje čím déle jsi vzhůru. Ovlivňuje tvou schopnost se soustředit a kvalitu efektu medicíny.
        </p>
      </div>
    </div>
  );
}
