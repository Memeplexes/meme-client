import { createMemeCardTags } from "../MemeCardTags.js";

export function createMemeInfoPanel({ onClose = () => {}, onRequestSearch = () => {} } = {}) {
  const caption = document.createElement("div");
  caption.className = "meme-modal__caption";
  caption.setAttribute("data-meme-modal-caption", "true");
  caption.setAttribute("data-element", "caption");

  const infoPanel = document.createElement("div");
  infoPanel.className = "meme-modal__info-panel";
  infoPanel.setAttribute("data-element", "info-panel");

  const actionRow = document.createElement("div");
  actionRow.className = "meme-modal__actions";
  actionRow.setAttribute("data-element", "actions");

  const primaryActions = document.createElement("div");
  primaryActions.className = "meme-modal__primary-actions";
  primaryActions.setAttribute("data-element", "primary-actions");

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "Close";
  closeButton.className = "meme-modal__button meme-modal__close";
  closeButton.setAttribute("data-role", "close");
  closeButton.addEventListener("click", () => onClose());

  const { tagsRow, renderTags } = createMemeCardTags({
    tags: [],
    searchInput: document.querySelector("page-topbar")?.searchInput,
    requestSearch: ({ query = "" } = {}) => onRequestSearch(query),
    cleanup: []
  });
  tagsRow.classList.add("meme-modal__tags");
  tagsRow.setAttribute("data-element", "tags");

  const voteButton = document.createElement("div");
  voteButton.className = "meme-modal__vote-slot";
  voteButton.setAttribute("data-element", "vote");
  voteButton.dataset.visible = "false";

  actionRow.appendChild(primaryActions);
  actionRow.appendChild(tagsRow);
  actionRow.appendChild(closeButton);
  infoPanel.appendChild(caption);
  infoPanel.appendChild(actionRow);

  return {
    infoPanel,
    caption,
    primaryActions,
    tagsRow,
    renderTags,
    voteButton
  };
}
