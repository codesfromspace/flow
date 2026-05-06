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

  const getRecommendation = () => {
    if (overstimulated) {
      return {
        title: '⚠️ Přestimulace',
        message: 'Mozek je v hyperaktivním stavu. Může být obtížné zpomalit myšlení.',
        tips: ['Zpomal tempo práce', 'Zkus meditaci nebo cvičení', 'Vyhni se dalším stimulantům', 'Voda a zdravé jídlo'],
      };
    }
    if (focusLevel >= 80) {
      return {
        title: '✅ Optimální fokus',
        message: 'Tvůj mozek je v ideálním stavu pro soustředěnou práci.',
        tips: ['Využij tuto dobu na důležité úkoly', 'Pracuj na projektech vyžadujících kreativitu', 'Záznamy mohou být hlubší a kvalitější'],
      };
    }
    if (focusLevel >= 60) {
      return {
        title: '🎯 Dobrý fokus',
        message: 'Dostatečná soustředěnost pro efektivní práci.',
        tips: ['Vhodné pro běžné úkoly', 'Zvažuj těžší úkoly postupně', 'Sleduj, jak se cítíš'],
      };
    }
    if (focusLevel >= 40) {
      return {
        title: '⚡ Středně slabý fokus',
        message: 'Soustředěnost je pouze střední. Zkus si pomoct.',
        tips: ['Krátký spánek nebo kofein', 'Rozdělení úkolů na menší kusy', 'Pohyb a čerstvý vzduch'],
      };
    }
    return {
      title: '📍 Nízký fokus',
      message: 'Soustředěnost je nízká. Tvůj mozek není připraven na těžkou práci.',
      tips: ['Odpočinek nebo spánek', 'Jídlo s proteiny a zdravými tuky', 'Fyzická aktivita (procházka)', 'Zvažuj konzultaci lékaře'],
    };
  };

  const rec = getRecommendation();

  return (
    <div className={`card-elevated col-span-full lg:col-span-2 p-6 lg:p-8 bg-gradient-to-br ${getBgColor()} animate-fade-in space-y-4`}>
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

      <div className="bg-card-border/10 p-3 rounded-lg space-y-2 border border-card-border/20">
        <p className="text-sm font-medium text-foreground">{rec.title}</p>
        <p className="text-xs text-muted leading-relaxed">{rec.message}</p>
        <ul className="text-xs text-muted space-y-1">
          {rec.tips.map((tip, i) => (
            <li key={i} className="flex gap-2">
              <span>•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-card-border/20 pt-3">
        <p className="text-xs text-muted">
          <strong>ℹ️ Co to je:</strong> Focus level je odhadnut z farmakokinetikou a vytvořené inverzní U-křivky. Optimum je kolem 75% - více není vždy lépe (přestimulace).
        </p>
      </div>
    </div>
  );
}
