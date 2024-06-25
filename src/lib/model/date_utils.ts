export interface Age {
  years: number;
  months: number;
}

export function ageToDate(age: Age, birthday: Date): Date {
  let date = new Date(birthday);
  date.setMonth(birthday.getMonth() + 12 * age.years + age.months);
  return date;
}

export function dateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

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
