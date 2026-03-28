import { meetsMinimumCohort, RESULTS_MICRODETAIL_LOCKED } from "./metricPolicies";

export interface GuardrailCheck {
  isSufficientCohort: boolean;
  privacyLocked: boolean;
  resultsMicrodetailLocked: boolean;
  isFresh: boolean;
  mode: "synthetic" | "real" | "hybrid";
}

export function generateAnalyticGuardrails(n: number, freshnessDate: Date, forceSynthetic: boolean = false): GuardrailCheck {
  const isCohortValid = meetsMinimumCohort(n);
  const isFresh = new Date().getTime() - freshnessDate.getTime() < 86400000;
  
  return {
    isSufficientCohort: isCohortValid,
    privacyLocked: !isCohortValid,
    resultsMicrodetailLocked: RESULTS_MICRODETAIL_LOCKED,
    isFresh,
    mode: forceSynthetic ? "synthetic" : (isCohortValid ? "real" : "hybrid")
  };
}
