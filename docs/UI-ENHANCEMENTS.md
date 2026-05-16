# PI-PRODUCT-WORKFLOW — UI Enhancement Research

## Overview

This document explores what UI/TUI elements would make the pi-product-workflow more intuitive, visual, and "gostoso" to use. Based on research of pi.dev docs and community extensions.

---

## 1. What pi Supports

### 1.1 Extension UI APIs (`ctx.ui`)

| Method | Purpose |
|--------|---------|
| `ctx.ui.notify()` | Toast notification (info/success/warning/error) |
| `ctx.ui.setStatus()` | Footer status text (persistent) |
| `ctx.ui.setWidget()` | Content above/below editor |
| `ctx.ui.setFooter()` | Replace footer entirely |
| `ctx.ui.setWorkingIndicator()` | Custom loading spinner |
| `ctx.ui.setTitle()` | Window title |
| `ctx.ui.custom()` | Full custom TUI component |
| `ctx.ui.select()` | Built-in selection dialog |
| `ctx.ui.confirm()` | Built-in confirmation dialog |

### 1.2 Custom TUI Components

```typescript
interface Component {
  render(width: number): string[];
  handleInput?(data: string): void;
  invalidate(): void;
}
```

Can create: SelectList, SettingsList, Dialogs, Loaders, Status bars, etc.

### 1.3 Widgets Above/Below Editor

```typescript
// Simple string array
ctx.ui.setWidget("workflow-progress", ["Phase 1/5: Shape Up"]);

// Or themed component
ctx.ui.setWidget("workflow-progress", (_tui, theme) => ({
  render: () => [
    theme.fg("accent", "●") + " Shape Up",
    theme.fg("muted", "○ Tech Planning")
  ],
  invalidate: () => {}
}), { placement: "aboveEditor" });
```

---

## 2. Community Extensions (Inspiration)

### 2.1 Status Bar Extensions

| Extension | What it does |
|----------|--------------|
| **pi-powerline-footer** | Powerline-style status bar + welcome overlay |
| **pi-fancy-footer** | Compact 2-line footer with model, context, git, cost |
| **pi-powerbar** | Left/right segments updated via events |

### 2.2 UI Enhancements

| Extension | What it does |
|----------|--------------|
| **pi-tool-display** | Compact tool rendering, richer diffs |
| **pi-agent-extensions** | Notify tool, whimsical loading messages |

---

## 3. Ideas for pi-product-workflow UI

### 3.1 Workflow Status Widget (HIGH PRIORITY)

**What:** Persistent widget showing current workflow phase.

**Where:** Above the editor (default) or below.

**Content:**
```
┌─────────────────────────────────────────────────────────┐
│ 🚀 Product Workflow: feature-login (Phase 2/5)          │
│ [████░░░░░░░░░░░░░░░░░░░░] 40% — Interface Design  │
│ ○ Clarify ○ Shape ○ Bet ○ Build ○ Critique ○ Gate      │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**
```typescript
ctx.ui.setWidget("workflow-status", (_tui, theme) => ({
  render: (width) => {
    const phase = currentPhase(); // 0-5
    const total = 6;
    const pct = Math.round((phase / total) * 100);
    const bar = "█".repeat(pct/10) + "░".repeat(10 - pct/10);
    
    return [
      `🚀 Product Workflow: ${workflowSlug} (Phase ${phase+1}/${total})`,
      `[${bar}] ${pct}% — ${phaseNames[phase]}`,
      phases.map((p, i) => 
        i === phase ? theme.fg("success", "●") + " " + p :
        i < phase ? theme.fg("success", "●") + " " + p :
        theme.fg("muted", "○") + " " + p
      ).join(" ")
    ];
  },
  invalidate: () => {}
}));
```

### 3.2 Phase Transition Notifications

**What:** Toast when entering new phase.

**Implementation:**
```typescript
pi.on("before_agent_start", async (_event, ctx) => {
  const prevPhase = getPhaseFromTracking();
  // ... agent does work ...
  
  if (getPhaseFromTracking() !== prevPhase) {
    ctx.ui.notify(
      `📍 New phase: ${getPhaseName()}`, 
      "info"
    );
  }
});
```

### 3.3 Custom Footer with Workflow Info

**What:** Footer showing workflow + git info together.

**Content:**
```
[model] | feature-login | Phase 2/5 | branch: main | ↑3 ↓1
```

**Implementation:**
```typescript
ctx.ui.setFooter((tui, theme, footerData) => ({
  invalidate() {},
  render(width: number): string[] {
    const git = footerData.getGitBranch() || "no git";
    const diff = getWorkflowDiff();
    const phase = getCurrentPhase();
    
    return [
      `${ctx.model?.id} | ${workflowSlug} | Phase ${phase} | ${git} | ${diff}`
    ];
  },
  dispose: footerData.onBranchChange(() => tui.requestRender())
}));
```

### 3.4 Welcome Overlay on Session Start

**What:** Branded splash when workflow is active.

```typescript
pi.on("session_start", async (_event, ctx) => {
  if (hasActiveWorkflow()) {
    const workflow = getActiveWorkflow();
    ctx.ui.custom((tui, theme, _kb, done) => ({
      render: (w) => [
        theme.fg("accent", "╔══════════════════════════════╗"),
        theme.fg("accent", "║") + " ".repeat(28) + theme.fg("accent", "║"),
        theme.fg("accent", "║") + theme.fg("success", "  🚀 PRODUCT WORKFLOW  ") + theme.fg("accent", "║"),
        theme.fg("accent", "║") + " ".repeat(28) + theme.fg("accent", "║"),
        theme.fg("accent", "╚══════════════════════════════╝"),
        "",
        `   Workflow: ${workflow.slug}`,
        `   Phase: ${workflow.phase}`,
        `   Status: ${workflow.status}`,
        "",
        theme.fg("dim", "Press Enter to continue...")
      ],
      handleInput: (data) => {
        if (data === "enter") done(undefined);
      },
      invalidate: () => {}
    }), { overlay: true });
  }
});
```

### 3.5 Progress Loader During Phase Execution

**What:** Animated loader during subagent execution.

```typescript
const result = await ctx.ui.custom((tui, theme, _kb, done) => {
  const loader = new BorderedLoader(tui, theme, "Running Shape Up analysis...");
  loader.onAbort = () => done(null);
  
  runSubagents(workflow).then(done).catch(() => done(null));
  
  return loader;
});
```

### 3.6 Phase-Specific Color Themes

**What:** Different accent colors per phase.

| Phase | Color | Why |
|-------|-------|-----|
| Clarify | Blue | Understanding |
| Shape | Green | Definition |
| Bet | Yellow | Commitment |
| Build | Orange | Execution |
| Critique | Purple | Review |
| Gate | Success | Approval |

**Implementation:**
```typescript
const phaseColors = {
  clarify: "accent",
  shape: "success",
  bet: "warning",
  build: "error", // Orange via warning
  critique: "syntaxKeyword",
  gate: "success"
};
```

---

## 4. Recommended Implementation Order

### Phase 1: Basic Status (Quick Win)
1. `ctx.ui.setStatus()` in footer - shows current phase
2. `ctx.ui.notify()` on phase transitions

### Phase 2: Widget (Medium Effort)
1. `ctx.ui.setWidget()` with progress bar
2. Update on phase changes

### Phase 3: Overlay (Higher Effort)
1. Welcome splash on session start
2. Phase completion celebration

### Phase 4: Custom Footer (Advanced)
1. Replace default footer
2. Combine workflow + git + context info

---

## 5. Code Skeleton

```typescript
// extensions/cali-product-workflow/index.ts

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WORKFLOW_DIR = "product-workflow";
const TRACKING_FILE = "cali-product-workflow.json";

interface Workflow {
  slug: string;
  status: string;
  current_phase: string;
}

interface TrackingData {
  workflows: Workflow[];
}

function getActiveWorkflow(cwd: string): Workflow | null {
  const trackingPath = join(cwd, TRACKING_FILE);
  if (!existsSync(trackingPath)) return null;
  
  const tracking: TrackingData = JSON.parse(readFileSync(trackingPath, "utf-8"));
  return tracking.workflows.find(w => w.status === "in-progress") || null;
}

export default function (pi: ExtensionAPI) {
  // 1. Scaffolding on session_start
  pi.on("session_start", async (_event, ctx) => {
    const workflowPath = join(ctx.cwd, WORKFLOW_DIR);
    const trackingPath = join(ctx.cwd, TRACKING_FILE);
    
    // Create workflow directory
    // Create tracking file if not exists
    
    // 2. Show workflow status in footer
    const workflow = getActiveWorkflow(ctx.cwd);
    if (workflow) {
      ctx.ui.setStatus("workflow", 
        ctx.ui.theme.fg("accent", `📍 ${workflow.slug} [${workflow.current_phase}]`)
      );
      
      // 3. Set progress widget
      ctx.ui.setWidget("workflow-progress", (_tui, theme) => ({
        render: (width) => [
          theme.fg("accent", "🚀") + ` Product: ${workflow.slug}`,
          `Phase: ${workflow.current_phase}`
        ],
        invalidate: () => {}
      }));
    }
  });
  
  // 4. Notify on phase transitions
  pi.on("turn_end", async (_event, ctx) => {
    const workflow = getActiveWorkflow(ctx.cwd);
    if (workflow) {
      // Check if phase changed, notify if so
    }
  });
  
  // 5. Clear on session shutdown
  pi.on("session_shutdown", async (_event, ctx) => {
    ctx.ui.setStatus("workflow", undefined);
    ctx.ui.setWidget("workflow-progress", undefined);
  });
}
```

---

## 6. References

- [pi.dev TUI Components](https://pi.dev/docs/latest/tui)
- [pi.dev Extensions](https://pi.dev/docs/latest/extensions)
- [pi-fancy-footer](https://github.com/mavam/pi-fancy-footer)
- [pi-powerbar](https://github.com/juanibiapina/pi-powerbar)
- [pi-powerline-footer](https://github.com/razor-ai/pi-powerline-footer)

---

## 7. Next Steps

1. **Decide** which UI elements to implement first
2. **Create** extension code skeleton
3. **Test** with actual workflow
4. **Iterate** based on UX feedback

---

*Document generated: 2026-05-15*
*Author: Cali*
