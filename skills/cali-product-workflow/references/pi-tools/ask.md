# Tool: ask_user_question

> Structured user questions for PI using ask_user_question.

---

## Comando Específico (PI)

```typescript
ask_user_question({
  questions: [{
    question: "...",
    header: "...",
    options: [...],
    multiSelect: boolean
  }]
})
```

| Info | Value |
|------|-------|
| Package | @juicesharp/rpiv-ask-user-question (juicesharp) |
| Patterns | See `phases/ask-patterns.md` |

---

## Tool Capabilities

| Capability | Description |
|------------|-------------|
| Options | 2-6 options per question |
| Preview | Markdown/ASCII rendered side-by-side |
| multiSelect | Allow multiple selections |
| Notes | Press 'n' on option to attach notes |

---

## Preview Limits

| Mode | Max rows |
|------|----------|
| Side-by-side | 20 rows |
| Stacked | 15 rows |

---

## Patterns Reference

**Usar padrões de `phases/ask-patterns.md`:**

| Pattern | Phase | Purpose |
|---------|-------|---------|
| Pattern 1 | Phase 2a | Strategic exploration selection |
| Pattern 2 | Phase 9 | Interface proposal selection |
| Pattern 3 | Phase 6 | Scope adjustment (add/remove) |
| Pattern 4 | General | Simple confirmation |
| Pattern 5 | Phase 1b | Stage selection |

---

## Multi-Select Rule

Quando `multiSelect: true`:
- **NÃO** incluir "None", "Skip", "All" como options
- Usuário pode selecionar **nada** para significar "none"
- Selecionar **tudo** é permitido
- Seleções são explícitas — não precisa de "select all"

---

## Schema

```typescript
interface Option {
  label: string;       // 1-5 words, max 60 chars
  description: string; // explains trade-offs
  preview?: string;    // markdown/ASCII for visual
}

interface Question {
  question: string;    // ends with "?"
  header: string;     // max 20 chars
  options: Option[];   // 2-6 options
  multiSelect?: boolean;
}
```

---

## Reserved Labels

These are auto-added and must NOT be in options:
- `"Other"` / `"Type something."`
- `"Chat about this"`
- `"Next →"`

---

## Fallback (Outros Harnesses)

Se `ask_user_question` não disponível:
- Listar opções como markdown numerado
- User responde com número
- Processar resposta como seleção

**Exemplo fallback:**
```markdown
## Opções

1. Opção A — description
2. Opção B — description

Responda com o número da escolha:
> 1
```

**Abstração:** "Questão estruturada com opções e resposta do usuário"