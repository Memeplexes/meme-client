import { MEME_CONFIG } from "../config.js";
import { getMemeByFilename } from "../api.js";
import { shareMeme } from "./shareMeme.js";
import { createMemeCardTags } from "./MemeCardTags.js";
import { createVoteButton } from "./VoteButton.js";

function getMemeExtension(meme = {}) {
  const extension = meme.extension ?? "";
  if (extension) return String(extension).toLowerCase();

  const filename = meme.filename ?? "";
  const extensionIndex = String(filename).lastIndexOf(".");
  return extensionIndex >= 0 ? String(filename).slice(extensionIndex).toLowerCase() : "";
}

function isVideoExtension(extension = "") {
  return [
    ".3g2", ".3gp", ".avi", ".m2ts", ".m4v", ".mkv", ".mov", ".mp4", ".mpeg",
    ".mpg", ".mts", ".ogg", ".ogv", ".ts", ".webm", ".wmv"
  ].includes(extension);
}

function resolveMemeSrc(meme = {}) {
  console.log("Resolving meme src for:", meme);
  const directSrc = meme.src ?? meme.url ?? meme.assetUrl ?? meme.asset_url ?? meme.mediaUrl ?? meme.media_url;
  if (directSrc) return String(directSrc);
  if (!meme.filename) return "";
  return `${MEME_CONFIG.filesBaseUrl}/${String(meme.filename).replace(/^\/+/, "")}`;
}

class MemeModal extends HTMLElement {
  constructor() {
    super();
    this._media = null;
    this._mediaFrame = null;
    this._mediaContent = null;
    this._caption = null;
    this._shareButton = null;
    this._downloadButton = null;
    this._shareFallback = null;
    this._voteButton = null;
    this._previousButton = null;
    this._nextButton = null;
    this._tagsRow = null;
    this._renderTagsRow = null;
    this._currentSrc = "";
    this._currentMeme = null;
    this._didRestoreFromLocation = false;
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._touchTracking = false;
    this._onKeyDown = event => {
      if (this.style.display === "none") return;
      if (event.key === "Escape" && this.style.display !== "none") {
        this.close();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        this.#navigateMeme(-1);
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        this.#navigateMeme(1);
      }
    };
    this._onPopState = () => {
      void this.#syncWithLocation({ skipUrlSync: true });
    };
  }

  connectedCallback() {
    if (!this._mediaFrame || !this._caption) {
      this.#render();
    }

    if (!this.isConnected) return;
    document.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("popstate", this._onPopState);
    if (!this._didRestoreFromLocation) {
      this._didRestoreFromLocation = true;
      void this.#syncWithLocation({ skipUrlSync: true });
    }
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("popstate", this._onPopState);
  }

  open({ meme = null, src = "", caption = "" } = {}, { skipUrlSync = false } = {}) {
    if (!this._mediaFrame || !this._caption) {
      this.#render();
    }

    const nextMeme = meme && typeof meme === "object"
      ? meme
      : src
        ? { src, title: caption, filename: caption || "meme" }
        : null;
    const nextSrc = resolveMemeSrc(nextMeme ?? {});
    console.log("Opening meme modal with:", { nextMeme, nextSrc, caption });
    const nextCaption = nextMeme?.title ?? caption ?? "";

    this._currentMeme = nextMeme;
    this._currentSrc = nextSrc;
    this.#renderMedia(nextMeme, nextSrc);
    this._caption.textContent = nextCaption;
    this._caption.title = nextCaption;
    this._renderTagsRow?.(this.#getMemeTags(nextMeme));
    this.#renderVoteButton(nextMeme);
    this.#syncActionState();
    this.style.display = "flex";
    this.scrollTop = 0;
    this.#syncNavigationState();
    if (!skipUrlSync) {
      this.#updateLocationForMeme(nextMeme);
    }
  }

  close({ skipUrlSync = false } = {}) {
    this.style.display = "none";
    this._currentSrc = "";
    this._currentMeme = null;
    if (this._media?.tagName === "VIDEO") {
      this._media.pause();
      this._media.removeAttribute("src");
      this._media.load();
    } else {
      this._media?.removeAttribute("src");
    }
    if (this._caption) {
      this._caption.textContent = "";
      this._caption.title = "";
    }
    this._renderTagsRow?.([]);
    this.#renderVoteButton(null);
    this.#syncActionState();
    this.#syncNavigationState();
    if (!skipUrlSync) {
      this.#updateLocationForMeme(null);
    }
  }

  #render() {
    this.replaceChildren();
    this.setAttribute("data-meme-modal", "true");
    Object.assign(this.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "24px 0",
      background: "rgba(8, 8, 10, 0.88)",
      overflowY: "auto",
      overflowX: "hidden",
      overscrollBehavior: "contain",
      zIndex: "9999"
    });

    const frame = document.createElement("div");
    Object.assign(frame.style, {
      position: "relative",
      width: "min(100vw, 1120px)",
      maxWidth: "100%",
      padding: "0 clamp(16px, 5vw, 88px)",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "0"
    });

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    const baseButtonStyles = {
      alignSelf: "flex-end",
      border: "1px solid rgba(17, 17, 17, 0.14)",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.88)",
      color: "#171717",
      padding: "10px 16px",
      fontWeight: "600",
      cursor: "pointer"
    };
    Object.assign(closeButton.style, baseButtonStyles);

    const actionRow = document.createElement("div");
    Object.assign(actionRow.style, {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      justifyContent: "space-between",
      alignItems: "center"
    });

    const primaryActions = document.createElement("div");
    Object.assign(primaryActions.style, {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      alignItems: "center"
    });

    this._downloadButton = document.createElement("button");
    this._downloadButton.type = "button";
    this._downloadButton.textContent = "Download";
    Object.assign(this._downloadButton.style, baseButtonStyles);
    this._downloadButton.addEventListener("click", () => this.#downloadMeme());

    this._shareButton = document.createElement("button");
    this._shareButton.type = "button";
    this._shareButton.textContent = "Share";
    Object.assign(this._shareButton.style, baseButtonStyles);
    this._shareButton.addEventListener("click", () => this.#shareMeme());

    this._shareFallback = document.createElement("a");
    this._shareFallback.textContent = "Open Asset";
    this._shareFallback.target = "_blank";
    this._shareFallback.rel = "noreferrer";
    Object.assign(this._shareFallback.style, {
      ...baseButtonStyles,
      textDecoration: "none",
      alignItems: "center",
      display: "none"
    });

    const photoCard = document.createElement("div");
    Object.assign(photoCard.style, {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(180deg, #fbfaf5 0%, #f2eee4 100%)",
      borderRadius: "28px",
      border: "1px solid rgba(255, 255, 255, 0.55)",
      boxShadow: "0 30px 90px rgba(0, 0, 0, 0.35)",
      overflow: "hidden",
      // transform: "perspective(1600px) rotateX(7deg)",
      transformOrigin: "top center"
    });

    this._mediaFrame = document.createElement("div");
    Object.assign(this._mediaFrame.style, {
      position: "relative",
      height: "min(82vh, calc(100vh - 112px))",
      minHeight: "min(82vh, calc(100vh - 112px))",
      maxHeight: "min(82vh, calc(100vh - 112px))",
      padding: "clamp(12px, 2vw, 20px)",
      boxSizing: "border-box",
      background: "#0f0f10",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });

    this._mediaContent = document.createElement("div");
    Object.assign(this._mediaContent.style, {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    this._mediaFrame.addEventListener("touchstart", event => this.#handleTouchStart(event), { passive: true });
    this._mediaFrame.addEventListener("touchend", event => this.#handleTouchEnd(event), { passive: true });
    this._mediaFrame.addEventListener("touchcancel", () => this.#resetTouchGesture(), { passive: true });

    const createNavButton = (label, direction) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.setAttribute("aria-label", direction < 0 ? "Previous meme" : "Next meme");
      Object.assign(button.style, {
        position: "absolute",
        top: "calc(min(82vh, 100vh - 112px) / 2)",
        [direction < 0 ? "left" : "right"]: "clamp(8px, 1.5vw, 18px)",
        transform: "translateY(-50%)",
        width: "48px",
        height: "48px",
        border: "1px solid rgba(255, 255, 255, 0.24)",
        borderRadius: "999px",
        background: "rgba(0, 0, 0, 0.45)",
        color: "#fff",
        fontSize: "24px",
        lineHeight: "1",
        cursor: "pointer",
        zIndex: "2"
      });
      button.addEventListener("click", event => {
        event.stopPropagation();
        this.#navigateMeme(direction);
      });
      return button;
    };

    this._previousButton = createNavButton("‹", -1);
    this._nextButton = createNavButton("›", 1);
    this._mediaFrame.appendChild(this._previousButton);
    this._mediaFrame.appendChild(this._mediaContent);
    this._mediaFrame.appendChild(this._nextButton);

    this._caption = document.createElement("div");
    this._caption.setAttribute("data-meme-modal-caption", "true");
    Object.assign(this._caption.style, {
      color: "white",
      fontSize: "clamp(18px, 2vw, 24px)",
      lineHeight: "1.35",
      textAlign: "center",
      fontWeight: "700",
      maxWidth: "36ch",
      margin: "0 auto",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    });

    const infoPanel = document.createElement("div");
    Object.assign(infoPanel.style, {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      padding: "26px clamp(18px, 4vw, 40px) 34px",
      paddingTop: "8px",
      paddingBottom: "8px",
      background: "rgba(0, 0, 0, 0.88)",
      /* minHeight: "min(34vh, 320px)" */
    });
    const { tagsRow, renderTags } = createMemeCardTags({
      tags: [],
      searchInput: document.querySelector("page-topbar")?.searchInput,
      requestSearch: ({ query = "" } = {}) => this.#requestSearch(query),
      cleanup: []
    });
    this._tagsRow = tagsRow;
    this._renderTagsRow = renderTags;
    Object.assign(this._tagsRow.style, {
      flex: "1 1 auto",
      minWidth: "0"
    });

    closeButton.addEventListener("click", () => this.close());
    this.addEventListener("click", event => {
      if (event.target === this) {
        this.close();
      }
    });

    primaryActions.appendChild(this._downloadButton);
    primaryActions.appendChild(this._shareButton);
    primaryActions.appendChild(this._shareFallback);
    this._voteButton = document.createElement("div");
    primaryActions.appendChild(this._voteButton);
    actionRow.appendChild(primaryActions);
    actionRow.appendChild(this._tagsRow);
    actionRow.appendChild(closeButton);
    infoPanel.appendChild(this._caption);
    infoPanel.appendChild(actionRow);
    photoCard.appendChild(this._mediaFrame);
    photoCard.appendChild(infoPanel);
    frame.appendChild(photoCard);
    frame.appendChild(this._previousButton);
    frame.appendChild(this._nextButton);
    this.appendChild(frame);
    this.#syncActionState();
    this.#syncNavigationState();
  }

  #renderMedia(meme = null, src = "") {
    if (!this._mediaContent) return;

    const extension = getMemeExtension(meme ?? {});
    const nextMedia = isVideoExtension(extension)
      ? document.createElement("video")
      : document.createElement("img");

    if (nextMedia.tagName === "VIDEO") {
      nextMedia.autoplay = true;
      nextMedia.loop = true;
      nextMedia.muted = true;
      nextMedia.defaultMuted = true;
      nextMedia.playsInline = true;
      nextMedia.controls = true;
      nextMedia.preload = "metadata";
      nextMedia.setAttribute("muted", "");
      nextMedia.setAttribute("playsinline", "");
      nextMedia.setAttribute("webkit-playsinline", "");
      Object.assign(nextMedia.style, {
        maxWidth: "100%",
        maxHeight: "100%",
        width: "100%",
        height: "100%",
        objectFit: "contain",
        background: "#111"
      });
    } else {
      Object.assign(nextMedia.style, {
        maxWidth: "100%",
        maxHeight: "100%",
        width: "100%",
        height: "100%",
        objectFit: "contain",
        background: "#111"
      });
    }

    if (this._media?.tagName === "VIDEO") {
      this._media.pause();
      this._media.removeAttribute("src");
      this._media.load();
    }

    this._media = nextMedia;
    this._mediaContent.replaceChildren(nextMedia);
    nextMedia.addEventListener("error", () => {
      if (this._media !== nextMedia) return;
      this.#showUnavailableState(this.#getFilename(), "This meme could not be loaded.");
    }, { once: true });

    if (src) {
      nextMedia.src = src;
      if (nextMedia.tagName === "VIDEO") {
        requestAnimationFrame(() => {
          const playPromise = nextMedia.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        });
      }
    }
  }

  #showUnavailableState(filename = "", message = "This meme is unavailable.") {
    if (!this._mediaContent || !this._caption) return;

    const fallback = document.createElement("div");
    fallback.textContent = message;
    Object.assign(fallback.style, {
      maxWidth: "min(80vw, 520px)",
      padding: "32px 24px",
      color: "rgba(255, 255, 255, 0.9)",
      textAlign: "center",
      lineHeight: "1.5"
    });

    this._currentMeme = filename ? { filename, title: "Meme unavailable" } : null;
    this._currentSrc = "";
    this._media = null;
    this._mediaContent.replaceChildren(fallback);
    this._caption.textContent = filename
      ? `Unable to load meme: ${filename}`
      : "Unable to load meme.";
    this._caption.title = this._caption.textContent;
    this.#syncActionState();
    this.#syncNavigationState();
    this.style.display = "flex";
  }

  #updateLocationForMeme(meme = null) {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const filename = String(meme?.filename ?? "").trim();

    if (filename) {
      url.searchParams.set("m", filename);
    } else {
      url.searchParams.delete("m");
    }

    window.history.replaceState(window.history.state, "", url);
  }

  async #syncWithLocation({ skipUrlSync = false } = {}) {
    if (typeof window === "undefined") return;

    const filename = String(new URL(window.location.href).searchParams.get("m") ?? "").trim();
    if (!filename) {
      if (this.style.display !== "none") {
        this.close({ skipUrlSync: true });
      }
      return;
    }

    if (this._currentMeme?.filename === filename && this.style.display !== "none") {
      return;
    }
    // TODO: for now just open meme by filename, but ideally we should support checksum as well and try to fetch by checksum if filename lookup fails
    let meme = {
      filename,
      title: filename
    };
    this.open({ meme }, { skipUrlSync: true });
    /*
    try {
      const meme = await getMemeByFilename(filename);
      this.open({ meme }, { skipUrlSync });
    } catch {
      this.#showUnavailableState(filename, "This meme does not exist or could not be fetched.");
    }
      */
  }

  #syncActionState() {
    const hasSrc = Boolean(this._currentSrc);
    const shareSupported = typeof navigator !== "undefined" && typeof navigator.share === "function";

    if (this._downloadButton) {
      this._downloadButton.disabled = !hasSrc;
      this._downloadButton.style.opacity = hasSrc ? "1" : "0.5";
      this._downloadButton.style.cursor = hasSrc ? "pointer" : "not-allowed";
    }

    if (this._shareButton) {
      this._shareButton.disabled = !hasSrc;
      this._shareButton.style.display = shareSupported ? "inline-flex" : "none";
      this._shareButton.style.opacity = hasSrc ? "1" : "0.5";
      this._shareButton.style.cursor = hasSrc ? "pointer" : "not-allowed";
    }

    if (this._shareFallback) {
      this._shareFallback.href = hasSrc ? this._currentSrc : "#";
      this._shareFallback.download = hasSrc ? this.#getFilename() : "";
      this._shareFallback.style.display = !shareSupported && hasSrc ? "inline-flex" : "none";
    }
  }

  #renderVoteButton(meme = null) {
    if (!this._voteButton) return;

    const voteState = meme?._voteState;
    const voteForMeme = meme?._voteForMeme;
    const filename = String(meme?.filename ?? "").trim();
    const initialVoteCount = Number(voteState?.votes ?? meme?.votes ?? 0);
    const votes = Number.isFinite(initialVoteCount) ? initialVoteCount : 0;

    if (!voteState || !voteForMeme || !filename) {
      this._voteButton.replaceChildren();
      this._voteButton.style.display = "none";
      return;
    }

    this._voteButton.style.display = "inline-flex";
    this._voteButton.replaceChildren(createVoteButton({
      filename,
      votes,
      getState: () => voteState,
      voteForMeme
    }));
  }

  #getMemeTags(meme = null) {
    if (Array.isArray(meme?.tags) && meme.tags.length) {
      return meme.tags.map(tag => String(tag).trim()).filter(Boolean);
    }

    const filename = String(meme?.filename ?? "").replace(/\.[^.]+$/, "");
    return filename.split(/[._-]+/).map(tag => tag.trim()).filter(Boolean);
  }

  #requestSearch(query = "") {
    const searchInput = document.querySelector("page-topbar")?.searchInput;
    if (!searchInput) return;

    searchInput.value = String(query ?? "").trim();
    searchInput.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      composed: true,
      detail: {
        value: searchInput.value,
        words: Array.isArray(searchInput.words) ? searchInput.words : searchInput.value.split(/\s+/).filter(Boolean)
      }
    }));
    this.close();
  }

  #getFeedMemes() {
    return Array.from(document.querySelectorAll("meme-card"))
      .map(card => (
        card?._metadata
          ? {
            ...card._metadata,
            _voteState: card._state,
            _voteForMeme: card._options?.voteForMeme
          }
          : null
      ))
      .filter(meme => meme?.filename);
  }

  #getCurrentFeedIndex() {
    if (!this._currentMeme?.filename) return -1;

    return this.#getFeedMemes().findIndex(meme =>
      meme?.filename === this._currentMeme?.filename
      || (
        meme?.checksum
        && this._currentMeme?.checksum
        && meme.checksum === this._currentMeme.checksum
      )
    );
  }

  #navigateMeme(direction = 0) {
    if (!direction) return;

    const memes = this.#getFeedMemes();
    const currentIndex = this.#getCurrentFeedIndex();
    if (currentIndex < 0) return;

    const nextMeme = memes[currentIndex + direction];
    if (!nextMeme) return;

    this.open({ meme: nextMeme });
  }

  #syncNavigationState() {
    const currentIndex = this.#getCurrentFeedIndex();
    const memes = currentIndex >= 0 ? this.#getFeedMemes() : [];
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < memes.length - 1;

    const syncButton = (button, enabled) => {
      if (!button) return;
      button.disabled = !enabled;
      button.style.opacity = enabled ? "1" : "0.35";
      button.style.cursor = enabled ? "pointer" : "not-allowed";
    };

    syncButton(this._previousButton, hasPrevious);
    syncButton(this._nextButton, hasNext);
  }

  #handleTouchStart(event) {
    if (this.style.display === "none" || event.touches.length !== 1) {
      this.#resetTouchGesture();
      return;
    }

    const touch = event.touches[0];
    this._touchStartX = touch.clientX;
    this._touchStartY = touch.clientY;
    this._touchTracking = true;
  }

  #handleTouchEnd(event) {
    if (!this._touchTracking || event.changedTouches.length !== 1) {
      this.#resetTouchGesture();
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this._touchStartX;
    const deltaY = touch.clientY - this._touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const threshold = 60;

    this.#resetTouchGesture();

    if (absY >= threshold && absY > absX && deltaY < 0) {
      this.close();
      return;
    }

    if (absX < threshold || absX <= absY) {
      return;
    }

    this.#navigateMeme(deltaX < 0 ? -1 : 1);
  }

  #resetTouchGesture() {
    this._touchTracking = false;
    this._touchStartX = 0;
    this._touchStartY = 0;
  }

  #getFilename() {
    if (this._currentMeme?.filename) return this._currentMeme.filename;
    if (!this._currentSrc) return "meme";

    try {
      const url = new URL(this._currentSrc, window.location.href);
      const pathname = url.pathname || "";
      const rawName = pathname.split("/").pop() || "meme";
      return rawName.includes(".") ? rawName : `${rawName}.png`;
    } catch {
      const rawName = this._currentSrc.split("/").pop() || "meme";
      return rawName.includes(".") ? rawName : `${rawName}.png`;
    }
  }

  #downloadMeme() {
    if (!this._currentSrc) return;

    const link = document.createElement("a");
    link.href = this._currentSrc;
    link.download = this.#getFilename();
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async #shareMeme() {
    await shareMeme(this._currentMeme, {
      title: this._caption?.textContent || "Meme",
      text: this._caption?.textContent || ""
    });
  }

  static ensure() {
    let modal = document.querySelector("meme-modal[data-meme-modal]");
    if (modal) return modal;

    modal = document.createElement("meme-modal");
    document.body.appendChild(modal);
    return modal;
  }
}

if (!customElements.get("meme-modal")) {
  customElements.define("meme-modal", MemeModal);
}

if (typeof window !== "undefined" && new URL(window.location.href).searchParams.has("m")) {
  const initializeModalFromLocation = () => {
    MemeModal.ensure();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeModalFromLocation, { once: true });
  } else {
    initializeModalFromLocation();
  }
}
