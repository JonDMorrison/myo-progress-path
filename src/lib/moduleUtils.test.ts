import { describe, it, expect, vi, beforeEach } from "vitest";

// Reuse the same chainable supabase mock shape as reviewActions.test.ts so the
// helper's `.from(...).select(...).in(...).eq(...)` call chain can be asserted.
type Call = { from: string; method: string; args: any[] };
let callLog: Call[] = [];
let tableResponses: Record<string, { data: any; error: any }> = {};

function makeChain(table: string): any {
  const proxy: any = new Proxy(
    {},
    {
      get(_target, prop: string | symbol) {
        if (typeof prop !== "string") return undefined;
        if (prop === "then") {
          return (resolve: (v: any) => any) => {
            resolve(tableResponses[table] ?? { data: null, error: null });
          };
        }
        if (prop === "single" || prop === "maybeSingle") {
          return () => {
            callLog.push({ from: table, method: prop, args: [] });
            return Promise.resolve(tableResponses[table] ?? { data: null, error: null });
          };
        }
        return (...args: any[]) => {
          callLog.push({ from: table, method: prop, args });
          return proxy;
        };
      },
    }
  );
  return proxy;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      callLog.push({ from: table, method: "__from__", args: [table] });
      return makeChain(table);
    }),
  },
}));

import {
  getModuleAnchorWeek,
  isModuleAnchorWeek,
  isCollapsedEvenWeek,
  getPartnerWeekNumber,
  getModulePartnerWeekIds,
} from "./moduleUtils";

beforeEach(() => {
  callLog = [];
  tableResponses = {};
});

describe("getModuleAnchorWeek", () => {
  it("returns the odd week itself for biweekly anchors", () => {
    expect(getModuleAnchorWeek(1, "standard")).toBe(1);
    expect(getModuleAnchorWeek(3, "frenectomy")).toBe(3);
    expect(getModuleAnchorWeek(23, "non_frenectomy")).toBe(23);
  });

  it("returns the partner odd week for biweekly even weeks", () => {
    expect(getModuleAnchorWeek(2, "standard")).toBe(1);
    expect(getModuleAnchorWeek(4, "frenectomy")).toBe(3);
    expect(getModuleAnchorWeek(24, "non_frenectomy_video")).toBe(23);
  });

  it("returns the week itself for single-week modules", () => {
    expect(getModuleAnchorWeek(25, "standard")).toBe(25);
    expect(getModuleAnchorWeek(25, "frenectomy")).toBe(25);
    expect(getModuleAnchorWeek(9, "frenectomy")).toBe(9);
    expect(getModuleAnchorWeek(10, "frenectomy_video")).toBe(10);
  });

  it("treats standard variant weeks 9 and 10 as biweekly (paired Module 5)", () => {
    expect(getModuleAnchorWeek(9, "standard")).toBe(9);
    expect(getModuleAnchorWeek(10, "standard")).toBe(9);
  });
});

describe("isModuleAnchorWeek", () => {
  it("true for odd weeks in biweekly modules", () => {
    expect(isModuleAnchorWeek(1, "standard")).toBe(true);
    expect(isModuleAnchorWeek(23, "frenectomy")).toBe(true);
  });

  it("false for even weeks in biweekly modules", () => {
    expect(isModuleAnchorWeek(2, "standard")).toBe(false);
    expect(isModuleAnchorWeek(24, "frenectomy")).toBe(false);
  });

  it("true for single-week modules", () => {
    expect(isModuleAnchorWeek(25, "standard")).toBe(true);
    expect(isModuleAnchorWeek(9, "frenectomy")).toBe(true);
    expect(isModuleAnchorWeek(10, "frenectomy")).toBe(true);
  });
});

describe("isCollapsedEvenWeek", () => {
  it("true for biweekly even weeks (the ones patients should be redirected from)", () => {
    expect(isCollapsedEvenWeek(2, "standard")).toBe(true);
    expect(isCollapsedEvenWeek(4, "frenectomy")).toBe(true);
    expect(isCollapsedEvenWeek(24, "non_frenectomy")).toBe(true);
    expect(isCollapsedEvenWeek(10, "standard")).toBe(true); // standard wk10 is paired
  });

  it("false for odd weeks", () => {
    expect(isCollapsedEvenWeek(1, "standard")).toBe(false);
    expect(isCollapsedEvenWeek(23, "frenectomy")).toBe(false);
  });

  it("false for week 25 and frenectomy weeks 9/10", () => {
    expect(isCollapsedEvenWeek(25, "standard")).toBe(false);
    expect(isCollapsedEvenWeek(25, "frenectomy")).toBe(false);
    expect(isCollapsedEvenWeek(10, "frenectomy")).toBe(false);
    expect(isCollapsedEvenWeek(9, "frenectomy_video")).toBe(false);
  });
});

describe("getPartnerWeekNumber", () => {
  it("returns the even partner for odd biweekly weeks", () => {
    expect(getPartnerWeekNumber(1, "standard")).toBe(2);
    expect(getPartnerWeekNumber(3, "frenectomy")).toBe(4);
    expect(getPartnerWeekNumber(23, "frenectomy")).toBe(24);
  });

  it("returns the odd partner for even biweekly weeks", () => {
    expect(getPartnerWeekNumber(2, "standard")).toBe(1);
    expect(getPartnerWeekNumber(4, "frenectomy")).toBe(3);
  });

  it("returns null for single-week modules", () => {
    expect(getPartnerWeekNumber(25, "standard")).toBeNull();
    expect(getPartnerWeekNumber(9, "frenectomy")).toBeNull();
    expect(getPartnerWeekNumber(10, "frenectomy_video")).toBeNull();
  });
});

describe("getModulePartnerWeekIds — Option B upload-scoping gate", () => {
  it("queries weeks table with BOTH partner numbers for biweekly modules", async () => {
    tableResponses["weeks"] = {
      data: [
        { id: "week-3-id", programs: { title: "Frenectomy Program" } },
        { id: "week-4-id", programs: { title: "Frenectomy Program" } },
      ],
      error: null,
    };

    const ids = await getModulePartnerWeekIds(3, "frenectomy", "Frenectomy Program");

    // The .in("number", [...]) call must include BOTH partner week numbers,
    // otherwise uploads from one side of the module are invisible to the
    // collapsed anchor page.
    const inCall = callLog.find(
      (c) => c.from === "weeks" && c.method === "in" && c.args[0] === "number"
    );
    expect(inCall).toBeDefined();
    expect(inCall!.args[1]).toEqual(expect.arrayContaining([3, 4]));
    expect(inCall!.args[1]).toHaveLength(2);

    expect(ids).toEqual(expect.arrayContaining(["week-3-id", "week-4-id"]));
    expect(ids).toHaveLength(2);
  });

  it("works when the patient is on the even week (still resolves both partner ids)", async () => {
    tableResponses["weeks"] = {
      data: [
        { id: "week-3-id", programs: { title: "Frenectomy Program" } },
        { id: "week-4-id", programs: { title: "Frenectomy Program" } },
      ],
      error: null,
    };

    const ids = await getModulePartnerWeekIds(4, "frenectomy", "Frenectomy Program");

    const inCall = callLog.find(
      (c) => c.from === "weeks" && c.method === "in" && c.args[0] === "number"
    );
    expect(inCall!.args[1]).toEqual(expect.arrayContaining([3, 4]));
    expect(ids).toHaveLength(2);
  });

  it("queries only the single week for week 25 (post-program review)", async () => {
    tableResponses["weeks"] = {
      data: [{ id: "week-25-id", programs: { title: "Frenectomy Program" } }],
      error: null,
    };

    const ids = await getModulePartnerWeekIds(25, "frenectomy", "Frenectomy Program");

    const inCall = callLog.find(
      (c) => c.from === "weeks" && c.method === "in" && c.args[0] === "number"
    );
    expect(inCall!.args[1]).toEqual([25]);
    expect(ids).toEqual(["week-25-id"]);
  });

  it("queries only the single week for frenectomy week 10 (post-op single-week module)", async () => {
    tableResponses["weeks"] = {
      data: [{ id: "week-10-id", programs: { title: "Frenectomy Program" } }],
      error: null,
    };

    const ids = await getModulePartnerWeekIds(10, "frenectomy", "Frenectomy Program");

    const inCall = callLog.find(
      (c) => c.from === "weeks" && c.method === "in" && c.args[0] === "number"
    );
    expect(inCall!.args[1]).toEqual([10]);
    expect(ids).toHaveLength(1);
  });

  it("queries both partner numbers for standard variant week 9 (paired Module 5)", async () => {
    tableResponses["weeks"] = {
      data: [
        { id: "week-9-id", programs: { title: "Non-Frenectomy Program" } },
        { id: "week-10-id", programs: { title: "Non-Frenectomy Program" } },
      ],
      error: null,
    };

    const ids = await getModulePartnerWeekIds(9, "standard", "Non-Frenectomy Program");

    const inCall = callLog.find(
      (c) => c.from === "weeks" && c.method === "in" && c.args[0] === "number"
    );
    expect(inCall!.args[1]).toEqual(expect.arrayContaining([9, 10]));
    expect(ids).toHaveLength(2);
  });

  it("returns empty array on supabase error so callers can fall back defensively", async () => {
    tableResponses["weeks"] = {
      data: null,
      error: new Error("boom"),
    };

    const ids = await getModulePartnerWeekIds(3, "frenectomy", "Frenectomy Program");
    expect(ids).toEqual([]);
  });
});
