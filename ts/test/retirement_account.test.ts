import {
  RetirementAccount401k,
  RetirementAccount401kParameters,
} from "../src/retirement_account_401k";

import { Age } from "../src/date_utils";
import { TaxDocument1099R } from "../src/tax_document";

const monthlyReturnRate = 2;
const annualReturnRate = 100 * (Math.pow(1 + monthlyReturnRate / 100, 12) - 1);
const birthday = new Date(1990, 2, 20);
const penaltyFreeWithdrawalAge: Age = { years: 59, months: 6 };

const params: RetirementAccount401kParameters = {
  accountName: "test account",
  employeeName: "test employee",
  initialValue: 100000,
  annualReturnRate: annualReturnRate,
};

describe("test RetirementAccount401k", () => {
  test("constructor", () => {
    let account = new RetirementAccount401k(
      params,
      2020,
      birthday,
      penaltyFreeWithdrawalAge,
    );
    const expectedDate = new Date(2049, 8, 20);
    expect(account.monthlyReturnRate).toBeCloseTo(monthlyReturnRate);
    expect(account.penaltyFreeWithdrawalDate.getTime()).toBe(
      expectedDate.getTime()
    );
  });
  test("contribute", () => {
    let account = new RetirementAccount401k(
      params,
      2020,
      birthday,
      penaltyFreeWithdrawalAge,
    );
    account.contribute(100);
    expect(account.value).toBe(100100);
  });
  test("withdraw", () => {
    let account = new RetirementAccount401k(
      params,
      2020,
      birthday,
      penaltyFreeWithdrawalAge,
    );
    expect(account.withdraw(100100, 1)).toBeCloseTo(100000);
    expect(account.value).toBeCloseTo(0);
  });
  test("receiveMonthlyReturn", () => {
    let account = new RetirementAccount401k(
      params,
      2020,
      birthday,
      penaltyFreeWithdrawalAge,
    );
    account.receiveMonthlyReturn();
    expect(account.value).toBeCloseTo(102000);
  });
  test("get1099Rs", () => {
    let account = new RetirementAccount401k(
      params,
      2049,
      birthday,
      penaltyFreeWithdrawalAge,
    );

    // Withdraw early.
    expect(account.withdraw(100, 8)).toBeCloseTo(100);

    // Withdraw late
    expect(account.withdraw(200, 10)).toBeCloseTo(200);
    account.incrementYear();

    const expectedDocs: TaxDocument1099R[] = [
      {
        year: 2049,
        accountName: "test account",
        taxableIncome: 100,
        isEarlyDistribution: true,
      },
      {
        year: 2049,
        accountName: "test account",
        taxableIncome: 200,
        isEarlyDistribution: false,
      },
    ];
    expect(account.getPreviousYear1099Rs()).toStrictEqual(expectedDocs);
  });
});
