import { CognitiveLog } from '@/types';
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

export function generateTimelineData(startTime: number, endTime: number, doses: DoseEvent[]) {
  const points = [];
  const interval = 15 * 60 * 1000;

  for (let time = startTime; time <= endTime; time += interval) {
    const { total: totalConcentration } = calculateCumulativeConcentration(doses, time);
    const timeStr = new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const focus = Math.round(estimateFocusFromConcentration(totalConcentration, 50));
    points.push({
      time: timeStr,
      timestamp: time,
      concentration: totalConcentration,
      focus: Math.max(0, Math.min(100, focus)),
    });
  }

  return points;
}
