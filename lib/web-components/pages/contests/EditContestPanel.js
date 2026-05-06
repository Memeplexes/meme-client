import { getContest, updateContest } from "../../../api/contests.js";

function padDateTimePart(value) {
  return String(value).padStart(2, "0");
}

function toDateTimeLocalValue(dateLike) {
  if (!dateLike) {
    return "";
  }

  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${padDateTimePart(date.getMonth() + 1)}-${padDateTimePart(date.getDate())}T${padDateTimePart(date.getHours())}:${padDateTimePart(date.getMinutes())}`;
}

function toJsonDateTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function deriveContestTag(contest) {
  const themeTag = Array.isArray(contest?.themeTags)
    ? contest.themeTags.find(tag => typeof tag === "string" && tag.trim())
    : "";

  return String(
    themeTag
    ?? contest?.tag
    ?? contest?.slug
    ?? ""
  )
    .trim()
    .replace(/^#+/, "");
}

function createFormValuesFromContest(contest) {
  return {
    title: String(contest?.title ?? contest?.name ?? "").trim(),
    description: String(contest?.description ?? "").trim(),
    rules: String(contest?.rules ?? "").trim(),
    tag: deriveContestTag(contest),
    startTime: toDateTimeLocalValue(contest?.startTime ?? contest?.startsAt ?? contest?.startDate),
    endTime: toDateTimeLocalValue(contest?.endTime ?? contest?.endsAt ?? contest?.endDate)
  };
}

class EditContestPanel extends HTMLElement {
  static get observedAttributes() {
    return ["contest-id"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isLoading = false;
    this.isSubmitting = false;
    this.errorMessage = "";
    this.successMessage = "";
    this.formValues = createFormValuesFromContest();
    this.initialFormValues = createFormValuesFromContest();
    this.loadedContestId = "";
  }

  get contestId() {
    return this.getAttribute("contest-id") || "";
  }

  connectedCallback() {
    this.render();
    void this.loadContest();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== "contest-id" || oldValue === newValue || !this.isConnected) {
      return;
    }

    this.successMessage = "";
    this.errorMessage = "";
    this.formValues = createFormValuesFromContest();
    this.initialFormValues = createFormValuesFromContest();
    this.loadedContestId = "";
    this.render();
    void this.loadContest();
  }

  async loadContest() {
    if (!this.contestId) {
      this.errorMessage = "A contest id is required to edit a contest.";
      this.isLoading = false;
      this.render();
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";
      this.render();

      const contest = await getContest(this.contestId);
      this.initialFormValues = createFormValuesFromContest(contest);
      this.formValues = { ...this.initialFormValues };
      this.loadedContestId = String(contest?.id ?? contest?._id ?? this.contestId);
    } catch (error) {
      console.error("[edit-contest-panel] failed to load contest", error);
      this.errorMessage = error instanceof Error && error.message
        ? error.message
        : "Unable to load this contest right now.";
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isSubmitting || this.isLoading) {
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

      const contest = await updateContest(this.loadedContestId || this.contestId, {
        title,
        description,
        rules,
        startTime: toJsonDateTime(startTime),
        endTime: toJsonDateTime(endTime),
        themeTags: tag ? [tag] : []
      });

      this.loadedContestId = String(contest?.id ?? contest?._id ?? this.contestId);
      this.initialFormValues = createFormValuesFromContest(contest);
      this.formValues = { ...this.initialFormValues };
      this.successMessage = "Contest updated.";
      this.dispatchEvent(new CustomEvent("contest-updated", {
        bubbles: true,
        composed: true,
        detail: { contest }
      }));
    } catch (error) {
      console.error("[edit-contest-panel] failed to update contest", error);
      this.errorMessage = error instanceof Error && error.message
        ? error.message
        : "Unable to update this contest right now.";
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

  handleCancel() {
    this.formValues = { ...this.initialFormValues };
    this.errorMessage = "";
    this.successMessage = "";
    this.render();
    this.dispatchEvent(new CustomEvent("edit-cancelled", {
      bubbles: true,
      composed: true
    }));
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

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .actions button[type="button"] {
          border-color: var(--theme-white-12);
          background: var(--theme-surface-glass-faint);
          color: var(--theme-text-primary);
        }
      </style>

      <section class="panel">
        ${this.errorMessage ? `<p class="message error-banner" role="alert">${this.errorMessage}</p>` : ""}
        <div class="copy">
          <h2>Edit contest</h2>
          <p>Update the title, tag, rules, and schedule for an existing contest.</p>
        </div>
        ${this.isLoading ? `
          <p class="message">Loading contest details...</p>
        ` : `
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
            <div class="actions">
              <button type="submit" ${this.isSubmitting ? "disabled" : ""}>
                ${this.isSubmitting ? "Saving..." : "Save contest"}
              </button>
              <button type="button" data-cancel ${this.isSubmitting ? "disabled" : ""}>Cancel</button>
            </div>
          </form>
        `}
      </section>
    `;

    this.shadowRoot.querySelector("form")?.addEventListener("submit", event => {
      event.preventDefault();
      void this.handleSubmit(event);
    });
    this.shadowRoot.querySelector("form")?.addEventListener("input", event => {
      this.handleFieldInput(event);
    });
    this.shadowRoot.querySelector("[data-cancel]")?.addEventListener("click", () => {
      this.handleCancel();
    });
  }
}

if (!customElements.get("edit-contest-panel")) {
  customElements.define("edit-contest-panel", EditContestPanel);
}
