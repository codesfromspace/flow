'use client';

interface MentalLoadProps {
  load: number;
  capacity: number;
}

export default function MentalLoad({ load, capacity }: MentalLoadProps) {
  const overloaded = load > capacity;

  const getLoadColor = () => {
    if (overloaded) return 'text-status-red';
    if (load > capacity * 0.8) return 'text-status-amber';
    return 'text-status-green';
  };

  return (
    <div className="card-base p-4 space-y-3">
      <p className="text-label">Mental Load</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-title font-light ${getLoadColor()}`}>{Math.round(load)}%</span>
          {overloaded && <span className="badge-danger">Overloaded</span>}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted">Current Load</div>
          <div className="w-full h-1.5 bg-card-border/20 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${overloaded ? 'bg-status-red' : load > capacity * 0.8 ? 'bg-status-amber' : 'bg-status-green'}`} style={{ width: `${Math.min(load, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
