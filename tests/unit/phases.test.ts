/**
 * Unit tests: Phases
 * 
 * Tests phase-related utilities and constants:
 * - PHASE_NAMES length and order (11 phases)
 * - Phase index mapping
 * - Phase transitions (next, set)
 * - Phase status updates
 */
import { describe, it, expect } from 'vitest';
import {
  PHASE_NAMES,
  PHASE_HINTS,
  type Phase,
  type Workflow,
} from '../../extensions/cali-product-workflow/types';

// ── Constants ───────────────────────────────────────────────────────

describe('PHASE_NAMES Constants', () => {
  it('should have 11 phases (matching SKILL.md)', () => {
    expect(PHASE_NAMES).toHaveLength(11);
  });

  it('should have phases in correct order', () => {
    expect(PHASE_NAMES[0]).toBe('Setup');
    expect(PHASE_NAMES[1]).toBe('Context');
    expect(PHASE_NAMES[2]).toBe('Shape');
    expect(PHASE_NAMES[3]).toBe('Critique');
    expect(PHASE_NAMES[4]).toBe('Gate');
    expect(PHASE_NAMES[5]).toBe('Scope');
    expect(PHASE_NAMES[6]).toBe('Interface');
    expect(PHASE_NAMES[7]).toBe('Int.Gate');
    expect(PHASE_NAMES[8]).toBe('Selection');
    expect(PHASE_NAMES[9]).toBe('Planning');
    expect(PHASE_NAMES[10]).toBe('Execution');
  });

  it('should have hints for all phases', () => {
    PHASE_NAMES.forEach((_, index) => {
      expect(PHASE_HINTS[index]).toBeDefined();
    });
  });

  it('should have hints matching phase order', () => {
    expect(PHASE_HINTS[0]).toBe('setup');
    expect(PHASE_HINTS[5]).toBe('scope');
    expect(PHASE_HINTS[7]).toBe('int.gate');
    expect(PHASE_HINTS[9]).toBe('planning');
    expect(PHASE_HINTS[10]).toBe('execution');
  });
});

// ── Phase Index Mapping ──────────────────────────────────────────────

describe('Phase Index Mapping', () => {
  it('should map phase index to correct PHASE_NAMES', () => {
    const mapping: Record<number, string> = {
      0: 'Setup',
      1: 'Context',
      2: 'Shape',
      3: 'Critique',
      4: 'Gate',
      5: 'Scope',
      6: 'Interface',
      7: 'Int.Gate',
      8: 'Selection',
      9: 'Planning',
      10: 'Execution',
    };

    Object.entries(mapping).forEach(([index, name]) => {
      expect(PHASE_NAMES[parseInt(index)]).toBe(name);
    });
  });

  it('should handle last phase correctly', () => {
    const lastIndex = PHASE_NAMES.length - 1;
    expect(PHASE_NAMES[lastIndex]).toBe('Execution');
  });

  it('should not have duplicate phase names', () => {
    const unique = new Set(PHASE_NAMES);
    expect(unique.size).toBe(PHASE_NAMES.length);
  });
});

// ── Phase Status ─────────────────────────────────────────────────────

describe('Phase Status Logic', () => {
  function getPhaseStatus(phases: Phase[], currentPhase: number): Phase[] {
    return phases.map((p, i) => ({
      ...p,
      status: i < currentPhase 
        ? 'completed' 
        : i === currentPhase 
          ? 'in-progress' 
          : 'pending'
    }));
  }

  it('should mark phases before current as completed', () => {
    const phases: Phase[] = [
      { id: '0-setup', name: 'Setup', status: '' },
      { id: '1-context', name: 'Context', status: '' },
      { id: '2-shape', name: 'Shape', status: '' },
    ];

    const result = getPhaseStatus(phases, 2);

    expect(result[0].status).toBe('completed');
    expect(result[1].status).toBe('completed');
    expect(result[2].status).toBe('in-progress');
  });

  it('should mark current phase as in-progress', () => {
    const phases: Phase[] = [
      { id: '0-setup', name: 'Setup', status: '' },
      { id: '1-context', name: 'Context', status: '' },
    ];

    const result = getPhaseStatus(phases, 0);

    expect(result[0].status).toBe('in-progress');
    expect(result[1].status).toBe('pending');
  });

  it('should mark phases after current as pending', () => {
    const phases: Phase[] = [
      { id: '0-setup', name: 'Setup', status: '' },
      { id: '1-context', name: 'Context', status: '' },
      { id: '2-shape', name: 'Shape', status: '' },
    ];

    const result = getPhaseStatus(phases, 1);

    expect(result[0].status).toBe('completed');
    expect(result[1].status).toBe('in-progress');
    expect(result[2].status).toBe('pending');
  });
});

// ── Phase Transitions ────────────────────────────────────────────────

describe('Phase Transitions', () => {
  function nextPhase(currentPhase: number, maxPhases: number): number {
    const next = currentPhase + 1;
    return next >= maxPhases ? currentPhase : next;
  }

  function setPhase(workflow: Workflow, phase: number): Workflow {
    const maxPhase = workflow.phases.length - 1;
    const clampedPhase = Math.max(0, Math.min(phase, maxPhase));
    return {
      ...workflow,
      currentPhase: clampedPhase,
      phases: workflow.phases.map((p, i) => ({
        ...p,
        status: i < clampedPhase 
          ? 'completed' 
          : i === clampedPhase 
            ? 'in-progress' 
            : 'pending'
      }))
    };
  }

  it('should advance to next phase', () => {
    expect(nextPhase(0, 11)).toBe(1);
    expect(nextPhase(1, 11)).toBe(2);
    expect(nextPhase(9, 11)).toBe(10);
  });

  it('should not advance past last phase', () => {
    expect(nextPhase(10, 11)).toBe(10);
    expect(nextPhase(11, 11)).toBe(11);
  });

  it('should set phase and update statuses', () => {
    const workflow: Workflow = {
      name: 'test',
      description: '',
      status: 'in-progress',
      currentPhase: 0,
      phases: [
        { id: '0-setup', name: 'Setup', status: 'in-progress' },
        { id: '1-context', name: 'Context', status: 'pending' },
        { id: '2-shape', name: 'Shape', status: 'pending' },
      ],
      created: '',
      updated: '',
    };

    const result = setPhase(workflow, 2);

    expect(result.currentPhase).toBe(2);
    expect(result.phases[0].status).toBe('completed');
    expect(result.phases[1].status).toBe('completed');
    expect(result.phases[2].status).toBe('in-progress');
  });

  it('should clamp phase to valid range', () => {
    const workflow: Workflow = {
      name: 'test',
      description: '',
      status: 'in-progress',
      currentPhase: 1,
      phases: [
        { id: '0-setup', name: 'Setup', status: 'completed' },
        { id: '1-context', name: 'Context', status: 'in-progress' },
        { id: '2-shape', name: 'Shape', status: 'pending' },
      ],
      created: '',
      updated: '',
    };

    const result = setPhase(workflow, 10); // Beyond range
    expect(result.currentPhase).toBe(2);
  });
});

// ── Display Format ──────────────────────────────────────────────────

describe('Phase Display Format', () => {
  function formatPhaseStatus(currentPhase: number, totalPhases: number): string {
    const phaseName = PHASE_NAMES[currentPhase] || '?';
    return `${phaseName} ${currentPhase + 1}/${totalPhases}`;
  }

  it('should format phase status correctly', () => {
    expect(formatPhaseStatus(0, 11)).toBe('Setup 1/11');
    expect(formatPhaseStatus(4, 11)).toBe('Gate 5/11');
    expect(formatPhaseStatus(10, 11)).toBe('Execution 11/11');
  });

  it('should show current phase indicator', () => {
    const isActive = (index: number, currentPhase: number) => index === currentPhase;
    const icon = (index: number, currentPhase: number) => 
      isActive(index, currentPhase) ? '◆' : '●';

    expect(icon(0, 2)).toBe('●');
    expect(icon(2, 2)).toBe('◆');
    expect(icon(10, 2)).toBe('●');
  });
});

// ── SKILL.md Mapping ─────────────────────────────────────────────────

describe('SKILL.md Phase Mapping', () => {
  /**
   * Extension 11 phases now match SKILL.md 11 phases.
   */
  const expectedSkillPhases = 11;

  it('should match SKILL.md phase count', () => {
    expect(PHASE_NAMES.length).toBe(expectedSkillPhases);
    console.log(`Phase count: Extension=${PHASE_NAMES.length}, SKILL.md=${expectedSkillPhases}`);
    console.log('Footer will now show correct phase count (X/11)');
  });

  it('should map all extension phases to skill phases', () => {
    // Extension phases now match skill phases directly
    expect(PHASE_NAMES[0]).toBe('Setup');     // Phase 1
    expect(PHASE_NAMES[1]).toBe('Context');   // Phase 2
    expect(PHASE_NAMES[2]).toBe('Shape');    // Phase 3
    expect(PHASE_NAMES[3]).toBe('Critique'); // Phase 4
    expect(PHASE_NAMES[4]).toBe('Gate');      // Phase 5
    expect(PHASE_NAMES[5]).toBe('Scope');     // Phase 6
    expect(PHASE_NAMES[6]).toBe('Interface'); // Phase 7
    expect(PHASE_NAMES[7]).toBe('Int.Gate'); // Phase 8
    expect(PHASE_NAMES[8]).toBe('Selection'); // Phase 9
    expect(PHASE_NAMES[9]).toBe('Planning'); // Phase 10
    expect(PHASE_NAMES[10]).toBe('Execution'); // Phase 11
  });
});