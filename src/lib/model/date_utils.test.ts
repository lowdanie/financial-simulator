import { numOverlapMonths } from "./date_utils";

describe("test numOverlapMonths", () => {
  test("interval before year", () => {
    expect(
      numOverlapMonths(
        { start: new Date(2022, 0), end: new Date(2023, 2) },
        2024
      )
    ).toBe(0);
  });
  test("interval after year", () => {
    expect(
      numOverlapMonths(
        { start: new Date(2022, 4), end: new Date(2023, 2) },
        2020
      )
    ).toBe(0);
  });
  test("interval ends in year", () => {
    expect(
      numOverlapMonths(
        { start: new Date(2022, 0), end: new Date(2023, 8) },
        2023
      )
    ).toBe(9);
  });
  test("interval starts in year", () => {
    expect(
      numOverlapMonths(
        { start: new Date(2022, 0), end: new Date(2023, 8) },
        2022
      )
    ).toBe(12);
  });
  test("interval contained in year", () => {
    expect(
      numOverlapMonths(
        { start: new Date(2022, 0), end: new Date(2022, 8) },
        2022
      )
    ).toBe(9);
  });
});
