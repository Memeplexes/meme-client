class MemeCardSizeSlider extends HTMLElement {
  static #stylesInjected = false;

  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";

    if (!MemeCardSizeSlider.#stylesInjected) {
      const style = document.createElement("style");
      style.textContent = `
        meme-card-size-slider .feed-size-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          background: rgba(18, 18, 18, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        meme-card-size-slider label {
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.92);
        }

        meme-card-size-slider input[type="range"] {
          flex: 1 1 220px;
          accent-color: #ff8a3d;
        }

        meme-card-size-slider .feed-size-value {
          min-width: 4.5rem;
          text-align: right;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.72);
        }
      `;
      document.head.appendChild(style);
      MemeCardSizeSlider.#stylesInjected = true;
    }

    const inputId = this.dataset.inputId || `meme-card-size-slider-${crypto.randomUUID()}`;
    const value = this.getAttribute("value") || "20";

    this.dataset.inputId = inputId;
    this.innerHTML = `
      <div class="feed-size-controls">
        <label for="${inputId}">Card size</label>
        <input
          id="${inputId}"
          type="range"
          min="128"
          max="420"
          step="10"
          value="${value}"
        />
        <output class="feed-size-value" for="${inputId}">${value}px</output>
      </div>
    `;

    const slider = this.querySelector("input");
    const output = this.querySelector("output");
    const feed = this.closest("meme-feed");
    const updateCardSize = nextValue => {
      const size = `${nextValue}px`;
      if (feed) {
        feed.style.setProperty("--meme-card-size", size);
      }
      output.textContent = size;
    };

    updateCardSize(slider.value);
    slider.addEventListener("input", event => {
      updateCardSize(event.target.value);
    });
  }
}

if (!customElements.get("meme-card-size-slider")) {
  customElements.define("meme-card-size-slider", MemeCardSizeSlider);
}
