import { Job, type JobParameters } from './job';
import { Expense, type ExpenseParameters } from './expense';
import { type Person } from './person';
import {
	RetirementAccount401k,
	type RetirementAccount401kParameters
} from './retirement_account_401k';
import { SavingsAccount, type SavingsAccountParameters } from './savings_account';
import { TaxManager, type TaxManagerParameters } from './tax_manager';
import type { TaxDocument1099R } from './tax_document';
import { BrokerageAccount, type BrokerageAccountParameters } from './brokerage_account';

export interface ModelParameters {
	startYear: number;
	durationYears: number;
	inflationRate: number;
	targetEmergencyFund: number;
	people: Person[];
	taxManager: TaxManagerParameters;
	jobs: JobParameters[];
	expenses: ExpenseParameters[];
	savingsAccount: SavingsAccountParameters;
	brokerageAccount: BrokerageAccountParameters;
	retirement401kAccounts: RetirementAccount401kParameters[];
}

export class ModelState {
	currentDate: Date;
	inflationRate: number;
	targetEmergencyFund: number;
	personByName: Map<string, Person>;
	taxManager: TaxManager;
	jobs: Job[];
	expenses: Expense[];
	savingsAccount: SavingsAccount;
	brokerageAccount: BrokerageAccount;
	retirement401kAccountByEmployeeName: Map<string, RetirementAccount401k>;
	isBankrupt: boolean;

	constructor(params: ModelParameters) {
		this.currentDate = new Date(params.startYear, 0);
		this.inflationRate = params.inflationRate;
		this.targetEmergencyFund = params.targetEmergencyFund;

		this.personByName = new Map();
		for (let person of params.people) {
			this.personByName.set(person.name, person);
		}

		this.taxManager = new TaxManager(params.taxManager, params.startYear, params.inflationRate);

		this.jobs = [];
		for (let jobParams of params.jobs) {
			this.jobs.push(
				new Job(jobParams, params.startYear, this.taxManager.getMax401kContribution())
			);
		}

		this.expenses = [];
		for (let expenseParams of params.expenses) {
			this.expenses.push(new Expense(expenseParams));
		}

		this.savingsAccount = new SavingsAccount(params.savingsAccount, params.startYear);
		this.brokerageAccount = new BrokerageAccount(params.brokerageAccount, params.startYear);

		this.retirement401kAccountByEmployeeName = new Map();
		for (let retirement401kParams of params.retirement401kAccounts) {
			const employee = this.personByName.get(retirement401kParams.employeeName);
			if (employee === undefined) {
				throw `Unexpected employee: ${retirement401kParams.employeeName};`;
			}
			this.retirement401kAccountByEmployeeName.set(
				retirement401kParams.employeeName,
				new RetirementAccount401k(
					retirement401kParams,
					params.startYear,
					employee.birthday,
					this.taxManager.getPenaltyFree401kWithdrawalAge()
				)
			);
		}

		this.isBankrupt = false;
	}

	depositCash(amount: number) {
		let savingsAccountDeposit = Math.min(
			amount,
			Math.max(0, this.targetEmergencyFund - this.savingsAccount.value)
		);
		this.savingsAccount.contribute(savingsAccountDeposit);
		this.brokerageAccount.contribute(amount - savingsAccountDeposit);
	}

	withdrawCash(amount: number): number {
		const accounts401kByWithdrawalDate = Array.from(
			this.retirement401kAccountByEmployeeName.values()
		);
		accounts401kByWithdrawalDate.sort((a, b) => {
			return a.penaltyFreeWithdrawalDate.getTime() - b.penaltyFreeWithdrawalDate.getTime();
		});
		const accountsByWithdrawOrder = Array.prototype.concat(
			[this.savingsAccount, this.brokerageAccount],
			accounts401kByWithdrawalDate
		);

		let remaining = amount;
		for (let account of accountsByWithdrawOrder) {
			remaining -= account.withdraw(remaining, this.currentDate.getMonth() + 1);
		}

		return remaining;
	}

	computeTaxes() {
		const docW2s = this.jobs.map((job) => job.getPreviousYearW2());
		const doc1099Ints = [this.savingsAccount.getPreviousYear1099Int()];
		const doc1099Bs = [this.brokerageAccount.getPreviousYear1099B()];
		let doc1099Rs: TaxDocument1099R[] = [];
		for (let account of this.retirement401kAccountByEmployeeName.values()) {
			doc1099Rs = doc1099Rs.concat(account.getPreviousYear1099Rs());
		}

		return this.taxManager.computePreviousYearFederalTax(docW2s, doc1099Ints, doc1099Bs, doc1099Rs);
	}

	executeMonth() {
		// Credit
		this.savingsAccount.receiveMonthlyInterest();
		this.brokerageAccount.receiveMonthlyReturn();
		this.retirement401kAccountByEmployeeName.forEach((account) => {
			account.receiveMonthlyReturn();
		});
		const paystubs = this.jobs
			.filter((job) => job.isActive(this.currentDate))
			.map((job) => {
				return job.sendMonthlyPaystub(this.currentDate.getMonth() + 1);
			});

		// Debit
		let monthlyExpense = this.expenses
			.filter((expense) => expense.isActive(this.currentDate))
			.reduce((partialSum, expense) => {
				return partialSum + expense.monthlyExpense;
			}, 0);

		if (this.currentDate.getMonth() == 3) {
			monthlyExpense += this.computeTaxes();
		}

		// Cashflow
		let monthlyIncome = paystubs.reduce((partialSum, paystub) => partialSum + paystub.income, 0);

		for (let paystub of paystubs) {
			let account = this.retirement401kAccountByEmployeeName.get(paystub.employeeName);
			if (account === undefined) {
				throw `Unexpected employee: ${paystub.employeeName}`;
			}
			account.contribute(paystub.contribution401k);
		}

		let balance = monthlyIncome - monthlyExpense;

		if (balance >= 0) {
			this.depositCash(balance);
		} else {
			balance = -this.withdrawCash(-balance);
		}

		this.isBankrupt = balance < 0;

		// End of year adjustments.
		if (this.currentDate.getMonth() == 11) {
			this.taxManager.incrementYear(this.inflationRate);
			this.jobs.forEach((job) =>
				job.incrementYear(this.inflationRate, this.taxManager.getMax401kContribution())
			);
			this.expenses.forEach((expense) => expense.incrementYear(this.inflationRate));
			this.savingsAccount.incrementYear();
			this.brokerageAccount.incrementYear();
			this.retirement401kAccountByEmployeeName.forEach((account) => account.incrementYear());
		}

		// Increment to next month.
		this.currentDate.setMonth(this.currentDate.getMonth() + 1);
	}

	getNetWorth() {
		let totalRetirement = 0;
		for (let account of this.retirement401kAccountByEmployeeName.values()) {
			totalRetirement += account.value;
		}
		return this.savingsAccount.value + this.brokerageAccount.value + totalRetirement;
	}
}
