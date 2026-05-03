import "../PageTopbar.js";
import "../FeedTopbar.js";
import "../FeedNavbar.js";
import "../MemeCardSizeSlider.js";

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
          --meme-card-size: 320px;
          --meme-card-height: calc(var(--meme-card-size) * 1.4375);
          display: block;
          width: 100%;
        }

        meme-feed .feed-layout {
          width: min(100%, 1280px);
          margin: 0 auto;
          display: grid;
          gap: 1rem;
        }

        meme-feed .feed {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(var(--meme-card-size), var(--meme-card-size)));
          grid-auto-rows: var(--meme-card-height);
          justify-content: center;
          gap: 1rem;
          align-items: start;
        }

        meme-feed .feed > meme-card.meme {
          width: var(--meme-card-size);
          min-height: var(--meme-card-height) !important;
          height: var(--meme-card-height) !important;
        }

        @media (max-width: 640px) {
          meme-feed .feed {
            grid-template-columns: minmax(0, 1fr);
          }

          meme-feed .feed > meme-card.meme {
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
      MemeFeed.#stylesInjected = true;
    }

    const defaultSize = 20;
    // TODO: make both feed-topbar and feed-navbar more responsive and mobile friendly, we can do this by switching to a single-column layout on smaller viewports, and also by adding a hamburger menu for the feed-navbar on mobile. For the feed-topbar, we can stack the search bar and the auth/upload buttons vertically on smaller screens.
    this.innerHTML = `
      <div class="feed-layout">
        <div style="display: flex; flex-direction: column; width: 100%;">
          <feed-topbar style="flex: 1;"></feed-topbar>
          <feed-navbar style="flex: 1;"></feed-navbar>
        </div>
        <meme-card-size-slider value="${defaultSize}"></meme-card-size-slider>
        <div class="feed" id="feed"></div>
      </div>
    `;
  }
}

if (!customElements.get("meme-feed")) {
  customElements.define("meme-feed", MemeFeed);
}
