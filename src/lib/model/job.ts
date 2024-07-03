import { type TaxDocumentW2 } from './tax_document';
import { numOverlapMonths, type Age } from './date_utils';
import { RetirementAccount401k, generateRetirement401kId } from './retirement_account_401k';
import type { Person } from './person';

let jobId = 0;
export function generateJobId(): number {
	return jobId++;
}

export interface JobParameters {
	id: number;
	companyName: string;
	employeeId: number;
	startDate: Date;
	endDate: Date;
	initialSalary: number;
	initialBonus: number;
	bonusMonth: number; // 1-12
	realRaiseRate: number;

	percentOfMax401kContribution: number;
	company401kMatchRate: number;
	initial401kValue: number;
	annual401kReturnRate: number;
}

export interface Paystub {
	income: number;
}

function computeMonthly401kContribution(
	params: JobParameters,
	taxYear: number,
	max401kContribution: number
): number {
	let numMonths = numOverlapMonths({ start: params.startDate, end: params.endDate }, taxYear);

	if (numMonths == 0) {
		return 0;
	}
	let annual401kContribution = (params.percentOfMax401kContribution / 100) * max401kContribution;
	return annual401kContribution / numMonths;
}

export class Job {
	params: JobParameters;
	currentYear: number;
	salary: number;
	bonus: number;
	monthly401kContribution: number;
	retirementAccount401k: RetirementAccount401k;
	currentAnnualTaxableIncome: number;
	previousAnnualTaxableIncome: number;

	constructor(
		params: JobParameters,
		currentYear: number,
		employee: Person,
		max401kContribution: number,
		penaltyFree401kWithdrawalAge: Age
	) {
		if (employee.id != params.employeeId) {
			throw `Expected employee ${params.employeeId} but got ${employee.id}`;
		}

		this.params = params;
		this.currentYear = currentYear;
		this.salary = params.initialSalary;
		this.bonus = params.initialBonus;
		this.monthly401kContribution = computeMonthly401kContribution(
			params,
			currentYear,
			max401kContribution
		);
		this.retirementAccount401k = new RetirementAccount401k(
			{
				id: generateRetirement401kId(),
				accountName: `${params.companyName} 401k`,
				employeeId: params.employeeId,
				initialValue: params.initial401kValue,
				annualReturnRate: params.annual401kReturnRate
			},
			currentYear,
			employee,
			penaltyFree401kWithdrawalAge
		);
		this.currentAnnualTaxableIncome = 0;
		this.previousAnnualTaxableIncome = 0;
	}

	isActive(date: Date): boolean {
		return this.params.startDate <= date && date <= this.params.endDate;
	}

	sendMonthlyPaystub(month: number): Paystub {
		let monthlyIncome = this.salary / 12;
		if (month == this.params.bonusMonth) {
			monthlyIncome += this.bonus;
		}

		const monthly401kContribution = Math.min(monthlyIncome, this.monthly401kContribution);
		monthlyIncome -= monthly401kContribution;
		const match401k = (this.params.company401kMatchRate / 100) * monthly401kContribution;
		const total401kContribution = monthly401kContribution + match401k;

		this.currentAnnualTaxableIncome += monthlyIncome;
		this.retirementAccount401k.contribute(total401kContribution);

		return {
			income: monthlyIncome
		};
	}

	getPreviousYearW2(): TaxDocumentW2 {
		return {
			year: this.currentYear - 1,
			companyId: this.params.id,
			employeeId: this.params.employeeId,
			taxableIncome: this.previousAnnualTaxableIncome
		};
	}

	incrementYear(inflationRate: number, max401kContribution: number) {
		this.currentYear += 1;
		this.previousAnnualTaxableIncome = this.currentAnnualTaxableIncome;
		this.currentAnnualTaxableIncome = 0;

		if (this.params.endDate.getFullYear() < this.currentYear) {
			return;
		}

		let incomeFactor = 1 + inflationRate / 100;

		// If the job was active this year, add a raise.
		if (this.params.startDate.getFullYear() <= this.currentYear) {
			incomeFactor *= 1 + this.params.realRaiseRate / 100;
		}

		this.salary *= incomeFactor;
		this.bonus *= incomeFactor;

		this.monthly401kContribution = computeMonthly401kContribution(
			this.params,
			this.currentYear,
			max401kContribution
		);
	}
}
