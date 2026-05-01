class FeedNavbar extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const title = this.getAttribute("title") || "Top";
    const ranges = ["Today", "Week", "Month", "All"];
    const activeRange = (this.getAttribute("active-range") || "Today").toLowerCase();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 700px;
          margin: 0 auto;
          padding: 0 10px 14px;
          box-sizing: border-box;
        }

        .feed-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .feed-navbar-title {
          margin: 0;
          font: inherit;
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
        }

        .feed-navbar-buttons {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.94);
        }

        button {
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          padding: 8px 14px;
          font: inherit;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background-color 160ms ease, color 160ms ease;
        }

        button[aria-pressed="true"] {
          background: #24a153;
          color: #fff;
        }

        @media (max-width: 767px) {
          :host {
            padding-bottom: 12px;
          }

          .feed-navbar {
            align-items: stretch;
          }

          .feed-navbar-buttons {
            width: 100%;
            justify-content: space-between;
          }

          button {
            flex: 1 1 0;
            padding: 8px 10px;
          }
        }
      </style>
      <div class="feed-navbar">
        <h2 class="feed-navbar-title">${title}</h2>
        <div class="feed-navbar-buttons" role="toolbar" aria-label="Feed range">
          ${ranges
            .map(
              (range) => `
                <button type="button" data-range="${range.toLowerCase()}" aria-pressed="${range.toLowerCase() === activeRange}">
                  ${range}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    `;

    this.shadowRoot.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-range]");
      if (!button) {
        return;
      }

      const { range } = button.dataset;
      this.shadowRoot.querySelectorAll("button[data-range]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      this.dispatchEvent(
        new CustomEvent("rangechange", {
          detail: { range },
          bubbles: true
        })
      );
    });
  }
}

if (!customElements.get("feed-navbar")) {
  customElements.define("feed-navbar", FeedNavbar);
}
