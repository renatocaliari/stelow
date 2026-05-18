## Phase 5: Plan Critique

> **Part of cali-product-workflow** — See [`SKILL.md`](../SKILL.md) for phase sequence, safety rules, and capability reference.

### 5a. Read reference files

Read the `references/plan-critique/` files to guide the process:

| File | Covers | When to read |
|---|---|---|
| `references/plan-critique/PLAN-CRITIQUE-CONTEXT.md` | Role definition, when to use, workflow position | **Before starting** — sets reviewer role |
| `references/plan-critique/CHECKLISTS.md` | Flow, state, affordance, data, system, feasibility checks | **During analysis** — primary checklist |
| `references/plan-critique/critique-frameworks.md` | Nielsen heuristics, emotional journey, cognitive load, personas, AI slop | **During analysis** — UX evaluation frameworks |
| `references/plan-critique/audit-dimensions.md` | 5 audit dimensions (a11y, perf, theming, responsive, anti-patterns) | **During analysis** — technical audit framework |
| `references/plan-critique/auto-resolve-rules.md` | Rules for automatic gap resolution | **After analysis** — for auto-resolve mode |
| `references/plan-critique/output-format.md` | Critique report format | **After analysis** — format output |

### 5b. Analysis via subagent

Launch subagent with checklists from `references/plan-critique/`:

```typescript
subagent({
  agent: "reviewer",
  task: `Review the spec-product.md using checklists from references/plan-critique/.
Use: PLAN-CRITIQUE-CONTEXT.md (role), CHECKLISTS.md (primary), critique-frameworks.md (UX), audit-dimensions.md (technical).
Output: Executive Summary + Critical Questions (🚨) + Important (🤔) + Minor (🔎) + Strengths.
Do NOT resolve gaps — only identify and classify.
Format per output-format.md.
Save to .cali-product-workflow/{YYYY-MM-DD}/{_dir}/plans/critique-report.md`,
  output: ".cali-product-workflow/{YYYY-MM-DD}/{_dir}/plans/critique-report.md"
})
```

### 5c. Gap Resolution

Ask mode: **Auto-resolve** (applies rules from `references/plan-critique/auto-resolve-rules.md`) or **Manual** (ask one by one).

- 🔎 is always automatic
- Auto-resolve: save `spec-product_{v}-pre-critique.md`, create `spec-product_{v+1}.md` with
  "Resolved Gaps" section, and show change summary before proceeding
- Manual: ask each 🚨 and 🤔 individually
- After resolving, create `spec-product_{v+1}.md` with documented resolutions
