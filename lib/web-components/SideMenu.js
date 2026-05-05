import { getTopCreators, getTrendingTags } from "../api/api.js";
import "./CreatorCard.js";

class SideMenu extends HTMLElement {
  #shadow;
  #open = false;
  #trendingTags = [];
  #topCreators = [];
  #isTrendingTagsLoading = false;
  #trendingTagsError = "";
  #topCreatorsError = "";
  #hasLoadedTrendingTags = false;
  #hasBoundLocationEvents = false;

  static get observedAttributes() {
    return ["title", "open", "toggle-label", "menu-label"];
  }

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#render();
  }

  connectedCallback() {
    this.#syncOpenState();
    this.#bindEvents();
    this.#syncLocationState();
    this.#loadTrendingTags();
  }

  attributeChangedCallback() {
    this.#render();
    this.#syncOpenState();
    this.#bindEvents();
    this.#syncLocationState();
  }

  get open() {
    return this.#open;
  }

  set open(value) {
    const isOpen = Boolean(value);
    this.#open = isOpen;
    this.toggleAttribute("open", isOpen);
    this.#syncOpenState();
  }

  close() {
    if (!this.#open) {
      return;
    }

    this.open = false;
    this.dispatchEvent(new CustomEvent("side-menu-toggle", {
      detail: { open: false },
      bubbles: true
    }));
  }

  #bindEvents() {
    this.#shadow.querySelector("[data-side-menu-toggle]")?.addEventListener("click", () => {
      this.open = true;
      this.dispatchEvent(new CustomEvent("side-menu-toggle", {
        detail: { open: true },
        bubbles: true
      }));
    });

    this.#shadow.querySelector("[data-side-menu-close]")?.addEventListener("click", () => {
      this.close();
    });

    this.#shadow.querySelector("[data-side-menu-backdrop]")?.addEventListener("click", () => {
      this.close();
    });

    this.#shadow.querySelector("[data-trending-tags-retry]")?.addEventListener("click", () => {
      this.#loadTrendingTags({ force: true });
    });

    this.#shadow.querySelector("[data-trending-tags-list]")?.addEventListener("click", event => {
      const tagButton = event.target.closest("[data-trending-tag]");
      if (!tagButton) {
        return;
      }

      this.#applyTrendingTag(tagButton.dataset.trendingTag || "");
    });

    this.#shadow.querySelector("slot")?.addEventListener("slotchange", () => {
      this.#bindSlottedItemEvents();
      this.#syncSelectedState();
    });

    if (!this.#hasBoundLocationEvents) {
      window.addEventListener("popstate", () => {
        this.#syncLocationState();
      });

      window.addEventListener("meme-client:search-location-change", () => {
        this.#syncLocationState();
      });

      this.#hasBoundLocationEvents = true;
    }

    this.#bindSlottedItemEvents();
    this.#syncSelectedState();
  }

  #bindSlottedItemEvents() {
    this.#getMenuItems().forEach(item => {
      if (item.dataset.sideMenuBound === "true") {
        return;
      }

      item.dataset.sideMenuBound = "true";
      item.addEventListener("click", () => {
        this.#getMenuItems().forEach(link => link.toggleAttribute("data-active", link === item));
        this.#syncSelectedState();
        this.close();
      });
    });
  }

  #getMenuItems() {
    const slot = this.#shadow.querySelector("slot");
    if (!slot) {
      return [];
    }

    return slot
      .assignedElements({ flatten: true })
      .filter(element => element.matches("[data-side-menu-item]"));
  }

  #syncSelectedState() {
    this.#getMenuItems().forEach(item => {
      item.classList.toggle("is-active", item.hasAttribute("data-active"));
    });
  }

  #syncLocationState() {
    const activePath = window.location.pathname === "/" ? "/hot" : window.location.pathname;
    const menuItems = this.#getMenuItems();
    let hasActiveItem = false;

    menuItems.forEach(item => {
      const itemPath = (item.getAttribute("href") || "").trim();
      const isActive = itemPath === activePath;
      item.toggleAttribute("data-active", isActive);
      hasActiveItem = hasActiveItem || isActive;
    });

    if (!hasActiveItem && menuItems[0]) {
      menuItems[0].toggleAttribute("data-active", true);
    }

    this.#syncSelectedState();
  }

  #syncOpenState() {
    const isOpen = this.hasAttribute("open");
    this.#open = isOpen;
    this.#shadow.querySelector("[data-side-menu-toggle]")?.setAttribute("aria-expanded", String(isOpen));
    this.#shadow.querySelector("[data-side-menu-backdrop]")?.toggleAttribute("hidden", !isOpen);
  }

  async #loadTrendingTags({ force = false } = {}) {
    if (this.#isTrendingTagsLoading || (this.#hasLoadedTrendingTags && !force)) {
      return;
    }

    this.#isTrendingTagsLoading = true;
    this.#trendingTagsError = "";
    this.#topCreatorsError = "";
    this.#render();
    this.#bindEvents();
    this.#syncOpenState();
    this.#syncSelectedState();

    try {
      const [trendingTagsResult, topCreatorsResult] = await Promise.allSettled([
        getTrendingTags(),
        getTopCreators()
      ]);

      if (trendingTagsResult.status === "fulfilled") {
        this.#trendingTags = trendingTagsResult.value;
      } else {
        this.#trendingTags = [];
        this.#trendingTagsError = trendingTagsResult.reason instanceof Error
          ? trendingTagsResult.reason.message
          : "Unable to load trending tags.";
      }

      if (topCreatorsResult.status === "fulfilled") {
        this.#topCreators = topCreatorsResult.value;
      } else {
        this.#topCreators = [];
        this.#topCreatorsError = topCreatorsResult.reason instanceof Error
          ? topCreatorsResult.reason.message
          : "Unable to load top creators.";
      }

      this.#hasLoadedTrendingTags = true;
    } finally {
      this.#isTrendingTagsLoading = false;

      if (!this.isConnected) {
        return;
      }

      this.#render();
      this.#bindEvents();
      this.#syncOpenState();
      this.#syncSelectedState();
    }
  }

  #applyTrendingTag(tag) {
    const trimmedTag = tag.trim();
    if (!trimmedTag) {
      return;
    }

    const searchInput = document.querySelector("page-topbar")?.searchInput;
    if (!searchInput) {
      return;
    }

    if (typeof searchInput.addWord === "function") {
      searchInput.addWord(trimmedTag);
    } else {
      const currentValue = String(searchInput.value || "").trim();
      const nextWords = currentValue.split(/\s+/).filter(Boolean);

      if (!nextWords.includes(trimmedTag)) {
        nextWords.push(trimmedTag);
      }

      searchInput.value = nextWords.join(" ");
    }

    searchInput.dispatchEvent(
      new CustomEvent("submit", {
        bubbles: true,
        composed: true,
        detail: {
          value: searchInput.value
        }
      })
    );

    this.close();
  }

  #applyCreatorFilter(creator) {
    const trimmedCreator = creator.trim();
    if (!trimmedCreator) {
      return;
    }

    const feed = document.querySelector("#feed");
    if (!feed) {
      return;
    }

    feed.dispatchEvent(new CustomEvent("meme-client:navigate-search", {
      bubbles: true,
      composed: true,
      detail: {
        creator: trimmedCreator
      }
    }));

    this.close();
  }

  #renderTrendingTagsMarkup() {
    if (this.#isTrendingTagsLoading) {
      return `<p class="trending-tags-status" role="status">Loading trending tags...</p>`;
    }

    if (this.#trendingTagsError) {
      return `
        <div class="trending-tags-feedback">
          <p class="trending-tags-error" role="alert">${this.#escapeHtml(this.#trendingTagsError)}</p>
          <button class="trending-tags-retry" data-trending-tags-retry type="button">Retry</button>
        </div>
      `;
    }

    if (!this.#trendingTags.length) {
      return `<p class="trending-tags-status">No trending tags yet.</p>`;
    }
    const TAG_RENDER_LIMIT = 5;
    return `
      <div class="trending-tags-list" data-trending-tags-list>
        ${this.#trendingTags.slice(0, TAG_RENDER_LIMIT).map(tag => {
          const name = typeof tag?.name === "string" ? tag.name.trim() : "";
          const count = Number(tag?.meme_count) || 0;

          if (!name) {
            return "";
          }

          return `
            <button class="trending-tag" data-trending-tag="${this.#escapeHtml(name)}" type="button">
              <span class="trending-tag-name">#${this.#escapeHtml(name)}</span>
              <span class="trending-tag-count">+${count}</span>
            </button>
          `;
        }).join("")}
      </div>
    `;
  }

  #renderTopCreatorsMarkup() {

    if (this.#isTrendingTagsLoading) {
      return `<p class="trending-tags-status" role="status">Loading top creators...</p>`;
    }

    if (this.#topCreatorsError) {
      return `<p class="trending-tags-error" role="alert">${this.#escapeHtml(this.#topCreatorsError)}</p>`;
    }

    if (!this.#topCreators.length) {
      return `<p class="trending-tags-status">No top creators yet.</p>`;
    }

    return `
      <div class="trending-tags-list">
        ${this.#topCreators.map((creator, index) => {
          const name = typeof creator?.creator === "string" ? creator.creator.trim() : "";
          const count = Number(creator?.meme_count) || 0;

          if (!name) {
            return "";
          }
          return `
            <div class="trending-tag">
              <div data-top-creator-card="${index}"></div>
              <span class="trending-tag-count">+${count}</span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  #hydrateTopCreatorCards() {
    this.#shadow.querySelectorAll("[data-top-creator-card]").forEach(cardMount => {
      const index = Number(cardMount.getAttribute("data-top-creator-card"));
      const creator = this.#topCreators[index];
      const name = typeof creator?.creator === "string" ? creator.creator.trim() : "";

      if (!name) {
        return;
      }

      const card = document.createElement("creator-card").setup({
        name,
        username: creator?.username ?? creator?.handle,
        email: creator?.email,
        avatarUrl: creator?.avatar_url ?? creator?.avatarUrl ?? creator?.profile_image ?? creator?.profileImage
      });

      card.addEventListener("creator-card:filter", event => {
        event.stopPropagation();
        this.#applyCreatorFilter(name);
      });

      cardMount.replaceChildren(card);
    });
  }

  #escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  #render() {
    const title = this.getAttribute("title") || "Menu";
    const toggleLabel = this.getAttribute("toggle-label") || `Open ${title.toLowerCase()}`;
    const menuLabel = this.getAttribute("menu-label") || title;
    this.#shadow.innerHTML = `
      <style>
        :host {
          --side-menu-width: 250px;
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 1000;
          width: var(--side-menu-width);
        }

        .side-menu-toggle,
        .side-menu-backdrop {
          display: none;
        }

        .side-menu {
          position: fixed;
          top: 40px;
          left: 0;
          bottom: 0;
          z-index: 1000;
          width: var(--side-menu-width);
          /* padding: calc(28px + env(safe-area-inset-top)) 20px 24px; */
          padding-top: calc(28px + env(safe-area-inset-top));
          box-sizing: border-box;
          background: #171717;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow: hidden;
        }

        .side-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .side-menu-title {
          margin: 0;
          font-size: 14px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
        }

        .side-menu-list {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 0px;
          overflow-y: auto;
        }

        .side-menu-footer {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 0 16px 20px;
        }

        .side-menu-footer-link {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          text-decoration: none;
        }

        .side-menu-footer-row {
          display: flex;
          gap: 16px;
          width: 100%;
        }

        .side-menu-footer-link:hover,
        .side-menu-footer-link:focus-visible {
          color: rgba(255, 255, 255, 0.9);
          outline: none;
        }

        .trending-tags-panel {
          margin-top: 8px;
          padding-top: 8px;
        }

        .trending-tags-panel + .trending-tags-panel {
          margin-top: 0;
        }

        .trending-tags-heading {
          margin: 0 0 12px;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.52);
          margin-left: 8px;
        }

        .trending-tags-status,
        .trending-tags-error {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.7);
        }

        .trending-tags-feedback {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .trending-tags-error {
          color: #ffb4b4;
        }

        .trending-tags-retry {
          align-self: flex-start;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
        }

        .trending-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .trending-tag {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          border: none;
          background: none;
          color: #d3d3d3;
          padding: 8px 12px;
          font: inherit;
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
        }

        .trending-tag:hover,
        .trending-tag:focus-visible {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.24);
          transform: translateY(-1px);
          outline: none;
        }

        .trending-tag-name {
          font-size: 14px;
        }

        .trending-tag-count {
          min-width: 24px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.28);
          padding: 2px 8px;
          font-size: 12px;
          text-align: center;
          color: #4ade80;
        }

        ::slotted([data-side-menu-item]) {
          /* border: 1px solid rgba(255, 255, 255, 0.08); */
          /* background: rgba(255, 255, 255, 0.04); */
          color: #979797;
          text-decoration: none;
          padding: 14px 16px;
          font-size: 17px;
        }

        ::slotted([data-side-menu-item]):hover,
        ::slotted([data-side-menu-item]:focus-visible) {
          /* background: rgba(255, 255, 255, 0.08); */
          color: #d3d3d3;
          outline: none;
        }

        ::slotted([data-side-menu-item].is-active) {
          background: #172920;
          color: #1eab55;
          font-weight: 700;
        }

        .side-menu-close {
          display: none;
        }

        @media (max-width: 767px) {
          :host {
            width: 0;
            z-index: 1004;
          }

          .side-menu-toggle {
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 1003;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 999px;
            background: rgba(24, 24, 24, 0.94);
            color: white;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          .side-menu-backdrop {
            position: fixed;
            inset: 0;
            z-index: 1003;
            background: rgba(0, 0, 0, 0.5);
          }

          .side-menu {
            z-index: 1004;
            width: min(82vw, 320px);
            transform: translateX(-100%);
            transition: transform 180ms ease;
            box-shadow: 14px 0 40px rgba(0, 0, 0, 0.45);
          }

          .side-menu-close {
            display: block;
            border: 0;
            background: transparent;
            color: white;
            font-size: 30px;
            line-height: 1;
            padding: 0;
            cursor: pointer;
          }

          :host([open]) .side-menu {
            transform: translateX(0);
          }

          :host([open]) .side-menu-backdrop {
            display: block;
          }
        }
      </style>

      <button
        class="side-menu-toggle"
        data-side-menu-toggle
        type="button"
        aria-label="${toggleLabel}"
        aria-controls="side-menu-panel"
        aria-expanded="false"
      >☰</button>
      <div class="side-menu-backdrop" data-side-menu-backdrop hidden></div>
      <nav class="side-menu" id="side-menu-panel" aria-label="${menuLabel}">
        <div class="side-menu-header">
          <p class="side-menu-title">${title}</p>
          <button class="side-menu-close" data-side-menu-close type="button" aria-label="Close ${title.toLowerCase()}">×</button>
        </div>
        <div class="side-menu-list">
          <slot></slot>
          <section class="trending-tags-panel" aria-labelledby="trending-tags-heading">
            <p class="trending-tags-heading" id="trending-tags-heading">Trending Tags</p>
            ${this.#renderTrendingTagsMarkup()}
          </section>
          <section class="trending-tags-panel" id="top-creators" aria-labelledby="top-creators-heading">
            <p class="trending-tags-heading" id="top-creators-heading">Top Creators</p>
            ${this.#renderTopCreatorsMarkup()}
          </section>
        </div>
        <div class="side-menu-footer">
          <div class="side-menu-footer-row">
            <!-- <a class="side-menu-footer-link" href="/about">About</a> -->
            <a class="side-menu-footer-link" href="https://api.danks.meme" target="_blank" rel="noreferrer">API</a>
          </div>
          <span class="side-menu-footer-link" aria-hidden="true">© 2026 Memeplexes Inc.</span>
        </div>
      </nav>
    `;

    this.#hydrateTopCreatorCards();
  }
}

customElements.define("side-menu", SideMenu);
