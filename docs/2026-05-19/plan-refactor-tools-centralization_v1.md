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

### Estrutura de Arquivos (prefixo `pi-tools-*`)

```
references/
├── pi-tools-plannotator.md    (~90 lines, EXISTE) - renomear
├── pi-tools-subagents.md       (~150 lines, NOVO)   - padrões abstraídos
├── pi-tools-goals.md            (~80 lines, NOVO)   - goal/sisyphus patterns
├── pi-tools-ask.md             (~120 lines, NOVO)   - ask patterns ref
├── environment-adaptation.md   (~63 lines, EXISTE) -簡化 -> só pointers
└── ...outros arquivos não-técnicos...
```

### Regras

1. **Max 300 linhas por arquivo** - se passar, quebrar em múltiplos
2. **Nomenclatura** - prefixo `pi-tools-` para identificar arquivos técnicos de PI
3. **Abstração** - não hardcoded commands, usar descrições que o harness pode interpretar
4. **Alternativas** - cada tool terá seção de fallback para ambientes sem a ferramenta

---

## Arquivos a Criar/Modificar

### 1. Renomear: `plannotator-rules.md` → `pi-tools-plannotator.md`

**Conteúdo atual:**
- When to use
- Command format (--gate mandatory)
- After approval (stamp + receipt)
- Standalone gate

**Adicionar:**
- Abstração: "Visual review gate with human approval"
- Alternative: "If Plannotator unavailable, use plan-review with manual approval tracking"

### 2. Criar: `pi-tools-subagents.md`

**Padrões de subagent abstraídos:**

| Agent Type | Purpose | Abstraction |
|------------|---------|-------------|
| `worker` | Execute single task | "parallel task executor" |
| `reviewer` | Code quality review | "adversarial review" |
| `scout` | Investigate codebase | "codebase investigation" |
| `researcher` | External research | "research task" |
| `delegate` | Skill delegation | "skill-based delegation" |
| `planner` | Strategic planning | "planning task" |

**Content:**
- Table of agent types and purposes
- Common patterns (parallel, chain, single)
- Abstraction examples
- Fallback: "If subagent unavailable, execute task directly with context preservation"

### 3. Criar: `pi-tools-goals.md`

**Goal system patterns:**
- `/sisyphus` - scoped execution with steps
- `/goal` - general goal tracking
- `pause_goal` - checkpoint

**Abstraction:**
- "Goal with typed scopes and acceptance criteria"
- "Step-by-step execution with DoD"
- "Checkpoint for resume"

**Fallback:**
- "If goal system unavailable, use todo tool + checkpoint files"

### 4. Criar: `pi-tools-ask.md`

**Reference to ask-patterns.md** (já existe em `phases/ask-patterns.md`)

**Content:**
- "Use patterns from phases/ask-patterns.md"
- "Tool capabilities summary"
- "Multi-select rules"
- "Preview format guidelines"

**Fallback:**
- "If ask_user_question unavailable, list options as numbered choices in markdown"

### 5. Simplificar: `environment-adaptation.md`

**Conteúdo atual:** 63 lines com adaptações para pi.dev e Fusion

**Proposta:**
- Manter estrutura de tabela
- Simplificar para só pointers para arquivos específicos
- Remover conteúdo duplicado de `pi-tools-*.md`

---

## Simplificar SKILL.md

**Remover:** Tabela de tools (linhas 36-46)
**Adicionar:** "Read references/pi-tools-*.md for all tool definitions and patterns"

---

## Simplificar Skills Individuais

### cali-interface-brainstorm/SKILL.md
- Subagent: usar tipo abstrato "parallel worker" em vez de `agent: "worker"`
- Referenciar `pi-tools-subagents.md`

### cali-plan-critique/SKILL.md
- Subagent: usar tipo abstrato "reviewer"
- Referenciar `pi-tools-subagents.md`

### cali-tech-planning/SKILL.md
- Subagent: usar tipo abstrato "planner"
- Referenciar `pi-tools-subagents.md`

### cali-shape-up/SKILL.md
- Subagent: usar tipos "scout", "delegate"
- Referenciar `pi-tools-subagents.md`

---

## Resumo de Arquivos

| Arquivo | Ação | Linhas estimadas |
|---------|------|------------------|
| `plannotator-rules.md` → `pi-tools-plannotator.md` | Renomear | ~90 |
| `pi-tools-subagents.md` | Criar | ~150 |
| `pi-tools-goals.md` | Criar | ~80 |
| `pi-tools-ask.md` | Criar | ~120 |
| `environment-adaptation.md` | Simplificar | ~30 |
| `SKILL.md` | Simplificar | -20 |
| Skills-workflow/*/SKILL.md | Simplificar | -50 cada |

---

## Validação

- [ ] Todos os arquivos técnicos com prefixo `pi-tools-`
- [ ] Nenhum arquivo técnico > 300 linhas
- [ ] SKILL.md sem tabela de tools hardcoded
- [ ] Cada skill referenciando arquivos `pi-tools-*`
- [ ] Environment adaptation só com pointers
- [ ] Fallbacks documentados para cada tool

---

## Ordens de Execução

1. Criar `pi-tools-subagents.md`
2. Criar `pi-tools-goals.md`
3. Criar `pi-tools-ask.md`
4. Renomear `plannotator-rules.md` → `pi-tools-plannotator.md`
5. Simplificar `environment-adaptation.md`
6. Atualizar SKILL.md (remover tabela, adicionar referências)
7. Atualizar skills-workflow/* (simplificar subagent calls)
8. Commit e push