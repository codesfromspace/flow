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
      <p className="text-xs text-muted">Awake {Math.floor(hoursAwake)}h {Math.round((hoursAwake % 1) * 60)}m</p>
    </div>
  );
}
