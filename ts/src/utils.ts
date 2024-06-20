export function annualToMonthlyReturnRate(
  annualReturnRate: number
): number {
  return 100 * (Math.pow(1 + annualReturnRate / 100, 1 / 12) - 1);
}
