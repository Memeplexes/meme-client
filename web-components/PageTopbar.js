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
          top: 0;
          left: var(--side-menu-width, 250px);
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

        @media (max-width: 767px) {
          :host {
            left: 0;
            padding: 10px 10px 0;
          }

          .page-topbar-inner {
            padding: 10px 12px;
          }

          .page-topbar-count-value {
            font-size: 20px;
          }

          .view-toggle {
            padding: 10px 14px;
          }
        }
      </style>
      <div class="page-topbar-inner" role="group" aria-label="${ariaLabel}">
        <div class="page-topbar-count">
          <strong class="page-topbar-count-value" data-page-topbar-total-memes>--</strong>
          <span class="page-topbar-count-label">Memes</span>
        </div>
        <label class="search-box" for="search-input">
          <search-bar-tags id="search-input" placeholder="Search..." initial-query=""></search-bar-tags>
        </label>
        <button class="view-toggle" id="view-toggle" type="button" aria-pressed="false" data-grid-view-label="▦ Grid" data-list-view-label="☰ List">▦ Grid</button>
      </div>
    `;
  }

  get totalMemesElement() {
    return this.shadowRoot?.querySelector("[data-page-topbar-total-memes]") || null;
  }

  get searchInput() {
    return this.shadowRoot?.querySelector("search-bar-tags#search-input") || null;
  }

  get toggleButton() {
    return this.shadowRoot?.querySelector("#view-toggle") || null;
  }
}

if (!customElements.get("page-topbar")) {
  customElements.define("page-topbar", PageTopbar);
}
