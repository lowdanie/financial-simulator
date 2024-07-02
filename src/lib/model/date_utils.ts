export interface Age {
	years: number;
	months: number;
}

export function ageToDate(age: Age, birthday: Date): Date {
	let date = new Date(birthday);
	date.setMonth(birthday.getMonth() + 12 * age.years + age.months);
	return date;
}

export function dateToInputDateString(date: Date): string {
	const paddedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
  const paddedDate = date.getDate().toString().padStart(2, '0');
	return `${date.getFullYear()}-${paddedMonth}-${paddedDate}`;
}

export function inputDateStringToDate(s: string): Date {
	const [year, month, date] = s.split('-');
	return new Date(parseInt(year), parseInt(month) - 1, parseInt(date));
}

export function dateToInputMonthString(date: Date): string {
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	return `${date.getFullYear()}-${month}`;
}

export function inputMonthStringToDate(s: string): Date {
	const [year, month] = s.split('-');
	return new Date(parseInt(year), parseInt(month) - 1);
}

export function numOverlapMonths(interval: { start: Date; end: Date }, year: number): number {
	let firstMonth = 0;
	let lastMonth = 11;

	if (interval.start.getFullYear() > year || interval.end.getFullYear() < year) {
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
