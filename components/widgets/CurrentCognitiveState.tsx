'use client';

import { useEffect, useState } from 'react';

interface CurrentCognitiveStateProps {
  focusLevel: number;
  overstimulated: boolean;
  activeMedications: string[];
}

export default function CurrentCognitiveState({
  focusLevel,
  overstimulated,
  activeMedications,
}: CurrentCognitiveStateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getStateLabel = () => {
    if (overstimulated) return 'Overstimulated';
    if (focusLevel >= 80) return 'Optimal Focus';
    if (focusLevel >= 60) return 'Good Focus';
    if (focusLevel >= 40) return 'Moderate Focus';
    return 'Low Focus';
  };

  const getStateColor = () => {
    if (overstimulated) return 'text-status-red';
    if (focusLevel >= 70) return 'text-status-green';
    if (focusLevel >= 50) return 'text-status-blue';
    return 'text-status-amber';
  };

  const getBgColor = () => {
    if (overstimulated) return 'from-status-red/10 to-status-amber/10';
    if (focusLevel >= 70) return 'from-status-green/10 to-status-blue/10';
    if (focusLevel >= 50) return 'from-status-blue/10 to-accent-cyan/10';
    return 'from-status-amber/10 to-status-blue/10';
  };

  return (
    <div className={`card-elevated col-span-full lg:col-span-2 p-6 lg:p-8 bg-gradient-to-br ${getBgColor()} animate-fade-in`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-label mb-2">Current State</p>
          <h2 className={`text-display font-light mb-2 ${getStateColor()}`}>{focusLevel}%</h2>
          <p className="text-title text-foreground/80 mb-4">{getStateLabel()}</p>

          {activeMedications.length > 0 && (
            <div className="pt-4 border-t border-card-border/30">
              <p className="text-label mb-2">Active Substances</p>
              <div className="flex flex-wrap gap-2">
                {activeMedications.map((med) => (
                  <span key={med} className="badge-base bg-accent-cyan/10 text-accent-cyan">{med}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-card-border/30" />
            <circle
              cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"
              className={getStateColor()}
              strokeDasharray={`${(focusLevel / 100) * 2 * Math.PI * 45} ${2 * Math.PI * 45}`}
              strokeLinecap="round" transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
            />
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-xs font-medium fill-muted">
              {focusLevel}%
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
