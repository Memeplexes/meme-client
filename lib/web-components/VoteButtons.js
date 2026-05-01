class VoteButtons extends HTMLElement {
  constructor() {
    super();
    this._getState = null;
    this._voteForMeme = null;
    this._state = null;

    Object.assign(this.style, {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      gap: "0"
    });

    Object.assign(this.style, {
      border: "1px solid rgba(255, 255, 255, 0.18)",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.06)",
      overflow: "hidden",
      backdropFilter: "blur(8px)"
    });

    const voteButtonStyle = {
      border: "0",
      background: "transparent",
      color: "white",
      padding: "8px 12px",
      paddingRight: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      lineHeight: "1",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      // minWidth: "44px",
      transition: "transform 160ms ease, background 160ms ease, color 160ms ease"
    };

    this.upvoteButton = document.createElement("button");
    this.upvoteButton.type = "button";
    this.upvoteButton.innerHTML = `<span aria-hidden="true">👍</span>`;
    this.upvoteButton.title = "Upvote";
    Object.assign(this.upvoteButton.style, voteButtonStyle, {
//      borderRight: "1px solid rgba(255, 255, 255, 0.14)"
    });

    this.voteCountLabel = document.createElement("span");
    Object.assign(this.voteCountLabel.style, {
      // minWidth: "3ch",
      paddingRight: "16px",
      color: "rgba(255, 255, 255, 0.88)",
      fontSize: "14px",
      fontWeight: "700",
      lineHeight: "1",
      textAlign: "center",
      pointerEvents: "none"
    });

    this.downvoteButton = document.createElement("button");
    this.downvoteButton.type = "button";
    this.downvoteButton.innerHTML = `<span aria-hidden="true">👎</span><span></span>`;
    this.downvoteButton.title = "Downvote";
    Object.assign(this.downvoteButton.style, voteButtonStyle, {
      borderLeft: "1px solid rgba(255, 255, 255, 0.14)"
    });

    this.appendChild(this.upvoteButton);
    this.appendChild(this.voteCountLabel);
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
    if (hovering) {
      button.style.background = "rgba(255, 255, 255, 0.1)";
      return;
    }
    this.#syncVoteState();
  }

  #syncVoteState() {
    const userVote = Number(this._state?.userVote ?? 0);
    Object.assign(this.upvoteButton.style, {
      background: userVote === 1 ? "rgba(61, 166, 255, 0.22)" : "transparent",
      color: userVote === 1 ? "#8fd0ff" : "white"
    });
    Object.assign(this.downvoteButton.style, {
      background: userVote === -1 ? "rgba(255, 112, 67, 0.22)" : "transparent",
      color: userVote === -1 ? "#ffb199" : "white"
    });
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
