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
    if (percentage >= 80) return 'Excellent focus';
    if (percentage >= 60) return 'Good focus';
    if (percentage >= 40) return 'Moderate focus';
    return 'Low focus';
  };

  const getTipBasedOnTrend = () => {
    if (trend === 'up') return 'Focus is improving.';
    if (trend === 'down') return 'Consider a break or water.';
    return 'Stable window for continuous work.';
  };

  return (
    <div className="card-base h-full min-h-[220px] p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-label">Focus Quality</p>
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

    </div>
  );
}
