import "./TextBanner.js";
import "./UploadButton.js";
import "./MemeCardSizeSlider.js";
import { MEME_CONFIG } from "../config.js";
const AUTH_URL = MEME_CONFIG.authUrl;

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
          /* 
          margin-right: 24px; */
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

        @media (max-width: 600px) {
          .wrap {
            flex-direction: column;
            align-items: stretch;
          }

          .title-wrap,
          .controls-wrap {
            width: 100%;
          }

          .controls-wrap {
            justify-content: space-between;
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
          background: rgba(255, 255, 255, 0.1);
          color: inherit;
          font: inherit;
          cursor: pointer;
        }

        button[aria-pressed="true"] {
          background: #fff;
          color: #111;
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
          <div class="buttons" role="toolbar" aria-label="Feed range">
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
  }
}

customElements.define("feed-navbar", FeedNavbar);
