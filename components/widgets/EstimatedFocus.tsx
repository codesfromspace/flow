'use client';

interface EstimatedFocusProps {
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export default function EstimatedFocus({ percentage, trend }: EstimatedFocusProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-status-green';
      case 'down': return 'text-status-amber';
      case 'stable': return 'text-status-blue';
    }
  };

  const getStatusLabel = () => {
    if (percentage >= 80) return 'Výborný fokus';
    if (percentage >= 60) return 'Dobrý fokus';
    if (percentage >= 40) return 'Střední fokus';
    return 'Nízký fokus';
  };

  const getTipBasedOnTrend = () => {
    if (trend === 'up') return 'Soustředění se zlepšuje.';
    if (trend === 'down') return 'Zvaž pauzu nebo vodu.';
    return 'Stabilní okno pro práci.';
  };

  return (
    <div className="card-base h-full min-h-[220px] p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-label">Kvalita soustředění</p>
        <span className={`text-lg font-medium ${getTrendColor()}`} title={`Trend: ${trend}`}>{getTrendIcon()}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <span className="text-headline font-light">{percentage}%</span>
        </div>
        <div className="w-full h-1 bg-card-border/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent-cyan to-accent-slate transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      <div className="bg-card-border/10 p-2 rounded space-y-2 border border-card-border/20">
        <p className="text-xs font-medium">{getStatusLabel()}</p>
        <p className="text-xs text-muted leading-relaxed">{getTipBasedOnTrend()}</p>
      </div>

      <div className="border-t border-card-border/20 pt-2">
        <p className="text-xs text-muted">
          <strong>ℹ️ Co to je:</strong> Odhadovaná úroveň soustředění na základě křivky medikace. Trend ukazuje, zda stoupá, klesá, nebo je stabilní.
        </p>
      </div>

    </div>
  );
}
