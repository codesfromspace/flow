'use client';

import { useState, useMemo } from 'react';
import { useCognitiveState } from '@/lib/context/CognitiveStateContext';
import ActivationCurve from '@/components/charts/ActivationCurve';
import PharmacologyInfo from '@/components/widgets/PharmacologyInfo';
import { generateTimelineData } from '@/lib/utils/mock-data';
import { MEDICATION_PRESETS } from '@/lib/utils/cognitive-math';

export default function GraphPage() {
  const { logs, medications, currentTime, effectiveRange, dayStart, dayEnd } = useCognitiveState();
  const [timeRange, setTimeRange] = useState<'1D' | '7D' | '30D'>('1D');

  const { graphData, displayDoses, summaryText } = useMemo(() => {
    const days = timeRange === '1D' ? 1 : timeRange === '7D' ? 7 : 30;
    const intervalMs = timeRange === '1D' ? 15 * 60 * 1000 : timeRange === '7D' ? 60 * 60 * 1000 : 4 * 60 * 60 * 1000; 
    
    // Pro 1D bere dayStart, pro 7D/30D bere dny zpět od dayEnd
    const rangeStart = timeRange === '1D' ? dayStart : dayEnd - days * 24 * 60 * 60 * 1000;

    const medicationById = new Map(medications.map(m => [m.id, m]));
    
    const recentDoses = logs
      .filter(l => l.logType === 'medication')
      .filter(l => l.timestamp.getTime() >= rangeStart && l.timestamp.getTime() <= dayEnd)
      .flatMap(log => {
        if (log.logType !== 'medication') return [];
        const profile = medicationById.get(log.data.medicationId) ?? MEDICATION_PRESETS[log.data.medicationId];
        if (!profile) return [];
        return [{
          timestamp: log.data.takenAt ?? log.timestamp.getTime(),
          dose: log.data.dose,
          profile,
        }];
      });

    const data = generateTimelineData(rangeStart, dayEnd, recentDoses, effectiveRange, intervalMs);

    const showDate = timeRange !== '1D';
    const dispDoses = recentDoses.map(dose => {
      const dateObj = new Date(dose.timestamp);
      let timeStr = dateObj.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
      if (showDate) {
        const dateStr = dateObj.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
        timeStr = `${dateStr} ${timeStr}`;
      }
      
      const shortName = dose.profile.id.includes('methyl') ? 'MPH' : dose.profile.id.includes('amphet') ? 'AMP' : 'Kofein';
      
      return {
        timestamp: dose.timestamp,
        time: timeStr,
        label: `${dose.dose}mg ${shortName}`,
        color: dose.profile.id.includes('methyl') ? '#0e9fa8' : dose.profile.id.includes('amphet') ? '#9333ea' : '#d97706',
      };
    });

    const totalsByMed = recentDoses.reduce((acc, dose) => {
      const shortName = dose.profile.id.includes('methyl') ? 'MPH' : dose.profile.id.includes('amphet') ? 'AMP' : 'Kofein';
      acc[shortName] = (acc[shortName] || 0) + dose.dose;
      return acc;
    }, {} as Record<string, number>);

    const summaryText = Object.entries(totalsByMed)
      .map(([name, total]) => {
        if (timeRange === '1D') return `${Math.round(total * 10) / 10}mg ${name}`;
        return `Ø ${Math.round((total / days) * 10) / 10}mg ${name}/den`;
      })
      .join(' • ');

    return { graphData: data, displayDoses: dispDoses, summaryText };
  }, [timeRange, logs, medications, dayStart, dayEnd, effectiveRange]);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto pb-8 pr-2">
      <div className="flex flex-col gap-4">
        {/* Time Range Selector & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {['1D', '7D', '30D'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as '1D' | '7D' | '30D')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  timeRange === range
                    ? 'bg-accent-cyan text-white shadow-sm'
                    : 'bg-card-border/10 text-muted hover:bg-card-border/30 hover:text-foreground border border-card-border/30'
                }`}
              >
                {range === '1D' ? 'Dnes' : range === '7D' ? 'Posledních 7 dní' : 'Posledních 30 dní'}
              </button>
            ))}
          </div>
          {summaryText && (
            <div className="text-sm font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-muted text-xs uppercase tracking-wider font-semibold">Celkem:</span>
              {summaryText}
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0">
          {graphData.length > 0 ? (
            <ActivationCurve 
              data={graphData} 
              medications={medications.map((m) => ({ name: m.name, color: '#0e9fa8', doseTime: 0 }))} 
              doses={displayDoses}
              currentTime={currentTime} 
              effectiveRange={effectiveRange} 
            />
          ) : (
            <div className="flex h-full items-center justify-center card-base">
              <p className="text-muted">Žádná data pro vybrané období.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="w-full">
        <PharmacologyInfo />
      </div>
    </div>
  );
}
