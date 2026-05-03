class VoteButtons extends HTMLElement {
  static #createVoteIcon(direction) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 24 24");
    Object.assign(svg.style, {
      width: "16px",
      height: "16px",
      display: "block",
      flexShrink: "0"
    });

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute(
      "d",
      "M10.4 3.2a1.8 1.8 0 0 1 1.73 2.29l-.84 3.01h6.16a2.75 2.75 0 0 1 2.68 3.38l-1.23 5.33a3.25 3.25 0 0 1-3.17 2.52H8.75a3.2 3.2 0 0 1-1.9-.62l-.29-.22a2.4 2.4 0 0 1-1.86.84H3.8a1.8 1.8 0 0 1-1.8-1.8V9.8A1.8 1.8 0 0 1 3.8 8h1.02c.57 0 1.1.27 1.43.72l2.72-4.58a1.8 1.8 0 0 1 1.43-.94Zm0 1.8-.11.01L7.2 10.18a.9.9 0 0 1-.77.44H4.1a.3.3 0 0 0-.3.3v7.15c0 .17.13.3.3.3h.9c.44 0 .84-.2 1.1-.56a.9.9 0 0 1 1.28-.17l.54.4c.24.18.53.28.83.28h6.98c.58 0 1.08-.4 1.2-.96l1.23-5.33a.95.95 0 0 0-.93-1.16H10.1a.9.9 0 0 1-.87-1.14l1.06-3.8A.3.3 0 0 0 10.4 5Z"
    );

    if (direction < 0) {
      svg.style.transform = "rotate(180deg)";
    }

    svg.appendChild(path);
    return svg;
  }

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
    this.upvoteButton.appendChild(VoteButtons.#createVoteIcon(1));
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
    this.downvoteButton.appendChild(VoteButtons.#createVoteIcon(-1));
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
