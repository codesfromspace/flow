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

  return (
    <div className="card-base p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-label">Focus Quality</p>
        <span className={`text-lg font-medium ${getTrendColor()}`}>{getTrendIcon()}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <span className="text-headline font-light">{percentage}%</span>
        </div>
        <div className="w-full h-1 bg-card-border/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent-cyan to-accent-slate transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <p className="text-xs text-muted">
        {percentage >= 80 ? 'Excellent focus' : percentage >= 60 ? 'Good focus' : percentage >= 40 ? 'Moderate focus' : 'Low focus'}
      </p>
    </div>
  );
}
