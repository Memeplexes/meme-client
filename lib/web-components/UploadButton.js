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
            display: block;
            border: 1px solid rgba(30, 171, 85, 0.35);
            background: linear-gradient(180deg, rgba(30, 171, 85, 0.22), rgba(18, 18, 18, 0.96));
            color: #dffbe8;
            padding: 12px 18px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            border-radius: 999px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
            transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
          }

          .upload-button:hover {
            border-color: rgba(30, 171, 85, 0.6);
            background: linear-gradient(180deg, rgba(30, 171, 85, 0.32), rgba(18, 18, 18, 0.98));
          }

          .upload-button:active {
            transform: translateY(1px);
          }

          @media (max-width: 767px) {
            .upload-button {
              padding: 10px 14px;
            }
          }
        </style>
        <button class="upload-button" id="upload-button" type="button">Upload</button>
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
}

if (!customElements.get("upload-button")) {
  customElements.define("upload-button", UploadButton);
}
