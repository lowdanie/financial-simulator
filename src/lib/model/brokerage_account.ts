import type { TaxDocument1099B } from './tax_document';
import { annualToMonthlyReturnRate } from './utils';

interface TaxInformation {
	costBasis: number;
	proceeds: number;
}

export interface BrokerageAccountParameters {
	accountName: string;
	initialValue: number;
	initialCostBasis: number;
	annualReturnRate: number;
	managementFeeRate: number;
}

export class BrokerageAccount {
	params: BrokerageAccountParameters;
	currentYear: number;
	value: number;
	costBasis: number;
	monthlyReturnRate: number;
	currentTaxInfo: TaxInformation;
	previousTaxInfo: TaxInformation;

	constructor(params: BrokerageAccountParameters, year: number) {
		this.params = params;
		this.currentYear = year;
		this.value = params.initialValue;
		this.costBasis = params.initialCostBasis;
		this.monthlyReturnRate = annualToMonthlyReturnRate(params.annualReturnRate);
		this.currentTaxInfo = { costBasis: 0, proceeds: 0 };
		this.previousTaxInfo = { costBasis: 0, proceeds: 0 };
	}

	contribute(amount: number) {
		this.value += amount;
		this.costBasis += amount;
	}

	withdraw(amount: number): number {
		amount = Math.min(this.value, amount);

		let costBasis = 0;
		if (this.value > 0) {
			costBasis = (this.costBasis / this.value) * amount;
		}

		this.value -= amount;
		this.costBasis -= costBasis;

		this.currentTaxInfo.costBasis += costBasis;
		this.currentTaxInfo.proceeds += amount;

		return amount;
	}

	receiveMonthlyReturn() {
		this.value *= 1 + this.monthlyReturnRate / 100;
	}

	getPreviousYear1099B(): TaxDocument1099B {
		return {
			year: this.currentYear - 1,
			costBasis: this.previousTaxInfo.costBasis,
			proceeds: this.previousTaxInfo.proceeds
		};
	}

	incrementYear() {
		this.value -= (this.params.managementFeeRate / 100) * this.value;

		this.currentYear += 1;
		this.previousTaxInfo = this.currentTaxInfo;
		this.currentTaxInfo = { costBasis: 0, proceeds: 0 };
	}
}
