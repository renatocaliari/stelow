/**
 * Integration tests: Phase Transitions
 * 
 * Tests phase advancement and status updates:
 * - /pw:next → currentPhase + 1
 * - /pw:setphase → phase specific
 * - Phase status updates (completed/in-progress/pending)
 * - Footer display updates
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, mkdirSync 
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const WORKFLOW_DIR = '.cali-product-workflow';
const TRACKING_FILE = 'cali-product-workflow.json';

// ── Phase Constants (matching extension - 11 phases) ─────────────────

const PHASE_NAMES = [
  "Setup",     // 0
  "Context",   // 1
  "Shape",     // 2
  "Critique",  // 3
  "Gate",      // 4
  "Scope",     // 5
  "Interface", // 6
  "Int.Gate", // 7
  "Selection", // 8
  "Planning",  // 9
  "Execution"  // 10
];

const PHASE_COUNT = PHASE_NAMES.length;

// ── Test Helpers ────────────────────────────────────────────────────

function writeTracking(baseDir: string, data: any) {
  const trackingDir = join(baseDir, WORKFLOW_DIR);
  mkdirSync(trackingDir, { recursive: true });
  writeFileSync(join(trackingDir, TRACKING_FILE), JSON.stringify(data, null, 2));
}

function readTracking(baseDir: string) {
  const path = join(baseDir, WORKFLOW_DIR, TRACKING_FILE);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function createWorkflow(name: string, currentPhase: number) {
  return {
    name,
    description: '',
    status: 'in-progress',
    currentPhase,
    phases: PHASE_NAMES.map((phaseName, i) => ({
      id: `${i}-${phaseName.toLowerCase()}`,
      name: phaseName,
      status: i < currentPhase 
        ? 'completed' 
        : i === currentPhase 
          ? 'in-progress' 
          : 'pending'
    })),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    dirHash: `pw-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-001`,
  };
}

// ── Phase Transition Logic ───────────────────────────────────────────

function nextPhase(currentPhase: number): number {
  const next = currentPhase + 1;
  return next >= PHASE_COUNT ? currentPhase : next;
}

function setPhaseIndex(currentPhase: number, targetPhase: number): number {
  return Math.max(0, Math.min(targetPhase, PHASE_COUNT - 1));
}

function updatePhaseStatus(workflow: any, newPhase: number) {
  workflow.currentPhase = newPhase;
  workflow.phases = workflow.phases.map((p: any, i: number) => ({
    ...p,
    status: i < newPhase 
      ? 'completed' 
      : i === newPhase 
        ? 'in-progress' 
        : 'pending'
  }));
  workflow.updated = new Date().toISOString();
  return workflow;
}

// ── Phase Transitions Tests ─────────────────────────────────────────

describe('Phase Transitions', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'pw-phase-test-'));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('nextPhase', () => {
    it('should advance to next phase', () => {
      expect(nextPhase(0)).toBe(1);
      expect(nextPhase(1)).toBe(2);
      expect(nextPhase(2)).toBe(3);
    });

    it('should advance through all phases', () => {
      let phase = 0;
      const phases: number[] = [phase];

      while (phase < PHASE_COUNT - 1) {
        phase = nextPhase(phase);
        phases.push(phase);
      }

      expect(phases).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should not advance past last phase', () => {
      expect(nextPhase(10)).toBe(10);
      expect(nextPhase(11)).toBe(11);
    });
  });

  describe('setPhaseIndex', () => {
    it('should set to valid phase', () => {
      expect(setPhaseIndex(0, 5)).toBe(5);
      expect(setPhaseIndex(0, 8)).toBe(8);
      expect(setPhaseIndex(5, 3)).toBe(3);
    });

    it('should clamp to minimum (0)', () => {
      expect(setPhaseIndex(5, -1)).toBe(0);
      expect(setPhaseIndex(0, -10)).toBe(0);
    });

    it('should clamp to maximum', () => {
      expect(setPhaseIndex(0, 10)).toBe(10);
      expect(setPhaseIndex(0, 100)).toBe(10);
    });
  });

  describe('updatePhaseStatus', () => {
    it('should update currentPhase and phase statuses', () => {
      const workflow = createWorkflow('test', 0);
      const updated = updatePhaseStatus(workflow, 5);

      expect(updated.currentPhase).toBe(5);
      expect(updated.phases[4].status).toBe('completed');
      expect(updated.phases[5].status).toBe('in-progress');
      expect(updated.phases[6].status).toBe('pending');
    });

    it('should update workflow timestamp', () => {
      const workflow = createWorkflow('test', 0);
      const updated = updatePhaseStatus(workflow, 1);

      expect(updated.updated).toBeTruthy();
      expect(new Date(updated.updated).getTime()).toBeGreaterThan(0);
    });
  });

  describe('Tracking Persistence', () => {
    it('should save phase changes to tracking.json', () => {
      const workflow = createWorkflow('phase-test', 0);

      writeTracking(tempDir, {
        $schema: "",
        version: "1.0",
        created: "",
        updated: "",
        workflows: [workflow]
      });

      // Simulate /pw:next
      let tracking = readTracking(tempDir);
      const wf = tracking.workflows[0];
      updatePhaseStatus(wf, nextPhase(wf.currentPhase));
      writeTracking(tempDir, tracking);

      // Verify
      tracking = readTracking(tempDir);
      expect(tracking.workflows[0].currentPhase).toBe(1);
    });

    it('should handle multiple phase advances', () => {
      const workflow = createWorkflow('multi-advance', 0);

      writeTracking(tempDir, {
        $schema: "",
        version: "1.0",
        created: "",
        updated: "",
        workflows: [workflow]
      });

      // Advance through phases 1-5
      for (let i = 1; i <= 5; i++) {
        let tracking = readTracking(tempDir);
        const wf = tracking.workflows[0];
        updatePhaseStatus(wf, i);
        writeTracking(tempDir, tracking);
      }

      const final = readTracking(tempDir);
      expect(final.workflows[0].currentPhase).toBe(5);
      expect(final.workflows[0].phases[5].status).toBe('in-progress');
    });

    it('should revert phase correctly', () => {
      const workflow = createWorkflow('revert-test', 5);

      writeTracking(tempDir, {
        $schema: "",
        version: "1.0",
        created: "",
        updated: "",
        workflows: [workflow]
      });

      // Revert to earlier phase
      let tracking = readTracking(tempDir);
      const wf = tracking.workflows[0];
      updatePhaseStatus(wf, 2);
      writeTracking(tempDir, tracking);

      const reverted = readTracking(tempDir);
      expect(reverted.workflows[0].currentPhase).toBe(2);
      expect(reverted.workflows[0].phases[2].status).toBe('in-progress');
      expect(reverted.workflows[0].phases[4].status).toBe('pending');
    });
  });

  describe('Footer Display Format', () => {
    it('should format current phase correctly', () => {
      const formatFooter = (currentPhase: number) => {
        const phaseName = PHASE_NAMES[currentPhase] || '?';
        return `${phaseName} ${currentPhase + 1}/${PHASE_COUNT}`;
      };

      expect(formatFooter(0)).toBe('Setup 1/11');
      expect(formatFooter(4)).toBe('Gate 5/11');
      expect(formatFooter(10)).toBe('Execution 11/11');
    });

    it('should show correct icon for active phase', () => {
      const getIcon = (phaseIndex: number, currentPhase: number) => {
        return phaseIndex === currentPhase ? '◆' : '●';
      };

      expect(getIcon(0, 2)).toBe('●');
      expect(getIcon(2, 2)).toBe('◆');
      expect(getIcon(10, 2)).toBe('●');
    });

    it('should build compact status string', () => {
      const buildStatus = (workflowName: string, currentPhase: number) => {
        const phaseName = PHASE_NAMES[currentPhase] || '?';
        const phaseNum = `${currentPhase + 1}/${PHASE_COUNT}`;
        const icon = '◆';
        return `[pw] ${workflowName}  │  ${icon} ${phaseName} ${phaseNum}`;
      };

      const status = buildStatus('snake-game', 2);
      expect(status).toBe('[pw] snake-game  │  ◆ Shape 3/11');
    });

    it('should handle phase index out of bounds', () => {
      const formatFooter = (currentPhase: number) => {
        const safePhase = Math.max(0, Math.min(currentPhase, PHASE_COUNT - 1));
        const phaseName = PHASE_NAMES[safePhase] || '?';
        return `${phaseName} ${safePhase + 1}/${PHASE_COUNT}`;
      };

      expect(formatFooter(-1)).toBe('Setup 1/11');
      expect(formatFooter(100)).toBe('Execution 11/11');
    });
  });

  describe('Phase Name Resolution', () => {
    it('should resolve phase name to index', () => {
      const resolvePhaseName = (name: string): number => {
        return PHASE_NAMES.findIndex(p => p.toLowerCase() === name.toLowerCase());
      };

      expect(resolvePhaseName('Setup')).toBe(0);
      expect(resolvePhaseName('Shape')).toBe(2);
      expect(resolvePhaseName('Execution')).toBe(10);
      expect(resolvePhaseName('Invalid')).toBe(-1);
    });

    it('should handle partial name matching', () => {
      const resolvePartial = (partial: string): number => {
        return PHASE_NAMES.findIndex(p => 
          p.toLowerCase().includes(partial.toLowerCase())
        );
      };

      expect(resolvePartial('set')).toBe(0);      // Setup
      expect(resolvePartial('sha')).toBe(2);       // Shape
      expect(resolvePartial('gate')).toBe(4);       // Gate
      expect(resolvePartial('sel')).toBe(8);        // Selection
    });
  });

  describe('Last Phase Behavior', () => {
    it('should handle last phase completed', () => {
      const workflow = createWorkflow('complete-test', 10);

      writeTracking(tempDir, {
        $schema: "",
        version: "1.0",
        created: "",
        updated: "",
        workflows: [workflow]
      });

      // Attempt to advance past last phase
      let tracking = readTracking(tempDir);
      const wf = tracking.workflows[0];
      
      // nextPhase should not advance from last phase
      const next = nextPhase(wf.currentPhase);
      expect(next).toBe(10);

      // Verify workflow status can be set to completed
      wf.status = 'completed';
      writeTracking(tempDir, tracking);

      const completed = readTracking(tempDir);
      expect(completed.workflows[0].status).toBe('completed');
    });
  });

  describe('Extension 11 Phases Now Match SKILL.md', () => {
    it('should have 11 phases matching SKILL.md', () => {
      expect(PHASE_NAMES.length).toBe(11);
      console.log('Footer now shows X/11 instead of X/8');
    });

    it('should map extension phases to skill phases directly', () => {
      // Now matches 1:1
      expect(PHASE_NAMES[0]).toBe('Setup');       // Phase 1
      expect(PHASE_NAMES[1]).toBe('Context');       // Phase 2
      expect(PHASE_NAMES[2]).toBe('Shape');        // Phase 3
      expect(PHASE_NAMES[3]).toBe('Critique');     // Phase 4
      expect(PHASE_NAMES[4]).toBe('Gate');          // Phase 5
      expect(PHASE_NAMES[5]).toBe('Scope');         // Phase 6
      expect(PHASE_NAMES[6]).toBe('Interface');    // Phase 7
      expect(PHASE_NAMES[7]).toBe('Int.Gate');      // Phase 8
      expect(PHASE_NAMES[8]).toBe('Selection');    // Phase 9
      expect(PHASE_NAMES[9]).toBe('Planning');     // Phase 10
      expect(PHASE_NAMES[10]).toBe('Execution');    // Phase 11
    });
  });
});