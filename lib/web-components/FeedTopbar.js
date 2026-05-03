import { getActiveVoters, getDailyVotes, getTotalCreators, getTotalMemes } from "../api.js";

import { createIcons, Image, Palette, Vote, Flame } from "lucide";

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
    this.style.cssText = [
      "display: flex",
      "align-items: center",
      "gap: 0.5rem",
      "padding: 0.5rem 0.75rem",
      "min-height: 2.5rem",
      "overflow-x: auto",
      "overflow-y: hidden",
      "white-space: nowrap",
      "scrollbar-width: none",
      "box-sizing: border-box"
    ].join(";");
    this.innerHTML = `
      <style>
        .feed-topbar::-webkit-scrollbar {
          display: none;
        }

        .feed-stat {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          flex: 0 0 auto;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          /* background: rgba(255, 255, 255, 0.72); */
          border: 1px solid rgba(15, 23, 42, 0.08);
          font-size: 0.8rem;
          line-height: 1;
        }

        .feed-stat-icon,
        .feed-stat-icon svg {
          width: 0.9rem;
          height: 0.9rem;
          color: currentColor;
          display: none;
        }

        .feed-stat-label {
          opacity: 0.7;
        }

        .feed-stat-value {
          font-weight: 700;
        }
      </style>
      <div class="feed-stat">
        <i class="feed-stat-icon" data-lucide="image" aria-hidden="true"></i>
        <strong class="feed-stat-value" id="total-memes">--</strong>
        <span class="feed-stat-label">Memes</span>
      </div>
      <div class="feed-stat">
        <i class="feed-stat-icon" data-lucide="palette" aria-hidden="true"></i>
        <strong class="feed-stat-value" id="total-creators">--</strong>
        <span class="feed-stat-label">Creators</span>
      </div>
      <div class="feed-stat">
        <i class="feed-stat-icon" data-lucide="vote" aria-hidden="true"></i>
        <strong class="feed-stat-value" id="votes-today">--</strong>
        <span class="feed-stat-label">Votes</span>
      </div>
      <div class="feed-stat">
        <i class="feed-stat-icon" data-lucide="flame" aria-hidden="true"></i>
        <strong class="feed-stat-value" id="active-now">--</strong>
        <span class="feed-stat-label">Active</span>
      </div>
    `;

    createIcons({
      icons: {
        Image,
        Palette,
        Vote,
        Flame
      },
      attrs: {
        width: "18",
        height: "18"
      }
    });

    this.#loadStats();
  }
}

customElements.define("feed-topbar", FeedTopbar);
