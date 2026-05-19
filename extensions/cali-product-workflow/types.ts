// ── Constants ────────────────────────────────────────────────────────

export const WORKFLOW_DIR = ".cali-product-workflow";
export const TRACKING_FILE = "cali-product-workflow.json";
export const GLOBAL_TRACKING_FILE = ".cali-product-workflow-global.json";
export const SCHEMA_URL =
  "https://raw.githubusercontent.com/renatocaliari/pi-product-workflow/main/cali-product-workflow.schema.json";

export const PHASE_NAMES = [
  "Setup",     // 0 — Phase 1: Project Setup
  "Context",   // 1 — Phase 2: Strategic Context (optional)
  "Shape",     // 2 — Phase 3: Shape Up Planning
  "Interface", // 3 — Phase 4: Interface Brainstorming
  "Critique",  // 4 — Phase 5: Plan Critique
  "Gate",      // 5 — Phase 6: Review Gate
  "Planning",  // 6 — Phase 7: Tech Planning
  "Execution"  // 7 — Phase 8: Supervisor + Execution
];

/** Display hints shown in compact TUI per phase — placeholder until real artifact counts exist */
export const PHASE_HINTS: Record<number, string> = {
  0: "setup",
  1: "context",
  2: "scopes",
  3: "proposals",
  4: "gaps",
  5: "review",
  6: "DoDs",
  7: "done"
};

// ── Types ────────────────────────────────────────────────────────────

export interface ParsedInput {
  sources: string[];
  draftText: string;
}

export interface Phase {
  id: string;
  name: string;
  status: string;
  started?: string;
  completed?: string;
}

export interface Workflow {
  name: string;       // Human-readable display name (may change via rename)
  description: string;
  draftContent?: string;
  source?: string;
  status: string;      // in-progress | paused | completed | archived
  currentPhase: number;
  phases: Phase[];
  created: string;
  updated: string;
  cwd?: string;
  worktreePath?: string;  // Path to git worktree if created for execution
  dirHash?: string;       // Stable directory name (e.g., pw-ollc-whkaxv) — REQUIRED for rename/archive operations
}

export interface TrackingData {
  $schema: string;
  version: string;
  created: string;
  updated: string;
  workflows: Workflow[];
}
