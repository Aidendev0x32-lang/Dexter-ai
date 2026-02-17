/**
 * Wizard WebSocket controller — drives the onboarding wizard via gateway RPC.
 *
 * Purpose: Manages wizard session lifecycle (start → answer → done/cancel).
 * Depends on: ../gateway.ts (GatewayBrowserClient)
 * Used by: ../views/wizard.ts, ../app.ts
 */

import type { GatewayBrowserClient } from "../gateway.ts";

export type WizardStepOption = {
  value: unknown;
  label: string;
  hint?: string;
};

export type WizardStep = {
  id: string;
  type: "note" | "select" | "text" | "confirm" | "multiselect" | "progress" | "action";
  title?: string;
  message?: string;
  options?: WizardStepOption[];
  initialValue?: unknown;
  placeholder?: string;
  sensitive?: boolean;
  executor?: "gateway" | "client";
};

export type WizardSessionStatus = "running" | "done" | "cancelled" | "error";

type WizardNextResult = {
  done: boolean;
  step?: WizardStep;
  status: WizardSessionStatus;
  error?: string;
};

type WizardStartResponse = WizardNextResult & { sessionId: string };

export type WizardState = {
  wizardSessionId: string | null;
  wizardStep: WizardStep | null;
  wizardStatus: WizardSessionStatus | null;
  wizardError: string | null;
  wizardLoading: boolean;
  wizardDone: boolean;
};

export function createInitialWizardState(): WizardState {
  return {
    wizardSessionId: null,
    wizardStep: null,
    wizardStatus: null,
    wizardError: null,
    wizardLoading: false,
    wizardDone: false,
  };
}

export async function startWizard(
  state: WizardState,
  client: GatewayBrowserClient | null,
): Promise<void> {
  if (!client) {
    state.wizardError = "Not connected to gateway";
    return;
  }
  state.wizardLoading = true;
  state.wizardError = null;
  try {
    const result = await client.request<WizardStartResponse>("wizard.start", {});
    state.wizardSessionId = result.sessionId;
    state.wizardStep = result.step ?? null;
    state.wizardStatus = result.status;
    state.wizardDone = result.done;
  } catch (err) {
    state.wizardError = err instanceof Error ? err.message : String(err);
  } finally {
    state.wizardLoading = false;
  }
}

export async function sendWizardAnswer(
  state: WizardState,
  client: GatewayBrowserClient | null,
  stepId: string,
  value: unknown,
): Promise<void> {
  if (!client || !state.wizardSessionId) {
    return;
  }
  state.wizardLoading = true;
  state.wizardError = null;
  try {
    const result = await client.request<WizardNextResult>("wizard.next", {
      sessionId: state.wizardSessionId,
      answer: { stepId, value },
    });
    state.wizardStep = result.step ?? null;
    state.wizardStatus = result.status;
    state.wizardDone = result.done;
  } catch (err) {
    state.wizardError = err instanceof Error ? err.message : String(err);
  } finally {
    state.wizardLoading = false;
  }
}

export async function cancelWizard(
  state: WizardState,
  client: GatewayBrowserClient | null,
): Promise<void> {
  if (!client || !state.wizardSessionId) {
    return;
  }
  try {
    await client.request("wizard.cancel", {
      sessionId: state.wizardSessionId,
    });
  } catch {
    // Ignore cancel errors — session may already be gone.
  }
  state.wizardSessionId = null;
  state.wizardStep = null;
  state.wizardStatus = null;
  state.wizardDone = false;
}
