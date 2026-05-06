import { v4 as uuidv4 } from 'uuid';
import { MEDICATION_PRESETS, estimateFocusFromConcentration } from './cognitive-math';

export function generateMockData(daysBack: number = 7) {
  const logs: any[] = [];
  const medications = Object.values(MEDICATION_PRESETS);
  return { logs, medications };
}

export function generateTimelineData(startTime: number, endTime: number, doses: Array<{ timestamp: number; dose: number; profile: any }>) {
  const points = [];
  const interval = 15 * 60 * 1000;

  for (let time = startTime; time <= endTime; time += interval) {
    let totalConcentration = 0;

    // Vypočítej koncentraci ze všech aktivních dávek
    for (const dose of doses) {
      if (time < dose.timestamp) continue;

      const elapsedMinutes = (time - dose.timestamp) / (1000 * 60);
      const profile = dose.profile;

      if (elapsedMinutes < profile.duration) {
        const onsetEnd = profile.onset;
        const peakTime = profile.peak;

        if (elapsedMinutes < onsetEnd) {
          // Fáze absorpce
          totalConcentration += (elapsedMinutes / onsetEnd) * dose.dose * 0.01;
        } else if (elapsedMinutes <= peakTime) {
          // Fáze stoupání ke špičce
          const rise = (elapsedMinutes - onsetEnd) / (peakTime - onsetEnd);
          totalConcentration += dose.dose * 0.01 * (0.7 + rise * 0.3);
        } else {
          // Fáze poklesu (exponenciální rozpad)
          const timeSincePeak = elapsedMinutes - peakTime;
          const halfLife = profile.halfLife * 60;
          const decayRate = Math.LN2 / halfLife;
          totalConcentration += dose.dose * 0.01 * Math.exp(-decayRate * timeSincePeak);
        }
      }
    }

    const timeStr = new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const focus = Math.round(estimateFocusFromConcentration(totalConcentration, 50));

    const optimalPeak = 0.75;
    const gaussianWidth = 0.15;
    const deviation = Math.abs(totalConcentration - optimalPeak) / gaussianWidth;
    const idealFocus = Math.exp(-0.5 * deviation * deviation);

    const targetZoneDeviation = Math.abs(0.5 - optimalPeak) / gaussianWidth;
    const targetZoneBase = Math.exp(-0.5 * targetZoneDeviation * targetZoneDeviation) * 0.6;

    points.push({
      time: timeStr,
      timestamp: time,
      concentration: Math.min(totalConcentration, 1),
      focus: Math.max(0, Math.min(100, focus)),
      optimalFocus: Math.max(idealFocus, targetZoneBase),
    });
  }

  return points;
}
