# Tool: plannotator annotate --gate

> Visual review with human approval gate for PI workflow.

---

## Comando Específico (PI)

```bash
plannotator annotate <file>.md --gate
```

| Info | Value |
|------|-------|
| Package | @plannotator/pi-extension (backnotprop) |
| Command | `plannotator annotate <file>.md --gate` |
| Example | `plannotator annotate .cali-product-workflow/2026-05-19/pw-xxx/specs/spec-product_v1.md --gate` |

---

## Quando Usar

| Phase | Purpose | File |
|-------|---------|------|
| Phase 5 | Shape Up spec approval | `specs/spec-product_v{N}.md` |
| Phase 8 | Interface proposals approval | `interfaces/interfaces_v{N}.md` |
| Standalone Tech Planning | Plan approval (no Shape Up) | `plans/spec-tech_v{N}.md` |

---

## ⚠️ CRITICAL: --gate Flag

**O `--gate` flag é OBRIGATÓRIO.**

| Sem `--gate` | Com `--gate` |
|--------------|--------------|
| ❌ Sem botão Approve | ✅ Botão Approve visível |
| ❌ Sem blocking | ✅ Bloqueia até aprovação |
| ❌ Abre em background | ✅ Abre como review ativo |
| ❌ Pode ser dispensado | ✅ Força decisão |

**Se esquecer `--gate`:** O UI abre mas o usuário não pode aprovar, e o workflow continua incorretamente.

---

## After Approval

Após aprovação do usuário:

### 1. Stamp YAML frontmatter
```yaml
approved: true
approved_at: "2026-05-19T15:00:00-03:00"
approved_via: plannotator --gate
```

### 2. Create receipt
```bash
mkdir -p .plannotator/approvals/{_dir}
cat > .plannotator/approvals/{_dir}/{filename}_v{N}.approved.md << 'EOF'
# Approval: {filename}_v{N}.md
- Approved at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
- Spec hash: `git hash-object <file>`
- Verdict: approved
EOF
```

### 3. File is frozen
Futuras mudanças exigem nova versão + novo gate.

---

## Fallback (Outros Harnesses)

Se `plannotator` não disponível:
- Usar visual review manual com approval tracking
- Bloquear execução até confirmação explícita do reviewer
- Documentar aprovação em arquivo de receipt manual

**Abstração:** "Visual review gate com aprovação humana bloqueante"