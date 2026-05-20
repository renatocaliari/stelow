# Installation Guide

This guide covers installing cali-product-workflow for different AI coding agents using `npx skills`.

## Quick Start with npx skills

The easiest way to install for all agents:

```bash
npx skills add renatocaliari/pi-product-workflow
```

This installs the skill to `~/.agents/skills/cali-product-workflow`, which works across multiple agents.

---

## Installation per Agent

### All Agents (Universal)

```bash
# Install once, works everywhere
npx skills add renatocaliari/pi-product-workflow

# Install to specific agents
npx skills add renatocaliari/pi-product-workflow -a pi -a opencode -a claude-code -a codex
```

### Pi

```bash
# Via npx skills
npx skills add renatocaliari/pi-product-workflow -a pi

# Skills install to: ~/.pi/agent/skills/

# Pi-specific dual-install (core + extension)
./scripts/setup.sh
```

### OpenCode

```bash
# Via npx skills
npx skills add renatocaliari/pi-product-workflow -a opencode

# Skills install to: ~/.config/opencode/skills/

# Or add as plugin to opencode.json:
# Add to ~/.config/opencode/opencode.json:
# {
#   "plugin": ["@renatocaliari/pi-product-workflow"]
# }
```

### Claude Code

```bash
# Via npx skills
npx skills add renatocaliari/pi-product-workflow -a claude-code

# Skills install to: ~/.claude/skills/

# Or install as plugin from local source:
claude /plugin install /path/to/pi-product-workflow
```

### Codex

```bash
# Via npx skills
npx skills add renatocaliari/pi-product-workflow -a codex

# Skills install to: ~/.codex/skills/

# Or via codex-marketplace:
npx codex-marketplace add renatocaliari/pi-product-workflow --skills
```

### Generic (npm global)

```bash
npm install -g @renatocaliari/pi-product-workflow
```

---

## Skill Management Commands

```bash
# List installed skills
npx skills list

# Update skills
npx skills update                    # Update all
npx skills update cali-product-workflow  # Update specific

# Remove skills
npx skills remove cali-product-workflow

# Search for skills
npx skills find product
```

---

## Installation Methods Summary

| Method | CLI | What it does |
|--------|-----|--------------|
| `npx skills add` | All | Install skill to universal `~/.agents/skills/` |
| `pi install npm:...` | Pi only | Dual-install (core + stub extension) |
| `opencode.json plugin` | OpenCode | Add plugin for hooks/custom tools |
| `claude /plugin install` | Claude Code | Full plugin with hooks |
| `npm install -g` | Any | Generic npm package |

---

## Skills Installation Paths

| Agent | Path | Via |
|-------|------|-----|
| Pi | `~/.pi/agent/skills/` | `npx skills -a pi` |
| OpenCode | `~/.config/opencode/skills/` | `npx skills -a opencode` |
| Claude Code | `~/.claude/skills/` | `npx skills -a claude-code` |
| Codex | `~/.codex/skills/` | `npx skills -a codex` |
| Universal | `~/.agents/skills/` | `npx skills add` |

---

## Using cli-install.sh

```bash
# Install skills to all agents
./scripts/cli-install.sh install-skills

# Update skills
./scripts/cli-install.sh update-skills

# Remove skills
./scripts/cli-install.sh remove-skills

# List skills
./scripts/cli-install.sh list-skills

# Full installation
./scripts/cli-install.sh all
```

---

## Pi-Specific: Dual-Install Pattern

For Pi, we use a dual-install pattern (same as context-mode):

```
Core package (npm):        @renatocaliari/pi-product-workflow
Pi stub extension:         @renatocaliari/cali-product-workflow-pi
```

### Automated (Recommended)

```bash
./scripts/setup.sh
```

### Manual

```bash
# Install core package
pi install npm:@renatocaliari/pi-product-workflow

# Install stub extension (Pi integration)
pi install npm:@renatocaliari/cali-product-workflow-pi

# Install supporting packages
pi install npm:pi-subagents
pi install npm:pi-goal
pi install npm:pi-intercom
pi install npm:pi-supervisor
pi install npm:pi-autoresearch
pi install npm:@plannotator/pi-extension
```

---

## Auto-trigger (Optional)

Enable auto-trigger to get workflow context in all projects:

```bash
cp ~/pi-product-workflow/AGENTS.md ~/.pi/agent/AGENTS.md
```

---

## Uninstallation

```bash
# Remove skills
npx skills remove cali-product-workflow

# Pi dual-install
pi remove npm:@renatocaliari/pi-product-workflow
pi remove npm:@renatocaliari/cali-product-workflow-pi

# Remove auto-trigger
rm ~/.pi/agent/AGENTS.md
```

---

## From Source

```bash
git clone https://github.com/renatocaliari/pi-product-workflow.git
cd pi-product-workflow

# Install skills
npx skills add . -a pi -a opencode -a claude-code -a codex

# For Pi dual-install
./scripts/setup.sh
```

---

## Version Sync

When you publish a new version:

```bash
npm version patch
```

This auto-syncs version numbers to all manifests.