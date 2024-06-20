export function numOverlapMonths(
  interval: { start: Date; end: Date },
  year: number
): number {
  let firstMonth = 0;
  let lastMonth = 11;

  if (
    interval.start.getFullYear() > year ||
    interval.end.getFullYear() < year
  ) {
    return 0;
  }

  if (interval.start.getFullYear() == year) {
    firstMonth = interval.start.getMonth();
  }

  if (interval.end.getFullYear() == year) {
    lastMonth = interval.end.getMonth();
  }

  return lastMonth - firstMonth + 1;
}
