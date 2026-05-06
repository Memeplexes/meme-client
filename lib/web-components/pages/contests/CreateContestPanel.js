import { createContest } from "../../../api/contests.js";

function padDateTimePart(value) {
  return String(value).padStart(2, "0");
}

function toDateTimeLocalValue(date) {
  return `${date.getFullYear()}-${padDateTimePart(date.getMonth() + 1)}-${padDateTimePart(date.getDate())}T${padDateTimePart(date.getHours())}:${padDateTimePart(date.getMinutes())}`;
}

function createDefaultFormValues() {
  const startTime = new Date(Date.now() + (15 * 60 * 1000));
  startTime.setSeconds(0, 0);

  const endTime = new Date(startTime);
  endTime.setDate(endTime.getDate() + 5);

  return {
    title: "",
    description: "",
    rules: "",
    tag: "",
    startTime: toDateTimeLocalValue(startTime),
    endTime: toDateTimeLocalValue(endTime)
  };
}

function toJsonDateTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString()
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

class CreateContestPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isSubmitting = false;
    this.errorMessage = "";
    this.successMessage = "";
    this.formValues = createDefaultFormValues();
  }

  connectedCallback() {
    this.render();
  }

  async handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isSubmitting) {
      return;
    }

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const title = String(formData.get("title") ?? "").trim();
      const description = String(formData.get("description") ?? "").trim();
      const rules = String(formData.get("rules") ?? "").trim();
      const tag = String(formData.get("tag") ?? "").trim().replace(/^#+/, "");
      const startTime = String(formData.get("startTime") ?? "").trim();
      const endTime = String(formData.get("endTime") ?? "").trim();
      this.formValues = {
        title,
        description,
        rules,
        tag,
        startTime,
        endTime
      };

      this.isSubmitting = true;
      this.errorMessage = "";
      this.successMessage = "";
      this.render();

      await createContest({
        title,
        description,
        rules,
        startTime: toJsonDateTime(startTime),
        endTime: toJsonDateTime(endTime),
        themeTags: tag ? [tag] : []
      });

      this.formValues = createDefaultFormValues();
      this.successMessage = "Contest created.";
    } catch (error) {
      console.error("[create-contest-panel] failed to create contest", error);
      this.errorMessage = error instanceof Error && error.message
        ? error.message
        : "Unable to create contest right now.";
    } finally {
      this.isSubmitting = false;
      this.render();
    }
    return false;
  }

  handleFieldInput(event) {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      return;
    }

    this.formValues = {
      ...this.formValues,
      [field.name]: field.value
    };
  }

  render() {
    const values = {
      title: escapeHtml(this.formValues.title),
      description: escapeHtml(this.formValues.description),
      rules: escapeHtml(this.formValues.rules),
      tag: escapeHtml(this.formValues.tag),
      startTime: escapeHtml(this.formValues.startTime),
      endTime: escapeHtml(this.formValues.endTime)
    };

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .panel {
          display: grid;
          gap: 12px;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid var(--theme-border-soft);
          background: var(--theme-surface-glass-soft);
        }

        .copy,
        form,
        .field {
          display: grid;
          gap: 8px;
        }

        h2,
        p {
          margin: 0;
        }

        h2 {
          font-size: 16px;
          font-weight: 700;
        }

        p,
        label,
        .message {
          color: var(--theme-text-primary-80);
          font-size: 14px;
          line-height: 1.5;
        }

        .field-row {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }

        input,
        textarea,
        button {
          font: inherit;
        }

        input,
        textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--theme-white-12);
          background: var(--theme-surface-glass-faint);
          color: var(--theme-text-primary);
        }

        textarea {
          min-height: 88px;
          resize: vertical;
        }

        input:focus-visible,
        textarea:focus-visible,
        button:focus-visible {
          outline: 2px solid var(--theme-sky-outline);
          outline-offset: 2px;
        }

        button {
          justify-self: start;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid var(--theme-sky-border-soft);
          border-radius: 999px;
          background: var(--theme-sky-surface-soft);
          color: var(--theme-info-text);
          font-weight: 600;
          cursor: pointer;
        }

        button:disabled {
          cursor: default;
          opacity: 0.7;
        }

        .message[role="alert"] {
          color: var(--theme-error-text, #ff8a8a);
        }

        .error-banner {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.4;
        }

        .message[data-kind="success"] {
          color: var(--theme-success-text, #7ddf9b);
        }
      </style>

      <section class="panel">
        ${this.errorMessage ? `<p class="message error-banner" role="alert">${this.errorMessage}</p>` : ""}
        <div class="copy">
          <h2>Create a contest</h2>
          <p>Set the title, tag, and dates for a simple contest. New contests will show up in the active list after creation.</p>
        </div>
        <form>
          <label class="field">
            <span>Title</span>
            <input name="title" type="text" maxlength="120" required value="${values.title}" />
          </label>
          <label class="field">
            <span>Description</span>
            <textarea name="description" maxlength="500" required>${values.description}</textarea>
          </label>
          <label class="field">
            <span>Rules</span>
            <textarea name="rules" maxlength="1000">${values.rules}</textarea>
          </label>
          <div class="field-row">
            <label class="field">
              <span>Contest tag</span>
              <input name="tag" type="text" maxlength="40" placeholder="funny-cats" value="${values.tag}" />
            </label>
            <label class="field">
              <span>Start time</span>
              <input name="startTime" type="datetime-local" required value="${values.startTime}" />
            </label>
            <label class="field">
              <span>End time</span>
              <input name="endTime" type="datetime-local" required value="${values.endTime}" />
            </label>
          </div>
          ${this.successMessage ? `<p class="message" data-kind="success">${this.successMessage}</p>` : ""}
          <button type="submit" ${this.isSubmitting ? "disabled" : ""}>
            ${this.isSubmitting ? "Creating..." : "Create contest"}
          </button>
        </form>
      </section>
    `;

    this.shadowRoot.querySelector("form")?.addEventListener("submit", event => {
      event.preventDefault();
      void this.handleSubmit(event);
    });
    this.shadowRoot.querySelector("form")?.addEventListener("input", event => {
      this.handleFieldInput(event);
    });
  }
}

if (!customElements.get("create-contest-panel")) {
  customElements.define("create-contest-panel", CreateContestPanel);
}
