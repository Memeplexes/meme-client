class VoteButtons extends HTMLElement {
  constructor() {
    super();
    this._getState = null;
    this._voteForMeme = null;

    Object.assign(this.style, {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px"
    });

    const voteButtonStyle = {
      border: "1px solid rgba(255, 255, 255, 0.18)",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.06)",
      color: "white",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "14px",
      lineHeight: "1",
      transition: "opacity 160ms ease, transform 160ms ease, background 160ms ease"
    };

    this.downvoteButton = document.createElement("button");
    this.downvoteButton.type = "button";
    this.downvoteButton.textContent = "👎";
    Object.assign(this.downvoteButton.style, voteButtonStyle);

    this.voteCountLabel = document.createElement("span");
    Object.assign(this.voteCountLabel.style, {
      minWidth: "2ch",
      color: "rgba(255, 255, 255, 0.88)",
      fontSize: "14px",
      fontWeight: "700",
      lineHeight: "1",
      textAlign: "center"
    });

    this.upvoteButton = document.createElement("button");
    this.upvoteButton.type = "button";
    this.upvoteButton.textContent = "👍";
    Object.assign(this.upvoteButton.style, voteButtonStyle);

    this.appendChild(this.downvoteButton);
    this.appendChild(this.voteCountLabel);
    this.appendChild(this.upvoteButton);

    this.downvoteButton.addEventListener("click", () => this.#handleVote(-1));
    this.upvoteButton.addEventListener("click", () => this.#handleVote(1));
  }

  setup({ filename, votes = 0, getState, voteForMeme }) {
    this._getState = getState;
    this._voteForMeme = voteForMeme;
    this.downvoteButton.setAttribute("aria-label", `Downvote ${filename}`);
    this.upvoteButton.setAttribute("aria-label", `Upvote ${filename}`);
    this.setVoteCount(votes);
    return this;
  }

  setVoteCount(value) {
    this.voteCountLabel.textContent = String(value);
  }

  #handleVote(value) {
    const state = this._getState?.();
    if (!state || !this._voteForMeme?.(state, value)) return;
    state.votes += value;
    this.setVoteCount(state.votes);
  }
}

if (!customElements.get("vote-buttons")) {
  customElements.define("vote-buttons", VoteButtons);
}
