export function formatPercentage(rawVal: number): number {
  return Math.round(rawVal * 1000) / 10;
}
