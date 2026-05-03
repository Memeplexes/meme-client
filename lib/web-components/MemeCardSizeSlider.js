const MEME_CARD_SIZE_STORAGE_KEY = "meme-card-size";
const MEME_CARD_SIZE_CSS_VAR = "--meme-card-size";
const DEFAULT_MEME_CARD_SIZE = 256;
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
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          margin-left: auto;
        }

        .feed-size-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          /*
          background: var(--feed-control-background, rgba(18, 18, 18, 0.88));
          border-radius: 16px;
          border: 1px solid var(--feed-control-border, rgba(255, 255, 255, 0.08));
          */
        }

        label {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--feed-accent-color, var(--accent-color, #24a153));
        }

        input[type="range"] {
          flex: 1 1 220px;
          accent-color: var(--feed-accent-color, var(--accent-color, #24a153));
        }

        .feed-size-value {
          min-width: 4.5rem;
          text-align: right;
          font-size: 0.9rem;
          color: var(--feed-accent-color, var(--accent-color, #24a153));
        }
      </style>
      <div class="feed-size-controls">
        <label></label>
        <input type="range" />
        <output class="feed-size-value"></output>
      </div>
    `;

    const inputId = this.dataset.inputId || `meme-card-size-slider-${crypto.randomUUID()}`;
    const initialValue = clampMemeCardSize(
      this.getAttribute("value") ?? getStoredMemeCardSize()
    );

    this.dataset.inputId = inputId;
    const label = shadow.querySelector("label");
    const slider = shadow.querySelector("input");
    const output = shadow.querySelector("output");

    label.setAttribute("for", inputId);
    label.textContent = "";
    slider.id = inputId;
    slider.min = String(MIN_MEME_CARD_SIZE);
    slider.max = String(MAX_MEME_CARD_SIZE);
    slider.step = String(MEME_CARD_SIZE_STEP);
    slider.value = String(initialValue);
    output.setAttribute("for", inputId);
    output.textContent = `${initialValue}px`;
    // hide the output
    output.style.display = "none";

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
