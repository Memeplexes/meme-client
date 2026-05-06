import { listContests } from "../../../api/contests.js";
import "../../CreatorCard.js";
import "../../UploadButton.js";
import "../contests/EditContestPanel.js";


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
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

function usernamesMatch(left, right) {
  return String(left ?? "").trim().toLowerCase()
    && String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();
}

function normalizeContest(contest, index) {
  const title = String(contest?.title ?? contest?.name ?? "").trim();
  const tag = deriveContestTag(contest);

  if (!title || !tag) {
    return null;
  }

  return {
    id: String(contest?.id ?? contest?._id ?? tag ?? index),
    title,
    tag,
    creator: contest?.creator
      ?? contest?.createdBy
      ?? contest?.owner
      ?? contest?.author
      ?? null,
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
    endsAt: formatContestDate(contest?.endTime ?? contest?.endsAt ?? contest?.endDate)
  };
}

class FeedContestInfo extends HTMLElement {
  constructor() {
    super();
    this.contest = null;
    this.isEditPanelOpen = false;
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";
    this.renderLoadingState();
    this.load();
  }

  get contestName() {
    return new URLSearchParams(window.location.search).get("cn")?.trim() || "";
  }

  getCurrentUsername() {
    const username = localStorage.getItem("memeplexes-username") || "";
    if (!username || username.trim().toLowerCase() === "guest") {
      return "";
    }

    return username.trim();
  }

  handleEditButtonClick() {
    if (this.isEditPanelOpen || !this.contest) {
      return;
    }

    this.isEditPanelOpen = true;
    this.renderContest();
  }

  handleEditPanelCancel() {
    if (!this.isEditPanelOpen) {
      return;
    }

    this.isEditPanelOpen = false;
    this.renderContest();
  }

  renderContest() {
    if (!this.contest) {
      this.hidden = true;
      this.innerHTML = "";
      return;
    }

    const canEdit = usernamesMatch(this.getCurrentUsername(), this.contest.creator);

    this.hidden = false;
    this.innerHTML = `
      <section class="feed-contest-banner" aria-label="Current contest">
        <div class="feed-contest-copy">
          <p class="feed-contest-eyebrow">Contest feed</p>
          <h2>${escapeHtml(this.contest.title)}</h2>
          ${this.contest.description ? `<p class="feed-contest-description">${escapeHtml(this.contest.description)}</p>` : ""}
          ${this.contest.creator ? `<creator-card class="feed-contest-creator"></creator-card>` : ""}
          <div class="feed-contest-actions">
            <upload-button preset-contest-id="${escapeHtml(this.contest.id)}"></upload-button>
            ${canEdit ? `<button type="button" class="feed-contest-edit-button" data-edit-contest-button>Edit contest</button>` : ""}
          </div>
          ${canEdit && this.isEditPanelOpen ? `<edit-contest-panel contest-id="${escapeHtml(this.contest.id)}"></edit-contest-panel>` : ""}
        </div>
        <div class="feed-contest-stats" aria-label="Contest metadata">
          <span class="feed-contest-stat">#${escapeHtml(this.contest.tag)}</span>
          <span class="feed-contest-stat">${this.contest.memesCount} memes</span>
          <span class="feed-contest-stat">${this.contest.votesCount} votes</span>
          <span class="feed-contest-stat">Ends ${escapeHtml(this.contest.endsAt)}</span>
        </div>
      </section>
    `;

    if (this.contest.creator) {
      this.querySelector("creator-card")?.setup({ name: this.contest.creator, username: this.contest.creator });
    }
    this.querySelector("[data-edit-contest-button]")?.addEventListener("click", this.handleEditButtonClick);
    this.querySelector("edit-contest-panel")?.addEventListener("edit-cancelled", () => this.handleEditPanelCancel());
  }

  async load() {
    if (!this.contestName) {
      this.hidden = true;
      this.innerHTML = "";
      return;
    }

    try {
      const contests = await listContests({ status: "active" });
      const normalizedContests = (Array.isArray(contests) ? contests : [])
        .map(normalizeContest)
        .filter(Boolean);
      const contestName = this.contestName.toLowerCase();
      const contest = normalizedContests.find(item =>
        item.id.toLowerCase() === contestName || item.tag.toLowerCase() === contestName
      );

      if (!contest) {
        this.contest = null;
        this.hidden = true;
        this.innerHTML = "";
        return;
      }

      this.contest = contest;
      this.isEditPanelOpen = false;
      this.renderContest();
      console.log("[feed-contest-info] loaded contest", contest);
    } catch (error) {
      console.error("[feed-contest-info] failed to load contest", error);
      this.contest = null;
      this.hidden = true;
      this.innerHTML = "";
    }
  }

  renderLoadingState() {
    if (!this.contestName) {
      this.hidden = true;
      return;
    }

    this.hidden = false;
    this.innerHTML = `
      <section class="feed-contest-banner" aria-label="Current contest">
        <div class="feed-contest-copy">
          <p class="feed-contest-eyebrow">Contest feed</p>
          <h2>Loading contest...</h2>
        </div>
      </section>
    `;
  }
}

if (!customElements.get("feed-contest-info")) {
  customElements.define("feed-contest-info", FeedContestInfo);
}
