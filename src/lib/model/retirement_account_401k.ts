import { TaxDocument1099R } from "./tax_document";
import { Age, ageToDate } from "./date_utils";
import { annualToMonthlyReturnRate } from "./utils";

interface TaxableIncome {
  early: number;
  penaltyFree: number;
}

export interface RetirementAccount401kParameters {
  accountName: string;
  employeeName: string;
  initialValue: number;
  annualReturnRate: number;
}

export class RetirementAccount401k {
  params: RetirementAccount401kParameters;
  value: number;
  currentYear: number;
  monthlyReturnRate: number;
  penaltyFreeWithdrawalDate: Date;
  currentAnnualTaxableIncome: TaxableIncome;
  previousAnnualTaxableIncome: TaxableIncome;

  constructor(
    params: RetirementAccount401kParameters,
    year: number,
    employeeBirthday: Date,
    penaltyFreeWithdrawalAge: Age
  ) {
    this.params = params;
    this.currentYear = year;
    this.value = params.initialValue;
    this.monthlyReturnRate = annualToMonthlyReturnRate(params.annualReturnRate);
    this.penaltyFreeWithdrawalDate = ageToDate(
      penaltyFreeWithdrawalAge,
      employeeBirthday
    );
    this.currentAnnualTaxableIncome = { early: 0, penaltyFree: 0 };
    this.previousAnnualTaxableIncome = { early: 0, penaltyFree: 0 };
  }

  contribute(amount: number) {
    this.value += amount;
  }

  withdraw(amount: number, month: number): number {
    amount = Math.min(this.value, amount);
    this.value -= amount;

    const date = new Date(this.currentYear, month - 1);
    if (date < this.penaltyFreeWithdrawalDate) {
      this.currentAnnualTaxableIncome.early += amount;
    } else {
      this.currentAnnualTaxableIncome.penaltyFree += amount;
    }

    return amount;
  }

  receiveMonthlyReturn() {
    this.value *= 1 + this.monthlyReturnRate / 100;
  }

  getPreviousYear1099Rs(): Array<TaxDocument1099R> {
    let docs = new Array<TaxDocument1099R>();

    if (this.previousAnnualTaxableIncome.early > 0) {
      docs.push({
        year: this.currentYear - 1,
        accountName: this.params.accountName,
        taxableIncome: this.previousAnnualTaxableIncome.early,
        isEarlyDistribution: true,
      });
    }

    if (this.previousAnnualTaxableIncome.penaltyFree > 0) {
      docs.push({
        year: this.currentYear - 1,
        accountName: this.params.accountName,
        taxableIncome: this.previousAnnualTaxableIncome.penaltyFree,
        isEarlyDistribution: false,
      });
    }

    return docs;
  }

  incrementYear() {
    this.currentYear += 1;
    this.previousAnnualTaxableIncome = this.currentAnnualTaxableIncome;
    this.currentAnnualTaxableIncome = { early: 0, penaltyFree: 0 };
  }
}
