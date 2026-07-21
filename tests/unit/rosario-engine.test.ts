import { describe, it, expect } from "vitest";
import {
  loadProgram,
  initializeSession,
  advanceSession,
  flattenProgram,
  getCurrentStep,
  getCurrentNode,
  isStep,
  isModule,
} from "@/lib/devotions/engine";
import type { PrayerProgram } from "@/lib/devotions/types";

const mockProgram: PrayerProgram = {
  id: "test-prayer",
  slug: "test",
  title: "Test Prayer",
  description: "Programa de prueba",
  accentColor: "#C6A15B",
  root: {
    id: "root",
    type: "sequence",
    title: "Root",
    children: [
      {
        id: "module-intro",
        type: "sequence",
        title: "Introducción",
        children: [
          {
            id: "step-1",
            type: "prayer",
            title: "Padre Nuestro",
            text: "Padre nuestro...",
            durationMs: 1000,
            requiresResponse: true,
            roles: [{ type: "leader" }, { type: "assembly" }],
          },
          {
            id: "step-2",
            type: "prayer",
            title: "Ave María",
            text: "Dios te salve...",
            durationMs: 2000,
            requiresResponse: true,
            roles: [{ type: "everyone" }],
          },
        ],
      },
    ],
  },
};

describe("Prayer Engine", () => {
  it("loads program and initializes session", () => {
    const engine = loadProgram(mockProgram);
    expect(engine.program.id).toBe("test-prayer");
    expect(engine.session.currentNodeId).toBe("step-1");
    expect(engine.session.repeatCount).toBe(0);
  });

  it("advances through nodes", () => {
    let engine = loadProgram(mockProgram);
    expect(engine.session.currentNodeId).toBe("step-1");

    let newSession = advanceSession(engine.program, engine.session);
    engine = { program: engine.program, session: newSession };
    expect(engine.session.currentNodeId).toBe("step-2");

    newSession = advanceSession(engine.program, engine.session);
    engine = { program: engine.program, session: newSession };
    expect(engine.session.currentNodeId).toBe("root");
  });

  it("flattens module hierarchy", () => {
    const engine = loadProgram(mockProgram);
    const flat = flattenProgram(engine.program);
    expect(flat.length).toBeGreaterThan(0);
    expect(flat[0].id).toBe("root");
    expect(flat[1].id).toBe("module-intro");
    expect(flat[2].id).toBe("step-1");
  });

  it("identifies step vs module", () => {
    const engine = loadProgram(mockProgram);
    const step = getCurrentStep(engine.program, engine.session);
    expect(step?.id).toBe("step-1");
    expect(step?.type).toBe("prayer");
  });

  it("distinguishes step from module", () => {
    const engine = loadProgram(mockProgram);
    const root = getCurrentNode(engine.program, engine.session);
    expect(isStep(root!)).toBe(true);
    expect(isModule(root!)).toBe(false);
  });
});
