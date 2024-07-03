import type { TaxDocument1099R } from './tax_document';
import { type Age, ageToDate } from './date_utils';
import { annualToMonthlyReturnRate } from './utils';
import { type Person } from './person';

let retirement401kId = 0;
export function generateRetirement401kId(): number {
	return retirement401kId++;
}

interface TaxableIncome {
	early: number;
	penaltyFree: number;
}

export interface RetirementAccount401kParameters {
	id: number;
	accountName: string;
	employeeId: number;
	initialValue: number;
	annualReturnRate: number;
}

export class RetirementAccount401k {
	params: RetirementAccount401kParameters;
	value: number;
	currentYear: number;
	monthlyReturnRate: number;
	penaltyFreeWithdrawalDate: Date;
	currentAnnualTaxableIncome: TaxableIncome;
	previousAnnualTaxableIncome: TaxableIncome;

	constructor(
		params: RetirementAccount401kParameters,
		year: number,
		employee: Person,
		penaltyFreeWithdrawalAge: Age
	) {
		if (employee.id != params.employeeId) {
			throw `Expected employee ${params.employeeId} but got ${employee.id}`;
		}
		this.params = params;
		this.currentYear = year;
		this.value = params.initialValue;
		this.monthlyReturnRate = annualToMonthlyReturnRate(params.annualReturnRate);
		this.penaltyFreeWithdrawalDate = ageToDate(penaltyFreeWithdrawalAge, employee.birthday);
		this.currentAnnualTaxableIncome = { early: 0, penaltyFree: 0 };
		this.previousAnnualTaxableIncome = { early: 0, penaltyFree: 0 };
	}

	contribute(amount: number) {
		this.value += amount;
	}

	withdraw(amount: number, month: number): number {
		amount = Math.min(this.value, amount);
		this.value -= amount;

		const date = new Date(this.currentYear, month - 1);
		if (date < this.penaltyFreeWithdrawalDate) {
			this.currentAnnualTaxableIncome.early += amount;
		} else {
			this.currentAnnualTaxableIncome.penaltyFree += amount;
		}

		return amount;
	}

	receiveMonthlyReturn() {
		this.value *= 1 + this.monthlyReturnRate / 100;
	}

	getPreviousYear1099Rs(): TaxDocument1099R[] {
		let docs = new Array<TaxDocument1099R>();

		if (this.previousAnnualTaxableIncome.early > 0) {
			docs.push({
				year: this.currentYear - 1,
				taxableIncome: this.previousAnnualTaxableIncome.early,
				isEarlyDistribution: true
			});
		}

		if (this.previousAnnualTaxableIncome.penaltyFree > 0) {
			docs.push({
				year: this.currentYear - 1,
				taxableIncome: this.previousAnnualTaxableIncome.penaltyFree,
				isEarlyDistribution: false
			});
		}

		return docs;
	}

	incrementYear() {
		this.currentYear += 1;
		this.previousAnnualTaxableIncome = this.currentAnnualTaxableIncome;
		this.currentAnnualTaxableIncome = { early: 0, penaltyFree: 0 };
	}
}
