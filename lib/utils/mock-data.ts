import { CognitiveLog, EffectiveRange } from '@/types';
import { MEDICATION_PRESETS, calculateCumulativeConcentration, estimateFocusFromConcentration, DoseEvent } from './cognitive-math';

export function generateMockData(): {
  logs: CognitiveLog[];
  medications: typeof MEDICATION_PRESETS[keyof typeof MEDICATION_PRESETS][];
} {
  const logs: CognitiveLog[] = [];
  const medications = Object.values(MEDICATION_PRESETS);

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const doses = [
    { time: 8, med: 'methylphenidate-ir', dose: 20 },
    { time: 12, med: 'methylphenidate-ir', dose: 20 },
    { time: 16, med: 'caffeine', dose: 100 },
  ];

  doses.forEach(({ time, med, dose }) => {
    const doseTime = new Date(today);
    doseTime.setHours(time, 0, 0, 0);

    if (doseTime <= now) {
      logs.push({
        id: `dose-${time}`,
        timestamp: doseTime,
        logType: 'medication',
        data: {
          medicationId: med,
          medicationName: MEDICATION_PRESETS[med]?.name || med,
          dose,
          doseUnit: 'mg',
          releaseType: MEDICATION_PRESETS[med]?.releaseType ?? 'instant',
          takenAt: doseTime.getTime(),
        },
      });
    }
  });

  return { logs, medications };
}

export function generateTimelineData(
  startTime: number, 
  endTime: number, 
  doses: DoseEvent[], 
  effectiveRange?: EffectiveRange,
  intervalMs?: number
) {
  const points = [];
  const interval = intervalMs ?? (15 * 60 * 1000);
  const showDate = (endTime - startTime) > (24 * 60 * 60 * 1000 + 1000); // More than 24h

  const times = new Set<number>();
  for (let time = startTime; time <= endTime; time += interval) {
    times.add(time);
  }
  for (const dose of doses) {
    times.add(dose.timestamp);
  }

  const sortedTimes = Array.from(times).sort((a, b) => a - b);

  for (const time of sortedTimes) {
    const { total: totalConcentration } = calculateCumulativeConcentration(doses, time);
    const dateObj = new Date(time);
    
    let timeStr = dateObj.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    if (showDate) {
      const dateStr = dateObj.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
      });
      timeStr = `${dateStr} ${timeStr}`;
    }

    const focus = Math.round(estimateFocusFromConcentration(totalConcentration, 50, effectiveRange));
    points.push({
      time: timeStr,
      timestamp: time,
      concentration: totalConcentration,
      focus: Math.max(0, Math.min(100, focus)),
    });
  }

  return points;
}
