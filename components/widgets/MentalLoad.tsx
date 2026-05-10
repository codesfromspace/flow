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
    if (overloaded) return 'Kapacita překročena. Rozděl úkoly a zvaž pauzu.';
    if (load > capacity * 0.8) return 'Blízko maxima. Vyhni se multitaskingu.';
    return 'V normě. Dobrý balanc pro soustředěnou práci.';
  };

  return (
    <div className="card-base h-full min-h-[220px] p-4 flex flex-col justify-between gap-3">
      <p className="text-label">Mentální zátěž</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-title font-light ${getLoadColor()}`}>{Math.round(percentOfCapacity)}%</span>
          {overloaded && <span className="badge-danger">Přetížení</span>}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted">Využití: {Math.round(load)} / {capacity}</div>
          <div className="w-full h-2 bg-card-border/20 rounded-full overflow-hidden flex">
            <div className={`h-full transition-all duration-500 ${overloaded ? 'bg-status-red' : load > capacity * 0.8 ? 'bg-status-amber' : 'bg-status-blue'}`} style={{ width: `${Math.min(percentOfCapacity * 0.6, 100)}%` }} title="Soustředění" />
            <div className={`h-full transition-all duration-500 bg-status-amber/80`} style={{ width: `${Math.min(percentOfCapacity * 0.3, 100)}%` }} title="Únava" />
            <div className={`h-full transition-all duration-500 bg-status-red/80`} style={{ width: `${Math.min(percentOfCapacity * 0.1, 100)}%` }} title="Stres" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-card-border/10 rounded-lg p-2 border border-card-border/20">
          <p className="text-[10px] text-muted uppercase tracking-wider">Fokus</p>
          <div className="w-full h-1 bg-card-border/20 mt-1 rounded-full"><div className="h-full bg-accent-cyan w-[60%] rounded-full"></div></div>
        </div>
        <div className="bg-card-border/10 rounded-lg p-2 border border-card-border/20">
          <p className="text-[10px] text-muted uppercase tracking-wider">Únava CNS</p>
          <div className="w-full h-1 bg-card-border/20 mt-1 rounded-full"><div className="h-full bg-status-amber w-[40%] rounded-full"></div></div>
        </div>
      </div>

      <p className="rounded-xl border border-card-border/60 bg-card-border/10 p-3 text-xs font-medium leading-relaxed text-muted">{getSummary()}</p>
    </div>
  );
}
