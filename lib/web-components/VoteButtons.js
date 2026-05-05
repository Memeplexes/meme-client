class VoteButtons extends HTMLElement {
  static #stylesInjected = false;

  static #ensureStyles() {
    if (VoteButtons.#stylesInjected) return;
    const style = document.createElement("style");
    style.textContent = `
      vote-buttons {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0;
        border: 1px solid var(--theme-border-strong);
        border-radius: 999px;
        background: var(--theme-surface-glass);
        overflow: hidden;
        backdrop-filter: blur(8px);
      }

      vote-buttons .vote-buttons__icon {
        width: 16px;
        height: 16px;
        display: block;
        flex-shrink: 0;
      }

      vote-buttons .vote-buttons__icon--downvote {
        transform: rotate(180deg);
      }

      vote-buttons .vote-buttons__button {
        border: 0;
        background: #000;
        color: var(--theme-text-primary);
        padding: 8px 12px;
        padding-right: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: transform 160ms ease, background 160ms ease, color 160ms ease;
      }

      vote-buttons .vote-buttons__button--downvote {
        border-left: 1px solid var(--theme-border-medium);
      }

      vote-buttons .vote-buttons__count {
        padding-right: 16px;
        color: var(--theme-text-primary-88);
        font-size: 14px;
        font-weight: 700;
        line-height: 1;
        text-align: center;
        pointer-events: none;
      }

      vote-buttons .vote-buttons__button--hover-upvote {
        background: var(--theme-accent-surface);
        color: var(--theme-accent);
      }

      vote-buttons .vote-buttons__button--hover-downvote {
        background: var(--theme-warning-surface);
        color: var(--theme-warning);
      }

      vote-buttons .vote-buttons__button--active-upvote {
        background: var(--theme-info-surface);
        color: var(--theme-info);
      }

      vote-buttons .vote-buttons__button--active-downvote {
        background: var(--theme-warning-surface);
        color: var(--theme-warning-soft);
      }
    `;
    document.head.appendChild(style);
    VoteButtons.#stylesInjected = true;
  }

  static #createVoteIcon(direction) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.classList.add("vote-buttons__icon");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute(
      "d",
      "M10.4 3.2a1.8 1.8 0 0 1 1.73 2.29l-.84 3.01h6.16a2.75 2.75 0 0 1 2.68 3.38l-1.23 5.33a3.25 3.25 0 0 1-3.17 2.52H8.75a3.2 3.2 0 0 1-1.9-.62l-.29-.22a2.4 2.4 0 0 1-1.86.84H3.8a1.8 1.8 0 0 1-1.8-1.8V9.8A1.8 1.8 0 0 1 3.8 8h1.02c.57 0 1.1.27 1.43.72l2.72-4.58a1.8 1.8 0 0 1 1.43-.94Zm0 1.8-.11.01L7.2 10.18a.9.9 0 0 1-.77.44H4.1a.3.3 0 0 0-.3.3v7.15c0 .17.13.3.3.3h.9c.44 0 .84-.2 1.1-.56a.9.9 0 0 1 1.28-.17l.54.4c.24.18.53.28.83.28h6.98c.58 0 1.08-.4 1.2-.96l1.23-5.33a.95.95 0 0 0-.93-1.16H10.1a.9.9 0 0 1-.87-1.14l1.06-3.8A.3.3 0 0 0 10.4 5Z"
    );

    if (direction < 0) {
      svg.classList.add("vote-buttons__icon--downvote");
    }

    svg.appendChild(path);
    return svg;
  }

  constructor() {
    super();
    VoteButtons.#ensureStyles();
    this._getState = null;
    this._voteForMeme = null;
    this._state = null;
    this.upvoteButton = document.createElement("button");
    this.upvoteButton.type = "button";
    this.upvoteButton.className = "vote-buttons__button vote-buttons__button--upvote";
    this.upvoteButton.appendChild(VoteButtons.#createVoteIcon(1));
    this.voteCountLabel = document.createElement("span");
    this.voteCountLabel.className = "vote-buttons__count";
    this.upvoteButton.appendChild(this.voteCountLabel);
    this.upvoteButton.title = "Upvote";

    this.downvoteButton = document.createElement("button");
    this.downvoteButton.type = "button";
    this.downvoteButton.className = "vote-buttons__button vote-buttons__button--downvote";
    this.downvoteButton.appendChild(VoteButtons.#createVoteIcon(-1));
    this.downvoteButton.title = "Downvote";

    this.appendChild(this.upvoteButton);
    this.appendChild(this.downvoteButton);

    this.upvoteButton.addEventListener("click", () => this.#handleVote(1));
    this.downvoteButton.addEventListener("click", () => this.#handleVote(-1));
    this.upvoteButton.addEventListener("mouseenter", () => this.#setHoverState(this.upvoteButton, true));
    this.upvoteButton.addEventListener("mouseleave", () => this.#setHoverState(this.upvoteButton, false));
    this.downvoteButton.addEventListener("mouseenter", () => this.#setHoverState(this.downvoteButton, true));
    this.downvoteButton.addEventListener("mouseleave", () => this.#setHoverState(this.downvoteButton, false));
  }

  setup({ filename, votes = 0, getState, voteForMeme }) {
    this._getState = getState;
    this._voteForMeme = voteForMeme;
    this._state = this._getState?.() ?? { votes, userVote: 0 };
    this.upvoteButton.setAttribute("aria-label", `Upvote ${filename}`);
    this.downvoteButton.setAttribute("aria-label", `Downvote ${filename}`);
    this.setVoteCount(votes);
    this.#syncVoteState();
    return this;
  }

  setVoteCount(value) {
    this.voteCountLabel.textContent = String(value);
  }

  #setHoverState(button, hovering) {
    button.classList.toggle("vote-buttons__button--hover-upvote", hovering && button === this.upvoteButton);
    button.classList.toggle("vote-buttons__button--hover-downvote", hovering && button === this.downvoteButton);
  }

  #syncVoteState() {
    const userVote = Number(this._state?.userVote ?? 0);
    this.upvoteButton.classList.toggle("vote-buttons__button--active-upvote", userVote === 1);
    this.downvoteButton.classList.toggle("vote-buttons__button--active-downvote", userVote === -1);
  }

  #handleVote(value) {
    const state = this._getState?.();
    if (!state || !this._voteForMeme?.(state, value)) return;
    state.votes += value;
    state.userVote = value;
    this._state = state;
    this.setVoteCount(state.votes);
    this.#syncVoteState();
  }
}

if (!customElements.get("vote-buttons")) {
  customElements.define("vote-buttons", VoteButtons);
}
