import "../PageTopbar.js";
import "../FeedTopbar.js";
import "../FeedNavbar.js";

class MemeFeed extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";
    // TODO: make both feed-topbar and feed-navbar more responsive and mobile friendly, we can do this by switching to a single-column layout on smaller viewports, and also by adding a hamburger menu for the feed-navbar on mobile. For the feed-topbar, we can stack the search bar and the auth/upload buttons vertically on smaller screens.
    this.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 80%;">
        <feed-topbar style="flex: 1;"></feed-topbar>
        <feed-navbar style="flex: 1;"></feed-navbar>
      </div>
      <div class="feed" id="feed"></div>
    `;
  }
}

if (!customElements.get("meme-feed")) {
  customElements.define("meme-feed", MemeFeed);
}
