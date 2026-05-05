import { createElement, Download, Share2 } from "lucide";
import { createMemeCardTags } from "../MemeCardTags.js";
import { createVoteButton } from "../VoteButton.js";

export function createMemeInfoPanel({
  onClose = () => {},
  onRequestSearch = () => {},
  onDownload = () => {},
  onShare = () => {}
} = {}) {
  const infoPanel = document.createElement("div");
  infoPanel.className = "meme-modal__info-panel meme-modal__info-panel--youtube";
  infoPanel.setAttribute("data-element", "info-panel");

  const panelStyles = document.createElement("style");
  panelStyles.textContent = `
    .meme-modal__info-panel--youtube {
      gap: 16px;
      padding-block: 16px;
    }

    .meme-modal__info-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .meme-modal__title-stack {
      min-width: 0;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .meme-modal__eyebrow {
      color: var(--theme-text-secondary, rgba(255, 255, 255, 0.72));
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .meme-modal__info-panel--youtube .meme-modal__caption {
      margin: 0;
      max-width: none;
      text-align: left;
      white-space: normal;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }

    .meme-modal__meta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px 16px;
    }

    .meme-modal__info-panel--youtube .meme-modal__primary-actions {
      flex: 1 1 320px;
      min-width: 0;
      gap: 8px;
    }

    .meme-modal__tag-row {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      padding: 16px;
      flex: 1 1 100%;
    }

    .meme-modal__info-panel--youtube .meme-modal__tags {
      width: 100%;
    }

    .meme-modal__info-panel--youtube .meme-modal__close {
      align-self: flex-start;
      flex: 0 0 auto;
      background: transparent;
      color: var(--theme-text-primary);
      border-color: var(--theme-overlay-border);
    }

    @media (max-width: 767px) {
      .meme-modal__info-panel--youtube {
        gap: 14px;
        padding: 14px 16px 18px;
      }

      .meme-modal__info-header {
        align-items: stretch;
        gap: 12px;
      }

      .meme-modal__info-panel--youtube .meme-modal__caption {
        font-size: clamp(17px, 4.8vw, 22px);
      }

      .meme-modal__meta-row {
        gap: 10px 12px;
      }

      .meme-modal__info-panel--youtube .meme-modal__primary-actions {
        flex-basis: 100%;
      }
    }
  `;

  const headerRow = document.createElement("div");
  headerRow.className = "meme-modal__info-header";

  const titleStack = document.createElement("div");
  titleStack.className = "meme-modal__title-stack";

  const eyebrow = document.createElement("div");
  eyebrow.className = "meme-modal__eyebrow";
  eyebrow.textContent = "Now viewing";

  const caption = document.createElement("div");
  caption.className = "meme-modal__caption";
  caption.setAttribute("data-meme-modal-caption", "true");
  caption.setAttribute("data-element", "caption");

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "Close";
  closeButton.className = "meme-modal__button meme-modal__close";
  closeButton.setAttribute("data-role", "close");
  closeButton.addEventListener("click", () => onClose());

  const metaRow = document.createElement("div");
  metaRow.className = "meme-modal__meta-row";

  const primaryActions = document.createElement("div");
  primaryActions.className = "meme-modal__primary-actions";
  primaryActions.setAttribute("data-element", "primary-actions");

  const downloadButton = document.createElement("button");
  downloadButton.type = "button";
  downloadButton.className = "meme-modal__button";
  downloadButton.setAttribute("data-role", "download");
  downloadButton.append(
    createElement(Download, {
      width: 16,
      height: 16,
      "aria-hidden": "true"
    }),
    document.createTextNode("Download")
  );
  downloadButton.addEventListener("click", () => onDownload());

  const shareButton = document.createElement("button");
  shareButton.type = "button";
  shareButton.className = "meme-modal__button";
  shareButton.setAttribute("data-role", "share");
  shareButton.append(
    createElement(Share2, {
      width: 16,
      height: 16,
      "aria-hidden": "true"
    }),
    document.createTextNode("Share")
  );
  shareButton.addEventListener("click", () => onShare());

  const shareFallback = document.createElement("a");
  shareFallback.className = "meme-modal__link";
  shareFallback.setAttribute("data-role", "share-fallback");
  shareFallback.textContent = "Open Asset";
  shareFallback.target = "_blank";
  shareFallback.rel = "noreferrer";

  const { tagsRow, renderTags } = createMemeCardTags({
    tags: [],
    searchInput: document.querySelector("page-topbar")?.searchInput,
    requestSearch: ({ query = "" } = {}) => onRequestSearch(query),
    cleanup: []
  });
  tagsRow.classList.add("meme-modal__tags", "meme-modal__tag-row");
  tagsRow.setAttribute("data-element", "tags");

  const voteButton = document.createElement("div");
  voteButton.className = "meme-modal__vote-slot";
  voteButton.setAttribute("data-element", "vote");
  voteButton.dataset.visible = "true";

  primaryActions.appendChild(downloadButton);
  primaryActions.appendChild(shareButton);
  primaryActions.appendChild(shareFallback);
  primaryActions.appendChild(voteButton);

  // titleStack.appendChild(eyebrow);
  titleStack.appendChild(caption);
  headerRow.appendChild(titleStack);
  metaRow.appendChild(primaryActions);
  metaRow.appendChild(closeButton);
  metaRow.appendChild(tagsRow);
  infoPanel.appendChild(panelStyles);
  infoPanel.appendChild(headerRow);
  infoPanel.appendChild(metaRow);

  const renderVoteButton = (meme = null) => {
    const voteState = meme?._voteState;
    const voteForMeme = meme?._voteForMeme;
    const filename = String(meme?.filename ?? "").trim();
    const initialVoteCount = Number(voteState?.votes ?? meme?.votes ?? 0);
    const votes = Number.isFinite(initialVoteCount) ? initialVoteCount : 0;

    if (!voteState || !voteForMeme || !filename) {
      voteButton.replaceChildren();
      voteButton.dataset.visible = "false";
      return;
    }

    voteButton.dataset.visible = "true";
    voteButton.replaceChildren(createVoteButton({
      filename,
      votes,
      getState: () => voteState,
      voteForMeme
    }));
  };

  return {
    infoPanel,
    caption,
    primaryActions,
    downloadButton,
    shareButton,
    shareFallback,
    tagsRow,
    renderTags,
    voteButton,
    renderVoteButton
  };
}
