import { describe, it, expect } from 'vitest';
import { 
  calculateDoseConcentration,
  calculateSleepPressure, 
  estimateStimulantEffect,
  estimateFocusFromConcentration, 
  estimateReboundRisk,
  MEDICATION_PRESETS,
  normalizeEffectiveRange,
} from '../lib/utils/cognitive-math';

describe('Cognitive Math', () => {
  describe('calculateDoseConcentration', () => {
    it('returns 0 before a dose is taken', () => {
      const now = Date.now();
      const concentration = calculateDoseConcentration({
        timestamp: now + 60 * 1000,
        dose: 10,
        profile: MEDICATION_PRESETS['methylphenidate-ir'],
      }, now);

      expect(concentration).toBe(0);
    });

    it('returns 0 for non-positive doses', () => {
      const now = Date.now();
      const concentration = calculateDoseConcentration({
        timestamp: now,
        dose: 0,
        profile: MEDICATION_PRESETS['methylphenidate-ir'],
      }, now + 60 * 60 * 1000);

      expect(concentration).toBe(0);
    });

    it('models extended release as slower early activation than instant release', () => {
      const now = Date.now();
      const currentTime = now + 60 * 60 * 1000;
      const instant = calculateDoseConcentration({
        timestamp: now,
        dose: 18,
        profile: MEDICATION_PRESETS['methylphenidate-xr'],
        releaseType: 'instant',
      }, currentTime);
      const extended = calculateDoseConcentration({
        timestamp: now,
        dose: 18,
        profile: MEDICATION_PRESETS['methylphenidate-xr'],
        releaseType: 'extended',
      }, currentTime);

      expect(extended).toBeLessThan(instant);
    });

    it('keeps extended release active later than instant release for the same profile', () => {
      const now = Date.now();
      const currentTime = now + 7 * 60 * 60 * 1000;
      const instant = calculateDoseConcentration({
        timestamp: now,
        dose: 18,
        profile: MEDICATION_PRESETS['methylphenidate-xr'],
        releaseType: 'instant',
      }, currentTime);
      const extended = calculateDoseConcentration({
        timestamp: now,
        dose: 18,
        profile: MEDICATION_PRESETS['methylphenidate-xr'],
        releaseType: 'extended',
      }, currentTime);

      expect(extended).toBeGreaterThan(instant);
    });
  });

  describe('normalizeEffectiveRange', () => {
    it('keeps effective range values ordered and within bounds', () => {
      expect(normalizeEffectiveRange({ lower: -1, optimal: 2, upper: 0 })).toEqual({
        lower: 0.01,
        optimal: 0.02,
        upper: 0.02,
      });
    });
  });

  describe('estimateStimulantEffect', () => {
    it('separates activation from overstimulation', () => {
      const optimal = estimateStimulantEffect(0.38);
      const high = estimateStimulantEffect(0.9);

      expect(optimal.activation).toBeCloseTo(1);
      expect(optimal.overstimulation).toBe(0);
      expect(high.overstimulation).toBeGreaterThan(optimal.overstimulation);
      expect(high.score).toBeLessThan(optimal.score);
    });
  });

  describe('calculateSleepPressure', () => {
    it('calculates 0 pressure immediately after waking up', () => {
      const now = Date.now();
      expect(calculateSleepPressure(now, now)).toBe(0);
    });

    it('calculates approximately 100 pressure after 16 hours awake with normal quality', () => {
      const now = Date.now();
      const awake16Hours = now + 16 * 60 * 60 * 1000;
      expect(calculateSleepPressure(now, awake16Hours, 3)).toBeCloseTo(100, 0);
    });

    it('adds penalty for poor sleep quality', () => {
      const now = Date.now();
      const awake8Hours = now + 8 * 60 * 60 * 1000;
      const pressureNormal = calculateSleepPressure(now, awake8Hours, 3);
      const pressurePoor = calculateSleepPressure(now, awake8Hours, 1);
      expect(pressurePoor).toBeGreaterThan(pressureNormal);
    });
  });

  describe('estimateFocusFromConcentration', () => {
    it('returns baseline when concentration is 0', () => {
      expect(estimateFocusFromConcentration(0, 50)).toBe(50);
    });

    it('increases focus as concentration goes up within optimal range', () => {
      const focusLow = estimateFocusFromConcentration(0.1, 50);
      const focusMed = estimateFocusFromConcentration(0.3, 50);
      expect(focusMed).toBeGreaterThan(focusLow);
    });

    it('penalizes focus when overstimulated (above upper range)', () => {
      const range = { lower: 0.18, upper: 0.55, optimal: 0.38 };
      const focusOptimal = estimateFocusFromConcentration(0.38, 50, range);
      const focusOver = estimateFocusFromConcentration(0.8, 50, range);
      expect(focusOver).toBeLessThan(focusOptimal);
    });
  });

  describe('estimateReboundRisk', () => {
    it('returns "none" for high concentration', () => {
      expect(estimateReboundRisk(0.4)).toBe('none');
    });

    it('returns "low" for medium concentration', () => {
      expect(estimateReboundRisk(0.25)).toBe('low');
    });

    it('returns "high" for very low concentration', () => {
      expect(estimateReboundRisk(0.01)).toBe('high');
    });
  });
});
