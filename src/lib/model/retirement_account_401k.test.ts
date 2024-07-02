import {
	RetirementAccount401k,
	type RetirementAccount401kParameters
} from './retirement_account_401k';

import { type Age } from './date_utils';
import { type TaxDocument1099R } from './tax_document';
import { type Person } from './person';

const MONTHLY_RETURN_RATE = 2;
const ANNUAL_RETURN_RATE = 100 * (Math.pow(1 + MONTHLY_RETURN_RATE / 100, 12) - 1);
const PENALTY_FREE_WITHDRAWAL_AGE: Age = { years: 59, months: 6 };

const RETIREMENT_PARAMS: RetirementAccount401kParameters = {
	id: 0,
	accountName: 'test account',
	employeeId: 1,
	initialValue: 100000,
	annualReturnRate: ANNUAL_RETURN_RATE
};

const EMPLOYEE: Person = {
	id: 1,
	name: 'employee',
	birthday: new Date(1990, 2, 20)
};

describe('test RetirementAccount401k', () => {
	test('constructor', () => {
		let account = new RetirementAccount401k(
			RETIREMENT_PARAMS,
			2020,
			EMPLOYEE,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		const expectedDate = new Date(2049, 8, 20);
		expect(account.monthlyReturnRate).toBeCloseTo(MONTHLY_RETURN_RATE);
		expect(account.penaltyFreeWithdrawalDate.getTime()).toBe(expectedDate.getTime());
	});
	test('contribute', () => {
		let account = new RetirementAccount401k(
			RETIREMENT_PARAMS,
			2020,
			EMPLOYEE,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		account.contribute(100);
		expect(account.value).toBe(100100);
	});
	test('withdraw', () => {
		let account = new RetirementAccount401k(
			RETIREMENT_PARAMS,
			2020,
			EMPLOYEE,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		expect(account.withdraw(100100, 1)).toBeCloseTo(100000);
		expect(account.value).toBeCloseTo(0);
	});
	test('receiveMonthlyReturn', () => {
		let account = new RetirementAccount401k(
			RETIREMENT_PARAMS,
			2020,
			EMPLOYEE,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		account.receiveMonthlyReturn();
		expect(account.value).toBeCloseTo(102000);
	});
	test('get1099Rs', () => {
		let account = new RetirementAccount401k(
			RETIREMENT_PARAMS,
			2049,
			EMPLOYEE,
			PENALTY_FREE_WITHDRAWAL_AGE
		);

		// Withdraw early.
		expect(account.withdraw(100, 8)).toBeCloseTo(100);

		// Withdraw late
		expect(account.withdraw(200, 10)).toBeCloseTo(200);
		account.incrementYear();

		const expectedDocs: TaxDocument1099R[] = [
			{
				year: 2049,
				taxableIncome: 100,
				isEarlyDistribution: true
			},
			{
				year: 2049,
				taxableIncome: 200,
				isEarlyDistribution: false
			}
		];
		const receivedDocs = account.getPreviousYear1099Rs();
		expect(receivedDocs.length).toBe(expectedDocs.length);

		for (let i = 0; i < 2; i++) {
			expect(receivedDocs[i].year).toBe(expectedDocs[i].year);
			expect(receivedDocs[i].taxableIncome).toBeCloseTo(expectedDocs[i].taxableIncome);
			expect(receivedDocs[i].isEarlyDistribution).toBe(expectedDocs[i].isEarlyDistribution);
		}
	});
});
