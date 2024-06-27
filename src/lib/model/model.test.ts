import { type ModelParameters, ModelState } from './model';
import { FilingStatus } from './tax_manager';

const SAVINGS_MONTHLY_RETURN = 2;
const RETIREMENT_MONTHLY_RETURN = 3;

const MODEL_PARAMS: ModelParameters = {
	startYear: 2025,
	durationYears: 50,
	inflationRate: 3,
	people: [
		{
			id: 0,
			name: 'alice',
			birthday: new Date(1990, 1, 10)
		}
	],
	taxManager: {
		filingStatus: FilingStatus.JOINT
	},
	jobs: [
		{
			id: 0,
			companyName: 'company',
			employeeName: 'alice',
			startDate: new Date(2025, 0, 1),
			endDate: new Date(2035, 0, 1),
			initialSalary: 100000,
			initialBonus: 20000,
			bonusMonth: 12,
			percentOfMax401kContribution: 100,
			company401kMatchRate: 10,
			realRaiseRate: 1
		}
	],
	expenses: [
		{
			id: 0,
			name: 'rent',
			start: new Date(2025, 0, 1),
			end: new Date(2035, 0, 1),
			initialMonthlyExpense: 1000,
			realIncreaseRate: 2
		}
	],
	savingsAccount: {
		name: 'savings',
		initialValue: 50000,
		annualPercentageYield: 100 * (Math.pow(1 + SAVINGS_MONTHLY_RETURN / 100, 12) - 1)
	},
	retirement401kAccounts: [
		{
			id: 0,
			accountName: '401k',
			employeeName: 'alice',
			initialValue: 10000,
			annualReturnRate: 100 * (Math.pow(1 + RETIREMENT_MONTHLY_RETURN / 100, 12) - 1)
		}
	]
};

describe('test Model', () => {
	test('constructor', () => {
		let model = new ModelState(MODEL_PARAMS);

		const expectedPersonByName = new Map([
			[
				'alice',
				{
          id: 0,
					name: 'alice',
					birthday: new Date(1990, 1, 10)
				}
			]
		]);

		const startDate = new Date(2025, 0);
		expect(model.currentDate.getTime()).toBe(startDate.getTime());
		expect(model.personByName).toStrictEqual(expectedPersonByName);
	});

	test('executeMonth', () => {
		let model = new ModelState(MODEL_PARAMS);
		model.executeMonth();

		const nextDate = new Date(2025, 1);
		const expectedMonthly401kContribution = (1.03 * 1.03 * 22500) / 12;
		const expectedMonthlySalary = 100000 / 12 - expectedMonthly401kContribution;
		const expectedMonthlyExpense = 1000;
		const expectedBalance = expectedMonthlySalary - expectedMonthlyExpense;

		const expectedSavingsValue = (1 + SAVINGS_MONTHLY_RETURN / 100) * 50000 + expectedBalance;
		const expected401kValue =
			(1 + RETIREMENT_MONTHLY_RETURN / 100) * 10000 + 1.1 * expectedMonthly401kContribution;

		expect(model.currentDate.getTime()).toBe(nextDate.getTime());
		expect(model.savingsAccount.value).toBeCloseTo(expectedSavingsValue);
		expect(model.retirement401kAccountByEmployeeName.get('alice')?.value).toBeCloseTo(
			expected401kValue
		);
	});
});
