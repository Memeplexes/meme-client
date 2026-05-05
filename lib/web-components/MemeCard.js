const SITE_ADMIN_ACCOUNTS = ["marak.squires"];

import { formatDistanceToNow } from 'date-fns'

import "./CommentsButton.js";
import "./CommentsPanel.js";
import "./CreatorCard.js";
import "./MemeEditPanel.js";
import "./MemeCardFooter.js";
import "./MemeModal/MemeModal.js";
import "./VoteButtons.js";
import { createMemeCardTags } from "./MemeCardTags.js";
import { shareMeme } from "./shareMeme.js";
import { createElement, Share2 } from "lucide";

function titleFromFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .split(/[._-]+/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatUploadDate(metadata) {

  const rawDate = metadata.created_at ?? metadata.uploaded_date ?? metadata.createdAt ?? metadata.date;
  if (!rawDate) return "Unknown date";
  const date = new Date(rawDate);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true })

  return timeAgo;
  if (Number.isNaN(date.getTime())) return String(rawDate);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

class MemeCard extends HTMLElement {
  static #stylesInjected = false;

  constructor() {
    super();
    this._metadata = null;
    this._options = null;
    this._state = null;
    this._cleanup = [];
    this._elements = {};
  }

  connectedCallback() {
    if (this._metadata && this._options && !this._state) {
      this.#initialize();
    }
  }

  disconnectedCallback() {
    this.#teardown();
  }

  setup(file, options) {
    this._metadata = typeof file === "string" ? { filename: file, checksum: file } : file;
    this._options = options;

    if (this.isConnected && !this._state) {
      this.#initialize();
    }

    return this;
  }

  #initialize() {
    let {
      searchInput,
      requestSearch,
      viewState,
      autoVoteMs,
      voteForMeme,
      mediaObserver
    } = this._options;

    // Remark: fix ref its not available now, prob loading order error...,easy fix
    searchInput = document.querySelector("page-topbar")?.searchInput;

    const metadata = this._metadata;
    // TODO: if current meme-card width is less than 220px, change the CSS for meta-overlay to flex column center ie flex-direction: column; justify-content: center;align-items: center;

    /*

       meme-card.meme[data-meta-overlay-stacked="true"] #meta-overlay {
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

      */
    if (!MemeCard.#stylesInjected) {
      const style = document.createElement("style");
      style.textContent = `
        meme-card.meme #meta-overlay {
          --meta-overlay-bottom: 10px;
          opacity: 0;
          bottom: 0px;
          transition: opacity 120ms ease;
        }

        body[data-view="list"] meme-card.meme #meta-overlay {
          --meta-overlay-bottom: 0px;
          opacity: 0.88;
          background: linear-gradient(var(--theme-card-top), var(--theme-surface-ink-98));
        }

        meme-card.meme:hover #meta-overlay {
          opacity: 0.88;
          background: linear-gradient(var(--theme-card-top), var(--theme-surface-ink-98));
        }
      `;
      document.head.appendChild(style);
      MemeCard.#stylesInjected = true;
    }
    const filename = metadata.filename;
    let tags = Array.isArray(metadata.tags) && metadata.tags.length
      ? metadata.tags
      : filename.replace(/\.[^.]+$/, "").split(/[._-]+/).map(tag => tag.trim()).filter(Boolean);
    let title = metadata.title ?? titleFromFilename(filename);
    const author = metadata.creator ?? metadata.uploader ?? metadata.uploadedBy ?? "Unknown author";
    const creatorUsername = metadata.creator ?? metadata.username ?? metadata.handle;
    const localUsername = localStorage.getItem("memeplexes-username");
    const showEditButton = Boolean(
      creatorUsername &&
      localUsername &&
      creatorUsername.trim().toLowerCase() === localUsername.trim().toLowerCase() ||
      SITE_ADMIN_ACCOUNTS.includes(localUsername)
    );
    const uploadedDate = formatUploadDate(metadata);
    const commentsCount = metadata.commentsCount ?? metadata.commentCount ?? metadata.comments?.length ?? tags.length;
    let detailsText = metadata.description ?? `File: ${filename}`;

    this.className = "meme";
    Object.assign(this.style, {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      minHeight: "460px",
      height: "460px",
      overflow: "hidden",
      borderRadius: "20px",
      border: "1px solid var(--theme-border-soft)",
      background: "linear-gradient(180deg, var(--theme-card-top), var(--theme-surface-ink-98))",
      boxShadow: "0 18px 44px var(--theme-shadow-card)"
    });

    this.replaceChildren();

    const mediaFrame = document.createElement("div");
    mediaFrame.className = "media-frame";
    Object.assign(mediaFrame.style, {
      position: "relative",
      flex: "1",
      minHeight: "0",
      // margin: "0 16px 16px",
      borderRadius: "18px",
      overflow: "hidden",
      background: "var(--theme-surface-card)"
    });

    const placeholder = document.createElement("div");
    placeholder.className = "media-shell media-placeholder";
    Object.assign(placeholder.style, {
      position: "relative",
      width: "100%",
      height: "100%",
      minHeight: "100%",
      background: "var(--theme-surface-card)"
    });

    const hoverInfo = document.createElement("div");
    Object.assign(hoverInfo.style, {
      position: "absolute",
      left: "28px",
      right: "28px",
      bottom: "88px",
      padding: "12px 14px",
      borderRadius: "14px",
      background: "var(--theme-overlay-card)",
      color: "var(--theme-text-primary-88)",
      fontSize: "12px",
      lineHeight: "1.45",
      opacity: "0",
      transform: "translateY(8px)",
      transition: "opacity 160ms ease, transform 160ms ease",
      pointerEvents: "none",
      zIndex: "2"
    });
    hoverInfo.textContent = detailsText;

    const footer = document.createElement("meme-card-footer");

    const metaOverlay = document.createElement("div");
    // set id
    metaOverlay.id = "meta-overlay";
    Object.assign(metaOverlay.style, {
      position: "absolute",
      left: "0px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: "12px",
      fontSize: "12px",
      color: "var(--theme-text-primary-72)",
      zIndex: "200",
      width: "100%",
      background: "var(--theme-bg-app)",
      paddingTop: "6px",
      paddingBottom: "6px",
      marginRight: "0px"

    });

    const authorEl = document.createElement("creator-card").setup({
      name: author,
      username: creatorUsername,
      email: metadata.creator_email ?? metadata.email,
      avatarUrl: metadata.creator_avatar_url ?? metadata.creatorAvatarUrl ?? metadata.avatar_url ?? metadata.avatarUrl
    });

    const onAuthorFilter = event => {
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent("meme-card:author-filter", {
        bubbles: true,
        composed: true,
        detail: { author }
      }));
    };
    authorEl.addEventListener("creator-card:filter", onAuthorFilter);
    this._cleanup.push(() => authorEl.removeEventListener("creator-card:filter", onAuthorFilter));

    const separatorEl = document.createElement("span");
    separatorEl.textContent = "•";
    Object.assign(separatorEl.style, {
      opacity: "0.6"
    });

    const dateEl = document.createElement("span");
    // Remark: uploadedDate should be formatted as "X time ago" and update in real time, we can use a library like timeago.js for this
    dateEl.textContent = uploadedDate;

    // add class
    dateEl.className = "upload-date"; // TODO: move to .upload-date in CSS

    metaOverlay.appendChild(authorEl);
    metaOverlay.appendChild(separatorEl);
    metaOverlay.appendChild(dateEl);

    const { tagsRow, renderTags: updateTagsRow } = createMemeCardTags({
      tags,
      searchInput,
      requestSearch,
      cleanup: this._cleanup
    });

    const renderTags = nextTags => {
      tags = Array.isArray(nextTags) ? nextTags : [];
      updateTagsRow(tags);
    };

    const controlsRow = document.createElement("div");
    Object.assign(controlsRow.style, {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "12px",
      // borderTop: "1px solid var(--theme-white-12)",
      // paddingTop: "4px"
    });

    const initialVoteCount = Number(metadata.votes ?? 0);
    const voteCount = Number.isFinite(initialVoteCount) ? initialVoteCount : 0;

    const VoteButtonsElement = customElements.get("vote-buttons");
    const voteButtons = new VoteButtonsElement().setup({
      filename,
      votes: voteCount,
      getState: () => viewState.get(this),
      voteForMeme
    });
    const { downvoteButton, upvoteButton, voteCountLabel } = voteButtons;

    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.setAttribute("aria-label", "Share");
    shareButton.appendChild(createElement(Share2, {
      width: 16,
      height: 16,
      "aria-hidden": "true"
    }));
    Object.assign(shareButton.style, {
      border: "1px solid var(--theme-border-strong)",
      borderRadius: "999px",
      background: "var(--theme-surface-glass)",
      color: "var(--theme-text-primary)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      padding: "0",
      cursor: "pointer",
      fontSize: "14px",
      lineHeight: "1"
    });
    shareButton.addEventListener("click", () => {
      void shareMeme(this._metadata, {
        title: titleEl.textContent || "Meme",
        text: titleEl.textContent || ""
      });
    });

    const infoWrap = document.createElement("div");
    Object.assign(infoWrap.style, {
      position: "relative",
      display: "flex",
      alignItems: "flex-end",
      gap: "8px",
      justifyContent: "flex-end"
    });

    const editButton = showEditButton ? document.createElement("button") : null;
    if (editButton) {
      editButton.type = "button";
      editButton.textContent = "Edit";
      Object.assign(editButton.style, {
        border: "1px solid var(--theme-border-strong)",
        borderRadius: "999px",
        background: "var(--theme-surface-glass)",
        color: "var(--theme-text-primary)",
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: "14px",
        lineHeight: "1"
      });
    }

    const editPanel = editButton
      ? document.createElement("meme-edit-panel").setup({
        meme: {
          ...metadata,
          title,
          description: metadata.description ?? "",
          tags
        },
        onSave: updatedMeme => {
          title = updatedMeme.title ?? title;
          detailsText = updatedMeme.description?.trim() || `File: ${filename}`;

          this._metadata = {
            ...this._metadata,
            ...updatedMeme,
            title,
            description: updatedMeme.description ?? "",
            tags: updatedMeme.tags ?? tags
          };

        footer.setTitle(title);
        hoverInfo.textContent = detailsText;
        renderTags(updatedMeme.tags ?? []);
        commentsPanel.setup({
            meme: this._metadata,
            comments: this._metadata.comments,
            detailsText: `${detailsText} • ${commentsCount} comments`
          });
        }
      })
      : null;

    if (editButton && editPanel) {
      const onEditClick = event => {
        event.stopPropagation();
        editPanel.open();
      };
      editButton.addEventListener("click", onEditClick);
      this._cleanup.push(() => editButton.removeEventListener("click", onEditClick));
    }

    const commentsPanel = document.createElement("comments-panel").setup({
      meme: metadata,
      comments: metadata.comments,
      detailsText: `${detailsText} • ${commentsCount} comments`
    });

    const commentsButton = document.createElement("comments-button").setup({
      commentsCount,
      panel: commentsPanel
    });

    const onDocumentClick = event => {
      if (!this.contains(event.target)) {
        commentsButton.closePanel();
      }
    };

    const onMouseEnter = () => {
      hoverInfo.style.opacity = "1";
      hoverInfo.style.transform = "translateY(0)";
    };

    const onMouseLeave = () => {
      hoverInfo.style.opacity = "0";
      hoverInfo.style.transform = "translateY(8px)";
    };

    const openMemeModal = () => {
      const modal = customElements.get("meme-modal").ensure();
      modal.open({
        meme: {
          ...this._metadata,
          _voteState: this._state,
          _voteForMeme: this._options?.voteForMeme
        }
      });
    };

    const onTitleClick = event => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("button, comments-button, comments-panel")) return;

      const mediaShell = this.querySelector(".media-shell");
      if (!mediaShell) return;

      openMemeModal();
    };

    const onCardClick = event => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("button, comments-button, comments-panel")) return;

      const mediaShell = event.target.closest(".media-shell");
      if (!mediaShell || !this.contains(mediaShell)) return;

      openMemeModal();
    };

    document.addEventListener("click", onDocumentClick);
    this.addEventListener("mouseenter", onMouseEnter);
    this.addEventListener("mouseleave", onMouseLeave);
    this.addEventListener("click", onCardClick);
    this._cleanup.push(() => document.removeEventListener("click", onDocumentClick));
    this._cleanup.push(() => this.removeEventListener("mouseenter", onMouseEnter));
    this._cleanup.push(() => this.removeEventListener("mouseleave", onMouseLeave));
    this._cleanup.push(() => this.removeEventListener("click", onCardClick));

    infoWrap.appendChild(commentsButton);
    infoWrap.appendChild(commentsPanel);

    controlsRow.appendChild(infoWrap);

    controlsRow.appendChild(voteButtons);
    controlsRow.appendChild(shareButton);
    if (editButton) controlsRow.appendChild(editButton);

    footer.setup({ title, tagsRow, controlsRow });
    const footerTitleElement = footer.titleElement;
    footerTitleElement?.addEventListener("click", onTitleClick);
    this._cleanup.push(() => footerTitleElement?.removeEventListener("click", onTitleClick));
    mediaFrame.appendChild(placeholder);
    mediaFrame.appendChild(metaOverlay);
    this.appendChild(mediaFrame);
    // this.appendChild(hoverInfo);
    this.appendChild(footer);
    if (editPanel) this.appendChild(editPanel);

    this._elements = {
      commentsButton,
      commentsPanel,
      downvoteButton,
      footer,
      hoverInfo,
      placeholder,
      upvoteButton,
      voteWrap: voteButtons
    };

    this._state = {
      ...metadata,
      container: this,
      file: filename,
      upvoteButton,
      downvoteButton,
      voteCountLabel,
      voteWrap: voteButtons,
      votes: voteCount,
      remainingMs: autoVoteMs,
      visibleSince: null,
      timerId: null,
      voted: false,
      loaded: false
    };

    viewState.set(this, this._state);
    mediaObserver.observe(this);
  }

  #teardown() {
    for (const cleanup of this._cleanup.splice(0)) {
      cleanup();
    }
  }
}

if (!customElements.get("meme-card")) {
  customElements.define("meme-card", MemeCard);
}
