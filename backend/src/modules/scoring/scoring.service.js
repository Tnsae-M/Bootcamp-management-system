/**
 * Pure calculation module for student scoring signals and weights.
 * Zero database or network dependencies.
 */

/**
 * Computes a composite weighted score from independent signals and bootcamp weights.
 *
 * @param {Object} signals
 * @param {number} signals.attendanceRate - 0 to 100 percentage
 * @param {number} signals.avgIndividualScore - 0 to 100 percentage
 * @param {number} signals.avgMilestoneScore - 0 to 100 percentage
 * @param {number} signals.avgPeerReviewScore - 1 to 5 rating scale
 *
 * @param {Object} weights
 * @param {number} weights.attendanceWeight - e.g. 20
 * @param {number} weights.individualTaskWeight - e.g. 40
 * @param {number} weights.groupMilestoneWeight - e.g. 30
 * @param {number} weights.peerReviewWeight - e.g. 10
 *
 * @returns {number} Weighted composite score (0 to 100)
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const computeWeightedScore = (signals, weights) => {
  const sumWeights =
    weights.attendanceWeight +
    weights.individualTaskWeight +
    weights.groupMilestoneWeight +
    weights.peerReviewWeight;

  if (sumWeights !== 100) {
    const error = new Error('Weights must sum to 100%');
    error.statusCode = 400;
    throw error;
  }

  const attendance = clamp(signals.attendanceRate, 0, 100);
  const individual = clamp(signals.avgIndividualScore, 0, 100);
  const milestone = clamp(signals.avgMilestoneScore, 0, 100);
  const peerRating = clamp(signals.avgPeerReviewScore, 0, 5.0);
  const peerPercentage = (peerRating / 5.0) * 100;

  const total =
    (attendance * weights.attendanceWeight) / 100 +
    (individual * weights.individualTaskWeight) / 100 +
    (milestone * weights.groupMilestoneWeight) / 100 +
    (peerPercentage * weights.peerReviewWeight) / 100;

  return Math.round(clamp(total, 0, 100) * 100) / 100;
};

/**
 * Adjusts an individual's score on a group milestone using their peer review rating.
 *
 * Formula:
 * - Peer rating is clamped to [1.0, 5.0].
 * - Neutral rating (3.0) gives multiplier 1.0 (100% of group score).
 * - Rating < 3.0 scales down to 0.6 at rating 1.0 (-20% per rating point below 3.0).
 * - Rating > 3.0 scales up to 1.10 at rating 5.0 (+5% per rating point above 3.0).
 * - Output is strictly clamped between 0 and 100.
 *
 * @param {number} groupScore - Base score earned by the group (0 to 100)
 * @param {number} peerRating - Average rating received from peers (1.0 to 5.0)
 * @returns {number} Adjusted milestone score (0 to 100)
 */
export const adjustMilestoneScore = (groupScore, peerRating) => {
  const rating = clamp(peerRating, 1.0, 5.0);
  const base = clamp(groupScore, 0, 100);

  let multiplier = 1.0;
  if (rating < 3.0) {
    // Drops from 1.0 down to 0.6 as rating drops from 3.0 to 1.0
    multiplier = 1.0 - (3.0 - rating) * 0.2;
  } else if (rating > 3.0) {
    // Rises from 1.0 up to 1.10 as rating rises from 3.0 to 5.0
    multiplier = 1.0 + (rating - 3.0) * 0.05;
  }

  const adjusted = base * multiplier;
  return Math.round(clamp(adjusted, 0, 100) * 100) / 100;
};
