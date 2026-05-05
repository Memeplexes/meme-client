const CONTESTS = [
  {
    id: "reaction-faceoff",
    title: "Reaction Face-Off",
    tag: "reaction-faceoff",
    description: "Vote on the best instant-reaction memes from this week's uploads.",
    memesCount: 18,
    votesCount: 244,
    endsAt: "May 10, 2026"
  },
  {
    id: "pets-with-jobs",
    title: "Pets With Jobs",
    tag: "pets-with-jobs",
    description: "Animal memes pretending to work harder than the rest of us.",
    memesCount: 12,
    votesCount: 187,
    endsAt: "May 14, 2026"
  },
  {
    id: "retro-chaos",
    title: "Retro Chaos",
    tag: "retro-chaos",
    description: "Old-school image macros, vintage screenshots, and maximal nostalgia.",
    memesCount: 9,
    votesCount: 131,
    endsAt: "May 18, 2026"
  }
];

const CONTESTS_PER_PAGE = 6;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function contestFeedHref(tag) {
  const url = new URL(window.location.href);
  url.searchParams.set("q", tag);
  url.searchParams.delete("c");
  return `${url.pathname}${url.search}${url.hash}`;
}

class MemeContests extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentPage = 1;
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";
    this.render();
  }

  contestPlaceholder(contest) {
    const initials = contest.title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase() || "")
      .join("");

    return `
      <div class="contest-feature" aria-hidden="true">
        <div class="contest-feature-badge">Featured</div>
        <div class="contest-feature-title">${escapeHtml(initials || "MC")}</div>
        <div class="contest-feature-tag">#${escapeHtml(contest.tag)}</div>
      </div>
    `;
  }

  renderPagination(totalPages) {
    if (totalPages <= 1) {
      return "";
    }

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return `
      <nav class="pagination" aria-label="Contest pages">
        <button class="page-button" type="button" data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? "disabled" : ""}>
          Previous
        </button>
        <div class="page-list">
          ${pages.map(page => `
            <button
              class="page-button ${page === this.currentPage ? "is-active" : ""}"
              type="button"
              data-page="${page}"
              aria-current="${page === this.currentPage ? "page" : "false"}"
            >
              ${page}
            </button>
          `).join("")}
        </div>
        <button class="page-button" type="button" data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? "disabled" : ""}>
          Next
        </button>
      </nav>
    `;
  }

  render() {
    const totalPages = Math.max(1, Math.ceil(CONTESTS.length / CONTESTS_PER_PAGE));
    this.currentPage = Math.min(this.currentPage, totalPages);
    const pageStart = (this.currentPage - 1) * CONTESTS_PER_PAGE;
    const visibleContests = CONTESTS.slice(pageStart, pageStart + CONTESTS_PER_PAGE);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: inherit;
          font-family: inherit;
        }

        .layout {
          display: grid;
          gap: 16px;
        }

        .card,
        .contest-card {
          border-radius: 16px;
          border: 1px solid var(--theme-border-soft);
          background: var(--theme-surface-glass-faint);
        }

        .card {
          display: grid;
          gap: 12px;
          padding: 18px;
        }

        .coming-soon-card {
          gap: 8px;
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .header-copy {
          display: grid;
          gap: 8px;
        }

        h1,
        h2,
        p {
          margin: 0;
        }

        h1 {
          font-size: 20px;
          font-weight: 700;
        }

        .subtitle,
        .meta,
        .empty-state {
          color: var(--theme-text-primary-72);
          font-size: 14px;
          line-height: 1.5;
        }

        .create-button,
        .view-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 120ms ease, opacity 120ms ease, border-color 120ms ease;
        }

        .create-button {
          border: 1px dashed var(--theme-white-20);
          background: var(--theme-surface-glass-faint);
          color: var(--theme-text-primary-90);
          cursor: not-allowed;
          opacity: 0.75;
        }

        .view-link {
          border: 1px solid var(--theme-sky-border-soft);
          background: var(--theme-sky-surface-soft);
          color: var(--theme-info-text);
        }

        .view-link:hover,
        .view-link:focus-visible {
          transform: translateY(-1px);
          border-color: var(--theme-sky-border);
        }

        .create-button:focus-visible,
        .view-link:focus-visible {
          outline: 2px solid var(--theme-sky-outline);
          outline-offset: 2px;
        }

        .contest-list {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }

        .contest-card {
          display: grid;
          gap: 12px;
          padding: 16px;
          overflow: hidden;
        }

        .contest-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        h2 {
          font-size: 17px;
          font-weight: 700;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--theme-white-07);
          color: var(--theme-text-primary-80);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .stats {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .stat {
          padding: 8px 10px;
          border-radius: 10px;
          background: var(--theme-surface-glass-soft);
          color: var(--theme-text-primary-82);
          font-size: 13px;
        }

        .contest-feature {
          display: none;
          align-content: space-between;
          min-height: 148px;
          padding: 16px;
          border-radius: 14px;
          background:
            radial-gradient(circle at top left, var(--theme-sky-glow), transparent 45%),
            linear-gradient(135deg, var(--theme-sky-surface), var(--theme-blue-panel));
          border: 1px solid var(--theme-border-soft);
        }

        .contest-feature-badge,
        .contest-feature-tag {
          width: fit-content;
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--theme-blue-panel-soft);
          color: var(--theme-text-primary-82);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .contest-feature-title {
          font-size: clamp(32px, 7vw, 44px);
          font-weight: 800;
          line-height: 1;
          color: var(--theme-info-bright);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .page-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .page-button {
          min-width: 44px;
          min-height: 44px;
          padding: 0 14px;
          border: 1px solid var(--theme-white-12);
          border-radius: 999px;
          background: var(--theme-surface-glass-faint);
          color: var(--theme-text-primary-88);
          font: inherit;
          cursor: pointer;
          transition: transform 120ms ease, border-color 120ms ease, opacity 120ms ease;
        }

        .page-button:hover,
        .page-button:focus-visible {
          transform: translateY(-1px);
          border-color: var(--theme-sky-border);
        }

        .page-button.is-active {
          background: var(--theme-sky-surface-strong);
          border-color: var(--theme-sky-border);
          color: var(--theme-info-text);
        }

        .page-button:disabled {
          cursor: default;
          opacity: 0.45;
          transform: none;
        }

        @media (max-width: 640px) {
          .header,
          .contest-top {
            flex-direction: column;
          }

          .create-button,
          .view-link {
            width: 100%;
          }

          .pagination {
            align-items: stretch;
          }

          .page-list {
            width: 100%;
          }
        }
      </style>

      <section class="layout">
        <section class="card coming-soon-card" aria-label="Meme contests coming soon">
          <div class="header">
            <div class="header-copy">
              <h1>Meme Contests coming soon</h1>
              <p class="subtitle">Dedicated contest creation and standalone contest pages are still being built.</p>
            </div>
          </div>
          <p class="meta">The current contest cards stay available below for browsing and voting, while the old featured placeholder art is hidden by default for now.</p>
        </section>
                      <!--

        <section class="card">
          <div class="header">
            <div class="header-copy">
              <h1>Active meme contests</h1>
              <p class="subtitle">Browse current contests, open the tagged meme feed, and vote on entries in the existing meme flow.</p>
            </div>
            <button class="create-button" type="button" disabled title="Contest creation coming soon">
              Create contest
            </button>
          </div>
          <p class="meta">Contest descriptions, deadlines, and dedicated voting views can live here later. For now each contest opens the regular feed filtered by its contest tag.</p>
        </section>

        <section class="contest-list" aria-label="Active contests">
          ${visibleContests.length ? visibleContests.map(contest => `
            <article class="contest-card">
              ${this.contestPlaceholder(contest)}
              <div class="contest-top">
                <div>
                  <h2>${escapeHtml(contest.title)}</h2>
                  <p class="subtitle">${escapeHtml(contest.description)}</p>
                </div>
                <span class="tag">#${escapeHtml(contest.tag)}</span>
              </div>
              <div class="stats">
                <span class="stat">${contest.memesCount} memes</span>
                <span class="stat">${contest.votesCount} votes</span>
                <span class="stat">Ends ${escapeHtml(contest.endsAt)}</span>
              </div>
              <a class="view-link" href="${escapeHtml(contestFeedHref(contest.tag))}">
                View contest memes and vote
              </a>
            </article>
          `).join("") : `
            <p class="empty-state">No active contests right now.</p>
          `}
        </section>
                -->

        ${this.renderPagination(totalPages)}
      </section>
    `;

    this.shadowRoot.querySelectorAll("[data-page]").forEach(button => {
      button.addEventListener("click", () => {
        const nextPage = Number(button.getAttribute("data-page"));
        if (!Number.isFinite(nextPage) || nextPage < 1 || nextPage > totalPages || nextPage === this.currentPage) {
          return;
        }
        this.currentPage = nextPage;
        this.render();
      });
    });
  }
}

if (!customElements.get("meme-contests")) {
  customElements.define("meme-contests", MemeContests);
}
