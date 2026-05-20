# Installation Guide

This guide covers installing cali-product-workflow for different AI coding agent harnesses.

## Architecture: Dual-Install Pattern

pi-product-workflow uses a dual-install pattern (same as context-mode):

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Core Package (all CLIs)                          │
│         npm install -g @renatocaliari/pi-product-workflow           │
│         → Skills, adapters, CLI tools (markdown files)               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     Pi Stub Extension (Pi only)                      │
│         pi install npm:@renatocaliari/cali-product-workflow-pi      │
│         → Lightweight Pi integration (references core)              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   Plugin Structures (all CLIs)                       │
│         .claude-plugin/  → Claude Code marketplace                  │
│         .codex-plugin/   → Codex plugin registry                   │
│         .opencode-plugin/ → OpenCode plugin                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Package Contents

| Directory | Purpose | CLIs |
|-----------|---------|------|
| `skills/` | Product workflow skills (markdown) | All |
| `adapters/` | CLI adapters (pi, opencode, claude-code, codex) | All |
| `.claude-plugin/` | Claude Code marketplace manifest | Claude Code |
| `.codex-plugin/` | Codex plugin manifest | Codex |
| `.opencode-plugin/` | OpenCode plugin manifest | OpenCode |
| `extensions/cali-product-workflow-pi/` | Pi stub extension | Pi |

---

## Quick Install (pi)

### Automated (Recommended)

```bash
# Clone and run setup
git clone https://github.com/renatocaliari/pi-product-workflow.git
cd pi-product-workflow
./scripts/setup.sh
```

Or use the single installer:

```bash
./install.sh
```

### Manual

```bash
# 1. Install core package
pi install npm:@renatocaliari/pi-product-workflow

# 2. Install stub extension (Pi integration)
pi install npm:@renatocaliari/cali-product-workflow-pi

# 3. Install supporting packages
pi install npm:pi-subagents
pi install npm:pi-goal
pi install npm:pi-intercom
pi install npm:pi-supervisor
pi install npm:pi-autoresearch
pi install npm:@plannotator/pi-extension
pi install npm:@juicesharp/rpiv-ask-user-question
```

---

## For Other CLIs

### Generic Install (npm)

```bash
npm install -g @renatocaliari/pi-product-workflow
```

Works on any system with Node.js >= 20.0.0. Skills are markdown files.

### opencode

Add to `opencode.json`:

```json
{
  "plugins": ["@renatocaliari/pi-product-workflow"]
}
```

Or via CLI:

```bash
opencode plugin add @renatocaliari/pi-product-workflow
```

### claude-code

```bash
# Via marketplace (recommended)
claude /plugin marketplace add renatocaliari/pi-product-workflow
claude /plugin install cali-product-workflow@cali-product-workflow

# Or install locally
claude /plugin install ./path/to/package
```

### codex

```bash
# Via plugin marketplace
codex plugin marketplace add renatocaliari/pi-product-workflow
codex plugin install cali-product-workflow

# Or install locally
codex plugin install ./path/to/package
```

---

## Installation Methods Summary

| CLI | Method | Packages | Plugin Structure |
|-----|--------|----------|------------------|
| **pi** | Dual-install | Core + Stub Extension | `extensions/cali-product-workflow-pi/` |
| **opencode** | Plugin | Core package | `.opencode-plugin/plugin.json` |
| **claude-code** | Marketplace | Core package | `.claude-plugin/` |
| **codex** | Plugin | Core package | `.codex-plugin/` |
| **generic** | npm | Core package only | N/A |

---

## Plugin Manifests

### Claude Code (`.claude-plugin/`)

```
.claude-plugin/
├── plugin.json      # Main manifest
├── marketplace.json  # Marketplace entry
└── .claude/
    └── skills/
        └── cali-product-workflow/
```

**plugin.json structure:**
```json
{
  "name": "@renatocaliari/cali-product-workflow",
  "version": "0.2.0-alpha",
  "description": "Product workflow for AI coding agents",
  "skills": "./.claude/skills/"
}
```

### Codex (`.codex-plugin/`)

```
.codex-plugin/
├── plugin.json      # Main manifest
└── marketplace.json # Marketplace entry
```

**plugin.json structure:**
```json
{
  "name": "@renatocaliari/cali-product-workflow",
  "version": "0.2.0-alpha",
  "description": "Product workflow for AI coding agents",
  "skills": "./skills/"
}
```

### OpenCode (`.opencode-plugin/`)

```
.opencode-plugin/
└── plugin.json      # Main manifest
```

**plugin.json structure:**
```json
{
  "name": "@renatocaliari/cali-product-workflow",
  "version": "0.2.0-alpha",
  "description": "Product workflow for AI coding agents",
  "skills": "./skills/"
}
```

---

## Dependencies

### Required (all CLIs)

| Package | Purpose | Min Version |
|---------|---------|-------------|
| typebox | Runtime type validation | * |

### Pi-Specific (dual-install)

| Package | Purpose | Install Location |
|---------|---------|-----------------|
| `@renatocaliari/pi-product-workflow` | Core (skills, adapters) | npm (global) |
| `@renatocaliari/cali-product-workflow-pi` | Stub extension | npm (Pi extension) |
| pi-subagents | Parallel task execution | Pi package |
| plannotator | Visual review gate | Pi package |
| pi-goal | Goal execution mode | Pi package |
| ask-user-question | Structured questions | Pi package |
| intercom | Cross-session messaging | Pi package |
| supervisor | Outcome steering | Pi package |
| pi-autoresearch | Optimization loops | Pi package |
| context-mode | Context reduction (98%) | Optional |

---

## Auto-trigger (Optional)

Enable auto-trigger to get workflow context in all projects:

```bash
cp ~/pi-product-workflow/AGENTS.md ~/.pi/agent/AGENTS.md
```

To disable:
```bash
rm ~/.pi/agent/AGENTS.md
```

---

## Verification

### Generic verification

```bash
npm list -g @renatocaliari/pi-product-workflow
```

### Pi-specific verification

```bash
pi list | grep product-workflow
```

You should see:
- `@renatocaliari/pi-product-workflow` (core)
- `@renatocaliari/cali-product-workflow-pi` (stub)

### CLI-specific verification

```bash
# OpenCode
opencode plugin list | grep product-workflow

# Claude Code
claude /plugin list | grep product-workflow

# Codex
codex plugin list | grep product-workflow
```

---

## Troubleshooting

### Skills not loading

Check that packages are installed:
```bash
pi list | grep product-workflow
```

### Commands not found

Restart the CLI after installation:
```bash
pi --reload
# or
opencode --reload
# or
claude /reload-plugins
```

### Auto-trigger not working

Verify AGENTS.md is in place:
```bash
cat ~/.pi/agent/AGENTS.md | head
```

---

## Uninstallation

### Automated

```bash
cd ~/pi-product-workflow
./scripts/uninstall.sh
```

### Manual

**Pi (dual-install):**
```bash
# Remove packages (dual-install)
pi remove npm:@renatocaliari/pi-product-workflow
pi remove npm:@renatocaliari/cali-product-workflow-pi

# Remove auto-trigger
rm ~/.pi/agent/AGENTS.md

# Remove supporting packages (optional)
pi remove npm:pi-subagents npm:pi-goal npm:@plannotator/pi-extension
```

**OpenCode:**
```bash
opencode plugin remove @renatocaliari/pi-product-workflow
```

**Claude Code:**
```bash
claude /plugin uninstall cali-product-workflow
```

**Codex:**
```bash
codex plugin uninstall cali-product-workflow
```

**Generic:**
```bash
npm uninstall -g @renatocaliari/pi-product-workflow
```

---

## From Source

For development or customization:

```bash
git clone https://github.com/renatocaliari/pi-product-workflow.git
cd pi-product-workflow

# For Pi
pi install .

# For OpenCode/Claude Code/Codex
npm install -g .
```

---

## Version Sync

When you publish a new version, the `npm version` script automatically syncs version numbers to:

- `extensions/cali-product-workflow-pi/package.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.codex-plugin/plugin.json`
- `.codex-plugin/marketplace.json`
- `.opencode-plugin/plugin.json`