import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, basename, dirname, extname } from "node:path";

const WORKFLOW_DIR = "product-workflow";
const TRACKING_FILE = "cali-product-workflow.json";
const GLOBAL_TRACKING_FILE = ".cali-product-workflow-global.json";
const SCHEMA_URL = "https://raw.githubusercontent.com/renatocaliari/pi-product-workflow/main/cali-product-workflow.schema.json";

// Phases matching the skill exactly (Fase 0 through Fase 6)
const PHASE_NAMES = [
  "Clarify",   // Fase 0: Initial questions
  "Shape",     // Fase 1: Shape Up
  "Interface", // Fase 2: Interface Brainstorming (conditional)
  "Critique",  // Fase 3: Plan Critique
  "Gate",      // Fase 4: Review Gate
  "Planning",  // Fase 5: Tech Planning
  "Execution"  // Fase 6: Supervisor + Execution
];

// Shared state for input parsing
interface ParsedInput {
  sources: string[];
  draftText: string;
}

const parsedInputStore: Map<string, ParsedInput> = new Map();

interface Phase {
  id: string;
  name: string;
  status: string;
  started?: string;
  completed?: string;
}

interface Workflow {
  slug: string;
  name: string;
  description: string;
  draftContent?: string;
  source?: string;
  status: string;
  currentPhase: number;
  phases: Phase[];
  created: string;
  updated: string;
  cwd?: string;
}

interface TrackingData {
  $schema: string;
  version: string;
  created: string;
  updated: string;
  workflows: Workflow[];
}

// ============ INPUT PARSING ============

const FILE_REF_REGEX = /@[\w\-\/\.]+(?::\d+(?::\d+)?)?/g;

function parseInputForWorkflow(input: string): { sources: string[], draftText: string } {
  const sources: string[] = [];
  
  const matches = input.match(FILE_REF_REGEX);
  if (matches) {
    for (const match of matches) {
      let filePath = match.slice(1).split(':')[0];
      if (!filePath.startsWith('./') && !filePath.startsWith('/')) {
        filePath = './' + filePath;
      }
      sources.push(filePath);
    }
  }
  
  let text = input
    .replace(FILE_REF_REGEX, ' ')
    .replace(/\/[a-z-]+(\s|$)/gi, ' ')
    .replace(/[a-z]+=[^\s]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return { sources, draftText: text };
}

// ============ STATE MANAGEMENT ============

function getTrackingPath(cwd: string): string {
  return join(cwd, TRACKING_FILE);
}

function getGlobalTrackingPath(): string {
  const home = process.env.HOME || dirname(process.cwd());
  return join(home, GLOBAL_TRACKING_FILE);
}

function readTracking(cwd: string): TrackingData | null {
  const path = getTrackingPath(cwd);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function readGlobalTracking(): TrackingData | null {
  const path = getGlobalTrackingPath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function writeTracking(cwd: string, data: TrackingData): void {
  writeFileSync(getTrackingPath(cwd), JSON.stringify(data, null, 2));
}

function writeGlobalTracking(data: TrackingData): void {
  writeFileSync(getGlobalTrackingPath(), JSON.stringify(data, null, 2));
}

function getActiveWorkflow(cwd: string): Workflow | null {
  const tracking = readTracking(cwd);
  if (!tracking) return null;
  return tracking.workflows.find(w => w.status === "in-progress") || null;
}

function getActiveWorkflowGlobal(): Workflow | null {
  const tracking = readGlobalTracking();
  if (!tracking) return null;
  return tracking.workflows.find(w => w.status === "in-progress") || null;
}

function generateSlug(): string {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6);
  return `workflow-${timestamp}-${random}`;
}

function readSourceFile(sourcePath: string): string | null {
  if (!sourcePath.startsWith('./') && !sourcePath.startsWith('/')) {
    sourcePath = './' + sourcePath;
  }
  if (!existsSync(sourcePath)) return null;
  try {
    const stat = statSync(sourcePath);
    if (stat.isDirectory()) return `Directory: ${sourcePath}`;
    return readFileSync(sourcePath, "utf-8").slice(0, 50000);
  } catch {
    return null;
  }
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 100) + "\n\n[... truncated ...]";
}

// ============ UI HELPERS ============

function getStatusText(workflow: Workflow): string {
  const phaseName = PHASE_NAMES[workflow.currentPhase] || "Unknown";
  return `${workflow.slug} [${phaseName}]`;
}

function getStatusLines(workflow: Workflow, theme: any): string[] {
  const lines = [
    theme.fg("accent", "▶") + " " + theme.fg("text", "Workflow:"),
    "  " + theme.fg("success", workflow.slug),
    "  " + theme.fg("muted", "Phase:") + " " + theme.fg("accent", `${workflow.currentPhase + 1}/${PHASE_NAMES.length}`),
    "  " + theme.fg("muted", "Stage:") + " " + theme.fg("text", PHASE_NAMES[workflow.currentPhase])
  ];
  
  // Show phase list
  lines.push("");
  const phaseList = PHASE_NAMES.map((name, i) => {
    if (i < workflow.currentPhase) {
      return theme.fg("success", "✓") + " " + theme.fg("muted", name);
    } else if (i === workflow.currentPhase) {
      return theme.fg("accent", "▶") + " " + theme.fg("accent", name);
    } else {
      return theme.fg("dim", "○") + " " + theme.fg("dim", name);
    }
  }).join("  ");
  lines.push(phaseList);
  
  return lines;
}

function updateWorkflowUI(ctx: ExtensionContext, cwd: string): void {
  if (!ctx.ui) return;
  
  const workflow = getActiveWorkflow(cwd);
  
  if (!workflow) {
    ctx.ui.setStatus("workflow", undefined);
    ctx.ui.setWidget("workflow-status", undefined);
    return;
  }
  
  const statusText = getStatusText(workflow);
  ctx.ui.setStatus("workflow", ctx.ui.theme.fg("accent", "▶ " + statusText));
  
  // Simple status widget - just shows current state, no progress bar
  ctx.ui.setWidget("workflow-status", (_tui, theme) => ({
    render: (_width) => getStatusLines(workflow, theme),
    invalidate: () => {}
  }), { placement: "aboveEditor" });
}

function notifyPhaseChange(ctx: ExtensionContext, workflow: Workflow, oldPhase: number): void {
  if (!ctx.ui) return;
  if (oldPhase !== workflow.currentPhase) {
    const phaseName = PHASE_NAMES[workflow.currentPhase] || "Unknown";
    ctx.ui.notify(
      `▶ Workflow: ${workflow.slug} — Phase ${workflow.currentPhase + 1}: ${phaseName}`,
      "info"
    );
  }
}

// ============ COMMANDS ============

function registerCommands(pi: ExtensionAPI): void {
  
  // /product-workflow-start
  pi.registerCommand("product-workflow-start", {
    description: "Start a new Workflow. Auto-generates slug if not provided. Parses @filename references as source files and trailing text as draft content.",
    handler: async (args, ctx) => {
      const sessionId = ctx.sessionId || "default";
      const parsed = parsedInputStore.get(sessionId) || { sources: [], draftText: "" };
      
      let slug = args?.slug;
      const name = args?.name;
      const description = args?.description;
      const sources = args?.source ? [args.source] : parsed.sources;
      const draftText = args?.description || parsed.draftText;
      
      if (!slug) {
        if (draftText && draftText.length > 3) {
          slug = draftText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim().split(/\s+/).slice(0, 3).join('-');
          slug = slug.replace(/[^a-z0-9-]/g, '').slice(0, 40);
          if (slug.length < 3) slug = generateSlug();
        } else if (sources.length > 0) {
          const srcName = basename(sources[0], extname(sources[0]));
          slug = srcName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40);
          if (slug.length < 3) slug = generateSlug();
        } else {
          slug = generateSlug();
        }
      }
      
      slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      
      let tracking = readTracking(ctx.cwd);
      if (!tracking) {
        tracking = { "$schema": SCHEMA_URL, "version": "1.0", "created": new Date().toISOString(), "updated": new Date().toISOString(), "workflows": [] };
      }
      
      if (tracking.workflows.some(w => w.slug === slug)) {
        return `Workflow '${slug}' already exists.\nUse /product-workflow-status to see it.`;
      }
      
      let allSourceContent = "";
      for (const src of sources) {
        const content = readSourceFile(src);
        if (content) allSourceContent += `\n\n=== FILE: ${src} ===\n${content}\n`;
      }
      
      let fullDraft = draftText ? `### Initial Draft\n\n${draftText}\n\n` : "";
      if (allSourceContent) fullDraft += allSourceContent;
      
      const workflow: Workflow = {
        slug, name: name || slug, description: truncateText(draftText, 500) || "",
        draftContent: fullDraft ? truncateText(fullDraft, 5000) : undefined,
        source: sources.length > 0 ? sources[0] : undefined,
        status: "in-progress", currentPhase: 0,
        phases: PHASE_NAMES.map((name, i) => ({ id: `${i}-${name.toLowerCase()}`, name, status: i === 0 ? "in-progress" : "pending" })),
        created: new Date().toISOString(), updated: new Date().toISOString(), cwd: ctx.cwd
      };
      
      tracking.workflows.push(workflow);
      writeTracking(ctx.cwd, tracking);
      
      // Create proper workflow directory structure for skill auto-detection
      const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const workflowDir = join(ctx.cwd, WORKFLOW_DIR, dateStr, slug);
      mkdirSync(workflowDir, { recursive: true });
      mkdirSync(join(workflowDir, "specs"), { recursive: true });
      mkdirSync(join(workflowDir, "interfaces"), { recursive: true });
      mkdirSync(join(workflowDir, "plans"), { recursive: true });
      mkdirSync(join(workflowDir, "plans", "scopes"), { recursive: true });
      mkdirSync(join(workflowDir, "critiques"), { recursive: true });
      mkdirSync(join(workflowDir, "approvals"), { recursive: true });
      mkdirSync(join(workflowDir, "sessions"), { recursive: true });
      
      // Create index.json for skill auto-discovery
      const indexPath = join(workflowDir, "index.json");
      const indexData = {
        version: "1.0",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug,
        workflow_status: "in-progress",
        current_phase: "clarify",
        current_phase_index: 0,
        artifacts: {},
        approved: false,
        approved_at: null,
        draft: fullDraft ? truncateText(fullDraft, 10000) : undefined,
        sources
      };
      writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
      
      const globalTracking = readGlobalTracking() || { "$schema": SCHEMA_URL, "version": "1.0", "created": new Date().toISOString(), "updated": new Date().toISOString(), "workflows": [] };
      globalTracking.workflows.push(workflow);
      writeGlobalTracking(globalTracking);
      
      updateWorkflowUI(ctx, ctx.cwd);
      parsedInputStore.delete(sessionId);
      
      const lines: string[] = [`✅ Workflow '${slug}' started!`, `Stage: ${PHASE_NAMES[0]}`, `Project: ${ctx.cwd}`];
      if (sources.length > 0) lines.push(`📎 Sources: ${sources.join(', ')}`);
      if (draftText) lines.push(`\n📝 Draft:\n${draftText.slice(0, 300)}${draftText.length > 300 ? '...' : ''}`);
      if (allSourceContent) lines.push(`\n📄 Source content loaded`);
      lines.push("");
      lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      lines.push("📋 NEXT STEP REQUIRED:");
      lines.push("");
      lines.push("  Type: /skill:cali-product-workflow");
      lines.push("");
      lines.push("  This will start Phase 1 (Shape Up) and ask you");
      lines.push("  the clarifying questions before planning.");
      lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      return lines.join("\n");
    }
  });
  
  // /product-workflow-stop
  pi.registerCommand("product-workflow-stop", {
    description: "Stop the Workflow immediately and clear all UI.",
    handler: async (args, ctx) => {
      const workflow = getActiveWorkflow(ctx.cwd);
      if (!workflow) {
        const global = getActiveWorkflowGlobal();
        if (global) {
          const globalTracking = readGlobalTracking();
          if (globalTracking) {
            globalTracking.workflows = globalTracking.workflows.filter(w => w.slug !== global.slug);
            writeGlobalTracking(globalTracking);
          }
          ctx.ui.setStatus("workflow", undefined);
          ctx.ui.setWidget("workflow-status", undefined);
          ctx.ui.notify("Workflow stopped", "info");
          return `❌ Workflow '${global.slug}' stopped.\nUI cleared.`;
        }
        return "No active Workflow to stop.";
      }
      
      ctx.ui.setStatus("workflow", undefined);
      ctx.ui.setWidget("workflow-status", undefined);
      
      const tracking = readTracking(ctx.cwd);
      if (tracking) {
        tracking.workflows = tracking.workflows.filter(w => w.slug !== workflow.slug);
        writeTracking(ctx.cwd, tracking);
      }
      
      const globalTracking = readGlobalTracking();
      if (globalTracking) {
        globalTracking.workflows = globalTracking.workflows.filter(w => w.slug !== workflow.slug);
        writeGlobalTracking(globalTracking);
      }
      
      ctx.ui.notify("Workflow stopped", "info");
      
      return `❌ Workflow '${workflow.slug}' stopped.\nUI cleared.\nStart new with /product-workflow-start`;
    }
  });
  
  // /product-workflow-pause
  pi.registerCommand("product-workflow-pause", {
    description: "Pause the Workflow (keeps state for later).",
    handler: async (args, ctx) => {
      const workflow = getActiveWorkflow(ctx.cwd);
      if (!workflow) return "No active Workflow to pause.\nUse /product-workflow-list to see all.";
      
      const tracking = readTracking(ctx.cwd);
      if (tracking) {
        const idx = tracking.workflows.findIndex(w => w.slug === workflow.slug);
        if (idx !== -1) tracking.workflows[idx].status = "paused";
        writeTracking(ctx.cwd, tracking);
      }
      
      const globalTracking = readGlobalTracking();
      if (globalTracking) {
        const idx = globalTracking.workflows.findIndex(w => w.slug === workflow.slug);
        if (idx !== -1) globalTracking.workflows[idx].status = "paused";
        writeGlobalTracking(globalTracking);
      }
      
      if (ctx.ui) ctx.ui.setStatus("workflow", ctx.ui.theme.fg("warning", "⏸ " + workflow.slug));
      
      return `⏸ Workflow '${workflow.slug}' paused.\nResume with /product-workflow-resume`;
    }
  });
  
  // /product-workflow-resume
  pi.registerCommand("product-workflow-resume", {
    description: "Resume a paused Workflow. Optionally specify slug.",
    handler: async (args, ctx) => {
      const slug = args?.slug;
      const tracking = readTracking(ctx.cwd);
      const globalTracking = readGlobalTracking();
      
      let paused = tracking?.workflows.find(w => w.status === "paused");
      if (!paused && globalTracking) paused = globalTracking.workflows.find(w => w.status === "paused");
      
      if (!paused) {
        return slug ? `Paused workflow '${slug}' not found.` : "No paused Workflow.\nUse /product-workflow-list\nOr: /product-workflow-resume slug=my-workflow";
      }
      
      const target = slug ? (tracking?.workflows.find(w => w.slug === slug && w.status === "paused") || globalTracking?.workflows.find(w => w.slug === slug && w.status === "paused")) : paused;
      if (!target) return `Paused workflow '${slug || "unknown"}' not found.`;
      
      if (tracking) {
        const idx = tracking.workflows.findIndex(w => w.slug === target.slug);
        if (idx !== -1) tracking.workflows[idx].status = "in-progress";
        writeTracking(ctx.cwd, tracking);
      }
      
      if (globalTracking) {
        const idx = globalTracking.workflows.findIndex(w => w.slug === target.slug);
        if (idx !== -1) globalTracking.workflows[idx].status = "in-progress";
        writeGlobalTracking(globalTracking);
      }
      
      updateWorkflowUI(ctx, ctx.cwd);
      
      return `▶️ Workflow '${target.slug}' resumed.\nStage: ${PHASE_NAMES[target.currentPhase]}`;
    }
  });
  
  // /product-workflow-status
  pi.registerCommand("product-workflow-status", {
    description: "Show current Workflow status.",
    handler: async (args, ctx) => {
      const workflow = getActiveWorkflow(ctx.cwd);
      
      if (!workflow) {
        const global = getActiveWorkflowGlobal();
        if (global) {
          return `▶️ Workflow: ${global.slug}\nStage: ${PHASE_NAMES[global.currentPhase]}\nProject: ${global.cwd}\n\ncd ${global.cwd} to continue.`;
        }
        
        return "No active Workflow.\n\nStart one:\n  /product-workflow-start\n  /product-workflow-start @brief.md\n  /product-workflow-start @doc.md \"extra context\"";
      }
      
      const lines: string[] = [`▶️ Workflow: ${workflow.slug}`, `Stage: ${workflow.currentPhase + 1}/${PHASE_NAMES.length} — ${PHASE_NAMES[workflow.currentPhase]}`];
      if (workflow.name !== workflow.slug) lines.push(`Name: ${workflow.name}`);
      if (workflow.source) lines.push(`Source: ${workflow.source}`);
      if (workflow.draftContent) {
        lines.push("", `Draft preview:`);
        lines.push(workflow.draftContent.slice(0, 400) + (workflow.draftContent.length > 400 ? '...' : ''));
      }
      
      lines.push("", "Stages:");
      workflow.phases.forEach((p, i) => {
        const icon = p.status === "completed" ? "✓" : p.status === "in-progress" ? "▶" : "○";
        const prefix = i === workflow.currentPhase ? "▶ " : "  ";
        lines.push(`${prefix}${icon} ${i + 1}. ${p.name}`);
      });
      
      return lines.join("\n");
    }
  });
  
  // /product-workflow-list
  pi.registerCommand("product-workflow-list", {
    description: "List all Workflows in current project and global.",
    handler: async (args, ctx) => {
      const lines: string[] = [];
      const tracking = readTracking(ctx.cwd);
      
      if (tracking && tracking.workflows.length > 0) {
        lines.push("📁 Current Project:");
        for (const w of tracking.workflows) {
          const icon = w.status === "in-progress" ? "▶" : w.status === "paused" ? "⏸" : w.status === "completed" ? "✓" : "○";
          lines.push(`  ${icon} ${w.slug} — ${PHASE_NAMES[w.currentPhase]}`);
        }
        lines.push("");
      }
      
      const globalTracking = readGlobalTracking();
      if (globalTracking && globalTracking.workflows.length > 0) {
        const globalOnly = globalTracking.workflows.filter(w => !tracking?.workflows.some(tw => tw.slug === w.slug));
        if (globalOnly.length > 0) {
          lines.push("🌐 Other Projects:");
          for (const w of globalOnly) {
            const icon = w.status === "in-progress" ? "▶" : w.status === "paused" ? "⏸" : w.status === "completed" ? "✓" : "○";
            lines.push(`  ${icon} ${w.slug} — ${PHASE_NAMES[w.currentPhase]}`);
            lines.push(`     ${w.cwd}`);
          }
        }
      }
      
      return lines.length === 0 ? "No Workflows found.\nStart one with /product-workflow-start" : lines.join("\n");
    }
  });
  
  // /product-workflow-setphase
  pi.registerCommand("product-workflow-setphase", {
    description: "Set current phase. 0=Clarify, 1=Shape, 2=Interface, 3=Critique, 4=Gate, 5=Planning, 6=Execution",
    handler: async (args, ctx) => {
      const phaseArg = args?.phase;
      const phaseName = args?.phasename;
      
      let phase: number | null = null;
      if (phaseArg !== undefined) {
        phase = parseInt(String(phaseArg));
      } else if (phaseName) {
        phase = PHASE_NAMES.findIndex(p => p.toLowerCase() === String(phaseName).toLowerCase());
      }
      
      if (phase === null || isNaN(phase) || phase < 0 || phase >= PHASE_NAMES.length) {
        return `Usage: /product-workflow-setphase phase=N\n\nPhases:\n${PHASE_NAMES.map((name, i) => `  ${i}: ${name}`).join("\n")}`;
      }
      
      const workflow = getActiveWorkflow(ctx.cwd);
      if (!workflow) return "No active Workflow.\nStart with /product-workflow-start";
      
      const oldPhase = workflow.currentPhase;
      
      const tracking = readTracking(ctx.cwd);
      if (tracking) {
        const idx = tracking.workflows.findIndex(w => w.slug === workflow.slug);
        if (idx !== -1) {
          tracking.workflows[idx].currentPhase = phase;
          tracking.workflows[idx].phases.forEach((p, i) => {
            if (i < phase!) p.status = "completed";
            else if (i === phase!) p.status = "in-progress";
            else p.status = "pending";
          });
          tracking.workflows[idx].updated = new Date().toISOString();
          writeTracking(ctx.cwd, tracking);
          workflow.currentPhase = phase;
          workflow.phases = tracking.workflows[idx].phases;
        }
      }
      
      const globalTracking = readGlobalTracking();
      if (globalTracking) {
        const idx = globalTracking.workflows.findIndex(w => w.slug === workflow.slug);
        if (idx !== -1) globalTracking.workflows[idx].currentPhase = phase;
        writeGlobalTracking(globalTracking);
      }
      
      updateWorkflowUI(ctx, ctx.cwd);
      if (oldPhase !== phase) notifyPhaseChange(ctx, workflow, oldPhase);
      
      return `▶️ Phase set: ${PHASE_NAMES[phase!]} (${phase! + 1}/${PHASE_NAMES.length})\nUI updated.`;
    }
  });
  
  // /product-workflow-next
  pi.registerCommand("product-workflow-next", {
    description: "Advance Workflow to next phase.",
    handler: async (args, ctx) => {
      const workflow = getActiveWorkflow(ctx.cwd);
      if (!workflow) return "No active Workflow.\nStart with /product-workflow-start";
      
      const nextPhase = workflow.currentPhase + 1;
      if (nextPhase >= PHASE_NAMES.length) {
        return `Workflow '${workflow.slug}' is complete.\nUse /product-workflow-complete to finish.`;
      }
      
      const tracking = readTracking(ctx.cwd);
      if (tracking) {
        const idx = tracking.workflows.findIndex(w => w.slug === workflow.slug);
        if (idx !== -1) {
          tracking.workflows[idx].currentPhase = nextPhase;
          tracking.workflows[idx].phases.forEach((p, i) => {
            if (i < nextPhase) p.status = "completed";
            else if (i === nextPhase) p.status = "in-progress";
            else p.status = "pending";
          });
          tracking.workflows[idx].updated = new Date().toISOString();
          writeTracking(ctx.cwd, tracking);
          workflow.currentPhase = nextPhase;
        }
      }
      
      const globalTracking = readGlobalTracking();
      if (globalTracking) {
        const idx = globalTracking.workflows.findIndex(w => w.slug === workflow.slug);
        if (idx !== -1) globalTracking.workflows[idx].currentPhase = nextPhase;
        writeGlobalTracking(globalTracking);
      }
      
      updateWorkflowUI(ctx, ctx.cwd);
      notifyPhaseChange(ctx, workflow, nextPhase - 1);
      
      return `✅ Moved to: ${PHASE_NAMES[nextPhase]} (${nextPhase + 1}/${PHASE_NAMES.length})`;
    }
  });
  
  // /product-workflow-complete
  pi.registerCommand("product-workflow-complete", {
    description: "Mark Workflow as completed.",
    handler: async (args, ctx) => {
      const workflow = getActiveWorkflow(ctx.cwd);
      if (!workflow) return "No active Workflow to complete.";
      
      ctx.ui.setStatus("workflow", undefined);
      ctx.ui.setWidget("workflow-status", undefined);
      
      const tracking = readTracking(ctx.cwd);
      if (tracking) {
        const idx = tracking.workflows.findIndex(w => w.slug === workflow.slug);
        if (idx !== -1) {
          tracking.workflows[idx].status = "completed";
          tracking.workflows[idx].updated = new Date().toISOString();
          writeTracking(ctx.cwd, tracking);
        }
      }
      
      const globalTracking = readGlobalTracking();
      if (globalTracking) {
        const idx = globalTracking.workflows.findIndex(w => w.slug === workflow.slug);
        if (idx !== -1) globalTracking.workflows[idx].status = "completed";
        writeGlobalTracking(globalTracking);
      }
      
      ctx.ui.notify(`🎉 Workflow '${workflow.slug}' completed!`, "info");
      
      return `🎉 Workflow '${workflow.slug}' completed!\nAll stages finished.`;
    }
  });
  
  // /product-workflow-goto
  pi.registerCommand("product-workflow-goto", {
    description: "Show how to navigate to a Workflow in another project.",
    handler: async (args, ctx) => {
      const slug = args?.slug;
      const globalTracking = readGlobalTracking();
      if (!globalTracking) return "No global Workflows found.";
      
      const workflow = slug ? globalTracking.workflows.find(w => w.slug === slug) : globalTracking.workflows.find(w => w.status === "in-progress");
      
      if (!workflow) return `Workflow '${slug || "active"}' not found.\nUse /product-workflow-list to see all.`;
      
      return `📍 Workflow: ${workflow.slug}\nProject: ${workflow.cwd}\nStage: ${PHASE_NAMES[workflow.currentPhase]}\n\nTo continue:\n  1. cd ${workflow.cwd}\n  2. /product-workflow-resume slug=${workflow.slug}`;
    }
  });
}

// ============ MAIN EXTENSION ============

export default function (pi: ExtensionAPI) {
  
  // 0. Parse input for @filename refs and draft text
  pi.on("input", async (event, ctx) => {
    if (!event.text.startsWith("/product-workflow-start")) return;
    
    const sessionId = ctx.sessionId || "default";
    const parsed = parseInputForWorkflow(event.text);
    
    if (parsed.sources.length > 0 || parsed.draftText) {
      parsedInputStore.set(sessionId, parsed);
    }
  });
  
  // 1. Scaffolding on session_start
  pi.on("session_start", async (_event, ctx) => {
    const workflowPath = join(ctx.cwd, WORKFLOW_DIR);
    mkdirSync(workflowPath, { recursive: true });
    
    const trackingPath = getTrackingPath(ctx.cwd);
    if (!existsSync(trackingPath)) {
      const template: TrackingData = { "$schema": SCHEMA_URL, "version": "1.0", "created": new Date().toISOString(), "updated": new Date().toISOString(), "workflows": [] };
      writeFileSync(trackingPath, JSON.stringify(template, null, 2));
    }
    
    registerCommands(pi);
    
    if (ctx.ui) {
      updateWorkflowUI(ctx, ctx.cwd);
      
      const workflow = getActiveWorkflow(ctx.cwd);
      if (workflow) {
        ctx.ui.notify(`▶ Workflow active: ${workflow.slug} (${PHASE_NAMES[workflow.currentPhase]})`, "info");
      } else {
        const globalTracking = readGlobalTracking();
        if (globalTracking) {
          const projectWorkflow = globalTracking.workflows.find(w => w.cwd === ctx.cwd && w.status !== "completed");
          if (projectWorkflow) {
            const tracking = readTracking(ctx.cwd);
            if (tracking && !tracking.workflows.some(w => w.slug === projectWorkflow.slug)) {
              tracking.workflows.push(projectWorkflow);
              writeTracking(ctx.cwd, tracking);
            }
            updateWorkflowUI(ctx, ctx.cwd);
            ctx.ui.notify(`▶ Found: ${projectWorkflow.slug} (${PHASE_NAMES[projectWorkflow.currentPhase]})`, "info");
          }
        }
      }
    }
  });
  
  // 2. Watch for file changes (skill updates tracking file)
  pi.on("tool_call", async (event, ctx) => {
    // Check if write tool was called on tracking file
    if (event.input?.path && event.input.path.includes(TRACKING_FILE)) {
      // File was modified - update UI
      if (ctx.ui) {
        const workflow = getActiveWorkflow(ctx.cwd);
        if (workflow) {
          updateWorkflowUI(ctx, ctx.cwd);
        }
      }
    }
  });
  
  // 3. Check for phase changes on turn end
  pi.on("turn_end", async (_event, ctx) => {
    const workflow = getActiveWorkflow(ctx.cwd);
    if (!workflow || !ctx.ui) return;
    
    // Check if tracking file was updated (skill may have changed phase)
    const tracking = readTracking(ctx.cwd);
    if (tracking) {
      const current = tracking.workflows.find(w => w.slug === workflow.slug);
      if (current && current.currentPhase !== workflow.currentPhase) {
        const oldPhase = workflow.currentPhase;
        workflow.currentPhase = current.currentPhase;
        updateWorkflowUI(ctx, ctx.cwd);
        notifyPhaseChange(ctx, workflow, oldPhase);
      }
    }
  });
  
  // 4. Update on agent_end
  pi.on("agent_end", async (_event, ctx) => {
    if (!ctx.ui) return;
    const currentWorkflow = getActiveWorkflow(ctx.cwd);
    if (currentWorkflow) updateWorkflowUI(ctx, ctx.cwd);
  });
}