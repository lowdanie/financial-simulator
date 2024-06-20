import { TaxDocument1099Int } from "./tax_document";

export interface SavingsAccountParameters {
  name: string;
  initialValue: number;
  annualPercentageYield: number;
}

function apyToMonthlyRate(apy: number): number {
  return 100 * (Math.pow(1 + apy / 100, 1 / 12) - 1);
}

export class SavingsAccount {
  params: SavingsAccountParameters;
  currentYear: number;
  value: number;
  interestByYear: Map<number, number>;
  monthlyInterestRate: number;

  constructor(params: SavingsAccountParameters, currentYear: number) {
    this.params = params;
    this.currentYear = currentYear;
    this.value = params.initialValue;
    this.interestByYear = new Map();
    this.monthlyInterestRate = apyToMonthlyRate(params.annualPercentageYield);
  }

  contribute(amount: number) {
    this.value += amount;
  }

  withdraw(amount: number): number {
    amount = Math.min(this.value, amount);
    this.value -= amount;
    return amount;
  }

  receiveMonthlyInterest() {
    const interest = (this.monthlyInterestRate / 100) * this.value;
    this.value += interest;
    this.interestByYear.set(
      this.currentYear,
      (this.interestByYear.get(this.currentYear) ?? 0) + interest
    );
  }

  get1099Int(year: number): TaxDocument1099Int {
    return {
      year: year,
      interest: this.interestByYear.get(year) ?? 0,
    };
  }

  incrementYear() {
    this.currentYear += 1;
  }
}
