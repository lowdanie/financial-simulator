import { BrokerageAccount, type BrokerageAccountParameters } from './brokerage_account';

import { type TaxDocument1099B } from './tax_document';

const monthlyReturnRate = 2;
const annualReturnRate = 100 * (Math.pow(1 + monthlyReturnRate / 100, 12) - 1);

const params: BrokerageAccountParameters = {
	accountName: 'test account',
	initialValue: 100000,
	initialCostBasis: 25000,
	managementFeeRate: 1,
	annualReturnRate: annualReturnRate
};

describe('test BrokerageAccount', () => {
	test('constructor', () => {
		let account = new BrokerageAccount(params, 2020);
		expect(account.monthlyReturnRate).toBeCloseTo(monthlyReturnRate);
	});
	test('contribute', () => {
		let account = new BrokerageAccount(params, 2020);
		account.contribute(100);
		expect(account.value).toBeCloseTo(100100);
		expect(account.costBasis).toBeCloseTo(25100);
	});
	test('withdraw', () => {
		let account = new BrokerageAccount(params, 2020);
		expect(account.withdraw(100)).toBeCloseTo(100);
		expect(account.value).toBeCloseTo(99900);
		expect(account.costBasis).toBeCloseTo(24975);
	});
	test('receiveMonthlyReturn', () => {
		let account = new BrokerageAccount(params, 2020);
		account.receiveMonthlyReturn();
		expect(account.value).toBeCloseTo(102000);
		expect(account.costBasis).toBeCloseTo(25000);
	});
	test('get1099B', () => {
		let account = new BrokerageAccount(params, 2020);
		account.withdraw(100);
		account.incrementYear();

		const expectedDoc: TaxDocument1099B = {
			year: 2020,
			costBasis: 25,
			proceeds: 100
		};
		const received1098 = account.getPreviousYear1099B();
		expect(received1098.year).toBe(expectedDoc.year);
		expect(received1098.costBasis).toBeCloseTo(expectedDoc.costBasis);
		expect(received1098.proceeds).toBeCloseTo(expectedDoc.proceeds);
	});
});
