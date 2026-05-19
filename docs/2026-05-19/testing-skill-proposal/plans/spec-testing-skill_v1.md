# Proposal: cali-testing-ai-code Skill

**Date:** 2026-05-19
**Status:** Draft — Pending Review
**Author:** cali-product-workflow (research-based on empirical papers)

---

## 1. Problem Statement

AI-generated code contains **1.7x more bugs** than human-written code (CodeRabbit, 2025). The current workflow plans and executes software without explicit AI-aware testing strategy. This creates risk of shipping code with:
- Logic errors missed by standard tests (75% increase in AI PRs)
- Security vulnerabilities (45% of AI code per Veracode 2025)
- Over-mocking anti-patterns (agents use mocks 36% vs 26% for humans per MSR 2026)

---

## 2. Proposed Solution

### 2.1 New Skill: `cali-testing-ai-code`

**Location:** `skills-execution/cali-testing-ai-code/`

**Trigger:** Automatic when `product_type: software` in spec-product.md frontmatter

**Phase:** Phase 10 (Tech Planning) — integrated into scope generation

### 2.2 Artifact Generated

| Artifact | Path | Purpose |
|----------|------|---------|
| `testing-strategy.md` | `.cali-product-workflow/{date}/{_dir}/plans/` | Mutation targets, coverage thresholds, CI gates |

### 2.3 New Scope Types

| Type | Description | Executor |
|------|-------------|----------|
| `test-unit` | Unit tests with mutation validation | worker |
| `test-integration` | Integration with real dependencies | worker |
| `test-security` | SAST, vulnerability scanning | worker |
| `test-behavior` | Agent workflow behavioral testing | worker |

---

## 3. Gap Analysis (vs Current Workflow)

| Gap | Current State | Proposed State |
|-----|---------------|----------------|
| **Testing trigger** | None — no conditional activation | Activated by `product_type: software` |
| **Scope types** | feature, optimization, spike | feature, optimization, spike + test-* |
| **Mutation testing** | Not mentioned | Explicit targets (70/50/30%) |
| **Security gates** | Not explicit | Mandatory on every commit for critical paths |
| **Anti-patterns** | Not documented | Over-mocking, 100% coverage target flagged |
| **AI-specific failure modes** | Not addressed | Based on empirical research |
| **Execution gates** | Implicit | Explicit mutation score + security gates |

---

## 4. Files to Modify

| File | Modification | Risk |
|------|-------------|------|
| `SKILL.md` (orchestrator) | Add conditional: `product_type: software → cali-testing-ai-code` | LOW — additive |
| `skills-workflow/cali-tech-planning/SKILL.md` | Add test-* scope types + test scopes in sequencing | LOW — extension |
| `skills-workflow/cali-tech-planning/references/SCOPES-AND-SEQUENCING.md` | Add test scope types documentation | LOW — reference |
| `references/pi-tools/goals.md` | Document test scopes as goal-ready | LOW — reference |
| `phases/execution.md` | Add testing gates, mutation validation | LOW — execution |
| `skills-execution/cali-product-scope-executor/SKILL.md` | Add test scope routing | LOW — routing |

**Files to Create:**

| File | Purpose |
|------|---------|
| `skills-execution/cali-testing-ai-code/SKILL.md` | Main skill |
| `skills-execution/cali-testing-ai-code/references/MUTATION_TARGETS.md` | Reference table |

---

## 5. Integration Diagram

```
CURRENT FLOW:
────────────────────────────────────────────────────────────
Phase 10: Tech Planning
  └── cali-tech-planning → scopes: feature/optimization/spike
      └── (no testing strategy)

PROPOSED FLOW:
────────────────────────────────────────────────────────────
Phase 10: Tech Planning
  └── cali-tech-planning
      └── [product_type: software?]
          ├── YES → cali-testing-ai-code → testing-strategy.md
          │                   └── test-* scopes added to spec-tech
          └── NO → (skip, normal flow)

EXECUTION PHASE:
────────────────────────────────────────────────────────────
test-* scopes routed to worker
CI/CD gates validate:
  - mutation_score >= target
  - security_findings = 0 on critical paths
  - flaky_rate < 5%
```

---

## 6. Testing Strategy Output (testing-strategy.md)

```markdown
---
version: 1
product_type: software
generated_by: cali-testing-ai-code
---

# Testing Strategy for {product_name}

## Mutation Score Targets
| Path Type | Target | Minimum |
|-----------|--------|---------|
| Critical paths | 70% | 60% |
| Standard features | 50% | 40% |
| Experimental | 30% | 20% |

## Coverage Strategy
- Do NOT target high coverage — target behavioral coverage
- Zero coverage for trivial code (getters/setters)
- Coverage is insufficient — mutation testing is mandatory

## Test Scope Types
| Type | When Use | Key Characteristics |
|------|----------|-------------------|
| test-unit | Core business logic | TDD-first, isolated, fast |
| test-integration | DB, APIs, external services | Real dependencies (no over-mocking) |
| test-mutation | Critical path validation | Stryker/PIT/mutmut |
| test-security | Security-sensitive code | SAST on every commit |

## AI-Specific Anti-Patterns
❌ mock count > 3 per test
❌ mocks for simple objects (use real objects)
❌ 100% coverage target
❌ snapshot tests for non-UI components
❌ single-run validation (agents are non-deterministic)

## Tech Stack Detection (Auto-detect)
| Language | Unit | Mutation | Security |
|----------|------|----------|----------|
| Python | pytest | mutmut | Bandit |
| JavaScript/TypeScript | Vitest/Jest | Stryker | ESLint + SAST |
| Go | testing | go-mutate | Gosec |
| Rust | cargo test | muter | cargo-audit |

## CI/CD Gates
```
GATE: mutation_score < target → BLOCK
GATE: security_findings > 0 on critical → BLOCK
GATE: flaky_rate > 5% → WARN
GATE: test execution > 10min → WARN
```

## Mutation Testing Loop
1. Generate tests (AI)
2. Run mutation testing (Stryker/PIT/mutmut)
3. Feed surviving mutants back to AI
4. Repeat until target score reached
```

---

## 7. Research Foundation

### Empirical Evidence (Papers)

| Paper | Key Finding | Implication |
|-------|-------------|-------------|
| AgentAssay (2026) | Non-deterministic agents need stochastic testing | Behavioral fingerprinting, 86% detection vs 0% binary |
| MSR 2026 | Agents over-mock (36% vs 26% human) | Anti-pattern: limit mocks per test |
| Veracode 2025 | 45% AI code contains vulnerabilities | Mandatory security gates |
| CodeRabbit 2025 | 1.7x more issues in AI PRs | Increased review rigor |
| CoderEval (2023) | 43.1% AI code less robust | Mutation testing essential |

### Key Numbers
- **1.7x** more bugs in AI code
- **75%** increase in logic/correctness issues
- **45%** security vulnerability rate
- **41%** bug rate increase with Copilot
- **29%** trust in AI output (declining)

---

## 8. Proposed Workflow Modification

### Phase 10 (Tech Planning) — Enhanced

**Before:** Generate scopes → feature/optimization/spike

**After:** 
1. Generate scopes → feature/optimization/spike
2. If `product_type: software` → Generate testing strategy
3. Add test-* scopes based on risk classification
4. Document CI/CD gates

### Phase 11 (Execution) — Enhanced

**Before:** Route by type → worker/autoresearch

**After:**
1. Route by type → worker/autoresearch
2. For test-* scopes: enforce mutation + security gates
3. Validate mutation score >= target before scope completion
4. Fail fast if security findings on critical paths

---

## 9. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Skill adds complexity to workflow | Optional — only activates for software products |
| Mutation testing is slow | Adaptive budgets (4-7x reduction per AgentAssay) |
| Over-engineering for small projects | Minimum threshold: 2 test scopes max |
| Tool detection fails | Fallback to sensible defaults (pytest/Vitest) |

---

## 10. Questions for Review

1. **Activation:** Is `product_type: software` in frontmatter the right trigger? Or should it be explicit user choice?

2. **Scope types:** Should `test-*` scopes be separate from feature scopes, or embedded within?

3. **Mutation targets:** Are 70/50/30% thresholds appropriate? Adjustable?

4. **Execution gating:** Should gates be hard (block) or soft (warn) by default?

---

## 11. Success Criteria

- [ ] testing-strategy.md generated for every software product
- [ ] test-* scopes included in spec-tech.md when applicable
- [ ] CI/CD gates documented for execution phase
- [ ] Anti-patterns documented in generated strategy
- [ ] Mutation targets calibrated per risk level

---

## Appendix A: Skill File Structure

```
skills-execution/cali-testing-ai-code/
├── SKILL.md
└── references/
    └── MUTATION_TARGETS.md
```

## Appendix B: Modified Files Summary

| File | Change Type | Lines |
|------|-------------|-------|
| SKILL.md (orchestrator) | ADD | ~10 |
| cali-tech-planning/SKILL.md | MODIFY | ~20 |
| SCOPES-AND-SEQUENCING.md | MODIFY | ~15 |
| goals.md | MODIFY | ~10 |
| execution.md | MODIFY | ~15 |
| scope-executor/SKILL.md | MODIFY | ~10 |

---

**Approve to proceed with implementation?**