import { type ModelParameters, ModelState } from './model';
import { FilingStatus } from './tax_manager';

const SAVINGS_MONTHLY_RETURN = 2;
const RETIREMENT_MONTHLY_RETURN = 3;
const BROKERAGE_MONTHLY_RETURN = 4;
const MONTHLY_HOUSE_VALUE_GROWTH_RATE = 3;

const MODEL_PARAMS: ModelParameters = {
	startYear: 2025,
	durationYears: 50,
	inflationRate: 3,
	targetEmergencyFund: 1000,
	people: [
		{
			id: 0,
			name: 'alice',
			birthday: new Date(1990, 1, 10)
		}
	],
	taxManager: {
		filingStatus: FilingStatus.JOINT,
		effectiveStateTaxRate: 5
	},
	jobs: [
		{
			id: 0,
			companyName: 'company',
			employeeId: 0,
			startDate: new Date(2025, 0, 1),
			endDate: new Date(2035, 0, 1),
			initialSalary: 100000,
			initialBonus: 20000,
			bonusMonth: 12,
			realRaiseRate: 1,
			percentOfMax401kContribution: 100,
			company401kMatchRate: 10,
			initial401kValue: 10000,
			annual401kReturnRate: 100 * (Math.pow(1 + RETIREMENT_MONTHLY_RETURN / 100, 12) - 1)
		}
	],
	expenses: [
		{
			id: 0,
			name: 'rent',
			startDate: new Date(2025, 0, 1),
			endDate: new Date(2035, 0, 1),
			initialMonthlyExpense: 1000,
			realIncreaseRate: 2
		}
	],
	houses: [
		{
			id: 0,
			name: 'house',
			buyDate: new Date(2020, 5),
			sellDate: new Date(2025, 5),
			homeValue: 100000,
			homeValueAnnualGrowthRate:
				100 * (Math.pow(1 + MONTHLY_HOUSE_VALUE_GROWTH_RATE / 100, 12) - 1),

			mortgageRate: 5,
			mortgageLengthYears: 30,
			downPaymentRate: 20,
			homeBuyPrice: 50000,
			remainingPrincipal: 40000,

			monthlyCommonFee: 100,
			propertyTaxRate: 1,
			insuranceRate: 1,
			maintenanceRate: 2,

			closingCostRate: 5,
			sellingCostRate: 3
		}
	],
	savingsAccount: {
		name: 'savings',
		initialValue: 50000,
		annualPercentageYield: 100 * (Math.pow(1 + SAVINGS_MONTHLY_RETURN / 100, 12) - 1)
	},
	brokerageAccount: {
		accountName: 'brokerage',
		initialCostBasis: 100,
		initialValue: 200,
		annualReturnRate: 100 * (Math.pow(1 + BROKERAGE_MONTHLY_RETURN / 100, 12) - 1),
		managementFeeRate: 1
	},
	retirement401kAccounts: [
		{
			id: 0,
			accountName: '401k',
			employeeId: 0,
			initialValue: 100000,
			annualReturnRate: 100 * (Math.pow(1 + RETIREMENT_MONTHLY_RETURN / 100, 12) - 1)
		}
	]
};

describe('test Model', () => {
	test('constructor', () => {
		let model = new ModelState(MODEL_PARAMS);

		const expectedPersonById = new Map([
			[
				0,
				{
					id: 0,
					name: 'alice',
					birthday: new Date(1990, 1, 10)
				}
			]
		]);

		const startDate = new Date(2025, 0);
		expect(model.currentDate.getTime()).toBe(startDate.getTime());
		expect(model.personById.size).toBe(expectedPersonById.size);
		for (let [k, v] of expectedPersonById) {
			expect(model.personById.get(k)?.birthday.getTime()).toBe(v.birthday.getTime());
			expect(model.personById.get(k)?.id).toBe(v.id);
			expect(model.personById.get(k)?.name).toBe(v.name);
		}
		expect(model.retirement401kAccounts.length).toBe(2);
	});

	test('executeMonth', () => {
		let model = new ModelState(MODEL_PARAMS);
		model.executeMonth();

		const nextDate = new Date(2025, 1);
		const expectedMonthly401kContribution = (1.03 * 1.03 * 22500) / 12;
		const expectedMonthlySalary = 100000 / 12 - expectedMonthly401kContribution;
		const expectedMonthlyExpense = 1000;
		const expectedMonthlyMortgagePayment = 214.73;
		const expectedHouseValue = (1 + MONTHLY_HOUSE_VALUE_GROWTH_RATE / 100) * 100000;
		const expectedHousePayments =
			expectedMonthlyMortgagePayment + 100 + ((0.01 + 0.02) * expectedHouseValue) / 12;
		const expectedBalance = expectedMonthlySalary - expectedMonthlyExpense - expectedHousePayments;

		const expectedSavingsValue = (1 + SAVINGS_MONTHLY_RETURN / 100) * 50000;
		const expectedBrokerageValue = (1 + BROKERAGE_MONTHLY_RETURN / 100) * 200 + expectedBalance;
		const expected401kValue =
			(1 + RETIREMENT_MONTHLY_RETURN / 100) * 10000 + 1.1 * expectedMonthly401kContribution;

		expect(model.currentDate.getTime()).toBe(nextDate.getTime());
		expect(model.savingsAccount.value).toBeCloseTo(expectedSavingsValue);
		expect(model.brokerageAccount.value).toBeCloseTo(expectedBrokerageValue);
		expect(model.jobs[0].retirementAccount401k.value).toBeCloseTo(expected401kValue);
	});
});
