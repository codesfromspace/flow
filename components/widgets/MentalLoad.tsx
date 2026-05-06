'use client';

interface MentalLoadProps {
  load: number;
  capacity: number;
}

export default function MentalLoad({ load, capacity }: MentalLoadProps) {
  const overloaded = load > capacity;
  const percentOfCapacity = (load / capacity) * 100;

  const getLoadColor = () => {
    if (overloaded) return 'text-status-red';
    if (load > capacity * 0.8) return 'text-status-amber';
    return 'text-status-green';
  };

  const getRecommendation = () => {
    if (overloaded) {
      return {
        title: '🔴 Přetížení',
        message: 'Tvá kognitivní kapacita je překročena. Výkon bude klesat.',
        tips: ['Deleguj nebo odlož úkoly', 'Rozděl velké projekty', 'Přestávky každých 25 minut', 'Ne všechno musí být NYNÍ'],
      };
    }
    if (load > capacity * 0.8) {
      return {
        title: '🟡 Vysoké zatížení',
        message: 'Blížíš se k limitům. Buď opatrný.',
        tips: ['Plánuj více si času', 'Vyhni se multitaskingu', 'Pamatuj na přestávky', 'Komunikuj, když potřebuješ pomoc'],
      };
    }
    return {
      title: '✅ Zdravé zatížení',
      message: 'Tvá kapacita je zdravě využitá. Dobrá rovnováha.',
      tips: ['Pokračuj v tom, co děláš', 'Máš prostor pro nové věci', 'Optimální pro učení a kreativitu'],
    };
  };

  const rec = getRecommendation();

  return (
    <div className="card-base h-full min-h-[220px] p-4 flex flex-col justify-between gap-3">
      <p className="text-label">Mental Load</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-title font-light ${getLoadColor()}`}>{Math.round(percentOfCapacity)}%</span>
          {overloaded && <span className="badge-danger">Přetížení</span>}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted">Kapacita: {Math.round(load)}/{capacity}</div>
          <div className="w-full h-1.5 bg-card-border/20 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${overloaded ? 'bg-status-red' : load > capacity * 0.8 ? 'bg-status-amber' : 'bg-status-green'}`} style={{ width: `${Math.min(percentOfCapacity, 100)}%` }} />
          </div>
        </div>
      </div>

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
          <strong>ℹ️ Co to je:</strong> Mental load je kombinace pracovního vytížení a tvé schopnosti jej zvládnout. Ovlivňuje ji koncentrace medicíny a kvalita spánku.
        </p>
      </div>
    </div>
  );
}
