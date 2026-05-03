const MEME_CARD_SIZE_STORAGE_KEY = "meme-card-size";
const MEME_CARD_SIZE_CSS_VAR = "--meme-card-size";
const DEFAULT_MEME_CARD_SIZE = 200;
const MIN_MEME_CARD_SIZE = 128;
const MAX_MEME_CARD_SIZE = 1000;
const MEME_CARD_SIZE_STEP = 10;

function clampMemeCardSize(value) {
  const numericValue = Number.parseInt(value, 10);
  if (Number.isNaN(numericValue)) {
    return DEFAULT_MEME_CARD_SIZE;
  }

  return Math.min(
    MAX_MEME_CARD_SIZE,
    Math.max(MIN_MEME_CARD_SIZE, numericValue)
  );
}

function getStoredMemeCardSize() {
  try {
    return clampMemeCardSize(localStorage.getItem(MEME_CARD_SIZE_STORAGE_KEY));
  } catch {
    return DEFAULT_MEME_CARD_SIZE;
  }
}

function applyMemeCardSize(value) {
  const nextSize = clampMemeCardSize(value);
  document.documentElement.style.setProperty(
    MEME_CARD_SIZE_CSS_VAR,
    `${nextSize}px`
  );

  try {
    localStorage.setItem(MEME_CARD_SIZE_STORAGE_KEY, String(nextSize));
  } catch {}

  return nextSize;
}

applyMemeCardSize(getStoredMemeCardSize());

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
    const initialValue = clampMemeCardSize(
      this.getAttribute("value") ?? getStoredMemeCardSize()
    );

    this.dataset.inputId = inputId;
    this.innerHTML = `
      <div class="feed-size-controls">
        <label for="${inputId}">Card size</label>
        <input
          id="${inputId}"
          type="range"
          min="${MIN_MEME_CARD_SIZE}"
          max="${MAX_MEME_CARD_SIZE}"
          step="${MEME_CARD_SIZE_STEP}"
          value="${initialValue}"
        />
        <output class="feed-size-value" for="${inputId}">${initialValue}px</output>
      </div>
    `;

    const slider = this.querySelector("input");
    const output = this.querySelector("output");
    const updateCardSize = nextValue => {
      const appliedSize = applyMemeCardSize(nextValue);
      output.textContent = `${appliedSize}px`;
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
