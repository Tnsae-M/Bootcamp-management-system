import { describe, it, expect } from 'vitest';
import { computeWeightedScore, adjustMilestoneScore } from '../src/modules/scoring/scoring.service.js';

describe('scoring.service - computeWeightedScore', () => {
  it('calculates the weighted composite score from independent signals and weights', () => {
    const signals = {
      attendanceRate: 100,        // 100% * 0.20 = 20.0
      avgIndividualScore: 80,     // 80%  * 0.40 = 32.0
      avgMilestoneScore: 90,      // 90%  * 0.30 = 27.0
      avgPeerReviewScore: 4.0     // 4.0 / 5.0 = 80% * 0.10 = 8.0
    };

    const weights = {
      attendanceWeight: 20,
      individualTaskWeight: 40,
      groupMilestoneWeight: 30,
      peerReviewWeight: 10
    };

    // Expected: 20.0 + 32.0 + 27.0 + 8.0 = 87.0
    const result = computeWeightedScore(signals, weights);
    expect(result).toBe(87.0);
  });

  it('throws a ValidationError when the weights do not sum up to 100%', () => {
    const signals = {
      attendanceRate: 80,
      avgIndividualScore: 80,
      avgMilestoneScore: 80,
      avgPeerReviewScore: 4.0
    };

    const invalidWeights = {
      attendanceWeight: 20,
      individualTaskWeight: 40,
      groupMilestoneWeight: 30,
      peerReviewWeight: 5 // Sum = 95 != 100
    };

    expect(() => computeWeightedScore(signals, invalidWeights)).toThrow(
      'Weights must sum to 100%'
    );
  });

  it('clamps signal values so the score stays strictly within [0, 100]', () => {
    const excessiveSignals = {
      attendanceRate: 150,        // should be clamped to 100 -> 25.0
      avgIndividualScore: 120,     // should be clamped to 100 -> 25.0
      avgMilestoneScore: 110,      // should be clamped to 100 -> 25.0
      avgPeerReviewScore: 6.0      // should be clamped to 5.0 -> 100% -> 25.0
    };

    const weights = {
      attendanceWeight: 25,
      individualTaskWeight: 25,
      groupMilestoneWeight: 25,
      peerReviewWeight: 25
    };

    const result = computeWeightedScore(excessiveSignals, weights);
    expect(result).toBe(100.0);

    const negativeSignals = {
      attendanceRate: -20,
      avgIndividualScore: -10,
      avgMilestoneScore: -5,
      avgPeerReviewScore: 0
    };

    const minResult = computeWeightedScore(negativeSignals, weights);
    expect(minResult).toBe(0.0);
  });
});

describe('scoring.service - adjustMilestoneScore', () => {
  it('leaves group score untouched when peer rating is neutral (3.0)', () => {
    const adjusted = adjustMilestoneScore(90, 3.0);
    expect(adjusted).toBe(90.0);
  });

  it('reduces individual score proportionally for free-riders (peer rating < 3.0)', () => {
    // 1.0 peer rating drops score to 60% of base: 90 * 0.6 = 54.0
    const penalized = adjustMilestoneScore(90, 1.0);
    expect(penalized).toBe(54.0);
  });

  it('grants a modest contribution bonus for high peer rating (up to 110%), capped at 100 max', () => {
    // 5.0 peer rating grants +10% bonus: 80 * 1.10 = 88.0
    const rewarded = adjustMilestoneScore(80, 5.0);
    expect(rewarded).toBe(88.0);

    // Capped at 100: 95 * 1.10 = 104.5 -> capped to 100.0
    const capped = adjustMilestoneScore(95, 5.0);
    expect(capped).toBe(100.0);
  });
});
