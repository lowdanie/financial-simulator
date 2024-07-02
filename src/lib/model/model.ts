import { Job, type JobParameters } from './job';
import { Expense, type ExpenseParameters } from './expense';
import { House, type HouseParameters } from './house';
import { type Person } from './person';
import {
	RetirementAccount401k,
	type RetirementAccount401kParameters
} from './retirement_account_401k';
import { SavingsAccount, type SavingsAccountParameters } from './savings_account';
import { TaxManager, type TaxManagerParameters } from './tax_manager';
import type { TaxDocument1099R } from './tax_document';
import { BrokerageAccount, type BrokerageAccountParameters } from './brokerage_account';

export interface MonthAssetSummary {
	name: string;
	value: number;
}

export interface MonthSummary {
	date: Date;
	netWorth: number;
	assets: MonthAssetSummary[];
}

export interface ModelParameters {
	startYear: number;
	durationYears: number;
	inflationRate: number;
	targetEmergencyFund: number;

	people: Person[];
	taxManager: TaxManagerParameters;
	jobs: JobParameters[];
	expenses: ExpenseParameters[];
	houses: HouseParameters[];
	savingsAccount: SavingsAccountParameters;
	brokerageAccount: BrokerageAccountParameters;
	retirement401kAccounts: RetirementAccount401kParameters[];
}

export class ModelState {
	currentDate: Date;
	inflationRate: number;
	targetEmergencyFund: number;

	personById: Map<number, Person>;
	taxManager: TaxManager;
	jobs: Job[];
	expenses: Expense[];
	houses: House[];
	savingsAccount: SavingsAccount;
	brokerageAccount: BrokerageAccount;
	retirement401kAccounts: RetirementAccount401k[];
	isBankrupt: boolean;

	constructor(params: ModelParameters) {
		this.currentDate = new Date(params.startYear, 0);
		this.inflationRate = params.inflationRate;
		this.targetEmergencyFund = params.targetEmergencyFund;

		this.personById = new Map();
		for (let person of params.people) {
			this.personById.set(person.id, person);
		}

		this.taxManager = new TaxManager(params.taxManager, params.startYear, params.inflationRate);

		this.jobs = [];
		for (let jobParams of params.jobs) {
			const employee = this.personById.get(jobParams.employeeId);
			if (employee === undefined) {
				throw `Unexpected employee: ${jobParams.employeeId}`;
			}
			this.jobs.push(
				new Job(
					jobParams,
					params.startYear,
					employee,
					this.taxManager.getMax401kContribution(),
					this.taxManager.getPenaltyFree401kWithdrawalAge()
				)
			);
		}
		this.expenses = params.expenses.map((expenseParams) => new Expense(expenseParams));
		this.houses = params.houses.map((houseParams) => new House(houseParams, params.startYear));

		this.savingsAccount = new SavingsAccount(params.savingsAccount, params.startYear);
		this.brokerageAccount = new BrokerageAccount(params.brokerageAccount, params.startYear);

		this.retirement401kAccounts = [];
		for (let retirement401kParams of params.retirement401kAccounts) {
			const employee = this.personById.get(retirement401kParams.employeeId);
			if (employee === undefined) {
				throw `Unexpected employee: ${retirement401kParams.employeeId};`;
			}
			this.retirement401kAccounts.push(
				new RetirementAccount401k(
					retirement401kParams,
					params.startYear,
					employee,
					this.taxManager.getPenaltyFree401kWithdrawalAge()
				)
			);
		}
		this.retirement401kAccounts.push(...this.jobs.map((job) => job.retirementAccount401k));
		this.retirement401kAccounts.sort((a, b) => {
			return a.penaltyFreeWithdrawalDate.getTime() - b.penaltyFreeWithdrawalDate.getTime();
		});

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
		const accountsByWithdrawOrder = Array.prototype.concat(
			[this.savingsAccount, this.brokerageAccount],
			this.retirement401kAccounts
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
		const doc1098s = this.houses.map((house) => house.getPreviousYear1098());
		let doc1099Rs: TaxDocument1099R[] = [];
		doc1099Rs = this.retirement401kAccounts.reduce(
			(previousDocs, account) => previousDocs.concat(account.getPreviousYear1099Rs()),
			doc1099Rs
		);

		return this.taxManager.computePreviousYearTax(
			docW2s,
			doc1099Ints,
			doc1099Bs,
			doc1099Rs,
			doc1098s
		);
	}

	executeMonth() {
		// Appreciation
		this.savingsAccount.receiveMonthlyInterest();
		this.brokerageAccount.receiveMonthlyReturn();
		this.retirement401kAccounts.forEach((account) => {
			account.receiveMonthlyReturn();
		});
		this.houses.forEach((house) => house.applyMonthlyAppreciation());

		// Cashflow
		const paystubs = this.jobs
			.filter((job) => job.isActive(this.currentDate))
			.map((job) => {
				return job.sendMonthlyPaystub(this.currentDate.getMonth() + 1);
			});

		let balance = paystubs.reduce((partialSum, paystub) => partialSum + paystub.income, 0);
		balance -= this.expenses
			.filter((expense) => expense.isActive(this.currentDate))
			.reduce((partialSum, expense) => {
				return partialSum + expense.monthlyExpense;
			}, 0);

		balance += this.houses.reduce(
			(partialSum, house) =>
				partialSum + house.executeMonthlyCashflow(this.currentDate.getMonth() + 1),
			0
		);

		if (this.currentDate.getMonth() == 3) {
			balance -= this.computeTaxes();
		}

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
			this.houses.forEach((house) => house.incrementYear(this.inflationRate));
			this.savingsAccount.incrementYear();
			this.brokerageAccount.incrementYear();
			this.retirement401kAccounts.forEach((account) => account.incrementYear());
		}

		// Increment to next month.
		this.currentDate.setMonth(this.currentDate.getMonth() + 1);
	}

	getNetWorth() {
		const totalRetirement = this.retirement401kAccounts.reduce(
			(partialSum, account) => partialSum + account.value,
			0
		);
		const totalHomeEquity = this.houses.reduce(
			(partialSum, house) => partialSum + house.getHomeEquity(),
			0
		);

		return (
			this.savingsAccount.value + this.brokerageAccount.value + totalRetirement + totalHomeEquity
		);
	}

	getMonthSummary(): MonthSummary {
		return {
			date: new Date(this.currentDate),
			netWorth: this.getNetWorth(),
			assets: Array.prototype.concat(
				[
					{
						name: this.savingsAccount.params.name,
						value: this.savingsAccount.value
					},
					{
						name: this.brokerageAccount.params.accountName,
						value: this.brokerageAccount.value
					}
				],
				this.houses.map((house) => ({
					name: house.params.name,
					value: house.getHomeEquity()
				})),
				this.retirement401kAccounts.map((account) => ({
					name: account.params.accountName,
					value: account.value
				}))
			)
		};
	}
}
