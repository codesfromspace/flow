'use client';

import { Area, AreaChart, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CurrentCognitiveStateProps {
  focusLevel: number;
  overstimulated: boolean;
  activeMedications: string[];
  timelineData?: any[];
  currentTime?: number;
}

export default function CurrentCognitiveState({
  focusLevel,
  overstimulated,
  activeMedications,
  timelineData = [],
  currentTime = Date.now(),
}: CurrentCognitiveStateProps) {
  const getStateLabel = () => {
    if (overstimulated) return 'Přestimulace';
    if (focusLevel >= 80) return 'Optimální fokus';
    if (focusLevel >= 60) return 'Dobrý fokus';
    if (focusLevel >= 40) return 'Střední fokus';
    return 'Nízký fokus';
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
        tip: 'Zpomal tempo, voda, bez dalších stimulantů.',
      };
    }
    if (focusLevel >= 80) {
      return {
        title: '✅ Optimální fokus',
        message: 'Tvůj mozek je v ideálním stavu pro soustředěnou práci.',
        tip: 'Využij okno na nejtěžší práci.',
      };
    }
    if (focusLevel >= 60) {
      return {
        title: '🎯 Dobrý fokus',
        message: 'Dostatečná soustředěnost pro efektivní práci.',
        tip: 'Dobré pro běžné úkoly a postupný rozjezd.',
      };
    }
    if (focusLevel >= 40) {
      return {
        title: '⚡ Středně slabý fokus',
        message: 'Soustředěnost je pouze střední. Zkus si pomoct.',
        tip: 'Rozděl práci na menší kroky, zvaž pauzu.',
      };
    }
    return {
      title: '📍 Nízký fokus',
      message: 'Soustředěnost je nízká. Tvůj mozek není připraven na těžkou práci.',
      tip: 'Odpočinek, jídlo a lehký pohyb budou lepší než tlak na výkon.',
    };
  };

  const rec = getRecommendation();

  return (
    <div className={`card-elevated h-full min-h-[220px] p-5 bg-gradient-to-br ${getBgColor()} animate-fade-in flex flex-col justify-between gap-4`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="group relative inline-flex items-center gap-1.5 cursor-help mb-2 z-50">
            <p className="text-label">Aktuální stav</p>
            <span className="text-muted text-[10px] opacity-70">ⓘ</span>
            
            <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-72 p-3.5 bg-[#0f1219] border border-card-border/50 rounded-xl shadow-2xl z-[100] text-xs leading-relaxed text-muted font-normal pointer-events-none">
              <strong className="text-foreground text-sm block mb-1">Jak se počítá fokus?</strong>
              Farmakokinetický model simuluje tvoji hladinu a odvozuje z ní fokus:
              <ul className="mt-2 space-y-1.5">
                <li><strong className="text-foreground font-medium">Základ:</strong> Bez látek je tvůj klidový fokus 50 %.</li>
                <li><strong className="text-status-green font-medium">Přínos:</strong> Jak se blížíš do tvého optimálního okna, fokus stoupá.</li>
                <li><strong className="text-status-red font-medium">Penalizace:</strong> Pokud okno přestřelíš (vezmeš moc), aktivuje se agresivní srážka za přestimulaci a mozek začne být roztěkaný.</li>
              </ul>
            </div>
          </div>
          <h2 className={`text-5xl font-light mb-2 ${getStateColor()}`}>{focusLevel}%</h2>
          <p className="text-lg text-foreground/80 mb-4">{getStateLabel()}</p>

          {activeMedications.length > 0 && (
            <div className="pt-4 border-t border-card-border/30">
              <p className="text-label mb-2">Aktivní látky</p>
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

      {/* Detailed Status Breakdown Grid */}
      <div className="flex-1 mt-2 grid grid-cols-2 gap-3 content-start">
         <div className="bg-card-border/5 rounded-xl p-3 border border-card-border/10 flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Nervový systém</p>
            <span className="text-sm font-semibold text-foreground">{overstimulated ? 'Sympatikus (Fight/Flight)' : 'Vyrovnaný (Klidný)'}</span>
         </div>
         <div className="bg-card-border/5 rounded-xl p-3 border border-card-border/10 flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Kognitivní kapacita</p>
            <span className="text-sm font-semibold text-foreground">{focusLevel >= 75 ? 'Vysoká (Deep Work)' : focusLevel >= 40 ? 'Střední (Běžné úkoly)' : 'Nízká (Odpočinek)'}</span>
         </div>
         <div className="bg-card-border/5 rounded-xl p-3 border border-card-border/10 flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Dopaminergní okno</p>
            <span className="text-sm font-semibold text-foreground">{activeMedications.length > 0 && focusLevel >= 60 ? 'Aktivní (Využij peak)' : 'Mimo optimální okno'}</span>
         </div>
         <div className="bg-card-border/5 rounded-xl p-3 border border-card-border/10 flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Očekávaný vývoj</p>
            <span className="text-sm font-semibold text-foreground">{focusLevel > 70 ? 'Zatím stabilní' : 'Pravděpodobný pokles'}</span>
         </div>
      </div>

      {timelineData.length > 0 && (
        <div className="h-16 mt-4 w-full opacity-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={overstimulated ? '#ef4444' : '#0e9fa8'} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={overstimulated ? '#ef4444' : '#0e9fa8'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="concentration" 
                stroke={overstimulated ? '#ef4444' : '#0e9fa8'} 
                fillOpacity={1} 
                fill="url(#colorLevel)" 
                strokeWidth={2} 
                isAnimationActive={false}
              />
              <ReferenceLine x={currentTime} stroke="#ffffff" strokeOpacity={0.4} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-card-border/10 p-3 rounded-lg space-y-2 border border-card-border/20 mt-4">
        <p className="text-sm font-medium text-foreground">{rec.title}</p>
        <p className="text-xs text-muted leading-relaxed">{rec.message}</p>
        <p className="text-xs text-muted leading-relaxed">{rec.tip}</p>
      </div>
    </div>
  );
}
