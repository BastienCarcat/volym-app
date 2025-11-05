import { InsightStatus } from "./types";

/**
 * Generic criterion evaluation result
 * Each criterion produces a score, status, and optional recommendation
 */
export interface CriterionEvaluation {
  criterionName: string;
  score: number; // 0-100
  status: InsightStatus;
  recommendation?: string;
  metadata?: Record<string, unknown>; // Criterion-specific data for UI
}

/**
 * Configuration for how criteria are weighted and combined
 */
export interface CriterionConfig {
  name: string;
  weight: number; // Weight in final score calculation (0-1)
  enabled: boolean;
}

/**
 * Generic evaluator function signature
 */
export type CriterionEvaluator<TData> = (
  data: TData
) => CriterionEvaluation | null;

/**
 * Result of evaluating all criteria for a metric
 */
export interface CriteriaEvaluationResult {
  finalScore: number; // Weighted aggregate score
  overallStatus: InsightStatus;
  criteria: CriterionEvaluation[];
  recommendations: string[];
}

/**
 * Evaluates multiple criteria and aggregates results
 */
export function evaluateCriteria<TData>(
  data: TData,
  evaluators: Array<{
    evaluator: CriterionEvaluator<TData>;
    config: CriterionConfig;
  }>
): CriteriaEvaluationResult {
  const evaluations: CriterionEvaluation[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  // Run each enabled evaluator
  for (const { evaluator, config } of evaluators) {
    if (!config.enabled) continue;

    const result = evaluator(data);
    if (!result) continue;

    evaluations.push(result);
    weightedScore += result.score * config.weight;
    totalWeight += config.weight;
  }

  // Calculate final score
  const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

  // Determine overall status
  const overallStatus = getStatusFromScore(finalScore);

  // Collect all recommendations
  const recommendations = evaluations
    .filter((e) => e.recommendation)
    .map((e) => e.recommendation!);

  return {
    finalScore: Math.round(finalScore),
    overallStatus,
    criteria: evaluations,
    recommendations,
  };
}

/**
 * Helper to determine status from score
 */
function getStatusFromScore(score: number): InsightStatus {
  if (score >= 90) return InsightStatus.Excellent;
  if (score >= 70) return InsightStatus.Good;
  if (score >= 50) return InsightStatus.Warning;
  return InsightStatus.Critical;
}

/**
 * Helper to create a criterion configuration
 */
export function createCriterionConfig(
  name: string,
  weight: number,
  enabled = true
): CriterionConfig {
  return { name, weight, enabled };
}
