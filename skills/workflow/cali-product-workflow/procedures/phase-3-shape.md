## Phase 3: Shape Up Planning

> **Part of cali-product-workflow** — See [`SKILL.md`](../SKILL.md) for phase sequence, safety rules, and capability reference.

### 1a. Parallel Recon (optional — recommended for complex features)

Before shaping, launch `subagent` to map context:

```typescript
subagent({
  tasks: [
    {
      agent: "scout",
      task: `Map the current code state related to: [description].
Identify relevant files, existing flows, and impact points.`,
      output: ".cali-product-workflow/{YYYY-MM-DD}/{_dir}/context/current-state.md",
      context: "fresh"
    },
    {
      agent: "scout",
      task: `Map technical risks, external dependencies, and
constraints for: [description].`,
      output: ".cali-product-workflow/{YYYY-MM-DD}/{_dir}/context/risks.md",
      context: "fresh"
    }
  ],
  concurrency: 2
})
```

Read the outputs before proceeding.

### 1b. Shaping

Read the `references/shape-up/` files to guide the process:

| File | Covers |
|---|---|
| `references/shape-up/SHAPING-COMPLETE.md` | Context, clarification, responsibilities |
| `references/shape-up/SHAPING-PRINCIPLES.md` | Core shaping principles |
| `references/shape-up/RISK-ANALYSIS.md` | Risk analysis and strategic alternatives |
| `references/shape-up/EXECUTION-GUIDE.md` | Sequencing, persistence, cross-domain adaptation |
| `references/shape-up/proposal-structure.md` | Output structure for the shaped proposal |
| `references/output-expectations.md` | Strong vs weak output criteria |

Use `ask_user_question` for strategic questions when needed.

After shaping:
- Save to `.cali-product-workflow/{YYYY-MM-DD}/{_dir}/plans/spec-product_{v}.md`
- Do not ask about Interface Brainstorming — already decided in Phase 1 (Setup)

### 1c. Scope Adjustment (after Shape Up)

Show the IN/OUT scope table. Ask:

1. **Remove IN scopes?** — `ask_user_question` multiSelect with current scopes
2. **Include OUT scopes?** — `ask_user_question` multiSelect with out-of-scope items

If user selects nothing → proceed with original Shape Up.
If there are removals/inclusions → create `spec-product_{v+1}.md` with adjusted scopes and document what changed.
