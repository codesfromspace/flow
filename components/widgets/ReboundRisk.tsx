'use client';

interface ReboundRiskProps {
  level: 'none' | 'low' | 'medium' | 'high';
  timeToRebound?: number;
}

export default function ReboundRisk({ level, timeToRebound }: ReboundRiskProps) {
  const getRiskColor = () => {
    switch (level) {
      case 'none': return 'from-status-green/10 to-status-green/5 border-status-green/20';
      case 'low': return 'from-status-blue/10 to-status-blue/5 border-status-blue/20';
      case 'medium': return 'from-status-amber/10 to-status-amber/5 border-status-amber/20';
      case 'high': return 'from-status-red/10 to-status-red/5 border-status-red/20';
    }
  };

  const getRiskTextColor = () => {
    switch (level) {
      case 'none': return 'text-status-green';
      case 'low': return 'text-status-blue';
      case 'medium': return 'text-status-amber';
      case 'high': return 'text-status-red';
    }
  };

  const getRiskLabel = () => {
    switch (level) {
      case 'none': return 'No Risk';
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
    }
  };

  return (
    <div className={`card-base p-4 space-y-3 border bg-gradient-to-br ${getRiskColor()}`}>
      <p className="text-label">Rebound Risk</p>
      <p className={`text-headline font-light ${getRiskTextColor()}`}>{getRiskLabel()}</p>
      {timeToRebound && (
        <p className="text-xs text-muted">In {Math.round(timeToRebound / 60)}h {Math.round(timeToRebound % 60)}m</p>
      )}
    </div>
  );
}
