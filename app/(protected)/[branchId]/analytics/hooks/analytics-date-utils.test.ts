import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  computeDateRange,
  computePreviousPeriod,
  computeCompareDateRange,
  formatDateRangeLabel,
} from "./analytics-date-utils";

describe("computeDateRange (frozen at Friday 2026-07-03)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 3, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("today", () => {
    expect(computeDateRange("today", "", "")).toEqual({
      startDate: "2026-07-03",
      endDate: "2026-07-03",
      label: "Today",
    });
  });

  it("yesterday", () => {
    expect(computeDateRange("yesterday", "", "")).toEqual({
      startDate: "2026-07-02",
      endDate: "2026-07-02",
      label: "Yesterday",
    });
  });

  it("last7 spans 7 days including today", () => {
    expect(computeDateRange("last7", "", "")).toEqual({
      startDate: "2026-06-27",
      endDate: "2026-07-03",
      label: "Last 7 Days",
    });
  });

  it("last30 spans 30 days including today", () => {
    expect(computeDateRange("last30", "", "")).toEqual({
      startDate: "2026-06-04",
      endDate: "2026-07-03",
      label: "Last 30 Days",
    });
  });

  it("thisMonth covers the whole calendar month", () => {
    expect(computeDateRange("thisMonth", "", "")).toEqual({
      startDate: "2026-07-01",
      endDate: "2026-07-31",
      label: "This Month",
    });
  });

  it("lastMonth covers the full previous month", () => {
    expect(computeDateRange("lastMonth", "", "")).toEqual({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      label: "Last Month",
    });
  });

  it("custom uses the provided dates", () => {
    expect(computeDateRange("custom", "2026-01-01", "2026-01-15")).toEqual({
      startDate: "2026-01-01",
      endDate: "2026-01-15",
      label: "Custom Range",
    });
  });

  it("custom falls back to today when dates are empty", () => {
    expect(computeDateRange("custom", "", "")).toEqual({
      startDate: "2026-07-03",
      endDate: "2026-07-03",
      label: "Custom Range",
    });
  });
});

describe("computePreviousPeriod", () => {
  it("mirrors a single day to the day before", () => {
    expect(computePreviousPeriod("2026-07-03", "2026-07-03")).toEqual({
      compareStartDate: "2026-07-02",
      compareEndDate: "2026-07-02",
    });
  });

  it("mirrors a 7-day range to the adjacent previous 7 days", () => {
    expect(computePreviousPeriod("2026-06-27", "2026-07-03")).toEqual({
      compareStartDate: "2026-06-20",
      compareEndDate: "2026-06-26",
    });
  });

  it("mirrors the range length, not the calendar month", () => {
    // July has 31 days, so the previous period is the 31 days ending June 30
    // (May 31 – June 30), not simply "June".
    expect(computePreviousPeriod("2026-07-01", "2026-07-31")).toEqual({
      compareStartDate: "2026-05-31",
      compareEndDate: "2026-06-30",
    });
  });
});

describe("computeCompareDateRange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 3, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("'previous' derives the adjacent earlier period from the primary range", () => {
    const result = computeCompareDateRange(
      "previous",
      "2026-07-01",
      "2026-07-03",
      "",
      ""
    );
    expect(result).toMatchObject({
      compareStartDate: "2026-06-28",
      compareEndDate: "2026-06-30",
    });
  });

  it("'custom' uses provided compare dates", () => {
    const result = computeCompareDateRange(
      "custom",
      "2026-07-01",
      "2026-07-03",
      "2026-05-01",
      "2026-05-31"
    );
    expect(result).toMatchObject({
      compareStartDate: "2026-05-01",
      compareEndDate: "2026-05-31",
    });
  });

  it("'last7' is anchored to today, not the primary range", () => {
    const result = computeCompareDateRange(
      "last7",
      "2026-01-01",
      "2026-01-31",
      "",
      ""
    );
    expect(result).toMatchObject({
      compareStartDate: "2026-06-27",
      compareEndDate: "2026-07-03",
    });
  });
});

describe("formatDateRangeLabel", () => {
  it("formats both ends as DD/MM/YYYY", () => {
    expect(formatDateRangeLabel("2026-07-01", "2026-07-03")).toBe(
      "01/07/2026 – 03/07/2026"
    );
  });
});
