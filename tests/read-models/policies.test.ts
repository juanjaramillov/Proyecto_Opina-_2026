import { ThresholdPolicies } from '../../src/read-models/shared/thresholdPolicies';

describe('ThresholdPolicies', () => {
  describe('isMajority', () => {
    it('returns true for shares >= 50', () => {
      expect(ThresholdPolicies.isMajority(50)).toBe(true);
      expect(ThresholdPolicies.isMajority(50.1)).toBe(true);
      expect(ThresholdPolicies.isMajority(75)).toBe(true);
      expect(ThresholdPolicies.isMajority(100)).toBe(true);
    });

    it('returns false for shares < 50', () => {
      expect(ThresholdPolicies.isMajority(49.9)).toBe(false);
      expect(ThresholdPolicies.isMajority(0)).toBe(false);
      expect(ThresholdPolicies.isMajority(25)).toBe(false);
    });
  });

  describe('isHighlyPolarized', () => {
    it('identifies tight margins (45-55%) as highly polarized', () => {
      expect(ThresholdPolicies.isHighlyPolarized(50)).toBe(true);
      expect(ThresholdPolicies.isHighlyPolarized(48)).toBe(true);
      expect(ThresholdPolicies.isHighlyPolarized(54)).toBe(true);
      expect(ThresholdPolicies.isHighlyPolarized(45)).toBe(true);
      expect(ThresholdPolicies.isHighlyPolarized(55)).toBe(true);
    });

    it('identifies non-tight margins as not polarized', () => {
      expect(ThresholdPolicies.isHighlyPolarized(44.9)).toBe(false);
      expect(ThresholdPolicies.isHighlyPolarized(55.1)).toBe(false);
      expect(ThresholdPolicies.isHighlyPolarized(80)).toBe(false);
      expect(ThresholdPolicies.isHighlyPolarized(10)).toBe(false);
    });
  });

  describe('evaluateUserSufficiency', () => {
    it('identifies insufficient data (0 signals)', () => {
      expect(ThresholdPolicies.evaluateUserSufficiency(0)).toBe('insufficient_data');
    });

    it('identifies partial data (1-4 signals)', () => {
      expect(ThresholdPolicies.evaluateUserSufficiency(1)).toBe('partial_data');
      expect(ThresholdPolicies.evaluateUserSufficiency(4)).toBe('partial_data');
    });

    it('identifies sufficient data (>= 5 signals)', () => {
      expect(ThresholdPolicies.evaluateUserSufficiency(5)).toBe('sufficient_data');
      expect(ThresholdPolicies.evaluateUserSufficiency(100)).toBe('sufficient_data');
    });
  });

  describe('evaluateConfidence (Platform level)', () => {
    it('evaluates none for tiny samples (< 10)', () => {
      expect(ThresholdPolicies.evaluateConfidence(0)).toBe('none');
      expect(ThresholdPolicies.evaluateConfidence(9)).toBe('none');
    });
    
    it('evaluates exploratory for small samples (10-49)', () => {
      expect(ThresholdPolicies.evaluateConfidence(10)).toBe('exploratory');
      expect(ThresholdPolicies.evaluateConfidence(49)).toBe('exploratory');
    });

    it('evaluates confident for medium samples (50-499)', () => {
      expect(ThresholdPolicies.evaluateConfidence(50)).toBe('confident');
      expect(ThresholdPolicies.evaluateConfidence(499)).toBe('confident');
    });

    it('evaluates highly confident for large samples (>= 500)', () => {
      expect(ThresholdPolicies.evaluateConfidence(500)).toBe('highly_confident');
      expect(ThresholdPolicies.evaluateConfidence(10000)).toBe('highly_confident');
    });
  });

  describe('isEligibleForGlobalRanking', () => {
    it('requires at least 10 interactions', () => {
      expect(ThresholdPolicies.isEligibleForGlobalRanking(0)).toBe(false);
      expect(ThresholdPolicies.isEligibleForGlobalRanking(9)).toBe(false);
      expect(ThresholdPolicies.isEligibleForGlobalRanking(10)).toBe(true);
      expect(ThresholdPolicies.isEligibleForGlobalRanking(100)).toBe(true);
    });
  });
});
