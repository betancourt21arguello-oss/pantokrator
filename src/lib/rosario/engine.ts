export interface DevotionProgram {
  id: string;
  slug: string;
  title: string;
  description: string;
  accentColor: string;
  totalSteps: number;
  steps: DevotionStep[];
}

export interface DevotionStep {
  id: string;
  order: number;
  kind: string;
  title: string;
  subtitle?: string;
  prayerText?: string;
  mysteryImage?: string;
  bibleQuote?: string;
  durationMs: number;
  requiresResponse: boolean;
}

export interface DevotionEngine {
  program: DevotionProgram;
  currentStepIndex: number;
}

export function loadProgram(program: DevotionProgram): DevotionEngine {
  return { program, currentStepIndex: 0 };
}

export function getStepByIndex(engine: DevotionEngine, index: number): DevotionStep | undefined {
  return engine.program.steps[index];
}

export function advanceStep(engine: DevotionEngine): DevotionEngine {
  const nextIndex = (engine.currentStepIndex + 1) % engine.program.steps.length;
  return { ...engine, currentStepIndex: nextIndex };
}

export function isStepKind(step: DevotionStep | undefined, kind: string): boolean {
  return step?.kind === kind;
}
