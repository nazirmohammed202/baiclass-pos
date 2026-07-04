import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  dateToIso,
  isoToDate,
  formatDateToDisplay,
  formatTimestampToDisplay,
  formatDateToDisplayWithDay,
  formatDateShort,
  getTodayDate,
  getLastNDays,
  getStartOfMonthIso,
  getEndOfMonthIso,
  getStartOfWeekIso,
  getEndOfWeekIso,
  getYesterdayIso,
} from "./date-utils";

describe("isoToDate / dateToIso round trip", () => {
  it("round trips an ISO date", () => {
    expect(dateToIso(isoToDate("2026-07-03"))).toBe("2026-07-03");
  });

  it("returns null / empty for empty input", () => {
    expect(isoToDate("")).toBeNull();
    expect(dateToIso(null)).toBe("");
  });

  it("pads single-digit months and days", () => {
    expect(dateToIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("formatDateToDisplay", () => {
  it("formats ISO as DD/MM/YYYY", () => {
    expect(formatDateToDisplay("2026-07-03")).toBe("03/07/2026");
  });

  it("returns empty string for empty input", () => {
    expect(formatDateToDisplay("")).toBe("");
  });
});

describe("formatTimestampToDisplay", () => {
  it("handles plain ISO dates", () => {
    expect(formatTimestampToDisplay("2026-07-03")).toBe("03/07/2026");
  });

  it("handles full ISO timestamps", () => {
    expect(formatTimestampToDisplay("2026-07-03T14:30:00")).toBe("03/07/2026");
  });

  it("returns the input unchanged when unparseable", () => {
    expect(formatTimestampToDisplay("not-a-date")).toBe("not-a-date");
  });
});

describe("formatDateToDisplayWithDay", () => {
  it("prefixes the short day name", () => {
    // 2026-07-03 is a Friday
    expect(formatDateToDisplayWithDay("2026-07-03")).toBe("Fri, 03/07/2026");
  });
});

describe("formatDateShort", () => {
  it("formats for chart axes", () => {
    expect(formatDateShort("2026-02-01")).toBe("1 Feb");
    expect(formatDateShort("2026-12-25")).toBe("25 Dec");
  });
});

describe("getYesterdayIso", () => {
  it("goes back one day", () => {
    expect(getYesterdayIso("2026-07-03")).toBe("2026-07-02");
  });

  it("crosses month boundaries", () => {
    expect(getYesterdayIso("2026-07-01")).toBe("2026-06-30");
  });

  it("crosses year boundaries", () => {
    expect(getYesterdayIso("2026-01-01")).toBe("2025-12-31");
  });
});

describe("today-relative helpers (frozen clock)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Friday, 3 July 2026
    vi.setSystemTime(new Date(2026, 6, 3, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("getTodayDate returns the frozen date", () => {
    expect(getTodayDate()).toBe("2026-07-03");
  });

  it("getLastNDays includes today in the count", () => {
    expect(getLastNDays(7)).toEqual({
      startDate: "2026-06-27",
      endDate: "2026-07-03",
    });
    expect(getLastNDays(1)).toEqual({
      startDate: "2026-07-03",
      endDate: "2026-07-03",
    });
  });

  it("month boundaries", () => {
    expect(getStartOfMonthIso()).toBe("2026-07-01");
    expect(getEndOfMonthIso()).toBe("2026-07-31");
  });

  it("week runs Monday to Sunday", () => {
    expect(getStartOfWeekIso()).toBe("2026-06-29");
    expect(getEndOfWeekIso()).toBe("2026-07-05");
  });

  it("week boundaries when today is Sunday", () => {
    vi.setSystemTime(new Date(2026, 6, 5, 12, 0, 0)); // Sunday 5 July
    expect(getStartOfWeekIso()).toBe("2026-06-29");
    expect(getEndOfWeekIso()).toBe("2026-07-05");
  });
});
