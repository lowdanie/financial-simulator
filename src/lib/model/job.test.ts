import { type JobParameters, Job } from './job';
import { type TaxDocumentW2 } from './tax_document';

const jobParams: JobParameters = {
	id: 0,
	companyName: 'test company',
	employeeName: 'test user',
	startDate: new Date(2024, 5),
	endDate: new Date(2035, 1),
	initialSalary: 100000,
	initialBonus: 20000,
	bonusMonth: 12,
	percentOfMax401kContribution: 90,
	company401kMatchRate: 50,
	realRaiseRate: 2
};

const currentYear = 2024;
const max401kContribution = 20000;

describe('test Job', () => {
	test('constructor', () => {
		let job = new Job(jobParams, currentYear, max401kContribution);
		let expectedMonthly401k = (0.9 * max401kContribution) / 7;
		expect(job.monthly401kContribution).toBeCloseTo(expectedMonthly401k);
	});
	test('isActive before', () => {
		let job = new Job(jobParams, currentYear, max401kContribution);
		expect(job.isActive(new Date(2024, 4))).toBe(false);
	});
	test('isActive during', () => {
		let job = new Job(jobParams, currentYear, max401kContribution);
		expect(job.isActive(new Date(2035, 1))).toBe(true);
	});
	test('isActive after', () => {
		let job = new Job(jobParams, currentYear, max401kContribution);
		expect(job.isActive(new Date(2035, 2))).toBe(false);
	});
	test('sendMonthlyPaystub', () => {
		let job = new Job(jobParams, currentYear, max401kContribution);
		const paystub = job.sendMonthlyPaystub(7);
		let expectedContribution401k = (0.9 * max401kContribution) / 7;

		expect(paystub.income).toBeCloseTo(jobParams.initialSalary / 12 - expectedContribution401k);
		expect(paystub.contribution401k).toBeCloseTo(1.5 * expectedContribution401k);
	});
	test('sendMonthlyPaystub with bonus', () => {
		let job = new Job(jobParams, currentYear, max401kContribution);
		const paystub = job.sendMonthlyPaystub(12);
		let expectedContribution401k = (0.9 * max401kContribution) / 7;
		expect(paystub.income).toBeCloseTo(
			jobParams.initialSalary / 12 + jobParams.initialBonus - expectedContribution401k
		);
		expect(paystub.contribution401k).toBeCloseTo(1.5 * expectedContribution401k);
	});
	test('getW2 empty', () => {
		let job = new Job(jobParams, currentYear, max401kContribution);
		const w2 = job.getPreviousYearW2();
		expect(w2.taxableIncome).toBe(0);
	});
	test('getW2 two paystubs', () => {
		let job = new Job(jobParams, currentYear, max401kContribution);
		job.sendMonthlyPaystub(7);
		job.sendMonthlyPaystub(8);
		job.incrementYear(3, max401kContribution);

		const monthlyContribution401k = (0.9 * max401kContribution) / 7;
		const expectedW2: TaxDocumentW2 = {
			year: currentYear,
			companyName: 'test company',
			employeeName: 'test user',
			taxableIncome: 2 * (jobParams.initialSalary / 12 - monthlyContribution401k)
		};

		const w2 = job.getPreviousYearW2();

		expect(w2.year).toBe(expectedW2.year);
		expect(w2.taxableIncome).toBeCloseTo(expectedW2.taxableIncome);
	});
	test('incrementYear', () => {
		let job = new Job(jobParams, currentYear, max401kContribution);
		job.incrementYear(3, 21000);

		expect(job.currentYear).toBe(2025);
		expect(job.salary).toBeCloseTo(jobParams.initialSalary * 1.03 * 1.02);
		expect(job.bonus).toBeCloseTo(jobParams.initialBonus * 1.03 * 1.02);
		expect(job.monthly401kContribution).toBeCloseTo((0.9 * 21000) / 12);
	});
});
