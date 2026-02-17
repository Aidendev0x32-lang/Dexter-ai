import { describe, expect, it, vi } from "vitest";
import { createWebOnboardingRunner } from "./web-onboarding.js";

vi.mock("./onboarding.js", () => ({
  runOnboardingWizard: vi.fn().mockResolvedValue(undefined),
}));

describe("createWebOnboardingRunner", () => {
  it("should return a function", () => {
    const runner = createWebOnboardingRunner();
    expect(typeof runner).toBe("function");
  });

  it("should call runOnboardingWizard with openai-api-key auth choice", async () => {
    const { runOnboardingWizard } = await import("./onboarding.js");
    const runner = createWebOnboardingRunner();
    const mockRuntime = { exit: vi.fn(), log: vi.fn(), error: vi.fn() } as never;
    const mockPrompter = {
      intro: vi.fn(),
      outro: vi.fn(),
      note: vi.fn(),
      select: vi.fn(),
      multiselect: vi.fn(),
      text: vi.fn(),
      confirm: vi.fn(),
      progress: vi.fn(),
    } as never;

    await runner({}, mockRuntime, mockPrompter);

    expect(runOnboardingWizard).toHaveBeenCalledWith(
      expect.objectContaining({
        authChoice: "openai-api-key",
        skipChannels: true,
        skipSkills: true,
        installDaemon: false,
        skipUi: true,
        skipHealth: false,
        flow: "quickstart",
        mode: "local",
      }),
      mockRuntime,
      mockPrompter,
    );
  });

  it("should preserve user-supplied opts while overriding web-specific ones", async () => {
    const { runOnboardingWizard } = await import("./onboarding.js");
    const runner = createWebOnboardingRunner();
    const mockRuntime = { exit: vi.fn(), log: vi.fn(), error: vi.fn() } as never;
    const mockPrompter = {} as never;

    await runner({ workspace: "~/my-workspace", acceptRisk: true }, mockRuntime, mockPrompter);

    expect(runOnboardingWizard).toHaveBeenCalledWith(
      expect.objectContaining({
        workspace: "~/my-workspace",
        acceptRisk: true,
        authChoice: "openai-api-key",
        skipChannels: true,
      }),
      mockRuntime,
      mockPrompter,
    );
  });

  it("should respect explicit flow override", async () => {
    const { runOnboardingWizard } = await import("./onboarding.js");
    const runner = createWebOnboardingRunner();
    const mockRuntime = { exit: vi.fn(), log: vi.fn(), error: vi.fn() } as never;
    const mockPrompter = {} as never;

    await runner({ flow: "advanced" }, mockRuntime, mockPrompter);

    expect(runOnboardingWizard).toHaveBeenCalledWith(
      expect.objectContaining({ flow: "advanced" }),
      mockRuntime,
      mockPrompter,
    );
  });
});
