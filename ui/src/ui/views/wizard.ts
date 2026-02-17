/**
 * Top-level wizard view — orchestrates the onboarding wizard UI.
 *
 * Purpose: Renders wizard container with card layout, scrollable body, and step content.
 * Depends on: ../controllers/wizard.ts, ./wizard-steps.ts, lit
 * Used by: ../app-render.ts
 */

import { html, nothing } from "lit";
import type { WizardState } from "../controllers/wizard.ts";
import { renderWizardStep } from "./wizard-steps.ts";

export type WizardViewProps = WizardState & {
  connected: boolean;
  onAnswer: (stepId: string, value: unknown) => void;
  onAcknowledge: (stepId: string) => void;
  onStart: () => void;
  onCancel: () => void;
  onComplete: () => void;
};

export function renderWizard(props: WizardViewProps) {
  if (props.wizardDone) {
    return renderWizardComplete(props);
  }

  if (!props.connected) {
    return renderWizardConnecting();
  }

  if (!props.wizardSessionId && !props.wizardLoading) {
    return renderWizardStart(props);
  }

  return html`
    <div class="wizard-container">
      <div class="wizard-card">
        <div class="wizard-card-header">
          <h2 class="wizard-title">OpenClaw Setup</h2>
          ${props.wizardStep
            ? html`<span class="wizard-status">Setting up your assistant...</span>`
            : nothing}
        </div>
        <div class="wizard-card-body">
          ${props.wizardError
            ? html`<div class="wizard-error">${props.wizardError}</div>`
            : nothing}
          ${props.wizardLoading && !props.wizardStep
            ? html`
                <div class="wizard-loading">
                  <div class="wizard-spinner"></div>
                  <span>Loading...</span>
                </div>
              `
            : nothing}
          ${props.wizardStep
            ? renderWizardStep(
                props.wizardStep,
                {
                  onAnswer: props.onAnswer,
                  onAcknowledge: props.onAcknowledge,
                },
                props.wizardLoading,
              )
            : nothing}
        </div>
        <div class="wizard-card-footer">
          <button
            class="wizard-btn wizard-btn-ghost"
            @click=${props.onCancel}
            ?disabled=${props.wizardLoading}
          >
            &#8634; Start Over
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderWizardStart(props: WizardViewProps) {
  return html`
    <div class="wizard-container">
      <div class="wizard-welcome">
        <h1 class="wizard-welcome-title">Welcome to OpenClaw</h1>
        <p class="wizard-welcome-subtitle">
          Let's configure your AI assistant. This will take about a minute.
        </p>
        ${props.wizardError
          ? html`<div class="wizard-error">${props.wizardError}</div>`
          : nothing}
        <button
          class="wizard-btn wizard-btn-primary wizard-btn-large"
          @click=${props.onStart}
          ?disabled=${props.wizardLoading}
        >
          Start Setup
        </button>
      </div>
    </div>
  `;
}

function renderWizardConnecting() {
  return html`
    <div class="wizard-container">
      <div class="wizard-welcome">
        <h1 class="wizard-welcome-title">Welcome to OpenClaw</h1>
        <div class="wizard-loading">
          <div class="wizard-spinner"></div>
          <span>Connecting to gateway...</span>
        </div>
      </div>
    </div>
  `;
}

function renderWizardComplete(props: WizardViewProps) {
  return html`
    <div class="wizard-container">
      <div class="wizard-welcome">
        <h1 class="wizard-welcome-title">Setup Complete!</h1>
        <p class="wizard-welcome-subtitle">
          Your assistant is ready. Redirecting to the control panel...
        </p>
        <button class="wizard-btn wizard-btn-primary wizard-btn-large" @click=${props.onComplete}>
          Go to Control Panel
        </button>
      </div>
    </div>
  `;
}
