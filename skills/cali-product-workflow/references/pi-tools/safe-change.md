# Tool: safe-change

> Regression check before planning using pi-agent-codebase-workflows.

---

## Comando Específico (PI)

```bash
safe-change
```

| Info | Value |
|------|-------|
| Package | pi-agent-codebase-workflows (PriNova) |
| Command | `safe-change` |

---

## Quando Usar

| Phase | Purpose |
|-------|---------|
| Phase 1b (Setup) | Validar impacto antes de planejar |

---

## Output

Retorna análise de:
- Arquivos que serão afetados
- Possíveis regressões
- Warnings e riscos

---

## Fallback (Outros Harnesses)

Se `safe-change` não disponível:
- Verificar manualmente arquivos relevantes com `git diff`
- Rodar testes existentes para verificar regressions
- Documentar análise manual

**Abstração:** "Verificação de regressão antes de mudanças"