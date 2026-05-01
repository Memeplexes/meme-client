import { getTrendingTags } from "../../api.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

class TrendingTags extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";
    this.renderMessage("Loading trending tags...");
    this.load();
  }

  async load() {
    try {
      const limit = Number(this.getAttribute("limit")) || 20;
      const tags = await getTrendingTags({ limit });
      const normalizedTags = (Array.isArray(tags) ? tags : [])
        .map(tag => ({
          name: typeof tag?.name === "string" ? tag.name.trim() : "",
          count: Number(tag?.meme_count) || 0
        }))
        .filter(tag => tag.name);

      if (!normalizedTags.length) {
        this.renderMessage("No trending tags yet.");
        return;
      }

      this.renderList(normalizedTags);
    } catch (error) {
      console.error("[trending-tags] failed to load tags", error);
      this.renderMessage("Unable to load trending tags right now.");
    }
  }

  renderMessage(message) {
    const title = this.getAttribute("title") || "Trending tags";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: inherit;
          font-family: inherit;
        }

        .card {
          display: grid;
          gap: 12px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.72);
        }
      </style>
      <section class="card">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
      </section>
    `;
  }

  renderList(tags) {
    const title = this.getAttribute("title") || "Trending tags";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: inherit;
          font-family: inherit;
        }

        .card {
          display: grid;
          gap: 16px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
        }

        .tag-name {
          font-size: 15px;
          font-weight: 600;
        }

        .tag-count {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
        }
      </style>
      <section class="card">
        <h1>${escapeHtml(title)}</h1>
        <ul>
          ${tags.map(tag => `
            <li>
              <span class="tag-name">#${escapeHtml(tag.name)}</span>
              <span class="tag-count">${tag.count} memes</span>
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  }
}

if (!customElements.get("trending-tags")) {
  customElements.define("trending-tags", TrendingTags);
}
