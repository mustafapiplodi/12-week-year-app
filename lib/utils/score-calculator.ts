/**
 * Calculate weekly execution percentage
 */
export function calculateWeeklyScore(
  plannedCount: number,
  completedCount: number
): number {
  if (plannedCount === 0) return 0
  return Math.round((completedCount / plannedCount) * 100)
}

/**
 * Calculate overall cycle score (average of all weekly scores)
 */
export function calculateCycleScore(weeklyScores: number[]): number {
  if (weeklyScores.length === 0) return 0
  const sum = weeklyScores.reduce((acc, score) => acc + score, 0)
  return Math.round(sum / weeklyScores.length)
}

/**
 * Get score color based on percentage
 */
export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-blue-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get score label based on percentage
 */
export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Needs Improvement'
}
