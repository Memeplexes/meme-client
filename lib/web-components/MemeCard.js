import { formatDistanceToNow } from 'date-fns'

import "./CommentsButton.js";
import "./CommentsPanel.js";
import "./CreatorCard.js";
import "./MemeEditPanel.js";
import "./MemeModal.js";
import "./VoteButtons.js";
import { shareMeme } from "./shareMeme.js";

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
      creatorUsername.trim().toLowerCase() === localUsername.trim().toLowerCase()
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
      border: "1px solid rgba(255, 255, 255, 0.08)",
      background: "linear-gradient(180deg, rgba(35, 35, 35, 0.98), rgba(18, 18, 18, 0.98))",
      boxShadow: "0 18px 44px rgba(0, 0, 0, 0.28)"
    });

    this.replaceChildren();

    const placeholder = document.createElement("div");
    placeholder.className = "media-shell media-placeholder";
    Object.assign(placeholder.style, {
      position: "relative",
      flex: "1",
      minHeight: "0",
      margin: "0 16px 16px",
      borderRadius: "18px",
      overflow: "hidden",
      background: "#1a1a1a"
    });

    const hoverInfo = document.createElement("div");
    Object.assign(hoverInfo.style, {
      position: "absolute",
      left: "28px",
      right: "28px",
      bottom: "88px",
      padding: "12px 14px",
      borderRadius: "14px",
      background: "rgba(0, 0, 0, 0.72)",
      color: "rgba(255, 255, 255, 0.88)",
      fontSize: "12px",
      lineHeight: "1.45",
      opacity: "0",
      transform: "translateY(8px)",
      transition: "opacity 160ms ease, transform 160ms ease",
      pointerEvents: "none",
      zIndex: "2"
    });
    hoverInfo.textContent = detailsText;

    // TODO: extract and refactor meme-footer to separate ./lib/web-components/MemeCardFooter.js component and use it here and in MemeCard.js
    const footer = document.createElement("div");
    footer.className = "meme-footer"; // TODO: move to .meme-footer in CSS
    Object.assign(footer.style, {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      paddingLeft: "8px",
      paddingBottom: "8px",
      paddingRight: "8px",
      //padding: "0 16px 16px",
      //paddingTop: "16px",
    });

    const titleEl = document.createElement("div");
    titleEl.textContent = title;
    Object.assign(titleEl.style, {
      color: "#fff",
      fontSize: "17px",
      fontWeight: "700",
      lineHeight: "1.3",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      cursor: "pointer"
    });

    const metaRow = document.createElement("div");
    Object.assign(metaRow.style, {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: "12px",
      fontSize: "12px",
      color: "rgba(255, 255, 255, 0.6)"
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

    metaRow.appendChild(authorEl);
    metaRow.appendChild(separatorEl);
    metaRow.appendChild(dateEl);

    const tagsRow = document.createElement("div");
    Object.assign(tagsRow.style, {
      display: "flex",
      flexWrap: "nowrap",
      gap: "8px",
      overflowX: "auto",
      scrollbarWidth: "none"
    });
    for (const tag of tags) {
      const tagButton = document.createElement("button");
      tagButton.type = "button";
      tagButton.textContent = '#' + tag;
      Object.assign(tagButton.style, {
        border: "1px solid rgba(255, 255, 255, 0.16)",
        borderRadius: "999px",
        background: "rgba(255, 255, 255, 0.06)",
        color: "white",
        padding: "5px 10px",
        cursor: "pointer",
        fontSize: "12px",
        lineHeight: "1.2",
        flex: "0 0 auto"
      });
      const onTagClick = () => {
        const currentTags = searchInput.value.trim().split(/\s+/).filter(Boolean);
        if (!currentTags.includes(tag)) currentTags.push(tag);
        requestSearch?.({ query: currentTags.join(" ") });
      };
      tagButton.addEventListener("click", onTagClick);
      this._cleanup.push(() => tagButton.removeEventListener("click", onTagClick));
      tagsRow.appendChild(tagButton);
    }

    const renderTags = nextTags => {
      tags = Array.isArray(nextTags) ? nextTags : [];
      tagsRow.replaceChildren();
      for (const tag of tags) {
        const tagButton = document.createElement("button");
        tagButton.type = "button";
        tagButton.textContent = '#' + tag;
        Object.assign(tagButton.style, {
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: "999px",
          background: "rgba(255, 255, 255, 0.06)",
          color: "white",
          //padding: "5px 10px",
          cursor: "pointer",
          fontSize: "12px",
          lineHeight: "1.2",
          flex: "0 0 auto"
        });
        const onTagClick = () => {
          const currentTags = searchInput.value.trim().split(/\s+/).filter(Boolean);
          if (!currentTags.includes(tag)) currentTags.push(tag);
          requestSearch?.({ query: currentTags.join(" ") });
        };
        tagButton.addEventListener("click", onTagClick);
        this._cleanup.push(() => tagButton.removeEventListener("click", onTagClick));
        tagsRow.appendChild(tagButton);
      }
    };

    const controlsRow = document.createElement("div");
    Object.assign(controlsRow.style, {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "12px",
      // borderTop: "1px solid rgba(255, 255, 255, 0.12)",
      paddingTop: "4px"
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
    shareButton.textContent = "Share";
    Object.assign(shareButton.style, {
      border: "1px solid rgba(255, 255, 255, 0.18)",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.06)",
      color: "white",
      padding: "8px 12px",
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
        border: "1px solid rgba(255, 255, 255, 0.18)",
        borderRadius: "999px",
        background: "rgba(255, 255, 255, 0.06)",
        color: "white",
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

          titleEl.textContent = title;
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
      modal.open({ meme: this._metadata });
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
    titleEl.addEventListener("click", onTitleClick);
    this._cleanup.push(() => document.removeEventListener("click", onDocumentClick));
    this._cleanup.push(() => this.removeEventListener("mouseenter", onMouseEnter));
    this._cleanup.push(() => this.removeEventListener("mouseleave", onMouseLeave));
    this._cleanup.push(() => this.removeEventListener("click", onCardClick));
    this._cleanup.push(() => titleEl.removeEventListener("click", onTitleClick));

    if (editButton) infoWrap.appendChild(editButton);
    infoWrap.appendChild(commentsButton);
    infoWrap.appendChild(commentsPanel);
    controlsRow.appendChild(voteButtons);
    controlsRow.appendChild(shareButton);
    controlsRow.appendChild(infoWrap);
    footer.appendChild(titleEl);
    footer.appendChild(metaRow);
    footer.appendChild(tagsRow);
    footer.appendChild(controlsRow);
    this.appendChild(placeholder);
    // this.appendChild(hoverInfo);
    this.appendChild(footer);
    if (editPanel) this.appendChild(editPanel);

    this._elements = {
      commentsButton,
      commentsPanel,
      downvoteButton,
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
