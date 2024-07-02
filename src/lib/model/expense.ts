let expenseId = 0;
export function generateExpenseId() {
	return expenseId++;
}

export interface ExpenseParameters {
	id: number;
	name: string;
	start: Date;
	end: Date;
	initialMonthlyExpense: number;
	realIncreaseRate: number;
}

export class Expense {
	params: ExpenseParameters;
	monthlyExpense: number;

	constructor(params: ExpenseParameters) {
		this.params = params;
		this.monthlyExpense = params.initialMonthlyExpense;
	}

	isActive(date: Date): boolean {
		return this.params.start <= date && date <= this.params.end;
	}

	incrementYear(inflationRate: number) {
		this.monthlyExpense *= 1 + inflationRate / 100;
		this.monthlyExpense *= 1 + this.params.realIncreaseRate / 100;
	}
}
