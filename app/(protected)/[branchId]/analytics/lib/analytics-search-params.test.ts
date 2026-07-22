import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  buildAnalyticsSearchParams,
  parseAnalyticsSearchParams,
  resolveAnalyticsRanges,
} from "./analytics-search-params";

describe("parseAnalyticsSearchParams", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 3, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults missing values to today and previous compare", () => {
    expect(parseAnalyticsSearchParams({})).toEqual({
      period: "today",
      customStart: "2026-07-03",
      customEnd: "2026-07-03",
      compareEnabled: false,
      comparePeriod: "previous",
      compareCustomStart: "2026-07-03",
      compareCustomEnd: "2026-07-03",
    });
  });

  it("reads the first value from repeated query params", () => {
    expect(
      parseAnalyticsSearchParams({
        period: ["last7", "today"],
        compare: ["1", "0"],
      })
    ).toMatchObject({
      period: "last7",
      compareEnabled: true,
    });
  });

  it("ignores invalid period and compare values", () => {
    expect(parseAnalyticsSearchParams({ period: "bad", comparePeriod: "bad" })).toMatchObject({
      period: "today",
      comparePeriod: "previous",
    });
  });
});

describe("buildAnalyticsSearchParams", () => {
  it("omits default today/previous values", () => {
    expect(
      buildAnalyticsSearchParams({
        period: "today",
        customStart: "2026-07-03",
        customEnd: "2026-07-03",
        compareEnabled: false,
        comparePeriod: "previous",
        compareCustomStart: "2026-07-03",
        compareCustomEnd: "2026-07-03",
      }).toString()
    ).toBe("");
  });

  it("serializes custom ranges and compare windows", () => {
    const params = buildAnalyticsSearchParams({
      period: "custom",
      customStart: "2026-07-01",
      customEnd: "2026-07-03",
      compareEnabled: true,
      comparePeriod: "custom",
      compareCustomStart: "2026-06-01",
      compareCustomEnd: "2026-06-03",
    });

    expect(Object.fromEntries(params.entries())).toEqual({
      period: "custom",
      start: "2026-07-01",
      end: "2026-07-03",
      compare: "1",
      comparePeriod: "custom",
      compareStart: "2026-06-01",
      compareEnd: "2026-06-03",
    });
  });
});

describe("resolveAnalyticsRanges", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 3, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves the primary range labels", () => {
    expect(
      resolveAnalyticsRanges({
        period: "today",
        customStart: "2026-07-03",
        customEnd: "2026-07-03",
        compareEnabled: false,
        comparePeriod: "previous",
        compareCustomStart: "2026-07-03",
        compareCustomEnd: "2026-07-03",
      })
    ).toMatchObject({
      startDate: "2026-07-03",
      endDate: "2026-07-03",
      periodLabel: "Today",
      currentDatesLabel: "03/07/2026 – 03/07/2026",
      compareDatesLabel: "",
    });
  });

  it("includes compare ranges when enabled", () => {
    expect(
      resolveAnalyticsRanges({
        period: "last7",
        customStart: "2026-07-03",
        customEnd: "2026-07-03",
        compareEnabled: true,
        comparePeriod: "previous",
        compareCustomStart: "2026-07-03",
        compareCustomEnd: "2026-07-03",
      })
    ).toMatchObject({
      compareStartDate: "2026-06-20",
      compareEndDate: "2026-06-26",
      compareDatesLabel: "20/06/2026 – 26/06/2026",
    });
  });
});
