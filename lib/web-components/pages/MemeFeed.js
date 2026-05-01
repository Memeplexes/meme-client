import "../PageTopbar.js";
import "../FeedTopbar.js";
import "../FeedNavbar.js";

class MemeFeed extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";
    this.innerHTML = `
      <feed-topbar></feed-topbar>
      <feed-navbar></feed-navbar>
      <div class="feed" id="feed"></div>
    `;
  }
}

if (!customElements.get("meme-feed")) {
  customElements.define("meme-feed", MemeFeed);
}
