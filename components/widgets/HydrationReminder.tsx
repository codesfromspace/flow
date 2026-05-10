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
      case 1: return 'Kritický';
      case 2: return 'Nízký';
      case 3: return 'Adekvátní';
      case 4: return 'Dobrý';
      case 5: return 'Výborný';
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
        return 'Napij se hned. Medikace zvyšuje riziko dehydratace.';
      }
      if (level === 3) {
        return 'Ideální chvíle pro 200-300ml vody.';
      }
      return 'Udržuj stabilní příjem tekutin.';
    } else {
      if (level <= 2) {
        return 'Nízká hydratace. Pij postupně.';
      }
      return 'Hydratace je stabilní.';
    }
  };

  const summary = getRecommendation();

  return (
    <div className={`card-base h-full min-h-[220px] p-4 flex flex-col justify-between gap-3 ${isUrgent ? 'border border-status-danger/40 bg-status-danger/5' : ''}`}>
      <div>
        <p className="text-label mb-2">Stav hydratace</p>
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

      <p className="rounded-xl border border-card-border/60 bg-card-border/10 p-3 text-xs font-medium leading-relaxed text-muted">{summary}</p>
      {hasActiveMedication ? <p className="text-xs font-medium text-muted">Aktivní medikace: doplňuj tekutiny pravidelně.</p> : null}
    </div>
  );
}
