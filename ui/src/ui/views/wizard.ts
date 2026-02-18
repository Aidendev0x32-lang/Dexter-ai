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
          <img class="wizard-logo wizard-logo--sm" src="/DexterLogo.jpeg" alt="Dexter" />
          <div class="wizard-card-header-text">
            <h2 class="wizard-title">Dexter Setup</h2>
            ${props.wizardStep
              ? html`<p class="wizard-status">Configuring your assistant...</p>`
              : nothing}
          </div>
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
          <div class="wizard-progress">
            <span class="wizard-progress-dot wizard-progress-dot--done"></span>
            <span class="wizard-progress-dot wizard-progress-dot--active"></span>
            <span class="wizard-progress-dot"></span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderWizardStart(props: WizardViewProps) {
  return html`
    <div class="wizard-container">
      <div class="wizard-welcome">
        <div class="wizard-welcome-logo">
          <img class="wizard-logo" src="/DexterLogo.jpeg" alt="Dexter" />
        </div>
        <h1 class="wizard-welcome-title">Welcome to Dexter</h1>
        <p class="wizard-welcome-subtitle">
          Your personal AI assistant, your rules.<br />
          Let's get you set up in about a minute.
        </p>
        ${props.wizardError
          ? html`<div class="wizard-error">${props.wizardError}</div>`
          : nothing}
        <button
          class="wizard-btn wizard-btn-primary wizard-btn-large"
          @click=${props.onStart}
          ?disabled=${props.wizardLoading}
        >
          Get Started
        </button>
      </div>
    </div>
  `;
}

function renderWizardConnecting() {
  return html`
    <div class="wizard-container">
      <div class="wizard-welcome">
        <div class="wizard-welcome-logo">
          <img class="wizard-logo" src="/DexterLogo.jpeg" alt="Dexter" />
        </div>
        <h1 class="wizard-welcome-title">Dexter</h1>
        <div class="wizard-connecting-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p class="wizard-status">Connecting to gateway...</p>
      </div>
    </div>
  `;
}

function renderWizardComplete(props: WizardViewProps) {
  return html`
    <div class="wizard-container">
      <div class="wizard-welcome">
        <div class="wizard-success-icon">
          <svg class="wizard-success-check" viewBox="0 0 24 24">
            <polyline points="6 12 10 16 18 8" />
          </svg>
        </div>
        <h1 class="wizard-welcome-title">You're All Set!</h1>
        <p class="wizard-welcome-subtitle">
          Dexter is configured and ready to go.<br />
          Head to the control panel to start chatting.
        </p>
        <button class="wizard-btn wizard-btn-primary wizard-btn-large" @click=${props.onComplete}>
          Open Control Panel
        </button>
      </div>
    </div>
  `;
}
