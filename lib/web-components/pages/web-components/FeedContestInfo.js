import { listContests } from "../../../api/contests.js";

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
        this.hidden = true;
        this.innerHTML = "";
        return;
      }

      this.hidden = false;
      this.innerHTML = `
        <section class="feed-contest-banner" aria-label="Current contest">
          <div class="feed-contest-copy">
            <p class="feed-contest-eyebrow">Contest feed</p>
            <h2>${escapeHtml(contest.title)}</h2>
            ${contest.description ? `<p class="feed-contest-description">${escapeHtml(contest.description)}</p>` : ""}
          </div>
          <div class="feed-contest-stats" aria-label="Contest metadata">
            <span class="feed-contest-stat">#${escapeHtml(contest.tag)}</span>
            <span class="feed-contest-stat">${contest.memesCount} memes</span>
            <span class="feed-contest-stat">${contest.votesCount} votes</span>
            <span class="feed-contest-stat">Ends ${escapeHtml(contest.endsAt)}</span>
          </div>
        </section>
      `;
    } catch (error) {
      console.error("[feed-contest-info] failed to load contest", error);
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
