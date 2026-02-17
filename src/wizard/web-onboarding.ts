import type { OnboardOptions } from "../commands/onboard-types.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "./prompts.js";

/**
 * Creates a wizard runner pre-configured for web-based onboarding.
 * Only OpenAI is exposed as an auth provider. Channels and model
 * picker are shown. Skills and daemon setup are skipped — the user
 * configures those later via the Control UI.
 */
export function createWebOnboardingRunner() {
  return async function webOnboardingRunner(
    opts: OnboardOptions,
    runtime: RuntimeEnv,
    prompter: WizardPrompter,
  ): Promise<void> {
    const { runOnboardingWizard } = await import("./onboarding.js");

    const webOpts: OnboardOptions = {
      ...opts,
      flow: opts.flow ?? "quickstart",
      mode: opts.mode ?? "local",
      authChoice: "openai-api-key",
      showModelPicker: true,
      skipChannels: false,
      skipSkills: true,
      installDaemon: false,
      skipUi: true,
      skipHealth: false,
    };

    await runOnboardingWizard(webOpts, runtime, prompter);
  };
}
