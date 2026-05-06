import { listContests } from "../../../api/contests.js";
import "../../SignupPanel.js";
import "./CreateContestPanel.js";
import { MEME_CONFIG } from "../../../config.js";

const CONTESTS_PER_PAGE = 6;
const AUTH_URL = MEME_CONFIG.authUrl;

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
  url.searchParams.set("cn", tag);
  url.searchParams.delete("c");
  return `/${url.search}${url.hash}`;
}

function formatContestDate(value) {
  if (!value) {
    return "TBD";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function deriveContestTag(contest) {
  const themeTag = Array.isArray(contest?.themeTags)
    ? contest.themeTags.find(tag => typeof tag === "string" && tag.trim())
    : "";
  const primaryTag = themeTag || contest?.tag;

  return String(
    primaryTag
    ?? contest?.slug
    ?? contest?.id
    ?? contest?.title
    ?? ""
  )
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function toContestTime(value) {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function deriveContestStatus(contest) {
  const normalizedStatus = String(contest?.status ?? "").trim().toLowerCase();
  if (normalizedStatus === "active" || normalizedStatus === "upcoming" || normalizedStatus === "ended") {
    return normalizedStatus;
  }

  const now = Date.now();
  const startsAtTime = toContestTime(contest?.startsAt);
  const endsAtTime = toContestTime(contest?.endsAtRaw);

  if (startsAtTime !== null && startsAtTime > now) {
    return "upcoming";
  }

  if (endsAtTime !== null && endsAtTime < now) {
    return "ended";
  }

  return "active";
}

function normalizeContest(contest, index) {
  const title = String(contest?.title ?? contest?.name ?? "").trim();
  const tag = deriveContestTag(contest);

  if (!title || !tag) {
    return null;
  }

  const startsAt = contest?.startTime ?? contest?.startsAt ?? contest?.startDate ?? null;
  const endsAtRaw = contest?.endTime ?? contest?.endsAt ?? contest?.endDate ?? null;

  return {
    id: String(contest?.id ?? contest?._id ?? tag ?? index),
    title,
    tag,
    status: String(contest?.status ?? "").trim().toLowerCase(),
    startsAt,
    description: String(contest?.description ?? contest?.rules ?? "").trim(),
    memesCount: Number(
      contest?.memesCount
      ?? contest?.memeCount
      ?? contest?.submissionCount
      ?? contest?.submissionsCount
      ?? contest?.entriesCount
      ?? contest?.submissions?.length
      ?? 0
    ) || 0,
    votesCount: Number(
      contest?.votesCount
      ?? contest?.voteCount
      ?? contest?.totalVotes
      ?? contest?.votes
      ?? 0
    ) || 0,
    endsAtRaw,
    endsAt: formatContestDate(endsAtRaw)
  };
}

class MemeContests extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentPage = 1;
    this.contests = [];
    this.myContests = [];
    this.isLoading = true;
    this.isLoadingMine = true;
    this.errorMessage = "";
    this.myContestsErrorMessage = "";
    this.isCreatePanelOpen = false;
  }

  get authUrl() {
    return this.getAttribute("auth-url") || AUTH_URL || "/api/meme/login";
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";
    this.render();
    this.load();
  }

  getCurrentUsername() {
    const username = localStorage.getItem("memeplexes-username") || "";
    if (!username || username.trim().toLowerCase() === "guest") {
      return "";
    }

    return username.trim();
  }

  async load() {
    const username = this.getCurrentUsername();
    try {
      const [contests, myContests] = await Promise.all([
        listContests({ status: "live" }),
        username ? listContests({ creator: username }) : Promise.resolve([])
      ]);
      console.log("Loaded contests", { contests, myContests });
      this.contests = (Array.isArray(contests) ? contests : [])
        .map(normalizeContest)
        .filter(Boolean);
      this.myContests = (Array.isArray(myContests) ? myContests : [])
        .map(normalizeContest)
        .filter(Boolean);
      this.errorMessage = "";
      this.myContestsErrorMessage = "";
    } catch (error) {
      console.error("[meme-contests] failed to load contests", error);
      this.contests = [];
      this.myContests = [];
      this.errorMessage = "Unable to load meme contests right now.";
      this.myContestsErrorMessage = username ? "Unable to load your contests right now." : "";
    } finally {
      this.isLoading = false;
      this.isLoadingMine = false;
      this.render();
    }
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

  getOrCreateSignupModal() {
    let signupModal = document.querySelector("signup-modal");
    if (!signupModal) {
      signupModal = document.createElement("signup-modal");
      signupModal.addEventListener("login", () => {
        window.location.href = this.authUrl;
      });
      signupModal.addEventListener("signup", () => {
        window.location.href = this.authUrl;
      });
    }

    signupModal.setAttribute("auth-url", this.authUrl);

    if (!signupModal.isConnected) {
      document.body.appendChild(signupModal);
    }

    return signupModal;
  }

  render() {
    const totalPages = Math.max(1, Math.ceil(this.contests.length / CONTESTS_PER_PAGE));
    this.currentPage = Math.min(this.currentPage, totalPages);
    const pageStart = (this.currentPage - 1) * CONTESTS_PER_PAGE;
    const visibleContests = this.contests.slice(pageStart, pageStart + CONTESTS_PER_PAGE);

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
          cursor: pointer;
          opacity: 1;
        }

        .view-link {
          border: 1px solid var(--theme-sky-border-soft);
          background: var(--theme-sky-surface-soft);
          color: var(--theme-info-text);
        }

        .view-link:hover,
        .create-button:hover,
        .view-link:focus-visible {
          transform: translateY(-1px);
          border-color: var(--theme-sky-border);
        }

        .create-button:hover,
        .create-button:focus-visible {
          background: var(--theme-surface-glass-soft);
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

        .section-stack {
          display: grid;
          gap: 12px;
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

        .hidden {
          display: none !important;
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
        </section>

        <section class="card hidden">
          <div class="header">
            <div class="header-copy">
              <h1>Active meme contests</h1>
              <p class="subtitle">Browse current contests, open the tagged meme feed, and vote on entries in the existing meme flow.</p>
            </div>
            <button class="create-button" type="button" aria-expanded="${this.isCreatePanelOpen ? "true" : "false"}">
              Create contest
            </button>
          </div>
          <p class="meta">Contest descriptions, deadlines, and dedicated voting views can live here later. For now each contest opens the regular feed filtered by its contest tag.</p>
          ${this.isCreatePanelOpen ? `
            <create-contest-panel></create-contest-panel>
          ` : ""}
        </section>

        <section class="section-stack hidden" aria-label="My contests">
          <section class="card">
            <div class="header">
              <div class="header-copy">
                <h1>My Contests</h1>
                <p class="subtitle">All contests created by the current account.</p>
              </div>
            </div>
          </section>

          <section class="contest-list hidden" aria-label="My contests list">
            ${!this.getCurrentUsername() ? `
              <p class="empty-state">Log in to view contests you created.</p>
            ` : this.isLoadingMine ? `
              <p class="empty-state">Loading your contests...</p>
            ` : this.myContestsErrorMessage ? `
              <p class="empty-state" role="alert">${escapeHtml(this.myContestsErrorMessage)}</p>
            ` : this.myContests.length ? this.myContests.map(contest => `
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
                  <span class="stat">Status ${escapeHtml(deriveContestStatus(contest))}</span>
                  <span class="stat">${contest.memesCount} memes</span>
                  <span class="stat">${contest.votesCount} votes</span>
                  <span class="stat">Ends ${escapeHtml(contest.endsAt)}</span>
                </div>
                <a class="view-link" href="${escapeHtml(contestFeedHref(contest.tag))}">
                  View contest memes and vote
                </a>
              </article>
            `).join("") : `
              <p class="empty-state">You have not created any contests yet.</p>
            `}
          </section>
        </section>

        <section class="card hidden">
          <div class="header">
            <div class="header-copy">
              <h1>Active Contests</h1>
            </div>
          </div>
        </section>

        <section class="contest-list hidden" aria-label="Active contests">
        
          ${this.isLoading ? `
            <p class="empty-state">Loading contests...</p>
          ` : this.errorMessage ? `
            <p class="empty-state" role="alert">${escapeHtml(this.errorMessage)}</p>
          ` : visibleContests.length ? visibleContests.map(contest => `
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
                <span class="stat">Status ${escapeHtml(deriveContestStatus(contest))}</span>
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

        ${!this.isLoading && !this.errorMessage ? this.renderPagination(totalPages) : ""}
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

    const createButton = this.shadowRoot.querySelector(".create-button");
    createButton?.addEventListener("click", () => {
      if (!localStorage.getItem("access_token")) {
        this.getOrCreateSignupModal();
        return;
      }

      this.isCreatePanelOpen = !this.isCreatePanelOpen;
      this.render();
    });

    const createPanel = this.shadowRoot.querySelector("create-contest-panel");
    createPanel?.addEventListener("contest-created", async () => {
      this.isCreatePanelOpen = false;
      this.isLoading = true;
      this.isLoadingMine = true;
      this.render();
      await this.load();
    });
  }
}

if (!customElements.get("meme-contests")) {
  customElements.define("meme-contests", MemeContests);
}
