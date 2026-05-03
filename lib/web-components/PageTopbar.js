import "./AuthMenu.js";
import "./UploadButton.js";
import { MEME_CONFIG } from "../config.js";

const AUTH_URL = MEME_CONFIG.authUrl;

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
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 40px;
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
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(17, 17, 17, 0.94);
          box-sizing: border-box;
          pointer-events: auto;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .page-topbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-topbar-title a {
          color: inherit;
          text-decoration: none;
        }
        .page-topbar-count {
          min-width: 0;
          display: none;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding-left: 8px;
          gap: 6px;
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
          cursor: pointer;
          position: relative;
          width: 44px;
          height: 44px;
          padding: 0;
        }

        .sidebar-visibility-toggle::before,
        .sidebar-visibility-toggle::after,
        .sidebar-visibility-toggle .sidebar-visibility-toggle-icon {
          content: "";
          position: absolute;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          left: 12px;
          width: 20px;
          height: 2px;
        }

        .sidebar-visibility-toggle::before {
          top: 14px;
        }

        .sidebar-visibility-toggle::after {
          top: 28px;
        }

        .sidebar-visibility-toggle .sidebar-visibility-toggle-icon {
          top: 21px;
        }

        .search-box {
          margin-left: auto;
          width: min(100%, 520px);
          /* margin-right: 44px; */
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

        @media (max-width: 767px) {
          :host {
            left: 0;
            padding: 10px 10px 0;
          }

          .page-topbar-inner {
            padding: 10px 12px;
          }

          feed-topbar {
            order: 10;
            flex: 1 0 100%;
            min-width: 0;
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

          upload-button {
            display: none;
          }

          .page-topbar-actions {
          }

          .search-box {
            margin-left: 0;
            padding-left: 8px;
          }
          .view-toggle {
            padding: 10px 14px;
          }
        }
      </style>
      <div class="page-topbar-inner" role="group" aria-label="${ariaLabel}">
        <div class="sidebar-controls" aria-label="Sidebar controls" role="group">
          <button class="sidebar-visibility-toggle" id="sidebar-visibility-toggle" type="button" aria-controls="side-menu" aria-label="Toggle sidebar">
            <span class="sidebar-visibility-toggle-icon" aria-hidden="true"></span>
          </button>
        </div>
        <div class="page-topbar-title">
          <a href="/">danks.meme</a>
        </div>
        <div class="page-topbar-count">
          <strong class="page-topbar-count-value" data-page-topbar-total-memes>--</strong>
          <span class="page-topbar-count-label">Memes</span>
        </div>
        <label class="search-box" for="search-input">
          <search-bar-tags id="search-input" placeholder="Search..." initial-query=""></search-bar-tags>
        </label>
        <feed-topbar></feed-topbar>
        <!-- Remark: Removed for now since it was conflicting with new responsive CSS grid layout...
          <button class="view-toggle" id="view-toggle" type="button" aria-pressed="false" data-grid-view-label="▦ Grid" data-list-view-label="☰ List">▦ Grid</button>
        -->
        <div class="page-topbar-actions">
          <upload-button auth-url="${AUTH_URL}"></upload-button>
          <auth-menu auth-url="${AUTH_URL}"></auth-menu>
        </div>
      </div>
    `;
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
