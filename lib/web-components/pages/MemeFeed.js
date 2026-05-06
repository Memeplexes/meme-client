import "../PageTopbar.js";
import "../FeedTopbar.js";
import "../FeedNavbar.js";
import "./web-components/FeedContestInfo.js";

class MemeFeed extends HTMLElement {
  static #stylesInjected = false;

  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";
    if (!MemeFeed.#stylesInjected) {
      const style = document.createElement("style");
      style.textContent = `
        meme-feed {
          --meme-card-height: calc(var(--meme-card-size, 320px) * 1.4375);
          display: block;
          width: 100%;
        }

        meme-feed .feed-layout {
          width: min(100%, 1280px);
          margin: 0 auto;
          display: grid;
          gap: 1rem;
        }

        feed-contest-info[hidden] {
          display: none !important;
        }

        meme-feed .feed-contest-banner {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 1rem;
          background: linear-gradient(135deg, rgba(255, 204, 102, 0.12), rgba(255, 255, 255, 0.04));
        }

        meme-feed .feed-contest-copy h2,
        meme-feed .feed-contest-copy p {
          margin: 0;
        }

        meme-feed .feed-contest-eyebrow {
          margin-bottom: 0.35rem !important;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.72;
        }

        meme-feed .feed-contest-description {
          margin-top: 0.5rem !important;
          opacity: 0.86;
        }

        meme-feed .feed-contest-stats {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-content: flex-start;
          gap: 0.5rem;
        }

        meme-feed .feed-contest-stat {
          display: inline-flex;
          align-items: center;
          min-height: 2rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          white-space: nowrap;
        }

        meme-feed .feed {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(var(--meme-card-size, 320px), var(--meme-card-size, 320px)));
          grid-auto-rows: var(--meme-card-height);
          justify-content: center;
          gap: 1rem;
          align-items: start;
        }

        meme-feed .feed > meme-card.meme {
          width: var(--meme-card-size, 320px);
          min-height: var(--meme-card-height) !important;
          height: var(--meme-card-height) !important;
        }

        @media (max-width: 640px) {
          meme-feed .feed-contest-banner {
            flex-direction: column;
          }

          meme-feed .feed-contest-stats {
            justify-content: flex-start;
          }

          meme-feed .feed {
            grid-template-columns: minmax(0, 1fr);
            min-width: 380px;
            padding-left: 0;
            padding-right: 0;
          }

          meme-feed .feed > meme-card.meme {
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
      MemeFeed.#stylesInjected = true;
    }
    // TODO: make both feed-topbar and feed-navbar more responsive and mobile friendly, we can do this by switching to a single-column layout on smaller viewports, and also by adding a hamburger menu for the feed-navbar on mobile. For the feed-topbar, we can stack the search bar and the auth/upload buttons vertically on smaller screens.
    this.innerHTML = `
      <div class="feed-layout">
        <div style="display: flex; flex-direction: column; width: 100%;">
          <!-- <feed-topbar style="flex: 1;"></feed-topbar> -->
          <feed-navbar style="flex: 1;"></feed-navbar>
          <feed-contest-info></feed-contest-info>
        </div>
        <div class="feed" id="feed"></div>
      </div>
    `;
  }
}

if (!customElements.get("meme-feed")) {
  customElements.define("meme-feed", MemeFeed);
}
