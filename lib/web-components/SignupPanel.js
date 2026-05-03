class SignupModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleEscape = this.handleEscape.bind(this);
    this.handleActionClick = this.handleActionClick.bind(this);
  }

  connectedCallback() {
    if (!this.hasAttribute("hidden")) {
      this.hidden = true;
    }

    this.open();
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
    this.remove();
  }

  get authUrl() {
    return this.getAttribute("auth-url") || "/api/meme/login";
  }

  render() {
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
          padding: 24px;
          box-sizing: border-box;
          background: rgba(0, 0, 0, 0.82);
        }

        .panel {
          position: relative;
          width: min(100%, 460px);
          display: grid;
          gap: 18px;
          padding: 28px;
          border-radius: 18px;
          background: linear-gradient(180deg, #050505 0%, #101810 100%);
          border: 1px solid rgba(74, 222, 128, 0.35);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
          color: #f9fafb;
        }

        .header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 16px;
        }

        .eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4ade80;
        }

        .title {
          margin: 0;
          font-size: 30px;
          line-height: 1.1;
        }

        .copy {
          margin: 12px 0 0;
          color: #d1d5db;
          font-size: 15px;
          line-height: 1.5;
        }

        .close-button {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #86efac;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
        }

        .section {
          display: grid;
          gap: 12px;
        }

        .benefits {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 12px;
        }

        .benefit {
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(20, 20, 20, 0.92);
          border: 1px solid rgba(74, 222, 128, 0.22);
          font-weight: 600;
        }

        .benefit-copy {
          display: block;
          margin-top: 4px;
          font-weight: 400;
          color: #bbf7d0;
        }

        .actions {
          display: flex;
          gap: 12px;
        }

        .button {
          flex: 1;
          border: 0;
          border-radius: 999px;
          padding: 14px 18px;
          font: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .button-secondary {
          background: rgba(22, 22, 22, 0.96);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.35);
        }

        .button-primary {
          background: linear-gradient(135deg, #166534, #4ade80);
          color: #03120a;
        }
      </style>
      <div class="backdrop" ${this.hidden ? "hidden" : ""}>
        <section class="panel" role="dialog" aria-modal="true" aria-labelledby="signup-modal-title">
          <div class="header">
            <div>
              <p class="eyebrow">Join the meme club</p>
              <h2 class="title" id="signup-modal-title">Sign up to unlock the fun</h2>
              <p class="copy">
                Create an account to do more than browse. Members can upload files, keep track of their favorite posts, and jump into community events.
              </p>
            </div>
            <button class="close-button" id="close-button" type="button" aria-label="Close signup">×</button>
          </div>
          <div class="section">
            <ul class="benefits">
              <li class="benefit">
                Upload your own files
                <span class="benefit-copy">Share memes, reactions, and fresh content directly from your device.</span>
              </li>
              <li class="benefit">
                View your Liked Memes
                <span class="benefit-copy">Save favorites and come back to your best finds anytime.</span>
              </li>
              <li class="benefit">
                Participate in meme contests
                <span class="benefit-copy">Enter community challenges and compete for the top spot.</span>
              </li>
            </ul>
          </div>
          <div class="actions">
            <button class="button button-secondary" id="login-button" type="button">Log In</button>
            <button class="button button-primary" id="signup-button" type="button">Sign Up</button>
          </div>
        </section>
      </div>
    `;

    this.shadowRoot.querySelector(".backdrop")?.addEventListener("click", this.handleBackdropClick);
    this.shadowRoot.querySelector("#close-button")?.addEventListener("click", () => this.close());
    this.shadowRoot.querySelector("#login-button")?.addEventListener("click", () => this.handleActionClick("login"));
    this.shadowRoot.querySelector("#signup-button")?.addEventListener("click", () => this.handleActionClick("signup"));
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

  handleActionClick(action) {
    this.dispatchEvent(
      new CustomEvent(action, {
        bubbles: true,
        composed: true,
        detail: {
          authUrl: this.authUrl
        }
      })
    );
  }
}

if (!customElements.get("signup-modal")) {
  customElements.define("signup-modal", SignupModal);
}
