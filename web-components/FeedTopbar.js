import { getActiveVoters, getDailyVotes, getTotalCreators, getTotalMemes } from "../lib/api.js";

class FeedTopbar extends HTMLElement {
  async #loadStats() {
    const totalMemesElement = this.querySelector("#total-memes");
    const pageTopbarTotalMemesElement = document.querySelector("page-topbar")?.totalMemesElement;
    const totalCreatorsElement = this.querySelector("#total-creators");
    const votesTodayElement = this.querySelector("#votes-today");
    const activeNowElement = this.querySelector("#active-now");
    const [totalMemes, totalCreators, dailyVotes, activeVoters] = await Promise.all([
      getTotalMemes(),
      getTotalCreators(),
      getDailyVotes(),
      getActiveVoters()
    ]);

    if (totalMemesElement && typeof totalMemes === "number") {
      totalMemesElement.textContent = totalMemes.toLocaleString();
    }

    if (pageTopbarTotalMemesElement && typeof totalMemes === "number") {
      pageTopbarTotalMemesElement.textContent = totalMemes.toLocaleString();
    }

    if (totalCreatorsElement && typeof totalCreators === "number") {
      totalCreatorsElement.textContent = totalCreators.toLocaleString();
    }

    if (votesTodayElement && typeof dailyVotes === "number") {
      votesTodayElement.textContent = dailyVotes.toLocaleString();
    }

    if (activeNowElement && typeof activeVoters === "number") {
      activeNowElement.textContent = activeVoters.toLocaleString();
    }
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }
    this.dataset.initialized = "true";
    this.classList.add("feed-topbar");
    this.setAttribute("aria-label", "Feed stats");
    this.innerHTML = `
      <div class="feed-stat" style="display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 0.75rem;">
        <span class="feed-stat-icon" aria-hidden="true">🖼️</span>
        <div class="feed-stat-content" style="display: grid; gap: 0.125rem;">
          <strong class="feed-stat-value" id="total-memes">--</strong>
          <span class="feed-stat-label">Total Memes</span>
        </div>
      </div>
      <div class="feed-stat" style="display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 0.75rem;">
        <span class="feed-stat-icon" aria-hidden="true">🧑‍🎨</span>
        <div class="feed-stat-content" style="display: grid; gap: 0.125rem;">
          <strong class="feed-stat-value" id="total-creators">--</strong>
          <span class="feed-stat-label">Total Creators</span>
        </div>
      </div>
      <div class="feed-stat" style="display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 0.75rem;">
        <span class="feed-stat-icon" aria-hidden="true">🗳️</span>
        <div class="feed-stat-content" style="display: grid; gap: 0.125rem;">
          <strong class="feed-stat-value" id="votes-today">--</strong>
          <span class="feed-stat-label">Votes Today</span>
        </div>
      </div>
      <div class="feed-stat" style="display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 0.75rem;">
        <span class="feed-stat-icon" aria-hidden="true">🔥</span>
        <div class="feed-stat-content" style="display: grid; gap: 0.125rem;">
          <strong class="feed-stat-value" id="active-now">--</strong>
          <span class="feed-stat-label">Active Now</span>
        </div>
      </div>
    `;

    this.#loadStats();
  }
}

customElements.define("feed-topbar", FeedTopbar);
