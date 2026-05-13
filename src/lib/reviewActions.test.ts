import { describe, it, expect, vi, beforeEach } from "vitest";

// Per-test call log + per-table mock responses. The mock chain records every
// chained method call so the test can assert on the final shape of the
// supabase query (e.g. that approveWeek scoped the UPDATE by
// .in("week_id", [week3Id, week4Id])).
type Call = { from: string; method: string; args: any[] };
let callLog: Call[] = [];
let tableResponses: Record<string, { data: any; error: any }> = {};

function makeChain(table: string): any {
  const proxy: any = new Proxy(
    {},
    {
      get(_target, prop: string | symbol) {
        if (typeof prop !== "string") return undefined;

        // Make the chain awaitable: `await supabase.from(t).update(...).eq(...)`
        // resolves to the table's mock response.
        if (prop === "then") {
          return (resolve: (v: any) => any) => {
            const response = tableResponses[table] ?? { data: null, error: null };
            resolve(response);
          };
        }

        // Terminal selectors that return a promise directly.
        if (prop === "single" || prop === "maybeSingle") {
          return () => {
            callLog.push({ from: table, method: prop, args: [] });
            return Promise.resolve(
              tableResponses[table] ?? { data: null, error: null }
            );
          };
        }

        // Any other method records and returns the chain.
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
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: { id: "user-1" } }, error: null })
      ),
    },
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

import { approveWeek, shouldCascadeApproval } from "./reviewActions";

beforeEach(() => {
  callLog = [];
  tableResponses = {};
});

describe("shouldCascadeApproval", () => {
  it("cascades for even biweekly weeks in standard variant", () => {
    expect(shouldCascadeApproval(2, "standard")).toBe(true);
    expect(shouldCascadeApproval(4, "standard")).toBe(true);
    expect(shouldCascadeApproval(10, "standard")).toBe(true); // standard pairs 9+10 = Module 5
    expect(shouldCascadeApproval(24, "standard")).toBe(true);
  });

  it("cascades for even biweekly weeks in frenectomy variant", () => {
    expect(shouldCascadeApproval(2, "frenectomy")).toBe(true);
    expect(shouldCascadeApproval(4, "frenectomy")).toBe(true);
    expect(shouldCascadeApproval(12, "frenectomy")).toBe(true);
    expect(shouldCascadeApproval(24, "frenectomy")).toBe(true);
  });

  it("does NOT cascade for odd weeks", () => {
    expect(shouldCascadeApproval(1, "standard")).toBe(false);
    expect(shouldCascadeApproval(3, "frenectomy")).toBe(false);
    expect(shouldCascadeApproval(23, "frenectomy_video")).toBe(false);
  });

  it("does NOT cascade for week 25 in any variant", () => {
    expect(shouldCascadeApproval(25, "standard")).toBe(false);
    expect(shouldCascadeApproval(25, "frenectomy")).toBe(false);
  });

  it("does NOT cascade for frenectomy post-op weeks 9 or 10", () => {
    expect(shouldCascadeApproval(10, "frenectomy")).toBe(false);
    expect(shouldCascadeApproval(10, "frenectomy_video")).toBe(false);
  });
});

describe("approveWeek cascade", () => {
  it("issues a single update covering both weeks 3 and 4 when approving week 4", async () => {
    tableResponses["patient_week_progress"] = {
      data: { week_id: "week-4-id", week: { number: 4, program_id: "prog-1" } },
      error: null,
    };
    tableResponses["patients"] = {
      data: { program_variant: "standard" },
      error: null,
    };
    tableResponses["weeks"] = {
      data: [
        { id: "week-3-id", number: 3 },
        { id: "week-4-id", number: 4 },
      ],
      error: null,
    };

    const result = await approveWeek("progress-4-id", "patient-1", 4, "");

    expect(result.success).toBe(true);

    // Find the cascade .in("week_id", [...]) call on patient_week_progress.
    const cascadeInCall = callLog.find(
      (c) =>
        c.from === "patient_week_progress" &&
        c.method === "in" &&
        c.args[0] === "week_id" &&
        Array.isArray(c.args[1])
    );
    expect(cascadeInCall).toBeDefined();
    expect(cascadeInCall!.args[1]).toEqual(
      expect.arrayContaining(["week-3-id", "week-4-id"])
    );
    expect(cascadeInCall!.args[1]).toHaveLength(2);

    // And the matching .update() should set status = "approved".
    const updateCall = callLog.find(
      (c) =>
        c.from === "patient_week_progress" &&
        c.method === "update" &&
        c.args[0]?.status === "approved"
    );
    expect(updateCall).toBeDefined();

    // It must be scoped to this patient — the .eq("patient_id", ...) call
    // sits in the same chain before the .in("week_id", ...).
    const patientScopeCall = callLog.find(
      (c) =>
        c.from === "patient_week_progress" &&
        c.method === "eq" &&
        c.args[0] === "patient_id" &&
        c.args[1] === "patient-1"
    );
    expect(patientScopeCall).toBeDefined();
  });

  it("uses single-row update (no cascade) for week 25 post-program review", async () => {
    tableResponses["patient_week_progress"] = {
      data: { week_id: "week-25-id", week: { number: 25, program_id: "prog-1" } },
      error: null,
    };
    tableResponses["patients"] = {
      data: { program_variant: "frenectomy" },
      error: null,
    };

    await approveWeek("progress-25-id", "patient-1", 25, "");

    // No .in("week_id", ...) cascade call should be made.
    const cascadeInCall = callLog.find(
      (c) =>
        c.from === "patient_week_progress" &&
        c.method === "in" &&
        c.args[0] === "week_id"
    );
    expect(cascadeInCall).toBeUndefined();

    // Instead, the single-row .eq("id", progressId) update path was taken.
    const idScopeCall = callLog.find(
      (c) =>
        c.from === "patient_week_progress" &&
        c.method === "eq" &&
        c.args[0] === "id" &&
        c.args[1] === "progress-25-id"
    );
    expect(idScopeCall).toBeDefined();
  });

  it("uses single-row update for frenectomy week 10 (post-op single-week module)", async () => {
    tableResponses["patient_week_progress"] = {
      data: { week_id: "week-10-id", week: { number: 10, program_id: "prog-1" } },
      error: null,
    };
    tableResponses["patients"] = {
      data: { program_variant: "frenectomy" },
      error: null,
    };

    await approveWeek("progress-10-id", "patient-1", 10, "");

    const cascadeInCall = callLog.find(
      (c) =>
        c.from === "patient_week_progress" &&
        c.method === "in" &&
        c.args[0] === "week_id"
    );
    expect(cascadeInCall).toBeUndefined();
  });

  it("cascades for standard variant week 10 (paired with week 9 as Module 5)", async () => {
    tableResponses["patient_week_progress"] = {
      data: { week_id: "week-10-id", week: { number: 10, program_id: "prog-1" } },
      error: null,
    };
    tableResponses["patients"] = {
      data: { program_variant: "standard" },
      error: null,
    };
    tableResponses["weeks"] = {
      data: [
        { id: "week-9-id", number: 9 },
        { id: "week-10-id", number: 10 },
      ],
      error: null,
    };

    await approveWeek("progress-10-id", "patient-1", 10, "");

    const cascadeInCall = callLog.find(
      (c) =>
        c.from === "patient_week_progress" &&
        c.method === "in" &&
        c.args[0] === "week_id" &&
        Array.isArray(c.args[1])
    );
    expect(cascadeInCall).toBeDefined();
    expect(cascadeInCall!.args[1]).toEqual(
      expect.arrayContaining(["week-9-id", "week-10-id"])
    );
  });
});
