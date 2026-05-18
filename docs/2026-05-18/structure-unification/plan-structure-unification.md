# Plan: Unify Skill Structure Between pi-product-workflow and ~/.agents/skills

## Status
**DRAFT** - Pending Plannotator review

## Problem Statement

The two locations have mismatched structures:

| Location | Orchestrator Path | Sub-skills Path |
|---|---|---|
| `~/Development/pi-product-workflow/skills/` | `workflow/cali-product-workflow/SKILL.md` | `workflow/` (flat) |
| `~/.agents/skills/cali-product-workflow/` | `SKILL.md` (root) | `skills-workflow/` (inside orchestrator) |

**Issue:** In pi-product-workflow, workflow sub-skills (cali-shape-up, cali-interface-brainstorm, etc.) are at the same level as the orchestrator, not **nested inside it**.

---

## Current Structure Analysis

### pi-product-workflow (npm package) - WRONG
```
skills/
├── workflow/
│   ├── cali-shape-up/          ← should be inside cali-product-workflow
│   ├── cali-interface-brainstorm/  ← should be inside cali-product-workflow
│   ├── cali-plan-critique/     ← should be inside cali-product-workflow
│   ├── cali-tech-planning/     ← should be inside cali-product-workflow
│   └── cali-product-workflow/  ← orchestrator
│       ├── SKILL.md
│       ├── phases/
│       └── references/
├── skills-strategic-analysis/
├── skills-domain-libraries/
└── skills-execution/
```

### ~/.agents/skills/cali-product-workflow - CORRECT
```
cali-product-workflow/
├── SKILL.md                   ← orchestrator at root
├── skills-workflow/           ← sub-skills properly nested
│   ├── cali-shape-up/
│   ├── cali-interface-brainstorm/
│   ├── cali-plan-critique/
│   └── cali-tech-planning/
├── phases/
├── references/
├── skills-strategic-analysis/
├── skills-domain-libraries/
└── skills-execution/
```

---

## Recommended Fix

### Option A: Match ~/.agents/skills structure (RECOMMENDED)

**Rationale:**
1. ~/.agents/skills is the "production" instance — it works
2. pi-product-workflow is the "development" package — should mirror production
3. Nesting sub-skills inside the orchestrator is more logically consistent
4. Easier to maintain consistency across updates

**Target structure for pi-product-workflow:**
```
skills/
├── cali-product-workflow/    ← orchestrator at same level as others
│   ├── SKILL.md
│   ├── skills-workflow/       ← nested sub-skills
│   │   ├── cali-shape-up/
│   │   ├── cali-interface-brainstorm/
│   │   ├── cali-plan-critique/
│   │   └── cali-tech-planning/
│   ├── phases/
│   ├── references/
│   └── references-archive/   ← existing references if any
├── skills-strategic-analysis/
├── skills-domain-libraries/
└── skills-execution/
```

**Changes needed:**
1. Move `workflow/cali-product-workflow/` → `cali-product-workflow/`
2. Move `workflow/cali-shape-up/`, `cali-interface-brainstorm/`, etc. → `cali-product-workflow/skills-workflow/`
3. Move `workflow/cali-product-workflow/phases/` → `cali-product-workflow/phases/`
4. Move `workflow/cali-product-workflow/references/` → `cali-product-workflow/references/`
5. Remove empty `workflow/` directory
6. Update all internal path references in SKILL.md files
7. Update `package.json` paths
8. Update `README.md` paths

### Option B: Keep current structure with path updates

Keep sub-skills at `workflow/` level but update all references.

**Rationale:** Less directory restructuring, just path updates.

**Why NOT recommended:** Doesn't solve the logical grouping problem.

---

## Files to Modify

### 1. Directory moves (8 items)
```
workflow/cali-product-workflow/ → cali-product-workflow/
workflow/cali-shape-up/ → cali-product-workflow/skills-workflow/cali-shape-up/
workflow/cali-interface-brainstorm/ → cali-product-workflow/skills-workflow/cali-interface-brainstorm/
workflow/cali-plan-critique/ → cali-product-workflow/skills-workflow/cali-plan-critique/
workflow/cali-tech-planning/ → cali-product-workflow/skills-workflow/cali-tech-planning/
```

### 2. SKILL.md updates
- `cali-product-workflow/SKILL.md` — update all path references
- `cali-product-workflow/skills-workflow/*/SKILL.md` — update internal references

### 3. Package.json updates
```json
{
  "skills": {
    "cali-product-workflow": "skills/cali-product-workflow",
    "cali-shape-up": "skills/cali-product-workflow/skills-workflow/cali-shape-up",
    "cali-interface-brainstorm": "skills/cali-product-workflow/skills-workflow/cali-interface-brainstorm",
    "cali-plan-critique": "skills/cali-product-workflow/skills-workflow/cali-plan-critique",
    "cali-tech-planning": "skills/cali-product-workflow/skills-workflow/cali-tech-planning"
  }
}
```

### 4. README.md updates
- Update skill paths

### 5. Cleanup
- Remove empty `workflow/` directory

---

## Verification Checklist

After refactoring:
- [ ] `skills/` has exactly 4 directories at top level
- [ ] `cali-product-workflow/SKILL.md` exists
- [ ] `cali-product-workflow/skills-workflow/` contains 4 sub-skills
- [ ] All SKILL.md files have updated path references
- [ ] `package.json` paths match new structure
- [ ] `README.md` paths match new structure
- [ ] No broken references (run link checker)
- [ ] Commit and push

---

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Path references break | Update all references before moving files |
| Git history split | Use `git mv` to preserve history |
| References still broken | Verify after each move |

---

## Estimated Effort
- Directory moves: 10 min
- Path updates: 15 min
- Verification: 10 min
- **Total: ~35 min**