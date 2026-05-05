import { fetchAccountAvatar, updateAccountAlias, uploadAccountAvatar } from "../api/api.js";

class AccountSettingsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleEscape = this.handleEscape.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleDisplayNameSubmit = this.handleDisplayNameSubmit.bind(this);
    this.handleAvatarSubmit = this.handleAvatarSubmit.bind(this);
    this.isSavingDisplayName = false;
    this.displayNameStatus = "";
    this.displayNameStatusType = "";
    this.isUploadingAvatar = false;
    this.avatarStatus = "";
    this.avatarStatusType = "";
    this.avatarUrl = "";
  }

  connectedCallback() {
    if (!this.hasAttribute("hidden")) {
      this.hidden = true;
    }

    if (this.shadowRoot.children.length === 0) {
      this.render();
    }

    this.loadAvatar();
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.handleEscape);
  }

  open() {
    this.hidden = false;
    this.render();
    document.addEventListener("keydown", this.handleEscape);
  }

  close() {
    this.hidden = true;
    document.removeEventListener("keydown", this.handleEscape);
    this.render();
  }

  async loadAvatar() {
    try {
      const { avatarUrl = "" } = await fetchAccountAvatar();
      this.avatarUrl = avatarUrl;
    } catch (error) {
      this.avatarUrl = "";
    } finally {
      this.render();
    }
  }

  render() {
    const username = localStorage.getItem("memeplexes-username") || "Anonymous";
    const displayName = localStorage.getItem("memeplexes-display-name") || username;
    const avatarMarkup = this.avatarUrl
      ? `<img class="avatar-image" src="${this.avatarUrl}" alt="${displayName}'s avatar" />`
      : `<div class="avatar-placeholder" aria-hidden="true">${displayName.charAt(0).toUpperCase()}</div>`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          inset: 0;
          z-index: 3000;
        }

        [hidden] {
          display: none !important;
        }

        .backdrop {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--theme-overlay-green);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .panel {
          width: min(100%, 420px);
          display: grid;
          gap: 18px;
          padding: 22px;
          border-radius: 24px;
          background: linear-gradient(180deg, var(--theme-panel-top), var(--theme-panel-bottom));
          border: 1px solid var(--theme-border-soft-strong);
          box-shadow: 0 24px 80px var(--theme-shadow-strong);
          color: var(--theme-text-primary);
        }

        .header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 16px;
        }

        .title {
          margin: 0;
          font-size: 22px;
          line-height: 1.1;
        }

        .subtitle {
          margin: 6px 0 0;
          color: var(--theme-text-muted);
          font-size: 14px;
          line-height: 1.5;
        }

        .close-button,
        .logout-button {
          border: 0;
          cursor: pointer;
          font: inherit;
        }

        .close-button {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: var(--theme-border-soft);
          color: var(--theme-text-primary-80);
        }

        .section {
          display: grid;
          gap: 10px;
          padding: 16px;
          border-radius: 18px;
          background: var(--theme-surface-glass-faint);
          border: 1px solid var(--theme-border-soft);
        }

        .label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--theme-text-subtle);
        }

        .value {
          font-size: 20px;
          font-weight: 700;
          color: var(--theme-accent-text);
          word-break: break-word;
        }

        .avatar-section {
          gap: 14px;
        }

        .avatar-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .avatar-preview,
        .avatar-placeholder,
        .avatar-image {
          width: 72px;
          height: 72px;
          border-radius: 18px;
        }

        .avatar-preview {
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: var(--theme-accent-tint);
          border: 1px solid var(--theme-border-soft);
        }

        .avatar-placeholder {
          display: grid;
          place-items: center;
          font-size: 28px;
          font-weight: 800;
          color: var(--theme-accent-text);
        }

        .avatar-image {
          display: block;
          object-fit: cover;
        }

        .avatar-copy {
          display: grid;
          gap: 4px;
        }

        .avatar-title {
          font-size: 16px;
          font-weight: 700;
        }

        .avatar-subtitle {
          font-size: 13px;
          color: var(--theme-text-muted);
          line-height: 1.5;
        }

        .avatar-form {
          display: grid;
          gap: 10px;
        }

        .avatar-input {
          width: 100%;
          color: var(--theme-text-primary-82);
          font: inherit;
        }

        .avatar-input::file-selector-button {
          margin-right: 12px;
          padding: 10px 14px;
          border: 0;
          border-radius: 999px;
          background: var(--theme-accent-tint);
          color: var(--theme-text-primary);
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .display-name-form {
          display: grid;
          gap: 10px;
        }

        .display-name-input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border: 1px solid var(--theme-border-medium);
          border-radius: 12px;
          background: var(--theme-black-20);
          color: var(--theme-text-primary);
          font: inherit;
        }

        .display-name-input:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .display-name-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .save-button {
          min-height: 40px;
          padding: 0 14px;
          border: 0;
          border-radius: 999px;
          background: var(--theme-accent-text);
          color: var(--theme-ink-on-accent);
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .status {
          min-height: 20px;
          font-size: 13px;
          color: var(--theme-text-primary-70);
        }

        .status.success {
          color: var(--theme-accent-soft-text);
        }

        .status.error {
          color: var(--theme-danger-soft);
        }

        .logout-button {
          min-height: 44px;
          justify-self: start;
          padding: 0 18px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--theme-accent-fill-strong), var(--theme-accent-fill-deep));
          color: var(--theme-ink-on-accent);
          font-weight: 700;
        }

        @media (max-width: 767px) {
          .panel {
            padding: 18px;
            border-radius: 20px;
          }
        }
      </style>
      <div class="backdrop" ${this.hidden ? "hidden" : ""}>
        <section class="panel" role="dialog" aria-modal="true" aria-labelledby="account-settings-title">
          <div class="header">
            <div>
              <h2 class="title" id="account-settings-title">Account settings</h2>
              <p class="subtitle">Manage your current session.</p>
            </div>
            <button class="close-button" id="close-button" type="button" aria-label="Close account settings">✕</button>
          </div>
          <div class="section">
            <div class="label">Signed in as</div>
            <div class="value">${displayName}</div>
          </div>
          <!--
          <div class="section avatar-section">
            <div class="label">Avatar</div>
            <div class="avatar-row">
              <div class="avatar-preview">${avatarMarkup}</div>
              <div class="avatar-copy">
                <div class="avatar-title">Profile photo</div>
                <div class="avatar-subtitle">Upload a square image to update your avatar for this session.</div>
              </div>
            </div>
            <form class="avatar-form" id="avatar-form">
              <input class="avatar-input" id="avatar-input" type="file" accept="image/*" ${this.isUploadingAvatar ? "disabled" : ""} />
              <div class="display-name-actions">
                <button class="save-button" id="save-avatar-button" type="submit" ${this.isUploadingAvatar ? "disabled" : ""}>
                  ${this.isUploadingAvatar ? "Uploading..." : "Upload avatar"}
                </button>
                <div class="status ${this.avatarStatusType}" id="avatar-status" aria-live="polite">${this.avatarStatus}</div>
              </div>
            </form>
            -->
          </div>
          <div class="section">
            <div class="label">Set Display Name</div>
            <form class="display-name-form" id="display-name-form">
              <input
                class="display-name-input"
                type="text"
                id="display-name-input"
                value="${displayName}"
                maxlength="64"
                ${this.isSavingDisplayName ? "disabled" : ""}
              />
              <div class="display-name-actions">
                <button class="save-button" id="save-display-name-button" type="submit" ${this.isSavingDisplayName ? "disabled" : ""}>
                  ${this.isSavingDisplayName ? "Saving..." : "Save"}
                </button>
                <div class="status ${this.displayNameStatusType}" id="display-name-status" aria-live="polite">${this.displayNameStatus}</div>
              </div>
            </form>
          </div>
          <button class="logout-button" id="logout-button" type="button">Logout</button>
        </section>
      </div>
    `;

    this.shadowRoot.querySelector(".backdrop")?.addEventListener("click", this.handleBackdropClick);
    this.shadowRoot.querySelector("#close-button")?.addEventListener("click", () => this.close());
    this.shadowRoot.querySelector("#logout-button")?.addEventListener("click", this.handleLogout);
    this.shadowRoot.querySelector("#avatar-form")?.addEventListener("submit", this.handleAvatarSubmit);
    this.shadowRoot.querySelector("#display-name-form")?.addEventListener("submit", this.handleDisplayNameSubmit);
  }

  handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  handleEscape(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }

  async handleDisplayNameSubmit(event) {
    event.preventDefault();
    if (this.isSavingDisplayName) {
      return;
    }

    const input = this.shadowRoot.querySelector("#display-name-input");
    const alias = input?.value?.trim() || "";

    if (!alias) {
      this.displayNameStatus = "Display name cannot be empty.";
      this.displayNameStatusType = "error";
      this.render();
      return;
    }

    this.isSavingDisplayName = true;
    this.displayNameStatus = "";
    this.displayNameStatusType = "";
    this.render();

    try {
      await updateAccountAlias(alias);
      localStorage.setItem("memeplexes-display-name", alias);
      window.dispatchEvent(new CustomEvent("memeplexes:display-name-updated", { detail: { displayName: alias } }));
      this.displayNameStatus = "Display name updated.";
      this.displayNameStatusType = "success";
    } catch (error) {
      this.displayNameStatus = error?.message || "Unable to update display name.";
      this.displayNameStatusType = "error";
    } finally {
      this.isSavingDisplayName = false;
      this.render();
    }
  }

  async handleAvatarSubmit(event) {
    event.preventDefault();
    if (this.isUploadingAvatar) {
      return;
    }

    const input = this.shadowRoot.querySelector("#avatar-input");
    const file = input?.files?.[0];

    if (!file) {
      this.avatarStatus = "Choose an image to upload.";
      this.avatarStatusType = "error";
      this.render();
      return;
    }

    this.isUploadingAvatar = true;
    this.avatarStatus = "";
    this.avatarStatusType = "";
    this.render();

    try {
      const { avatarUrl } = await uploadAccountAvatar(file);
      this.avatarUrl = avatarUrl;
      window.dispatchEvent(new CustomEvent("memeplexes:avatar-updated", { detail: { avatarUrl } }));
      this.avatarStatus = "Avatar updated.";
      this.avatarStatusType = "success";
    } catch (error) {
      this.avatarStatus = error?.message || "Unable to upload avatar.";
      this.avatarStatusType = "error";
    } finally {
      this.isUploadingAvatar = false;
      this.render();
    }
  }

  handleLogout() {
    localStorage.removeItem("memeplexes-username");
    localStorage.removeItem("memeplexes-display-name");
    localStorage.removeItem("access_token");
    this.close();
    window.location.reload();
  }
}

if (!customElements.get("account-settings-panel")) {
  customElements.define("account-settings-panel", AccountSettingsPanel);
}
