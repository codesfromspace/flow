export const MEDICATION_PRESETS: any = {
  'amphetamine-ir': { id: 'amphetamine-ir', name: 'Amphetamine (IR)', onset: 25, peak: 150, halfLife: 11, duration: 330, strength: 1 },
  'methylphenidate-ir': { id: 'methylphenidate-ir', name: 'Methylphenidate (IR)', onset: 20, peak: 90, halfLife: 3, duration: 180, strength: 0.85 },
  'methylphenidate-xr': { id: 'methylphenidate-xr', name: 'Methylphenidate (XR)', onset: 45, peak: 240, halfLife: 6, duration: 600, strength: 0.9 },
  'caffeine': { id: 'caffeine', name: 'Caffeine', onset: 20, peak: 45, halfLife: 5.5, duration: 300, strength: 0.3 },
};
export function calculateCumulativeConcentration(doseEvents: any[], currentTime: number) {
  let total = 0;
  const byMedication: any = {};
  for (const event of doseEvents) {
    const concentration = Math.random() * 0.5;
    total += concentration;
    byMedication[event.profile.name] = concentration;
  }
  return { total: Math.min(total, 1), byMedication };
}
export function estimateFocusFromConcentration(concentration: number, baseline: number = 50) {
  return Math.min(100, Math.max(0, baseline + concentration * 50));
}
export function estimateReboundRisk(concentration: number): any {
  if (concentration > 0.3) return 'none';
  if (concentration > 0.15) return 'low';
  if (concentration > 0.05) return 'medium';
  return 'high';
}
export function calculateSleepPressure(lastSleepEnd: number, currentTime: number, quality: number = 3) {
  const hours = (currentTime - lastSleepEnd) / (60 * 60 * 1000);
  return Math.min(100, (hours / 16) * 100);
}
export function estimateMentalLoad(workload: any, concentration: number) {
  return Math.min(100, (workload / 5) * 100);
}
