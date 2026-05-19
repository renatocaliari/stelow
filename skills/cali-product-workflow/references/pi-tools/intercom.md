# Tool: intercom

> Cross-session messaging for PI using pi-intercom (nicobailon).

---

## Comando Específico (PI)

```typescript
intercom({ action: "send", to: "session-name", message: "..." })
intercom({ action: "ask", to: "session-name", message: "..." })
```

| Info | Value |
|------|-------|
| Package | pi-intercom (nicobailon) |
| Actions | `send`, `ask`, `reply`, `pending`, `list`, `status` |

---

## Actions

| Action | Purpose |
|--------|---------|
| `list` | List active sessions |
| `send` | Send message to session |
| `ask` | Ask and wait for reply |
| `reply` | Reply to pending ask |
| `pending` | List unresolved asks |
| `status` | Show connection status |

---

## Fallback (Outros Harnesses)

Se `intercom` não disponível:
- Usar comunicação via arquivos compartilhados
- Agendar checkpoint para cross-session

**Abstração:** "Mensageria entre sessões de agente"