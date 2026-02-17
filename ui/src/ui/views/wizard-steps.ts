/**
 * Wizard step renderer components — renders each wizard step type.
 *
 * Purpose: Maps WizardStep.type to a Lit template with user interaction.
 * Depends on: ../controllers/wizard.ts (types), ../markdown.ts, lit
 * Used by: ./wizard.ts
 */

import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import type { WizardStep } from "../controllers/wizard.ts";
import { toSanitizedMarkdownHtml } from "../markdown.ts";

type StepCallbacks = {
  onAnswer: (stepId: string, value: unknown) => void;
  onAcknowledge: (stepId: string) => void;
};

/**
 * Strip ANSI escape sequences from text and convert terminal hyperlinks
 * (`\x1b]8;;URL\x07label\x1b]8;;\x07`) to markdown links `[label](URL)`.
 * Also converts bare `]8;;URL text ]8;;` fragments left after partial stripping.
 */
function cleanAnsiToMarkdown(text: string): string {
  // Convert ANSI OSC 8 hyperlinks to markdown: \x1b]8;;URL\x07label\x1b]8;;\x07
  let cleaned = text.replace(
    /\x1b\]8;;([^\x07]*)\x07([^\x1b]*)\x1b\]8;;\x07/g,
    (_match, url: string, label: string) => {
      const trimUrl = url.trim();
      const trimLabel = label.trim();
      if (!trimUrl) return trimLabel;
      if (trimLabel === trimUrl) return trimUrl;
      return `[${trimLabel}](${trimUrl})`;
    },
  );

  // Catch partially-escaped variants: ]8;;URL label]8;;  (when \x1b was already stripped)
  cleaned = cleaned.replace(
    /\]8;;(https?:\/\/[^\s\x07]+)\x07?([^\]]*)\]8;;/g,
    (_match, url: string, label: string) => {
      const trimUrl = url.trim();
      const trimLabel = label.trim();
      if (!trimUrl) return trimLabel;
      if (!trimLabel || trimLabel === trimUrl) return trimUrl;
      return `[${trimLabel}](${trimUrl})`;
    },
  );

  // Strip any remaining ANSI escape sequences
  cleaned = cleaned.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
  cleaned = cleaned.replace(/\x1b\][^\x07]*\x07/g, "");
  // eslint-disable-next-line no-control-regex
  cleaned = cleaned.replace(/[\x1b\x07]/g, "");

  return cleaned;
}

/** Render a wizard step message as formatted HTML via the markdown pipeline. */
function renderStepMessage(message: string | undefined) {
  if (!message) return nothing;
  const markdown = cleanAnsiToMarkdown(message);
  const rendered = toSanitizedMarkdownHtml(markdown);
  return html`<div class="wizard-step-message wizard-step-message--rich">${unsafeHTML(rendered)}</div>`;
}

export function renderWizardStep(step: WizardStep, callbacks: StepCallbacks, loading: boolean) {
  switch (step.type) {
    case "note":
      return renderNote(step, callbacks, loading);
    case "select":
      return renderSelect(step, callbacks, loading);
    case "text":
      return renderText(step, callbacks, loading);
    case "confirm":
      return renderConfirm(step, callbacks, loading);
    case "multiselect":
      return renderMultiselect(step, callbacks, loading);
    case "progress":
      return renderProgress(step);
    case "action":
      return renderAction(step, callbacks, loading);
    default:
      return html`<div class="wizard-step-unknown">Unknown step type: ${step.type}</div>`;
  }
}

function renderNote(step: WizardStep, callbacks: StepCallbacks, loading: boolean) {
  return html`
    <div class="wizard-step">
      ${step.title ? html`<h3 class="wizard-step-title">${step.title}</h3>` : nothing}
      ${renderStepMessage(step.message)}
      <button
        class="wizard-btn wizard-btn-primary"
        ?disabled=${loading}
        @click=${() => callbacks.onAcknowledge(step.id)}
      >
        Continue
      </button>
    </div>
  `;
}

function renderSelect(step: WizardStep, callbacks: StepCallbacks, loading: boolean) {
  const options = step.options ?? [];
  return html`
    <div class="wizard-step">
      ${step.title ? html`<h3 class="wizard-step-title">${step.title}</h3>` : nothing}
      ${renderStepMessage(step.message)}
      <div class="wizard-options">
        ${options.map(
          (opt) => html`
            <button
              class="wizard-option-btn"
              ?disabled=${loading}
              @click=${() => callbacks.onAnswer(step.id, opt.value)}
            >
              <span class="wizard-option-label">${opt.label}</span>
              ${opt.hint ? html`<span class="wizard-option-hint">${opt.hint}</span>` : nothing}
            </button>
          `,
        )}
      </div>
    </div>
  `;
}

function renderText(step: WizardStep, callbacks: StepCallbacks, loading: boolean) {
  const inputType = step.sensitive ? "password" : "text";
  return html`
    <div class="wizard-step">
      ${step.title ? html`<h3 class="wizard-step-title">${step.title}</h3>` : nothing}
      ${renderStepMessage(step.message)}
      <form
        class="wizard-text-form"
        @submit=${(e: Event) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const input = form.querySelector("input") as HTMLInputElement;
          if (input.value.trim()) {
            callbacks.onAnswer(step.id, input.value.trim());
          }
        }}
      >
        <input
          class="wizard-text-input"
          type=${inputType}
          placeholder=${step.placeholder ?? ""}
          .value=${String(step.initialValue ?? "")}
          ?disabled=${loading}
          autofocus
        />
        <button class="wizard-btn wizard-btn-primary" type="submit" ?disabled=${loading}>
          Continue
        </button>
      </form>
    </div>
  `;
}

function renderConfirm(step: WizardStep, callbacks: StepCallbacks, loading: boolean) {
  return html`
    <div class="wizard-step">
      ${step.title ? html`<h3 class="wizard-step-title">${step.title}</h3>` : nothing}
      ${renderStepMessage(step.message)}
      <div class="wizard-confirm-actions">
        <button
          class="wizard-btn wizard-btn-primary"
          ?disabled=${loading}
          @click=${() => callbacks.onAnswer(step.id, true)}
        >
          Yes
        </button>
        <button
          class="wizard-btn wizard-btn-secondary"
          ?disabled=${loading}
          @click=${() => callbacks.onAnswer(step.id, false)}
        >
          No
        </button>
      </div>
    </div>
  `;
}

function renderMultiselect(step: WizardStep, callbacks: StepCallbacks, loading: boolean) {
  const options = step.options ?? [];
  const selectedValues = new Set<unknown>();

  function toggleOption(value: unknown) {
    if (selectedValues.has(value)) {
      selectedValues.delete(value);
    } else {
      selectedValues.add(value);
    }
  }

  return html`
    <div class="wizard-step">
      ${step.title ? html`<h3 class="wizard-step-title">${step.title}</h3>` : nothing}
      ${renderStepMessage(step.message)}
      <div class="wizard-options">
        ${options.map(
          (opt) => html`
            <label class="wizard-checkbox-option">
              <input type="checkbox" @change=${() => toggleOption(opt.value)} ?disabled=${loading} />
              <span class="wizard-option-label">${opt.label}</span>
              ${opt.hint ? html`<span class="wizard-option-hint">${opt.hint}</span>` : nothing}
            </label>
          `,
        )}
      </div>
      <button
        class="wizard-btn wizard-btn-primary"
        ?disabled=${loading}
        style="margin-top: 0.5rem"
        @click=${() => callbacks.onAnswer(step.id, [...selectedValues])}
      >
        Continue
      </button>
    </div>
  `;
}

function renderProgress(step: WizardStep) {
  return html`
    <div class="wizard-step">
      ${step.title ? html`<h3 class="wizard-step-title">${step.title}</h3>` : nothing}
      ${renderStepMessage(step.message)}
      <div class="wizard-progress-indicator">
        <div class="wizard-spinner"></div>
      </div>
    </div>
  `;
}

function renderAction(step: WizardStep, callbacks: StepCallbacks, loading: boolean) {
  return html`
    <div class="wizard-step">
      ${step.title ? html`<h3 class="wizard-step-title">${step.title}</h3>` : nothing}
      ${renderStepMessage(step.message)}
      <button
        class="wizard-btn wizard-btn-primary"
        ?disabled=${loading}
        @click=${() => callbacks.onAcknowledge(step.id)}
      >
        Continue
      </button>
    </div>
  `;
}
