import "./AccountSettingsPanel.js";

class AuthMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleOpenSettings = this.handleOpenSettings.bind(this);
    this.handleDisplayNameUpdated = this.handleDisplayNameUpdated.bind(this);
  }

  connectedCallback() {
    this.render();
    window.addEventListener("memeplexes:display-name-updated", this.handleDisplayNameUpdated);
  }

  disconnectedCallback() {
    window.removeEventListener("memeplexes:display-name-updated", this.handleDisplayNameUpdated);
  }

  render() {
    const displayName = localStorage.getItem("memeplexes-display-name");
    const username = localStorage.getItem("memeplexes-username");
    const accountLabel = displayName || username;
    const authControls = username
      ? `
        <div class="auth-menu">
          <button
            class="auth-button auth-button-logged-in"
            id="auth-menu-button"
            type="button"
            aria-haspopup="true"
            aria-expanded="false"
          >${accountLabel}</button>
          <div class="auth-dropdown" id="auth-dropdown" hidden>
            <button class="auth-dropdown-button" id="settings-button" type="button">Settings</button>
            <button class="auth-dropdown-button" id="my-memes-button" type="button">My Memes</button>
            <button class="auth-dropdown-button" id="logout-button" type="button">Logout</button>
          </div>
        </div>
      `
      : '<button class="auth-button" id="login-button" type="button">Login</button>';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
        }

        .auth-button {
          border: none;
          background: rgba(17, 17, 17, 0.94);
          color: white;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .auth-menu {
          position: relative;
        }

        .auth-button-logged-in {
          color: rgba(255, 255, 255, 0.8);
        }

        .auth-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 100%;
          padding: 6px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(17, 17, 17, 0.98);
          box-sizing: border-box;
        }

        .auth-dropdown[hidden] {
          display: none;
        }

        .auth-dropdown-button {
          width: 100%;
          border: none;
          background: transparent;
          color: white;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }

        @media (max-width: 767px) {
          .auth-button {
            padding: 10px 14px;
          }
        }
      </style>
      ${authControls}
    `;

    const loginButton = this.shadowRoot.querySelector("#login-button");
    if (loginButton) {
      loginButton.addEventListener("click", () => {
        window.location.href = this.authUrl;
      });
    }

    const logoutButton = this.shadowRoot.querySelector("#logout-button");
    const myMemesButton = this.shadowRoot.querySelector("#my-memes-button");
    const settingsButton = this.shadowRoot.querySelector("#settings-button");
    const authMenuButton = this.shadowRoot.querySelector("#auth-menu-button");
    const authDropdown = this.shadowRoot.querySelector("#auth-dropdown");

    if (myMemesButton) {
      myMemesButton.addEventListener("click", () => {
        const storedUsername = localStorage.getItem("memeplexes-username");
        if (storedUsername) {
          window.location.href = `?c=${encodeURIComponent(storedUsername)}`;
        }
      });
    }

    if (authMenuButton && authDropdown) {
      authMenuButton.addEventListener("click", () => {
        const isOpen = !authDropdown.hidden;
        authDropdown.hidden = isOpen;
        authMenuButton.setAttribute("aria-expanded", String(!isOpen));
      });

      this.shadowRoot.addEventListener("click", (event) => {
        if (!event.composedPath().includes(authMenuButton) && !event.composedPath().includes(authDropdown)) {
          authDropdown.hidden = true;
          authMenuButton.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (settingsButton) {
      settingsButton.addEventListener("click", this.handleOpenSettings);
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("memeplexes-username");
        localStorage.removeItem("memeplexes-display-name");
        window.location.reload();
      });
    }
  }

  get authUrl() {
    return this.getAttribute("auth-url") || "/api/meme/login";
  }

  getOrCreateSettingsPanel() {
    let panel = document.querySelector("account-settings-panel");
    if (!panel) {
      panel = document.createElement("account-settings-panel");
      document.body.appendChild(panel);
    }
    return panel;
  }

  handleOpenSettings() {
    this.shadowRoot.querySelector("#auth-dropdown")?.setAttribute("hidden", "");
    this.shadowRoot.querySelector("#auth-menu-button")?.setAttribute("aria-expanded", "false");
    this.getOrCreateSettingsPanel().open();
  }

  handleDisplayNameUpdated() {
    this.render();
  }
}

if (!customElements.get("auth-menu")) {
  customElements.define("auth-menu", AuthMenu);
}
