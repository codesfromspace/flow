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
    if (trend === 'up') {
      return 'Tvůj fokus se zlepšuje. Pokračuj v tom, co děláš!';
    }
    if (trend === 'down') {
      return 'Tvůj fokus se zhoršuje. Zvažuj přestávku, vodu, nebo fyzickou aktivitu.';
    }
    return 'Tvůj fokus je stabilní. Dobrá pozice pro kontinuální práci.';
  };

  return (
    <div className="card-base p-4 space-y-3">
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

      <div className="border-t border-card-border/20 pt-2">
        <p className="text-xs text-muted">
          <strong>ℹ️ Co to je:</strong> Kvalita fokus je kombinace farmakologických efektů a spánkového tlaku. Ideální je 70-85% - vyšší už není výhodné.
        </p>
      </div>
    </div>
  );
}
