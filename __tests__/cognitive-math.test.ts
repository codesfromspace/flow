import { describe, it, expect } from 'vitest';
import { 
  calculateSleepPressure, 
  estimateFocusFromConcentration, 
  estimateReboundRisk,
  MEDICATION_PRESETS 
} from '../lib/utils/cognitive-math';

describe('Cognitive Math', () => {
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
