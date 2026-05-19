# Tool: /sisyphus, /goal

> Goal tracking with typed scopes and step-by-step execution for PI.

---

## Comando Específico (PI)

```bash
/sisyphus [scope-name]
/goal [description]
pause_goal
```

| Info | Value |
|------|-------|
| Package | @capyup/pi-goal (capyup) |
| Commands | /sisyphus, /goal, pause_goal |

---

## Quando Usar

| Phase | Purpose |
|-------|---------|
| Phase 11 (Execution) | Scoped implementation per scope |
| After Tech Planning | Cada scope vira um goal |

---

## Padrão para Scope Execution

```bash
/sisyphus Scope: [scope-name]
  Step 1: [description with DoD]
    - Criterion A
    - Criterion B
  Step 2: [description]
  ...
```

### DoD Format
```markdown
Done when:
- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
```

---

## Goal Generation (After Tech Planning)

Para cada scope no spec-tech aprovado:

```bash
/sisyphus Scope: [scope-name]
  Objective: {from scope description}
  DoD: {from scope}
  Files in scope: {from plan}
  Constraints: tests must pass
```

---

## Fallback (Outros Harnesses)

Se goal system não disponível:
- Usar todo tool para tracking de progresso
- Criar checkpoint files para resume
- Marcar `[DONE:n]` em responses

**Abstração:** "Goal com scopes tipados e critérios de aceite"

---

## Related

- Phase 11: Execution
- spec-tech scopes