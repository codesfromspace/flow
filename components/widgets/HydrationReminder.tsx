'use client';

interface HydrationReminderProps {
  level: 1 | 2 | 3 | 4 | 5;
  concentration: number;
}

export default function HydrationReminder({ level, concentration }: HydrationReminderProps) {
  const isUrgent = level <= 2 && concentration > 0.4;
  const hasActiveMedication = concentration > 0.1;

  const getLevelLabel = () => {
    switch (level) {
      case 1: return 'Critical';
      case 2: return 'Low';
      case 3: return 'Adequate';
      case 4: return 'Good';
      case 5: return 'Excellent';
    }
  };

  const getLevelColor = () => {
    if (level <= 2) return 'text-status-danger';
    if (level === 3) return 'text-status-warning';
    return 'text-status-success';
  };

  const getRecommendation = () => {
    if (hasActiveMedication) {
      if (level <= 2) {
        return {
          title: '🚨 Pij NYNÍ!',
          message: 'Psychostimulanty zvyšují riziko dehydratace. Pij vodu každých 15-20 minut.',
          tips: ['500ml vody během příštích 10 minut', 'Obsahuj elektrolyt (minerální voda)', 'Vyhni se kofeinu'],
        };
      }
      if (level === 3) {
        return {
          title: '💧 Připomínka hydratace',
          message: 'S aktivní medicínou je hydratace kritická. Teď je dobrý čas na vodu.',
          tips: ['200-300ml vody', 'Pij pravidelně - ne všechno najednou', 'Monitor moči - měla by být čirá'],
        };
      }
      return {
        title: '✅ Dobrá hydratace',
        message: 'Udržuj si tento stav - s medicínou je dehydratace vážný problém.',
        tips: ['Pokračuj v pití vody', 'Každých 30 minut několik mouthfuls', 'Vyhni se alkoholu'],
      };
    } else {
      if (level <= 2) {
        return {
          title: '💧 Nízká hydratace',
          message: 'Přestože teď nejsi pod medikací, měl bys pít.',
          tips: ['Postupně pij vodu (ne najednou)', '200-300ml na jednu dobu', 'Jídlo s vysokým obsahem vody pomaže'],
        };
      }
      return {
        title: '✅ Normální stav',
        message: 'Hydratace je v pořádku. Pokud začneš brát medicínu, zvyš příjem vody.',
        tips: ['Preventivně pij v průběhu dne', 'Připrav si vodu předem', 'Sleduj své pocity žízně'],
      };
    }
  };

  const rec = getRecommendation();

  return (
    <div className={`card-base h-full min-h-[220px] p-4 flex flex-col justify-between gap-3 ${isUrgent ? 'border border-status-danger/40 bg-status-danger/5' : ''}`}>
      <div>
        <p className="text-label mb-2">Hydration Status</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-1.5 h-6 rounded-sm transition-all ${
                  i <= level
                    ? level <= 2
                      ? 'bg-status-danger'
                      : level === 3
                        ? 'bg-status-warning'
                        : 'bg-status-success'
                    : 'bg-card-border/20'
                }`}
              />
            ))}
          </div>
          <span className={`text-sm font-medium ${getLevelColor()}`}>{getLevelLabel()}</span>
        </div>
      </div>

      <div className="bg-card-border/10 p-3 rounded-lg space-y-2">
        <p className="text-sm font-medium text-foreground">{rec.title}</p>
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

      {hasActiveMedication && (
        <div className="border-t border-card-border/20 pt-2">
          <p className="text-xs text-muted font-medium">
            ℹ️ Psychostimulanty (amphetamin, methylphenidat) potlačují pocit žízně a zvyšují ztrátu tekutin. Dehydratace zvyšuje kardiovaskulární riziko.
          </p>
        </div>
      )}
    </div>
  );
}
