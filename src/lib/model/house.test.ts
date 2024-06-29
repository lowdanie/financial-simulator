import { House, type HouseParameters } from './house';

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
	sellingCostRate: 4
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
});
