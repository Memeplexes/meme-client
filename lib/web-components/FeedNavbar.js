import "./TextBanner.js";
import "./UploadButton.js";
import "./MemeCardSizeSlider.js";
import { MEME_CONFIG } from "../config.js";
const AUTH_URL = MEME_CONFIG.authUrl;
const DATE_RANGES = ["today", "week", "month", "all"];
const SEARCH_LOCATION_CHANGE_EVENT = "meme-client:search-location-change";

class FeedNavbar extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          margin-left: 50px;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .wrap {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 1rem;
          padding-top: 0.5rem;
          padding-left: 5px;
          border-radius: 0.75rem;
          margin-right: 16px;
          margin-left: 16px;
        }

        .title-wrap,
        .controls-wrap {
          flex: 1;
          display: flex;
          align-items: center;
        }

    
        .controls-wrap {
          justify-content: flex-end;
          gap: 1rem;
        }

        upload-button {
          flex-shrink: 0;
        }

        @media (max-width: 700px) {
          :host {
            margin-left: 0;
          }

          .wrap {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            margin-left: 0;
            margin-right: 0;
            padding-left: 0;
          }

          .title-wrap,
          .controls-wrap {
            width: 100%;
          }

          .title-wrap {
            justify-content: center;
            text-align: center;
          }

          upload-button {
            align-self: stretch;
          }

          .controls-wrap {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .buttons {
            width: 100%;
            justify-content: center;
          }

          button {
            flex: 1 1 calc(50% - 0.25rem);
            min-height: 2.5rem;
          }

          .feed-size-controls {
            display: none;
          }
        }

        h2 {
          margin: 0;
          font-size: 1.6rem;
          font-weight: 700;
        }

        .buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        button {
          border: 0;
          border-radius: 32px;
          /* padding: 0.45rem 0.9rem; */
          background: var(--theme-border-soft-strong);
          color: inherit;
          font: inherit;
          cursor: pointer;
        }

        button[aria-pressed="true"] {
          background: var(--theme-text-primary);
          color: var(--theme-surface-elevated);
        }

        #cta-upload {
        /* padding: 46px; */
        }
      </style>
      <div class="wrap">
        <div class="title-wrap">
          <h2 id="feed-title">Hot Memes</h2>
        </div>
        <upload-button id="cta-upload" auth-url="${AUTH_URL}"></upload-button>
        <div class="controls-wrap">
          <meme-card-size-slider class="feed-size-controls"></meme-card-size-slider>
          <div class="buttons feed-date-range" role="toolbar" aria-label="Feed range">
            <button type="button" aria-pressed="true">Today</button>
            <button type="button" aria-pressed="false">Week</button>
            <button type="button" aria-pressed="false">Month</button>
            <button type="button" aria-pressed="false">All</button>
          </div>
        </div>
      </div>
    `;

    shadow.querySelector("#cta-upload")?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        const uploadButton = event.currentTarget;
        uploadButton.handleOpenPanel();
      },
      true
    );

    this.dateRangeButtons = Array.from(shadow.querySelectorAll(".feed-date-range button"));

    this.handleDateRangeClick = event => {
      const button = event.target.closest("button");
      if (!button) {
        return;
      }

      const nextDateRange = button.dataset.dateRange;
      if (!DATE_RANGES.includes(nextDateRange)) {
        return;
      }

      document.dispatchEvent(
        new CustomEvent("meme-client:navigate-search", {
          detail: { dateRange: nextDateRange }
        })
      );
    };

    this.handleLocationChange = () => {
      this.syncDateRangeButtons();
    };

    this.dateRangeButtons.forEach((button, index) => {
      button.dataset.dateRange = DATE_RANGES[index];
    });

    shadow.querySelector(".feed-date-range")?.addEventListener("click", this.handleDateRangeClick);
    window.addEventListener("popstate", this.handleLocationChange);
    window.addEventListener(SEARCH_LOCATION_CHANGE_EVENT, this.handleLocationChange);
    this.syncDateRangeButtons();
  }

  disconnectedCallback() {
    this.shadowRoot
      ?.querySelector(".feed-date-range")
      ?.removeEventListener("click", this.handleDateRangeClick);
    window.removeEventListener("popstate", this.handleLocationChange);
    window.removeEventListener(SEARCH_LOCATION_CHANGE_EVENT, this.handleLocationChange);
  }

  getActiveDateRange() {
    const dateRange = new URL(window.location.href).searchParams.get("d") || "";
    return DATE_RANGES.includes(dateRange) ? dateRange : "all";
  }

  syncDateRangeButtons() {
    const activeDateRange = this.getActiveDateRange();

    this.dateRangeButtons?.forEach(button => {
      const isActive = button.dataset.dateRange === activeDateRange;
      button.setAttribute("aria-pressed", String(isActive));
    });
  }
}

customElements.define("feed-navbar", FeedNavbar);
