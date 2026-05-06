import "./SignupPanel.js";
import "./UploadPanel.js";

class UploadButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleOpenPanel = this.handleOpenPanel.bind(this);
  }
  connectedCallback() {
    if (this.shadowRoot.children.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            align-items: center;
          }

          .upload-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: 1px solid var(--theme-accent-border);
            background: linear-gradient(180deg, var(--theme-accent-surface), var(--theme-surface-ink-96));
            color: var(--theme-accent-text);
            padding: 6px;
            /* padding: 12px 18px; */
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            border-radius: 999px;
            box-shadow: inset 0 1px 0 var(--theme-white-12);
            transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
            min-width: 150px;
          }

          .upload-button:hover {
            border-color: var(--theme-accent-border-hover);
            background: linear-gradient(180deg, var(--theme-accent-fill-hover), var(--theme-surface-ink-98));
          }

          .upload-button:active {
            transform: translateY(1px);
          }

          .upload-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
          }

          @media (max-width: 767px) {
            .upload-button {
              padding: 10px 12px;
              width: 100%;
            }

            .upload-label-desktop {
              display: none;
            }
          }
        </style>
        <button class="upload-button" id="upload-button" type="button" aria-label="Upload Meme">
          <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          <span class="upload-label-desktop">Upload Meme</span>
        </button>
      `;
    }

    this.shadowRoot.querySelector("#upload-button")?.addEventListener("click", this.handleOpenPanel);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector("#upload-button")?.removeEventListener("click", this.handleOpenPanel);
  }

  handleOpenPanel() {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      this.getOrCreatePanel().open();
      return;
    }

    this.getOrCreateSignupModal();
  }

  getOrCreatePanel() {
    let panel = document.querySelector("upload-panel");
    if (!panel) {
      panel = document.createElement("upload-panel");
      document.body.appendChild(panel);
    }
    panel.setAttribute("auth-url", this.authUrl);
    if (this.presetContestId) {
      panel.setAttribute("contest-id", this.presetContestId);
    } else {
      panel.removeAttribute("contest-id");
    }
    return panel;
  }

  getOrCreateSignupModal() {
    let signupModal = document.querySelector("signup-modal");
    if (!signupModal) {
      signupModal = document.createElement("signup-modal");
      signupModal.addEventListener("login", () => {
        window.location.href = this.authUrl;
      });
      signupModal.addEventListener("signup", () => {
        window.location.href = this.authUrl;
      });
    }

    if (!signupModal.isConnected) {
      document.body.appendChild(signupModal);
    }

    return signupModal;
  }

  get authUrl() {
    return this.getAttribute("auth-url") || "/api/meme/login";
  }

  get presetContestId() {
    return this.getAttribute("preset-contest-id") || "";
  }
}

if (!customElements.get("upload-button")) {
  customElements.define("upload-button", UploadButton);
}
