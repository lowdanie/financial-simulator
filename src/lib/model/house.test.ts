import { House, type HouseParameters } from './house';
import type { TaxDocument1098 } from './tax_document';

const INFLATION_RATE = 3;
const MONTHLY_GROWTH_RATE = 1;

const PARAMS_BEFORE_BUY: HouseParameters = {
	id: 0,
	name: 'house',
	buyDate: new Date(2020, 5, 1),
	sellDate: new Date(2025, 5, 1),
	homeValue: 100000,
	homeValueAnnualGrowthRate: 100 * (Math.pow(1 + MONTHLY_GROWTH_RATE / 100, 12) - 1),

	mortgageRate: 5,
	mortgageLengthYears: 30,
	downPaymentRate: 20,

	monthlyCommonFee: 100,
	propertyTaxRate: 1,
	insuranceRate: 1,
	maintenanceRate: 2,

	closingCostRate: 5,
	sellingCostRate: 3
};

const PARAMS_AFTER_BUY: HouseParameters = {
	...PARAMS_BEFORE_BUY,
	homeBuyPrice: 50000,
	remainingPrincipal: 40000
};

describe('test House', () => {
	test('constructor before buy', () => {
		let house = new House(PARAMS_BEFORE_BUY, 2020);

		expect(house.boughtHome).toBe(false);
		expect(house.soldHome).toBe(false);
		expect(house.homeValue).toBeCloseTo(100000);
		expect(house.homeValueMonthlyGrowthRate).toBeCloseTo(MONTHLY_GROWTH_RATE);
		expect(house.remainingPrincipal).toBeCloseTo(0);
		expect(house.monthlyMortgagePayment).toBeCloseTo(0);
	});

	test('constructor after buy', () => {
		let house = new House(PARAMS_AFTER_BUY, 2021);

		expect(house.boughtHome).toBe(true);
		expect(house.soldHome).toBe(false);
		expect(house.homeValue).toBeCloseTo(100000);
		expect(house.homeValueMonthlyGrowthRate).toBeCloseTo(MONTHLY_GROWTH_RATE);
		expect(house.remainingPrincipal).toBeCloseTo(40000);
		expect(house.monthlyMortgagePayment).toBeCloseTo(214.73);
	});

	test('buyHome', () => {
		let house = new House(PARAMS_BEFORE_BUY, 2020);
		const balance = house.buyHome();

		expect(house.boughtHome).toBe(true);
		expect(house.remainingPrincipal).toBeCloseTo(0.8 * 100000);
		expect(house.monthlyMortgagePayment).toBeCloseTo(429.46);
		expect(balance).toBeCloseTo(-(0.05 + 0.2) * 100000);
	});

	test('sellHome', () => {
		let house = new House(PARAMS_AFTER_BUY, 2021);
		const balance = house.sellHome();

		expect(house.soldHome).toBe(true);
		expect(balance).toBeCloseTo(100000 - 40000 - 0.03 * 100000);
	});

	test('makeMonthlyMortgagePayment', () => {
		let house = new House(PARAMS_AFTER_BUY, 2021);
		const expectedInterest = (0.05 / 12) * 40000;
		const expectedMonthlyPayment = 214.73;
		const expectedRemainingPrincipal = (1 + 0.05 / 12) * 40000 - expectedMonthlyPayment;

		house.makeMonthlyMortgagePayment();

		expect(house.currentTaxInfo.interestPayment).toBeCloseTo(expectedInterest);
		expect(house.remainingPrincipal).toBeCloseTo(expectedRemainingPrincipal);
	});

	test('makeMonthlyPayments', () => {
		let house = new House(PARAMS_AFTER_BUY, 2021);
		const expectedMonthlyMortgagePayment = 214.73;
		const expectedPayments = expectedMonthlyMortgagePayment + 100 + ((0.01 + 0.02) * 100000) / 12;

		expect(house.makeMonthlyPayments()).toBeCloseTo(expectedPayments);
	});

	test('applyMonthlyAppreciation', () => {
		let house = new House(PARAMS_AFTER_BUY, 2021);
		house.applyMonthlyAppreciation();

		expect(house.homeValue).toBeCloseTo((1 + MONTHLY_GROWTH_RATE / 100) * 100000);
	});

	test('executeMonthlyCashflow before buy', () => {
		let house = new House(PARAMS_BEFORE_BUY, 2020);
		expect(house.executeMonthlyCashflow(0)).toBe(0);
	});

	test('executeMonthlyCashflow on buy', () => {
		let house = new House(PARAMS_BEFORE_BUY, 2020);
		const expectedMonthlyMortgage = 429.46;
		const expectedMonthlyPayments = expectedMonthlyMortgage + 100 + ((0.01 + 0.02) * 100000) / 12;

		const expectedBalance = -(0.2 + 0.05) * 100000 - expectedMonthlyPayments;
		expect(house.executeMonthlyCashflow(6)).toBeCloseTo(expectedBalance);
	});

	test('executeMonthlyCashflow between buy and sell', () => {
		let house = new House(PARAMS_AFTER_BUY, 2021);
		const expectedMonthlyMortgagePayment = 214.73;
		const expectedPayments = expectedMonthlyMortgagePayment + 100 + ((0.01 + 0.02) * 100000) / 12;

		expect(house.executeMonthlyCashflow(7)).toBeCloseTo(-expectedPayments);
	});

	test('executeMonthlyCashflow between on sell', () => {
		let house = new House(PARAMS_AFTER_BUY, 2025);
		const expectedBalance = 100000 - 40000 - 0.03 * 100000;
		expect(house.executeMonthlyCashflow(6)).toBeCloseTo(expectedBalance);
	});

	test('executeMonthlyCashflow after sell', () => {
		let house = new House(PARAMS_AFTER_BUY, 2025);
		expect(house.executeMonthlyCashflow(7)).toBe(0);
	});

	test('incrementYear', () => {
		let house = new House(PARAMS_BEFORE_BUY, 2020);
		house.incrementYear(INFLATION_RATE);

		expect(house.monthlyCommonFee).toBeCloseTo((1 + INFLATION_RATE / 100) * 100);
		expect(house.homeValue).toBeCloseTo((1 + INFLATION_RATE / 100) * 100000);
	});

	test('getPreviousYear1098', () => {
		let house = new House(PARAMS_AFTER_BUY, 2025);
		house.executeMonthlyCashflow(1);
		house.incrementYear(INFLATION_RATE);

		const expected1098: TaxDocument1098 = {
			year: 2025,
			mortgageInterestPayed: (0.05 / 12) * 40000,
			propertyTax: 0.01 * (6 / 12) * 100000
		};
		const received1098 = house.getPreviousYear1098();
		expect(received1098.year).toBe(expected1098.year);
		expect(received1098.mortgageInterestPayed).toBeCloseTo(expected1098.mortgageInterestPayed);
		expect(received1098.propertyTax).toBeCloseTo(expected1098.propertyTax);
	});

	test('getHomeEquity', () => {
		let house = new House(PARAMS_AFTER_BUY, 2025);

		const expectedEquity = 100000 - 40000;

		expect(house.getHomeEquity()).toBeCloseTo(expectedEquity);
	});
});
