import { initializeRainbowPrompt } from "../initializeRainbowPrompt.js";

class SearchBarTags extends HTMLElement {
  #shadow;
  #words = [];
  #inputValue = "";
  #initialQuery = "";
  #changeDebounceTimeout = null;

  static get observedAttributes() {
    return ["placeholder", "initial-query", "disabled"];
  }

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#render();
  }

  connectedCallback() {
    this.#initialQuery = this.getAttribute("initial-query") || "";

    if (this.#initialQuery) {
      this.#setQuery(this.#initialQuery);

      requestAnimationFrame(() => {
        const container = this.#shadow.querySelector(".container");
        if (container) {
          initializeRainbowPrompt({
            searchInput: container,
            initialQuery: this.#initialQuery
          });
        }
      });
    }

    this.#setupEventListeners();
  }

  disconnectedCallback() {
    clearTimeout(this.#changeDebounceTimeout);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    if (name === "placeholder") {
      const input = this.#shadow.querySelector("input");
      if (input) {
        input.placeholder = newValue || "Search...";
      }
    }

    if (name === "initial-query" && this.isConnected) {
      this.#initialQuery = newValue || "";
      this.#setQuery(this.#initialQuery);
    }

    if (name === "disabled") {
      const input = this.#shadow.querySelector("input");
      if (input) {
        input.disabled = newValue !== null;
      }
    }
  }

  get value() {
    return [...this.#words, this.#inputValue.trim()]
      .filter(Boolean)
      .join(" ");
  }

  set value(newValue) {
    this.#setQuery(newValue || "");
  }

  get words() {
    return [...this.#words];
  }

  addWord(word) {
    const trimmed = word.trim();
    if (trimmed && !this.#words.includes(trimmed)) {
      this.#words.push(trimmed);
      this.#inputValue = "";
      this.#updateDisplay();
      this.#emitChange();
    }
  }

  removeWord(word) {
    const index = this.#words.indexOf(word);
    if (index > -1) {
      this.#words.splice(index, 1);
      this.#inputValue = "";
      this.#updateDisplay();
      this.#emitChange();
    }
  }

  clear() {
    this.#words = [];
    this.#inputValue = "";
    this.#updateDisplay();
    this.#emitChange();
  }

  #parseWords(text) {
    return text
      .split(/\s+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);
  }

  #setQuery(text) {
    this.#words = this.#parseWords(text || "");
    this.#inputValue = "";
    this.#updateDisplay();
  }

  #render() {
    this.#shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .container {
          margin: 6px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          padding-left: 10px;
          background: var(--theme-bg-app);
          border: 2px solid var(--theme-slate-700);
          border-radius: 12px;
          min-height: 36px;
          cursor: text;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .container:focus-within {
          border-color: var(--theme-accent);
          box-shadow: 0 0 0 3px var(--theme-focus-ring);
        }

        .container:hover:not(:focus-within) {
          border-color: var(--theme-slate-600);
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: linear-gradient(135deg, var(--theme-slate-700), var(--theme-slate-800));
          border: 1px solid var(--theme-slate-600);
          border-radius: 6px;
          font-size: 14px;
          color: var(--theme-slate-100);
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
          white-space: nowrap;
        }

        .tag:hover {
          background: linear-gradient(135deg, var(--theme-red-500), var(--theme-red-600));
          border-color: var(--theme-red-500);
          transform: scale(1.02);
        }

        .tag:active {
          transform: scale(0.98);
        }

        .tag-text {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tag-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--theme-border-soft-strong);
          font-size: 12px;
          line-height: 1;
          color: var(--theme-text-primary-70);
          transition: background 0.15s;
        }

        .tag:hover .tag-remove {
          background: var(--theme-white-25);
          color: var(--theme-text-primary);
        }

        input {
          flex: 1;
          min-width: 100px;
          padding: 4px 0;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: var(--theme-slate-100);
          font-family: inherit;
        }

        input::placeholder {
          color: var(--theme-slate-500);
        }

        input:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .hidden-input {
          position: absolute;
          left: -9999px;
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 767px) {
          .container {
            margin-left: 64px;
          }
      }
      </style>

      <div class="container" part="container">
        <div class="tags-container" part="tags-container"></div>
        <input
          type="text"
          part="input"
          placeholder="${this.getAttribute("placeholder") || "Search..."}"
        />
      </div>

      <input
        type="hidden"
        class="hidden-input"
        name="${this.getAttribute("name") || "search"}"
      />
    `;
  }

  #setupEventListeners() {
    const container = this.#shadow.querySelector(".container");
    const input = this.#shadow.querySelector("input");
    const emitDebouncedChange = () => {
      clearTimeout(this.#changeDebounceTimeout);
      this.#changeDebounceTimeout = setTimeout(() => {
        this.#emitChange();
      }, 500);
    };

    container.addEventListener("click", event => {
      if (event.target === container || event.target.classList.contains("tags-container")) {
        input.focus();
      }
    });

    input.addEventListener("input", event => {
      this.#inputValue = event.target.value;
      if (this.#inputValue.endsWith(" ")) {
        const newWords = this.#parseWords(this.#inputValue);
        this.#words = [...new Set([...this.#words, ...newWords])];
        this.#inputValue = "";
        input.value = "";
        this.#updateDisplay();
        this.#emitChange();
        return;
      }

      emitDebouncedChange();
    });

    input.addEventListener("keydown", event => {
      if (event.key === "Backspace" && this.#inputValue === "" && this.#words.length > 0) {
        clearTimeout(this.#changeDebounceTimeout);
        event.preventDefault();
        this.#words.pop();
        this.#updateDisplay();
        this.#emitChange();
      }

      if (event.key === "Enter") {
        clearTimeout(this.#changeDebounceTimeout);
        event.preventDefault();
        if (this.#inputValue.trim()) {
          const newWord = this.#inputValue.trim();
          if (!this.#words.includes(newWord)) {
            this.#words.push(newWord);
          }
          this.#inputValue = "";
          input.value = "";
          this.#updateDisplay();
        }
        this.#emitSubmit();
      }

      if (event.key === "Escape") {
        this.#inputValue = "";
        input.value = "";
        input.blur();
      }
    });

    input.addEventListener("paste", event => {
      event.preventDefault();
      clearTimeout(this.#changeDebounceTimeout);
      const text = (event.clipboardData || window.clipboardData).getData("text");
      const pastedWords = this.#parseWords(text);
      this.#words = [...new Set([...this.#words, ...pastedWords])];
      this.#inputValue = "";
      input.value = "";
      this.#updateDisplay();
      this.#emitChange();
    });
  }

  #updateDisplay() {
    const tagsContainer = this.#shadow.querySelector(".tags-container");
    const hiddenInput = this.#shadow.querySelector(".hidden-input");
    const input = this.#shadow.querySelector('input[type="text"]');
    tagsContainer.innerHTML = "";

    this.#words.forEach(word => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.setAttribute("role", "button");
      tag.setAttribute("aria-label", `Remove ${word}`);
      tag.setAttribute("tabindex", "0");
      tag.innerHTML = `
        <span class="tag-text" title="${this.#escapeHtml(word)}">#${this.#escapeHtml(word)}</span>
        <span class="tag-remove">x</span>
      `;

      tag.addEventListener("click", event => {
        event.stopPropagation();
        this.removeWord(word);
      });

      tag.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.removeWord(word);
        }
      });

      tagsContainer.appendChild(tag);
    });

    hiddenInput.value = this.value;
    this.setAttribute("value", this.value);
    if (input && input.value !== this.#inputValue) {
      input.value = this.#inputValue;
    }
  }

  #escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  #emitChange() {
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: {
          value: this.value,
          words: this.words
        }
      })
    );
  }

  #emitSubmit() {
    this.dispatchEvent(
      new CustomEvent("submit", {
        bubbles: true,
        composed: true,
        detail: {
          value: this.value,
          words: this.words,
          inputValue: this.inputValue
        }
      })
    );
  }
}

if (!customElements.get("search-bar-tags")) {
  customElements.define("search-bar-tags", SearchBarTags);
}
