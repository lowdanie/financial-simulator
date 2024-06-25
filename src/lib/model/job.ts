import { type TaxDocumentW2 } from "./tax_document";
import { numOverlapMonths } from "./date_utils";

export interface JobParameters {
  id: number;
  companyName: string;
  employeeName: string;
  startDate: Date;
  endDate: Date;
  initialSalary: number;
  initialBonus: number;
  bonusMonth: number; // 1-12
  percentOfMax401kContribution: number;
  company401kMatchRate: number;
  realRaiseRate: number;
}

export interface Paystub {
  companyName: string;
  employeeName: string;
  income: number;
  contribution401k: number;
}

function computeMonthly401kContribution(
  params: JobParameters,
  taxYear: number,
  max401kContribution: number
): number {
  let numMonths = numOverlapMonths(
    { start: params.startDate, end: params.endDate },
    taxYear
  );

  if (numMonths == 0) {
    return 0;
  }
  let annual401kContribution =
    (params.percentOfMax401kContribution / 100) * max401kContribution;
  return annual401kContribution / numMonths;
}

export class Job {
  params: JobParameters;
  salary: number;
  bonus: number;
  monthly401kContribution: number;
  currentYear: number;
  currentAnnualTaxableIncome: number;
  previousAnnualTaxableIncome: number;

  constructor(
    params: JobParameters,
    currentYear: number,
    max401kContribution: number
  ) {
    this.params = params;
    this.salary = params.initialSalary;
    this.bonus = params.initialBonus;
    this.monthly401kContribution = computeMonthly401kContribution(
      params,
      currentYear,
      max401kContribution
    );
    this.currentYear = currentYear;
    this.currentAnnualTaxableIncome = 0;
    this.previousAnnualTaxableIncome = 0;
  }

  isActive(date: Date): boolean {
    return this.params.startDate <= date && date <= this.params.endDate;
  }

  sendMonthlyPaystub(month: number): Paystub {
    let monthlyIncome = this.salary / 12;
    if (month == this.params.bonusMonth) {
      monthlyIncome += this.bonus;
    }

    const monthly401kContribution = Math.min(
      monthlyIncome,
      this.monthly401kContribution
    );
    monthlyIncome -= monthly401kContribution;
    let match401k =
      (this.params.company401kMatchRate / 100) * monthly401kContribution;

    this.currentAnnualTaxableIncome += monthlyIncome;

    return {
      companyName: this.params.companyName,
      employeeName: this.params.employeeName,
      income: monthlyIncome,
      contribution401k: monthly401kContribution + match401k,
    };
  }

  getPreviousYearW2(): TaxDocumentW2 {
    return {
      year: this.currentYear - 1,
      companyName: this.params.companyName,
      employeeName: this.params.employeeName,
      taxableIncome: this.previousAnnualTaxableIncome,
    };
  }

  incrementYear(inflationRate: number, max401kContribution: number) {
    this.currentYear += 1;
    this.previousAnnualTaxableIncome = this.currentAnnualTaxableIncome;
    this.currentAnnualTaxableIncome = 0;

    if (this.params.endDate.getFullYear() < this.currentYear) {
      return;
    }

    let incomeFactor = 1 + inflationRate / 100;

    // If the job was active this year, add a raise.
    if (this.params.startDate.getFullYear() <= this.currentYear) {
      incomeFactor *= 1 + this.params.realRaiseRate / 100;
    }

    this.salary *= incomeFactor;
    this.bonus *= incomeFactor;

    this.monthly401kContribution = computeMonthly401kContribution(
      this.params,
      this.currentYear,
      max401kContribution
    );
  }
}

