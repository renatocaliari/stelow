# Tool: /supervise

> Execution steering for PI using pi-supervisor (tintinweb).

---

## Comando Específico (PI)

```bash
/supervise [outcome]
```

| Info | Value |
|------|-------|
| Package | pi-supervisor (tintinweb) |
| Command | `/supervise` |

---

## Quando Usar

| Phase | Purpose |
|-------|---------|
| Phase 11 (Execution) | Steering durante execução |

---

## Ativação

**⚠️ IMPORTANTE:** Nunca ativar durante Phases 3-10.
O supervisor re-submete Plannotator, causando loops.

Ativar APENAS quando INICIAR cada scope na Phase 11.

---

## Fallback (Outros Harnesses)

Se `/supervise` não disponível:
- Monitorar execução manualmente
- Usar checkpoints para progress tracking

**Abstração:** "Steering de execução com direcionamento de outcome"