import { type TaxDocument1099Int } from "./tax_document";

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
  monthlyInterestRate: number;
  currentAnnualInterest: number;
  previousAnnualInterest: number;

  constructor(params: SavingsAccountParameters, currentYear: number) {
    this.params = params;
    this.currentYear = currentYear;
    this.value = params.initialValue;
    this.monthlyInterestRate = apyToMonthlyRate(params.annualPercentageYield);
    this.currentAnnualInterest = 0;
    this.previousAnnualInterest = 0;
  }

  contribute(amount: number) {
    this.value += amount;
  }

  withdraw(amount: number, month: number): number {
    amount = Math.min(this.value, amount);
    this.value -= amount;
    return amount;
  }

  receiveMonthlyInterest() {
    const interest = (this.monthlyInterestRate / 100) * this.value;
    this.value += interest;
    this.currentAnnualInterest += interest;
  }

  getPreviousYear1099Int(): TaxDocument1099Int {
    return {
      year: this.currentYear - 1,
      accountName: this.params.name,
      interest: this.previousAnnualInterest,
    };
  }

  incrementYear() {
    this.currentYear += 1;
    this.previousAnnualInterest = this.currentAnnualInterest;
    this.currentAnnualInterest = 0;
  }
}
