import { numOverlapMonths } from './date_utils';
import type { TaxDocument1098 } from './tax_document';
import { annualToMonthlyReturnRate } from './utils';

export interface HouseParameters {
	id: number;
	name: string;
	buyDate: Date;
	sellDate: Date;
	homeValue: number; // in todays dollars.
	homeValueAnnualGrowthRate: number;

	mortgageRate: number;
	mortgageLengthYears: number;
	downPaymentRate: number;

	// If buyDate < today
	remainingPrincipal?: number;
	homeBuyPrice?: number;

	monthlyCommonFee: number;
	propertyTaxRate: number;
	insuranceRate: number;
	maintenanceRate: number;

	closingCostRate: number;
	sellingCostRate: number;
}

interface TaxInformation {
	interestPayment: number;
	assessedHomeValue: number;
}

function computeMonthlyMortgagePayment(
	homePrice: number,
	mortgageRate: number,
	mortgageYears: number,
	downPaymentRate: number
): number {
	const r = mortgageRate / 1200;
	const n = mortgageYears * 12;
	const P = (1 - downPaymentRate / 100) * homePrice;

	const a = Math.pow(1 + r, n);
	return (a / (a - 1)) * (r * P);
}

export class House {
	params: HouseParameters;
	currentYear: number;
	boughtHome: boolean;
	soldHome: boolean;

	homeValue: number;
	homeValueMonthlyGrowthRate: number;

	remainingPrincipal: number;
	monthlyMortgagePayment: number;
	monthlyMortgageRate: number;

	monthlyCommonFee: number;

	currentTaxInfo: TaxInformation;
	previousTaxInfo: TaxInformation;

	constructor(params: HouseParameters, year: number) {
		this.params = params;
		this.currentYear = year;
		this.homeValue = params.homeValue;
		this.homeValueMonthlyGrowthRate = annualToMonthlyReturnRate(
			this.params.homeValueAnnualGrowthRate
		);
		this.boughtHome = false;
		this.soldHome = false;

		this.monthlyCommonFee = params.monthlyCommonFee;
		this.monthlyMortgageRate = params.mortgageRate / 12;

		this.currentTaxInfo = { interestPayment: 0, assessedHomeValue: params.homeValue };
		this.previousTaxInfo = { interestPayment: 0, assessedHomeValue: 0 };

		if (params.buyDate < new Date(year, 0)) {
			if (params.remainingPrincipal === undefined) {
				throw 'The remaining principal must be set for homes that were already bought.';
			}
			if (params.homeBuyPrice === undefined) {
				throw 'The home buy price must be set for homes that were already bought.';
			}

			this.boughtHome = true;
			this.remainingPrincipal = params.remainingPrincipal;
			this.monthlyMortgagePayment = computeMonthlyMortgagePayment(
				params.homeBuyPrice,
				this.params.mortgageRate,
				this.params.mortgageLengthYears,
				this.params.downPaymentRate
			);
		} else {
			this.remainingPrincipal = 0;
			this.monthlyMortgagePayment = 0;
		}
	}

	buyHome(): number {
		this.boughtHome = true;
		this.monthlyMortgagePayment = computeMonthlyMortgagePayment(
			this.homeValue,
			this.params.mortgageRate,
			this.params.mortgageLengthYears,
			this.params.downPaymentRate
		);

		const downPayment = (this.params.downPaymentRate / 100) * this.homeValue;
		const closingCost = (this.params.closingCostRate / 100) * this.homeValue;

		this.remainingPrincipal = this.homeValue - downPayment;

		return -(downPayment + closingCost);
	}

	sellHome(): number {
		this.soldHome = true;
		let costs = (this.params.sellingCostRate / 100) * this.homeValue;
		costs += this.remainingPrincipal;

		return this.homeValue - costs;
	}

	makeMonthlyMortgagePayment() {
		this.currentTaxInfo.interestPayment +=
			(this.monthlyMortgageRate / 100) * this.remainingPrincipal;
		this.remainingPrincipal = Math.max(
			0,
			this.remainingPrincipal * (1 + this.monthlyMortgageRate / 100) - this.monthlyMortgagePayment
		);
	}

	makeMonthlyPayments(): number {
		this.makeMonthlyMortgagePayment();
		const monthlyInsurance = (this.params.insuranceRate / 1200) * this.homeValue;
		const monthlyMaintenance = (this.params.maintenanceRate / 1200) * this.homeValue;
		return (
			this.monthlyMortgagePayment + this.monthlyCommonFee + monthlyInsurance + monthlyMaintenance
		);
	}

	getPreviousYearPropertyTax(): number {
		const taxRate =
			(this.params.propertyTaxRate *
				numOverlapMonths(
					{ start: this.params.buyDate, end: this.params.sellDate },
					this.currentYear - 1
				)) /
			12;
		return (taxRate / 100) * this.previousTaxInfo.assessedHomeValue;
	}

	applyMonthlyAppreciation() {
		if (this.boughtHome && !this.soldHome) {
			this.homeValue *= 1 + this.homeValueMonthlyGrowthRate / 100;
		}
	}

	executeMonthlyCashflow(month: number): number {
		const currentDate = new Date(this.currentYear, month - 1);
		let balance = 0;

		if (currentDate.getTime() == this.params.buyDate.getTime()) {
			balance = this.buyHome();
			balance -= this.makeMonthlyPayments();
		} else if (this.params.buyDate < currentDate && currentDate < this.params.sellDate) {
			balance -= this.makeMonthlyPayments();
		} else if (currentDate.getTime() == this.params.sellDate.getTime()) {
			balance = this.sellHome();
		}

		return balance;
	}

	incrementYear(inflationRate: number) {
		this.currentYear += 1;

		const inflationFactor = 1 + inflationRate / 100;
		this.monthlyCommonFee *= inflationFactor;

		if (!this.boughtHome) {
			this.homeValue *= inflationFactor;
		}

		this.previousTaxInfo = this.currentTaxInfo;
		this.currentTaxInfo = { interestPayment: 0, assessedHomeValue: this.homeValue };
	}

	getPreviousYear1098(): TaxDocument1098 {
		return {
			year: this.currentYear - 1,
			mortgageInterestPayed: this.previousTaxInfo.interestPayment,
			propertyTax: this.getPreviousYearPropertyTax()
		};
	}

	getHomeEquity(): number {
		if (this.boughtHome && !this.soldHome) {
			return this.homeValue - this.remainingPrincipal;
		}

		return 0;
	}
}
