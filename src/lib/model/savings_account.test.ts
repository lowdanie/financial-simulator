import {
  SavingsAccountParameters,
  SavingsAccount,
} from "../src/savings_account";

const monthlyInterestRate = 2;
const apy = 100 * (Math.pow(1 + monthlyInterestRate / 100, 12) - 1);
const currentYear = 2024;

const params: SavingsAccountParameters = {
  name: "savings account",
  initialValue: 100000,
  annualPercentageYield: apy,
};

describe("test SavingsAccount", () => {
  test("constructor", () => {
    let account = new SavingsAccount(params, currentYear);
    expect(account.monthlyInterestRate).toBeCloseTo(monthlyInterestRate);
  });
  test("contribute", () => {
    let account = new SavingsAccount(params, currentYear);
    account.contribute(100);
    expect(account.value).toBe(100100);
  });
  test("withdraw", () => {
    let account = new SavingsAccount(params, currentYear);
    const amount = account.withdraw(10000, 1);
    expect(account.value).toBe(90000);
    expect(amount).toBe(10000);
  });
  test("withdraw max", () => {
    let account = new SavingsAccount(params, currentYear);
    const amount = account.withdraw(100001, 1);
    expect(account.value).toBe(0);
    expect(amount).toBe(100000);
  });
  test("receiveMonthlyInterest", () => {
    let account = new SavingsAccount(params, currentYear);
    account.receiveMonthlyInterest();
    expect(account.value).toBeCloseTo(102000);
  });
  test("get1099Int no interest", () => {
    let account = new SavingsAccount(params, currentYear);
    const doc1099Int = account.getPreviousYear1099Int();
    expect(doc1099Int.interest).toBe(0);
  });
  test("get1099Int", () => {
    let account = new SavingsAccount(params, currentYear);
    account.receiveMonthlyInterest();
    account.incrementYear();
    const doc1099Int = account.getPreviousYear1099Int();

    expect(doc1099Int.year).toBe(currentYear);
    expect(doc1099Int.interest).toBeCloseTo(2000);
  });
});
