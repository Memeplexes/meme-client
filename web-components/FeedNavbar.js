class FeedNavbar extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 0 0 1rem;
          color: #fff;
        }

        .wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.06);
        }

        h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
        }

        .buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        button {
          border: 0;
          border-radius: 999px;
          padding: 0.45rem 0.9rem;
          background: rgba(255, 255, 255, 0.1);
          color: inherit;
          font: inherit;
          cursor: pointer;
        }

        button[aria-pressed="true"] {
          background: #fff;
          color: #111;
        }
      </style>
      <div class="wrap">
        <h2>Feed</h2>
        <div class="buttons" role="toolbar" aria-label="Feed range">
          <button type="button" aria-pressed="true">Today</button>
          <button type="button" aria-pressed="false">Week</button>
          <button type="button" aria-pressed="false">Month</button>
          <button type="button" aria-pressed="false">All</button>
        </div>
      </div>
    `;
  }
}

customElements.define("feed-navbar", FeedNavbar);
