import { type JobParameters, Job } from './job';
import { type TaxDocumentW2 } from './tax_document';
import { type Person } from './person';

const JOB_PARAMS: JobParameters = {
	id: 0,
	companyName: 'test company',
	employeeId: 1,
	startDate: new Date(2024, 5),
	endDate: new Date(2035, 1),
	initialSalary: 100000,
	initialBonus: 20000,
	bonusMonth: 12,
	realRaiseRate: 2,

	percentOfMax401kContribution: 90,
	company401kMatchRate: 50,
	initial401kValue: 100,
	annual401kReturnRate: 5
};

const EMPLOYEE: Person = {
	id: 1,
	name: 'employee',
	birthday: new Date(1990, 0)
};

const CURRENT_YEAR = 2024;
const MAX_401K_CONTRIBUTION = 20000;
const PENALTY_FREE_WITHDRAWAL_AGE = { years: 59, months: 6 };

describe('test Job', () => {
	test('constructor', () => {
		let job = new Job(
			JOB_PARAMS,
			CURRENT_YEAR,
			EMPLOYEE,
			MAX_401K_CONTRIBUTION,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		let expectedMonthly401k = (0.9 * MAX_401K_CONTRIBUTION) / 7;
		expect(job.monthly401kContribution).toBeCloseTo(expectedMonthly401k);
	});
	test('isActive before', () => {
		let job = new Job(
			JOB_PARAMS,
			CURRENT_YEAR,
			EMPLOYEE,
			MAX_401K_CONTRIBUTION,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		expect(job.isActive(new Date(2024, 4))).toBe(false);
	});
	test('isActive during', () => {
		let job = new Job(
			JOB_PARAMS,
			CURRENT_YEAR,
			EMPLOYEE,
			MAX_401K_CONTRIBUTION,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		expect(job.isActive(new Date(2035, 1))).toBe(true);
	});
	test('isActive after', () => {
		let job = new Job(
			JOB_PARAMS,
			CURRENT_YEAR,
			EMPLOYEE,
			MAX_401K_CONTRIBUTION,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		expect(job.isActive(new Date(2035, 2))).toBe(false);
	});
	test('sendMonthlyPaystub', () => {
		let job = new Job(
			JOB_PARAMS,
			CURRENT_YEAR,
			EMPLOYEE,
			MAX_401K_CONTRIBUTION,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		const paystub = job.sendMonthlyPaystub(7);
		const expectedContribution401k = (0.9 * MAX_401K_CONTRIBUTION) / 7;

		expect(paystub.income).toBeCloseTo(JOB_PARAMS.initialSalary / 12 - expectedContribution401k);
		expect(job.retirementAccount401k.value).toBeCloseTo(100 + 1.5 * expectedContribution401k);
	});
	test('sendMonthlyPaystub with bonus', () => {
		let job = new Job(
			JOB_PARAMS,
			CURRENT_YEAR,
			EMPLOYEE,
			MAX_401K_CONTRIBUTION,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		const expectedContribution401k = (0.9 * MAX_401K_CONTRIBUTION) / 7;
		const paystub = job.sendMonthlyPaystub(12);
		expect(paystub.income).toBeCloseTo(
			JOB_PARAMS.initialSalary / 12 + JOB_PARAMS.initialBonus - expectedContribution401k
		);
	});
	test('getW2 empty', () => {
		let job = new Job(
			JOB_PARAMS,
			CURRENT_YEAR,
			EMPLOYEE,
			MAX_401K_CONTRIBUTION,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		const w2 = job.getPreviousYearW2();
		expect(w2.taxableIncome).toBe(0);
	});
	test('getW2 two paystubs', () => {
		let job = new Job(
			JOB_PARAMS,
			CURRENT_YEAR,
			EMPLOYEE,
			MAX_401K_CONTRIBUTION,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		job.sendMonthlyPaystub(7);
		job.sendMonthlyPaystub(8);
		job.incrementYear(3, MAX_401K_CONTRIBUTION);

		const monthlyContribution401k = (0.9 * MAX_401K_CONTRIBUTION) / 7;
		const expectedW2: TaxDocumentW2 = {
			year: CURRENT_YEAR,
			companyId: 0,
			employeeId: 1,
			taxableIncome: 2 * (JOB_PARAMS.initialSalary / 12 - monthlyContribution401k)
		};

		const w2 = job.getPreviousYearW2();

		expect(w2.year).toBe(expectedW2.year);
		expect(w2.taxableIncome).toBeCloseTo(expectedW2.taxableIncome);
	});
	test('incrementYear', () => {
		let job = new Job(
			JOB_PARAMS,
			CURRENT_YEAR,
			EMPLOYEE,
			MAX_401K_CONTRIBUTION,
			PENALTY_FREE_WITHDRAWAL_AGE
		);
		job.incrementYear(3, 21000);

		expect(job.currentYear).toBe(2025);
		expect(job.salary).toBeCloseTo(JOB_PARAMS.initialSalary * 1.03 * 1.02);
		expect(job.bonus).toBeCloseTo(JOB_PARAMS.initialBonus * 1.03 * 1.02);
		expect(job.monthly401kContribution).toBeCloseTo((0.9 * 21000) / 12);
	});
});
