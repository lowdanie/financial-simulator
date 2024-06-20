import { TaxDocumentW2 } from "./tax_document";
import { numOverlapMonths } from "./date_utils";

export interface JobParameters {
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
  taxableIncomeByYear: Map<number, number>;

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
    this.taxableIncomeByYear = new Map();
  }

  isActive(date: Date): boolean {
    return this.params.startDate <= date && date <= this.params.endDate;
  }

  sendMonthlyPaystub(date: Date): Paystub {
    let monthlyIncome = this.salary / 12;
    if (date.getMonth() + 1 == this.params.bonusMonth) {
      monthlyIncome += this.bonus;
    }

    monthlyIncome -= this.monthly401kContribution;
    let match401k =
      (this.params.company401kMatchRate / 100) * this.monthly401kContribution;

    this.taxableIncomeByYear.set(
      this.currentYear,
      (this.taxableIncomeByYear.get(this.currentYear) ?? 0) + monthlyIncome
    );

    return {
      companyName: this.params.companyName,
      employeeName: this.params.employeeName,
      income: monthlyIncome,
      contribution401k: this.monthly401kContribution + match401k,
    };
  }

  getW2(year: number): TaxDocumentW2 {
    return {
      year: year,
      companyName: this.params.companyName,
      employeeName: this.params.employeeName,
      taxableIncome: this.taxableIncomeByYear.get(year) ?? 0,
    };
  }

  incrementYear(inflationRate: number, max401kContribution: number) {
    this.currentYear += 1;

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
