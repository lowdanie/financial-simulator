import { type Age } from './date_utils';
import {
	type TaxDocumentW2,
	type TaxDocument1099Int,
	type TaxDocument1099R,
	type TaxDocument1099B,
	type TaxDocument1098
} from './tax_document';

export enum FilingStatus {
	JOINT = 'Joint',
	SINGLE = 'Single'
}

interface TaxBracket {
	start: number;
	rate: number;
}

interface TaxData {
	year: number;
	incomeTaxBrackets: Array<TaxBracket>;
	capitalGainsRate: number;
	standardDeduction: number;
	max401kContribution: number;
	penaltyFree401kWithdrawalAge: Age;
	early401kWithdrawalPenaltyRate: number;
}

const TAX_DATA_BY_STATUS: Map<FilingStatus, TaxData> = new Map([
	[
		FilingStatus.JOINT,
		{
			year: 2023,
			incomeTaxBrackets: [
				{ start: 0, rate: 10 },
				{ start: 22000, rate: 12 },
				{ start: 89450, rate: 22 },
				{ start: 190750, rate: 24 },
				{ start: 364200, rate: 32 },
				{ start: 462500, rate: 35 },
				{ start: 693750, rate: 37 }
			],
			capitalGainsRate: 15,
			standardDeduction: 29200,
			max401kContribution: 22500,
			penaltyFree401kWithdrawalAge: { years: 59, months: 6 },
			early401kWithdrawalPenaltyRate: 10
		}
	]
]);

function getTaxData(filingStatus: FilingStatus): TaxData {
	let data = TAX_DATA_BY_STATUS.get(filingStatus);

	if (data === undefined) {
		throw `Unexpected filing status: ${filingStatus}`;
	}

	return data;
}

function adjustTaxData(taxData: TaxData, inflationRate: number, numYears: number): TaxData {
	const inflationFactor = Math.pow(1 + inflationRate / 100, numYears);

	const adjustedTaxBrackets: TaxBracket[] = [];
	for (let b of taxData.incomeTaxBrackets) {
		adjustedTaxBrackets.push({
			start: inflationFactor * b.start,
			rate: b.rate
		});
	}
	return {
		year: taxData.year + numYears,
		incomeTaxBrackets: adjustedTaxBrackets,
		capitalGainsRate: taxData.capitalGainsRate,
		standardDeduction: inflationFactor * taxData.standardDeduction,
		max401kContribution: inflationFactor * taxData.max401kContribution,
		penaltyFree401kWithdrawalAge: taxData.penaltyFree401kWithdrawalAge,
		early401kWithdrawalPenaltyRate: taxData.early401kWithdrawalPenaltyRate
	};
}

function computeProgressiveTax(income: number, taxBrackets: TaxBracket[]) {
	let tax = 0;

	for (let i = 0; i < taxBrackets.length - 1; i++) {
		const bracket = taxBrackets[i];
		const nextBracket = taxBrackets[i + 1];

		if (income >= bracket.start) {
			const incomeInBracket = Math.min(income - bracket.start, nextBracket.start - bracket.start);
			tax += (bracket.rate / 100) * incomeInBracket;
		}
	}

	const lastBracket = taxBrackets[taxBrackets.length - 1];
	if (income > lastBracket.start) {
		tax += (lastBracket.rate / 100) * (income - lastBracket.start);
	}

	return tax;
}

function computeTotalIncome(
	docW2s: TaxDocumentW2[],
	doc1099Ints: TaxDocument1099Int[],
	doc1099Rs: TaxDocument1099R[]
): number {
	return (
		docW2s.reduce((partialSum, d) => partialSum + d.taxableIncome, 0) +
		doc1099Ints.reduce((partialSum, d) => partialSum + d.interest, 0) +
		doc1099Rs.reduce((partialSum, d) => partialSum + d.taxableIncome, 0)
	);
}

function computeStateIncomeTax(
	effectiveTaxRate: number,
	docW2s: TaxDocumentW2[],
	doc1099Ints: TaxDocument1099Int[],
	doc1099Rs: TaxDocument1099R[]
): number {
	return (effectiveTaxRate / 100) * computeTotalIncome(docW2s, doc1099Ints, doc1099Rs);
}

function computeFederalIncomeTax(
	taxData: TaxData,
	docW2s: TaxDocumentW2[],
	doc1099Ints: TaxDocument1099Int[],
	doc1099Rs: TaxDocument1099R[],
	doc1098s: TaxDocument1098[]
): number {
	let taxableIncome = computeTotalIncome(docW2s, doc1099Ints, doc1099Rs);

	const houseDeductible = doc1098s.reduce(
		(partialSum, d) => partialSum + d.mortgageInterestPayed + d.propertyTax,
		0
	);
	const deduction = Math.max(houseDeductible, taxData.standardDeduction);
	taxableIncome = Math.max(0, taxableIncome - deduction);

	return computeProgressiveTax(taxableIncome, taxData.incomeTaxBrackets);
}

function computeCapitalGainsTax(taxData: TaxData, doc1099Bs: TaxDocument1099B[]): number {
	const totalGains = doc1099Bs.reduce(
		(previousValue, doc) => previousValue + Math.max(0, doc.proceeds - doc.costBasis),
		0
	);

	return (taxData.capitalGainsRate / 100) * totalGains;
}

export interface TaxManagerParameters {
	filingStatus: FilingStatus;
	effectiveStateTaxRate: number;
}

export class TaxManager {
	params: TaxManagerParameters;
	currentTaxData: TaxData;
	previousTaxData: TaxData;

	constructor(params: TaxManagerParameters, year: number, inflationRate: number) {
		this.params = params;

		const taxData = getTaxData(params.filingStatus);
		this.currentTaxData = adjustTaxData(taxData, inflationRate, year - taxData.year);
		this.previousTaxData = adjustTaxData(taxData, inflationRate, year - 1 - taxData.year);
	}

	computePreviousYearTax(
		docW2s: TaxDocumentW2[],
		doc1099Ints: TaxDocument1099Int[],
		doc1099Bs: TaxDocument1099B[],
		doc1099Rs: TaxDocument1099R[],
		doc1098s: TaxDocument1098[]
	): number {
		const taxData = this.previousTaxData;

		const federalIncomeTax = computeFederalIncomeTax(
			taxData,
			docW2s,
			doc1099Ints,
			doc1099Rs,
			doc1098s
		);
		const stateIncomeTax = computeStateIncomeTax(
			this.params.effectiveStateTaxRate,
			docW2s,
			doc1099Ints,
			doc1099Rs
		);
		const capitalGainsTax = computeCapitalGainsTax(taxData, doc1099Bs);

		let early401kWithdrawalPenalty = 0;
		for (let d of doc1099Rs) {
			if (d.isEarlyDistribution) {
				early401kWithdrawalPenalty +=
					(taxData.early401kWithdrawalPenaltyRate / 100) * d.taxableIncome;
			}
		}

		const propertyTax = doc1098s.reduce((partialSum, d) => partialSum + d.propertyTax, 0);

		return (
			federalIncomeTax + stateIncomeTax + capitalGainsTax + early401kWithdrawalPenalty + propertyTax
		);
	}

	getMax401kContribution() {
		return this.currentTaxData.max401kContribution;
	}

	getPenaltyFree401kWithdrawalAge() {
		return this.currentTaxData.penaltyFree401kWithdrawalAge;
	}

	incrementYear(inflationRate: number) {
		this.previousTaxData = this.currentTaxData;
		this.currentTaxData = adjustTaxData(this.currentTaxData, inflationRate, 1);
	}
}
