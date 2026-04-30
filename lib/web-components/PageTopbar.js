import "./UploadButton.js";

let AUTH_URL = "/api/meme/login";
AUTH_URL = "http://localhost:8888/api/meme/login";

class PageTopbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.shadowRoot.children.length > 0) {
      return;
    }
    const ariaLabel = this.getAttribute("aria-label") || "Feed controls";
    const username = localStorage.getItem("memeplexes-username");
    const authControls = username
      ? `
        <div class="auth-menu">
          <button
            class="auth-button auth-button-logged-in"
            id="auth-menu-button"
            type="button"
            aria-haspopup="true"
            aria-expanded="false"
          >${username}</button>
          <div class="auth-dropdown" id="auth-dropdown" hidden>
            <button class="auth-dropdown-button" id="logout-button" type="button">Logout</button>
          </div>
        </div>
      `
      : '<button class="auth-button" id="login-button" type="button">Login</button>';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1002;
          display: flex;
          justify-content: center;
          pointer-events: none;
          box-sizing: border-box;
        }

        .page-topbar-inner {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(17, 17, 17, 0.94);
          box-sizing: border-box;
          pointer-events: auto;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .page-topbar-count {
          min-width: 0;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding-left: 8px;
          gap: 14px;
        }

        .page-topbar-count-value {
          font-size: 14px;
          font-weight: 700;
          line-height: 1;
          color: #1eab55;
        }

        .page-topbar-count-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.6);
        }

        .sidebar-controls {
          display: inline-flex;
          align-items: stretch;
          overflow: hidden;
          border-radius: 999px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .sidebar-visibility-toggle {
          border: 0;
          background: transparent;
          color: white;
          font-size: 12px;
          cursor: pointer;
        }

        .sidebar-visibility-toggle:hover {
          /* background: rgba(255, 255, 255, 0.08); */
        }

        .sidebar-visibility-toggle {
          position: relative;
          min-width: 96px;
          padding: 12px 16px 12px 52px;
          text-align: left;
        }

        .sidebar-visibility-toggle::before,
        .sidebar-visibility-toggle::after {
          content: "";
          position: absolute;
          top: 14px;
          bottom: 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
        }

        .sidebar-visibility-toggle::before {
          left: 12px;
          width: 8px;
        }

        .sidebar-visibility-toggle::after {
          left: 24px;
          width: 10px;
          opacity: 0.5;
        }

        .search-box {
          width: min(100%, 700px);
          margin: 0 auto;
          pointer-events: auto;
        }

        .search-box search-bar-tags {
          display: block;
          width: 100%;
          box-sizing: border-box;
        }

        .view-toggle {
          border: none;
          background: rgba(17, 17, 17, 0.94);
          color: #1eab55;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
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
          :host {
            left: 0;
            padding: 10px 10px 0;
          }

          .page-topbar-inner {
            padding: 10px 12px;
          }

          .page-topbar-count {
            display: none;
          }

          .page-topbar-count-value {
            font-size: 20px;
          }

          .sidebar-controls {
            display: none;
          }
          .search-box {
            padding-left: 8px;
          }
          .view-toggle {
            padding: 10px 14px;
          }

          .auth-button {
            padding: 10px 14px;
          }
        }
      </style>
      <div class="page-topbar-inner" role="group" aria-label="${ariaLabel}">
        <div class="sidebar-controls" aria-label="Sidebar controls" role="group">
          <button class="sidebar-visibility-toggle" id="sidebar-visibility-toggle" type="button" aria-controls="side-menu">Menu</button>
        </div>
        <div class="page-topbar-count">
          <strong class="page-topbar-count-value" data-page-topbar-total-memes>--</strong>
          <span class="page-topbar-count-label">Memes</span>
        </div>
        <label class="search-box" for="search-input">
          <search-bar-tags id="search-input" placeholder="Search..." initial-query=""></search-bar-tags>
        </label>
        <button class="view-toggle" id="view-toggle" type="button" aria-pressed="false" data-grid-view-label="▦ Grid" data-list-view-label="☰ List">▦ Grid</button>
        <upload-button auth-url="${AUTH_URL}"></upload-button>
        ${authControls}
      </div>
    `;

    const loginButton = this.shadowRoot.querySelector("#login-button");
    if (loginButton) {
      loginButton.addEventListener("click", () => {
        window.location.href = AUTH_URL;
      });
    }

    const logoutButton = this.shadowRoot.querySelector("#logout-button");
    const authMenuButton = this.shadowRoot.querySelector("#auth-menu-button");
    const authDropdown = this.shadowRoot.querySelector("#auth-dropdown");

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

    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("memeplexes-username");
        window.location.reload();
      });
    }
  }

  get totalMemesElement() {
    return this.shadowRoot?.querySelector("[data-page-topbar-total-memes]") || null;
  }

  get searchInput() {
    return this.shadowRoot?.querySelector("search-bar-tags#search-input") || null;
  }

  get homeButton() {
    return this.sidebarToggleButton;
  }

  get sidebarToggleButton() {
    return this.shadowRoot?.querySelector("#sidebar-visibility-toggle") || null;
  }

  get toggleButton() {
    return this.shadowRoot?.querySelector("#view-toggle") || null;
  }
}

if (!customElements.get("page-topbar")) {
  customElements.define("page-topbar", PageTopbar);
}
