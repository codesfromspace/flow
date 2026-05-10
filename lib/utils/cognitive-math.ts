import { EffectiveRange, MedicationProfile } from '@/types';

export const MEDICATION_PRESETS: Record<string, MedicationProfile> = {
  'amphetamine-ir': {
    id: 'amphetamine-ir',
    name: 'Amphetamine (IR)',
    onset: 25,
    peak: 150,
    halfLife: 11,
    duration: 660,
    strength: 1,
    defaultDose: 10,
    referenceDose: 10,
    releaseType: 'instant',
  },
  'methylphenidate-ir': {
    id: 'methylphenidate-ir',
    name: 'Methylphenidate (IR)',
    onset: 20,
    peak: 90,
    halfLife: 3,
    duration: 300,
    strength: 0.85,
    defaultDose: 10,
    referenceDose: 10,
    releaseType: 'instant',
  },
  'methylphenidate-xr': {
    id: 'methylphenidate-xr',
    name: 'Methylphenidate (XR)',
    onset: 45,
    peak: 240,
    halfLife: 6,
    duration: 600,
    strength: 0.9,
    defaultDose: 18,
    referenceDose: 18,
    releaseType: 'extended',
  },
  caffeine: {
    id: 'caffeine',
    name: 'Caffeine',
    onset: 20,
    peak: 45,
    halfLife: 5.5,
    duration: 360,
    strength: 0.3,
    defaultDose: 100,
    referenceDose: 100,
    releaseType: 'instant',
  },
};

export interface DoseEvent {
  timestamp: number;
  dose: number;
  profile: MedicationProfile;
}

export const DEFAULT_EFFECTIVE_RANGE: EffectiveRange = {
  lower: 0.18,
  upper: 0.55,
  optimal: 0.38,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function calculateDoseConcentration(event: DoseEvent, currentTime: number) {
  if (currentTime < event.timestamp || event.dose <= 0) return 0;

  const elapsedMinutes = (currentTime - event.timestamp) / 60000;
  const { onset, peak, halfLife, duration, strength } = event.profile;

  if (elapsedMinutes >= duration) return 0;

  const referenceDose = event.profile.referenceDose ?? event.profile.defaultDose ?? 10;
  const doseScale = event.dose / Math.max(referenceDose, 1);
  const peakLevel = Math.max(0, doseScale * strength * 0.52);

  if (elapsedMinutes <= onset) {
    return Math.max(0, (elapsedMinutes / Math.max(onset, 1)) * peakLevel * 0.65);
  }

  if (elapsedMinutes <= peak) {
    const riseProgress = (elapsedMinutes - onset) / Math.max(peak - onset, 1);
    return Math.max(0, peakLevel * (0.65 + riseProgress * 0.35));
  }

  const timeSincePeak = elapsedMinutes - peak;
  const halfLifeMinutes = Math.max(halfLife * 60, 1);
  const decay = Math.exp(-(Math.LN2 / halfLifeMinutes) * timeSincePeak);
  return Math.max(0, peakLevel * decay);
}

export function calculateCumulativeConcentration(doseEvents: DoseEvent[], currentTime: number) {
  let total = 0;
  const byMedication: Record<string, number> = {};

  for (const event of doseEvents) {
    const concentration = calculateDoseConcentration(event, currentTime);
    if (concentration <= 0) continue;

    total += concentration;
    byMedication[event.profile.name] = (byMedication[event.profile.name] ?? 0) + concentration;
  }

  return {
    total: Math.max(0, total),
    byMedication: Object.fromEntries(
      Object.entries(byMedication).map(([name, value]) => [name, Math.max(0, value)])
    ),
  };
}

export function normalizeEffectiveRange(range?: EffectiveRange): EffectiveRange {
  const lower = clamp(range?.lower ?? DEFAULT_EFFECTIVE_RANGE.lower, 0.01, 0.95);
  const upper = clamp(range?.upper ?? DEFAULT_EFFECTIVE_RANGE.upper, lower + 0.01, 1);
  const optimal = clamp(range?.optimal ?? DEFAULT_EFFECTIVE_RANGE.optimal, lower, upper);
  return { lower, upper, optimal };
}

export function estimateFocusFromConcentration(concentration: number, baseline: number = 50, range?: EffectiveRange) {
  const effectiveRange = normalizeEffectiveRange(range);
  const underTargetGain = Math.min(concentration, effectiveRange.optimal) * 88;
  const aboveTarget = Math.max(0, concentration - effectiveRange.upper);
  const overstimulationPenalty = aboveTarget * 85;
  return clamp(baseline + underTargetGain - overstimulationPenalty, 0, 100);
}

export function estimateReboundRisk(concentration: number): 'none' | 'low' | 'medium' | 'high' {
  if (concentration > 0.35) return 'none';
  if (concentration > 0.18) return 'low';
  if (concentration > 0.06) return 'medium';
  return 'high';
}

export function calculateSleepPressure(lastSleepEnd: number, currentTime: number, quality: number = 3) {
  const hoursAwake = Math.max(0, (currentTime - lastSleepEnd) / 3600000);
  const qualityPenalty = (3 - quality) * 7;
  return clamp((hoursAwake / 16) * 100 + qualityPenalty, 0, 100);
}

export function estimateMentalLoad(workload: number, concentration: number) {
  const stimulantBuffer = concentration * 18;
  return clamp((workload / 5) * 100 - stimulantBuffer, 0, 100);
}
