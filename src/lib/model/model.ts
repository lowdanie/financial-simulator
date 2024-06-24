import { Job, JobParameters } from "./job";
import { Expense, ExpenseParameters } from "./expense";
import { Person } from "./person";
import {
  RetirementAccount401k,
  RetirementAccount401kParameters,
} from "./retirement_account_401k";
import { SavingsAccount, SavingsAccountParameters } from "./savings_account";
import { TaxManager, TaxManagerParameters } from "./tax_manager";
import { TaxDocument1099R } from "./tax_document";

export interface ModelParameters {
  startYear: number;
  inflationRate: number;
  people: Person[];
  taxManager: TaxManagerParameters;
  jobs: JobParameters[];
  expenses: ExpenseParameters[];
  savingsAccount: SavingsAccountParameters;
  retirement401kAccounts: RetirementAccount401kParameters[];
}

export class ModelState {
  currentDate: Date;
  inflationRate: number;
  personByName: Map<string, Person>;
  taxManager: TaxManager;
  jobs: Job[];
  expenses: Expense[];
  savingsAccount: SavingsAccount;
  retirement401kAccountByEmployeeName: Map<string, RetirementAccount401k>;
  isBankrupt: boolean;

  constructor(params: ModelParameters) {
    this.currentDate = new Date(params.startYear, 0);
    this.inflationRate = params.inflationRate;

    this.personByName = new Map();
    for (let person of params.people) {
      this.personByName.set(person.name, person);
    }

    this.taxManager = new TaxManager(
      params.taxManager,
      params.startYear,
      params.inflationRate
    );

    this.jobs = [];
    for (let jobParams of params.jobs) {
      this.jobs.push(
        new Job(
          jobParams,
          params.startYear,
          this.taxManager.getMax401kContribution()
        )
      );
    }

    this.expenses = [];
    for (let expenseParams of params.expenses) {
      this.expenses.push(new Expense(expenseParams));
    }

    this.savingsAccount = new SavingsAccount(
      params.savingsAccount,
      params.startYear
    );

    this.retirement401kAccountByEmployeeName = new Map();
    for (let retirement401kParams of params.retirement401kAccounts) {
      const employee = this.personByName.get(retirement401kParams.employeeName);
      this.retirement401kAccountByEmployeeName.set(
        retirement401kParams.employeeName,
        new RetirementAccount401k(
          retirement401kParams,
          params.startYear,
          employee.birthday,
          this.taxManager.getPenaltyFree401kWithdrawalAge()
        )
      );
    }

    this.isBankrupt = false;
  }

  depositCash(amount: number) {
    this.savingsAccount.contribute(amount);
  }

  withdrawCash(amount: number): number {
    const accounts401kByWithdrawalDate = Array.from(
      this.retirement401kAccountByEmployeeName.values()
    );
    accounts401kByWithdrawalDate.sort((a, b) => {
      return (
        a.penaltyFreeWithdrawalDate.getTime() -
        b.penaltyFreeWithdrawalDate.getTime()
      );
    });
    const accountsByWithdrawOrder = Array.prototype.concat(
      [this.savingsAccount],
      accounts401kByWithdrawalDate
    );

    let remaining = amount;
    for (let account of accountsByWithdrawOrder) {
      remaining -= account.withdraw(remaining, this.currentDate.getMonth() + 1);
    }

    return remaining;
  }

  computeTaxes() {
    const docW2s = this.jobs.map((job) => job.getPreviousYearW2());
    const doc1099Ints = [this.savingsAccount.getPreviousYear1099Int()];

    let doc1099Rs: TaxDocument1099R[] = [];
    for (let account of this.retirement401kAccountByEmployeeName.values()) {
      doc1099Rs = doc1099Rs.concat(account.getPreviousYear1099Rs());
    }

    return this.taxManager.computePreviousYearFederalTax(
      docW2s,
      doc1099Ints,
      doc1099Rs
    );
  }

  executeMonth() {
    // Credit
    this.savingsAccount.receiveMonthlyInterest();
    this.retirement401kAccountByEmployeeName.forEach((account) => {
      account.receiveMonthlyReturn();
    });
    const paystubs = this.jobs
      .filter((job) => job.isActive(this.currentDate))
      .map((job) => {
        return job.sendMonthlyPaystub(this.currentDate.getMonth() + 1);
      });

    // Debit
    let monthlyExpense = this.expenses
      .filter((expense) => expense.isActive(this.currentDate))
      .reduce((partialSum, expense) => {
        return partialSum + expense.monthlyExpense;
      }, 0);

    if (this.currentDate.getMonth() == 3) {
      monthlyExpense += this.computeTaxes();
    }

    // Cashflow
    let monthlyIncome = paystubs.reduce(
      (partialSum, paystub) => partialSum + paystub.income,
      0
    );
    paystubs.forEach((paystub) =>
      this.retirement401kAccountByEmployeeName
        .get(paystub.employeeName)
        .contribute(paystub.contribution401k)
    );

    let balance = monthlyIncome - monthlyExpense;

    if (balance >= 0) {
      this.depositCash(balance);
    } else {
      balance = -this.withdrawCash(-balance);
    }

    this.isBankrupt = balance < 0;

    // End of year adjustments.
    if (this.currentDate.getMonth() == 11) {
      this.taxManager.incrementYear(this.inflationRate);
      this.jobs.forEach((job) =>
        job.incrementYear(
          this.inflationRate,
          this.taxManager.getMax401kContribution()
        )
      );
      this.expenses.forEach((expense) =>
        expense.incrementYear(this.inflationRate)
      );
      this.savingsAccount.incrementYear();
      this.retirement401kAccountByEmployeeName.forEach((account) =>
        account.incrementYear()
      );
    }

    // Increment to next month.
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
  }
}
