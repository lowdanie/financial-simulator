import { type TaxManagerParameters, TaxManager, FilingStatus } from './tax_manager';

const PARAMS: TaxManagerParameters = {
	filingStatus: FilingStatus.JOINT
};
const INFLATION_RATE = 3;
const INFLATION_FACTOR = 1.03;

describe('test TaxManager', () => {
	test('constructor', () => {
		let taxManager = new TaxManager(PARAMS, 2024, INFLATION_RATE);

		expect(taxManager.previousTaxData.year).toBe(2023);
		expect(taxManager.currentTaxData.year).toBe(2024);

		expect(taxManager.previousTaxData.incomeTaxBrackets[1].start).toBeCloseTo(22000);
		expect(taxManager.currentTaxData.incomeTaxBrackets[1].start).toBeCloseTo(
			INFLATION_FACTOR * 22000
		);

		expect(taxManager.previousTaxData.standardDeduction).toBeCloseTo(29200);
		expect(taxManager.currentTaxData.standardDeduction).toBeCloseTo(INFLATION_FACTOR * 29200);
	});
	test('computePreviousYearFederalTax', () => {
		let taxManager = new TaxManager(PARAMS, 2024, INFLATION_RATE);
		const tax = taxManager.computePreviousYearTax(
			[
				{
					year: 2023,
					companyId: 0,
					employeeId: 1,
					taxableIncome: 100000
				}
			],
			[{ year: 2023, interest: 50000 }],
			[{ year: 2023, costBasis: 25, proceeds: 125 }],
			[
				{
					year: 2023,
					taxableIncome: 10000,
					isEarlyDistribution: true
				}
			],
			[{ year: 2023, mortgageInterestPayed: 100, propertyTax: 1000 }]
		);
		const totalIncome = 100000 + 50000 + 10000 - 29200;
		const expectedIncomeTax = 0.1 * 22000 + 0.12 * (89450 - 22000) + 0.22 * (totalIncome - 89450);
		const expectedCapitalGainsTax = 0.15 * 100;
		const expected401kPenalty = 0.1 * 10000;
		const expectedPropertyTax = 1000;

		expect(tax).toBeCloseTo(
			expectedIncomeTax + expectedCapitalGainsTax + expected401kPenalty + expectedPropertyTax
		);
	});
});
