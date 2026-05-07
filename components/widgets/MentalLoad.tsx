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

  const getSummary = () => {
    if (overloaded) return 'Over capacity. Reduce workload or split tasks.';
    if (load > capacity * 0.8) return 'Near capacity. Avoid multitasking.';
    return 'Within capacity. Good balance for focused work.';
  };

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

      <p className="rounded-xl border border-card-border/60 bg-card-border/10 p-3 text-xs font-medium leading-relaxed text-muted">{getSummary()}</p>
    </div>
  );
}
