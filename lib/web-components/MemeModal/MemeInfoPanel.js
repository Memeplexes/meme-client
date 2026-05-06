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
      --meme-info-panel-backdrop: color-mix(in srgb, rgba(10, 14, 20, 0.78) 78%, transparent);
      --meme-info-panel-border: rgba(255, 255, 255, 0.18);
      --meme-info-panel-shadow: 0 18px 40px rgba(0, 0, 0, 0.32);
      --meme-info-panel-text: #fff;
      --meme-info-panel-text-muted: rgba(255, 255, 255, 0.78);
      --meme-info-panel-button-backdrop: rgba(12, 18, 28, 0.72);
      --meme-info-panel-button-backdrop-hover: rgba(255, 255, 255, 0.22);
      --meme-info-panel-button-border: rgba(255, 255, 255, 0.26);
      display: flex;
      gap: 16px;
      padding: 16px 18px;
      border: 1px solid var(--meme-info-panel-border);
      /* border-radius: 20px; */
      background: var(--meme-info-panel-backdrop);
      box-shadow: var(--meme-info-panel-shadow);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      color: var(--meme-info-panel-text);
      isolation: isolate;
    }

    .meme-modal__info-panel--youtube > * {
      min-width: 0;
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
      color: var(--meme-info-panel-text);
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
    }

    .meme-modal__info-header {
      display: flex;
      align-items: center;
      min-width: 0;
      flex: 1 1 auto;
    }

    .meme-modal__title-stack {
      min-width: 0;
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meme-modal__meta-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;
      min-width: 0;
      flex: 1 1 auto;
    }

    .meme-modal__info-panel--youtube .meme-modal__primary-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: nowrap;
      min-width: 0;
      flex: 1 1 auto;
      gap: 16px;
    }

    .meme-modal__eyebrow {
      color: var(--meme-info-panel-text-muted);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
    }

    .meme-modal__tag-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 0;
      padding: 0;
      flex: 0 1 auto;
    }

    .meme-modal__info-panel--youtube .meme-modal__tags {
      width: auto;
    }

    .meme-modal__info-panel--youtube .meme-modal__close {
      flex: 0 0 auto;
    }

    .meme-modal__info-panel--youtube .meme-modal__button,
    .meme-modal__info-panel--youtube .meme-modal__link,
    .meme-modal__info-panel--youtube .meme-card__tag,
    .meme-modal__info-panel--youtube .meme-modal__vote-slot button {
      color: var(--meme-info-panel-text);
      border: 1px solid var(--meme-info-panel-button-border);
      background: var(--meme-info-panel-button-backdrop);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(14px) saturate(150%);
      -webkit-backdrop-filter: blur(14px) saturate(150%);
    }

    .meme-modal__info-panel--youtube .meme-modal__button,
    .meme-modal__info-panel--youtube .meme-modal__link {
      min-height: 42px;
      font-weight: 600;
    }

    .meme-modal__info-panel--youtube .meme-modal__button svg,
    .meme-modal__info-panel--youtube .meme-modal__link svg {
      flex: 0 0 auto;
    }

    .meme-modal__info-panel--youtube .meme-modal__link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 999px;
      text-decoration: none;
    }

    .meme-modal__info-panel--youtube .meme-modal__button:hover,
    .meme-modal__info-panel--youtube .meme-modal__button:focus-visible,
    .meme-modal__info-panel--youtube .meme-modal__link:hover,
    .meme-modal__info-panel--youtube .meme-modal__link:focus-visible,
    .meme-modal__info-panel--youtube .meme-card__tag:hover,
    .meme-modal__info-panel--youtube .meme-card__tag:focus-visible,
    .meme-modal__info-panel--youtube .meme-modal__vote-slot button:hover,
    .meme-modal__info-panel--youtube .meme-modal__vote-slot button:focus-visible {
      background: var(--meme-info-panel-button-backdrop-hover);
      border-color: rgba(255, 255, 255, 0.52);
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3);
      outline: none;
    }

    .meme-modal__info-panel--youtube .meme-modal__button:focus-visible,
    .meme-modal__info-panel--youtube .meme-modal__link:focus-visible,
    .meme-modal__info-panel--youtube .meme-card__tag:focus-visible,
    .meme-modal__info-panel--youtube .meme-modal__vote-slot button:focus-visible {
      box-shadow:
        0 0 0 2px rgba(10, 14, 20, 0.55),
        0 0 0 4px rgba(255, 255, 255, 0.72),
        0 14px 28px rgba(0, 0, 0, 0.3);
    }

    .meme-modal__info-panel--youtube .meme-card__tag {
      border-radius: 999px;
    }

    .meme-modal__info-panel--youtube .meme-modal__vote-slot[data-visible="false"] {
      display: none;
    }

    .meme-modal__info-panel--youtube .meme-modal__vote-slot[data-visible="true"] {
      display: inline-flex;
    }

    .meme-modal__info-panel--youtube .meme-modal__vote-slot button {
      min-height: 42px;
    }

    @media (max-width: 767px) {
      .meme-modal__info-panel--youtube {
        flex-wrap: wrap;
        gap: 12px;
        padding: 14px 16px;
        align-items: flex-start;
      }

      .meme-modal__info-panel {
        align-items: flex-start !important;
      }

      .meme-modal__info-header {
        flex: 1 1 100%;
      }

      .meme-modal__info-panel--youtube .meme-modal__caption {
        font-size: clamp(17px, 4.8vw, 22px);
      }

      .meme-modal__meta-row {
        flex: 1 1 100%;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 12px;
      }

      .meme-modal__info-panel--youtube .meme-modal__primary-actions {
        flex: 1 1 100%;
        flex-wrap: wrap;
        justify-content: flex-start;
        gap: 12px;
      }

      .meme-modal__tag-row {
        justify-content: flex-start;
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
    document.createTextNode("")
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
    document.createTextNode("")
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

  primaryActions.appendChild(voteButton);
  primaryActions.appendChild(downloadButton);
  primaryActions.appendChild(shareButton);
  primaryActions.appendChild(shareFallback);

  // titleStack.appendChild(eyebrow);
  titleStack.appendChild(caption);
  headerRow.appendChild(titleStack);
  metaRow.appendChild(tagsRow);
  metaRow.appendChild(primaryActions);
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
    const voteControls = createVoteButton({
      filename,
      votes,
      getState: () => voteState,
      voteForMeme
    });

    Object.assign(voteControls.style, {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "8px",
      border: "0",
      borderRadius: "20px",
      background: "transparent",
      overflow: "visible",
      backdropFilter: "none"
    });

    Object.assign(voteControls.upvoteButton.style, {
      border: "1px solid var(--theme-border-strong)",
      borderRadius: "999px",
      background: "var(--theme-surface-glass)",
      padding: "10px 12px",
      minWidth: "64px"
    });

    Object.assign(voteControls.voteCountLabel.style, {
      paddingRight: "0"
    });

    Object.assign(voteControls.downvoteButton.style, {
      border: "1px solid var(--theme-border-strong)",
      borderLeft: "1px solid var(--theme-border-strong)",
      borderRadius: "999px",
      background: "var(--theme-surface-glass)",
      padding: "10px 12px",
      minWidth: "64px"
    });

    voteButton.replaceChildren(voteControls);
  };

  return {
    infoPanel,
    caption,
    primaryActions,
    downloadButton,
    shareButton,
    shareFallback,
    closeButton,
    tagsRow,
    renderTags,
    voteButton,
    renderVoteButton
  };
}
