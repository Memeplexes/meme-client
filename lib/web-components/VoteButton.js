import "./VoteButtons.js";

export function createVoteButton({ filename, votes = 0, getState, voteForMeme } = {}) {
  const VoteButtonsElement = customElements.get("vote-buttons");
  if (!VoteButtonsElement) {
    throw new Error("vote-buttons custom element is not registered");
  }

  return new VoteButtonsElement().setup({
    filename,
    votes,
    getState,
    voteForMeme
  });
}
