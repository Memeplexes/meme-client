class SideMenu extends HTMLElement {
  #shadow;
  #open = false;

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
  }

  attributeChangedCallback() {
    this.#render();
    this.#syncOpenState();
    this.#bindEvents();
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

    this.#shadow.querySelector("slot")?.addEventListener("slotchange", () => {
      this.#bindSlottedItemEvents();
      this.#syncSelectedState();
    });

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

  #syncOpenState() {
    const isOpen = this.hasAttribute("open");
    this.#open = isOpen;
    this.#shadow.querySelector("[data-side-menu-toggle]")?.setAttribute("aria-expanded", String(isOpen));
    this.#shadow.querySelector("[data-side-menu-backdrop]")?.toggleAttribute("hidden", !isOpen);
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
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 1000;
          width: var(--side-menu-width);
          padding: calc(28px + env(safe-area-inset-top)) 20px 24px;
          box-sizing: border-box;
          background: #171717;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 18px;
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
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        ::slotted([data-side-menu-item]) {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          color: white;
          text-decoration: none;
          padding: 14px 16px;
          font-size: 17px;
        }

        ::slotted([data-side-menu-item].is-active) {
          background: white;
          color: #111;
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
        </div>
      </nav>
    `;
  }
}

customElements.define("side-menu", SideMenu);
