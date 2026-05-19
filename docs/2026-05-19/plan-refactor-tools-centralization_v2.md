# Plano: Centralização de Tools/Technical em pi-tools-*.md

## Contexto

Após investigação profunda, identificamos:
- 15 `subagent` calls espalhadas
- 60 menções de tools (ask_user_question, goal-system, plannotator, safe-change)
- 13 menções de packages (pi-subagents, @juicesharp, @plannotator, etc.)
- Tabela de tools hardcoded no SKILL.md

## Problema

Conteúdo técnico disperso causa:
1. Inconsistência quando ferramentas mudam
2. DRY violations (mesma info repetida em N lugares)
3. Dificuldade de manter / atualizar
4. Skills inchados com detalhes de implementação

## Solução Proposta

### Estrutura de Arquivos (prefixo `references/pi-tools/`)

```
references/
├── pi-tools/                    ← SUBDIRETÓRIO para tools PI
│   ├── plannotator.md          (~100 lines) - renomeado
│   ├── subagents.md            (~150 lines) - NOVO
│   ├── goals.md                 (~80 lines) - NOVO
│   └── ask.md                  (~100 lines) - NOVO
├── strategic-exploration.md     ← arquivos não-técnicos
└── ...outros arquivos...
```

**Benefício:** melhor organização, easy scanning, arquivos relacionados juntos.

**Atualizar todas as referências nos skills para usar o path completo:**
- `references/pi-tools/plannotator.md`
- `references/pi-tools/subagents.md`
- etc.

### Estrutura de Cada Arquivo `pi-tools-*.md`

Para CADA tool, o arquivo terá:

```markdown
## Tool: [Nome Específico]

### Comando Específico (PI)
```bash
[comando completo e específico com --flags]
```
Package: [npm package name] (author)
Exemplo: `plannotator annotate <file> --gate`

### Fallback (Outros Harnesses)
Se o comando específico não estiver disponível, use:
[descrição abstrata da alternativa que o harness deve encontrar]
```

**Princípio:** O principal é SEMPRE o comando específico para PI. A abstração/fallback é para quando o comando específico não existe.

### Sobre environment-adaptation.md

**Decisão:** REMOVER `environment-adaptation.md`.

**Justificativa:** Se cada `pi-tools-*.md` já documenta seu próprio fallback, o arquivo de environment-adaptation seria redundante e causaria manutenção duplicada.

---

## Arquivos a Criar/Modificar

### 1. Renomear: `plannotator-rules.md` → `pi-tools-plannotator.md`

**Estrutura:**
```markdown
## Tool: plannotator annotate --gate

### Comando Específico (PI)
```bash
plannotator annotate <file>.md --gate
```
Package: @plannotator/pi-extension (backnotprop)
Exemplo: `plannotator annotate .cali-product-workflow/.../spec-product_v1.md --gate`

### Quando Usar
- Phase 5 Gate (Shape Up approval)
- Phase 8 Gate (Interface approval)
- Standalone Tech Planning gate

### After Approval
1. Stamp YAML frontmatter: `approved: true`, `approved_at`, `approved_via: plannotator --gate`
2. Create receipt: `.plannotator/approvals/{_dir}/{filename}_v{N}.approved.md`

### Fallback (Outros Harnesses)
Se `plannotator` não disponível:
- Usar visual review com approval manual tracking
- Bloquear execução até confirmação explícita do reviewer
```

### 2. Criar: `pi-tools-subagents.md`

**Estrutura:**
```markdown
## Tool: subagent

### Comando Específico (PI)
```typescript
subagent({
  agent: "[worker|reviewer|scout|researcher|delegate|planner]",
  task: "...",
  output: "...",
  context: "[fork|fresh]"
})
```
Package: pi-subagents (nicobailon)
Modes: parallel (tasks[], concurrency), chain, single

### Agent Types (PI)

| Type | Purpose |
|------|---------|
| `worker` | Parallel task execution (Step 1 proposals, etc.) |
| `reviewer` | Adversarial code review |
| `scout` | Codebase investigation |
| `researcher` | External research tasks |
| `delegate` | Skill-based delegation |
| `planner` | Strategic planning tasks |

### Common Patterns

**Parallel (Step 1):**
```typescript
subagent({
  tasks: [
    { agent: "worker", task: "..." },
    { agent: "worker", task: "..." }
  ],
  concurrency: 5,
  context: "fork"
})
```

**Single (Step 3 - Hybrid):**
```typescript
subagent({
  agent: "worker",
  task: "Read proposals A-E, generate Hybrid",
  reads: ["interfaces_v1.md"]
})
```

### Fallback (Outros Harnesses)
Se `subagent` não disponível:
- Executar tarefa diretamente com preservação de contexto
- Manter outputs em arquivos para continuação
```

### 3. Criar: `pi-tools-goals.md`

**Estrutura:**
```markdown
## Tool: /sisyphus, /goal

### Comando Específico (PI)
```bash
/sisyphus [scope-name]
```
Package: @capyup/pi-goal (capyup)
Commands: /sisyphus, /goal, pause_goal

### Quando Usar
- Phase 11 (Execution) para scoped implementation
- Cada scope do spec-tech vira um goal

### Padrão
```bash
/sisyphus Scope: [scope-name]
  Step 1: [description with DoD]
  Step 2: ...
```

### Fallback (Outros Harnesses)
Se goal system não disponível:
- Usar todo tool para tracking
- Criar checkpoint files para resume
```

### 4. Criar: `pi-tools-ask.md`

**Estrutura:**
```markdown
## Tool: ask_user_question

### Comando Específico (PI)
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
Package: @juicesharp/rpiv-ask-user-question (juicesharp)

### Padrões Pré-definidos
Ver: `phases/ask-patterns.md`

### Capabilities
- 2-6 options por question
- Preview field (ASCII/markdown)
- multiSelect
- Notes (pressionar 'n')

### Fallback (Outros Harnesses)
Se `ask_user_question` não disponível:
- Listar opções como markdown numerado
- User escolhe respondendo com número
```

---

## Simplificar SKILL.md

**Remover:** Tabela de tools (linhas 36-46)
**Adicionar:**
```markdown
## Ferramentas PI

Antes de usar qualquer ferramenta, leia o arquivo de referência:
- `references/pi-tools-*.md` — TODAS as definições de tools

Não hardcode package names ou comandos nos skills. Use os arquivos de referência.
```

---

## Simplificar Skills Individuais

### Regra Geral
- NÃO incluir comandos `subagent` hardcoded nos skills
- REFERENCIAR `references/pi-tools-subagents.md`
- Usar nomes de agent types (worker, reviewer, etc.) em vez de comandos completos

### cali-interface-brainstorm/SKILL.md
**ANTES:**
```typescript
subagent({
  tasks: [
    { agent: "worker", task: "..." }
  ],
  concurrency: 5
})
```
**DEPOIS:** Referenciar pi-tools-subagents.md e usar tipo abstrato

---

## Resumo de Arquivos

| Arquivo | Ação | Linhas estimadas |
|---------|------|------------------|
| `references/pi-tools/plannotator.md` | Mover + renomear | ~100 |
| `references/pi-tools/subagents.md` | Criar | ~150 |
| `references/pi-tools/goals.md` | Criar | ~80 |
| `references/pi-tools/ask.md` | Criar | ~100 |
| `references/environment-adaptation.md` | DELETAR (redundante) | -63 |
| `SKILL.md` | Simplificar | -20 |
| Skills-workflow/*/SKILL.md | Simplificar | -50 cada |

---

## Validação

- [ ] Todos arquivos técnicos com prefixo `pi-tools-`
- [ ] Nenhum arquivo técnico > 300 linhas
- [ ] SKILL.md sem tabela de tools hardcoded
- [ ] Cada skill referenciando arquivos `pi-tools-*`
- [ ] environment-adaptation.md DELETADO
- [ ] Fallbacks documentados para cada tool
- [ ] Estrutura consistente: Comando Específico → Fallback

---

## Ordens de Execução

1. Criar diretório `references/pi-tools/`
2. Mover `plannotator-rules.md` → `references/pi-tools/plannotator.md`
3. Criar `references/pi-tools/subagents.md`
4. Criar `references/pi-tools/goals.md`
5. Criar `references/pi-tools/ask.md`
6. DELETAR `references/environment-adaptation.md`
7. Atualizar SKILL.md (remover tabela, adicionar referência)
8. Atualizar skills-workflow/* (simplificar subagent calls, usar paths corretos)
9. Commit e push