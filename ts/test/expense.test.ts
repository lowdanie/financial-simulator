import { Expense, ExpenseParameters } from "../src/expense";

const params: ExpenseParameters = {
  name: "expense",
  start: new Date(2024, 0, 10),
  end: new Date(2025, 1, 10),
  initialMonthlyExpense: 1000,
  realIncreaseRate: 1,
};

const inflationRate = 3;

describe("test RetirementAccount401k", () => {
  test("isActive", () => {
    let expense = new Expense(params);
    expect(expense.isActive(new Date(2023, 11, 20))).toBe(false);
    expect(expense.isActive(new Date(2024, 11, 20))).toBe(true);
    expect(expense.isActive(new Date(2025, 1, 11))).toBe(false);
  });
  test("incrementYear", () => {
    let expense = new Expense(params);
    expense.incrementYear(inflationRate);

    expect(expense.monthlyExpense).toBeCloseTo(1000 * 1.03 * 1.01);
  });
});
