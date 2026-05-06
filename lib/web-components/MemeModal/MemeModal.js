import { MEME_CONFIG } from "../../config.js";
import { getMemeByFilename } from "../../api/api.js";
import { shareMeme } from "../shareMeme.js";
import { createMemeInfoPanel } from "./MemeInfoPanel.js";
import {
  handleMediaClick,
  handlePointerCancel,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
  handleWheelGesture,
  resetTouchGesture
} from "./touchEvents.js";


const MEME_MODAL_STYLES = `
meme-modal[data-meme-modal] {
  position: fixed;
  inset: 0;
  display: none;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12px;
  padding-bottom: 12px;
  background: var(--theme-overlay-modal);
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  z-index: 9999;
}

meme-modal[data-meme-modal][data-state="open"],
meme-modal[data-meme-modal][data-state="closing"] {
  display: flex;
}

meme-modal[data-meme-modal][data-state="closing"] {
  pointer-events: none;
}

meme-modal[data-meme-modal] .meme-modal__frame {
  position: relative;
  /* width: min(100vw, 1120px); */
  max-width: 100%;
  padding: 0 clamp(16px, 5vw, 88px);
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

meme-modal[data-meme-modal] .meme-modal__content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

meme-modal[data-meme-modal] .meme-modal__action-rail {
  display: flex;
  align-self: flex-end;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding-top: clamp(12px, 2vw, 20px);
}

meme-modal[data-meme-modal] .meme-modal__action-rail .meme-modal__button,
meme-modal[data-meme-modal] .meme-modal__action-rail .meme-modal__link,
meme-modal[data-meme-modal] .meme-modal__action-rail .meme-modal__vote-slot {
  align-self: stretch;
}

meme-modal[data-meme-modal] .meme-modal__card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--theme-paper-top) 0%, var(--theme-paper-bottom) 100%);
  border-radius: 28px;
  border: 1px solid var(--theme-border-white-55);
  box-shadow: 0 30px 90px var(--theme-shadow-soft);
  overflow: hidden;
  transform-origin: top center;
}

@media (max-width: 767px) {
  meme-modal[data-meme-modal] .meme-modal__content {
    flex-direction: column;
    gap: 0;
    position: relative;
  }

  meme-modal[data-meme-modal] .meme-modal__card {
    border: none;
  }

  meme-modal[data-meme-modal] .meme-modal__frame {
    padding: 0;
    gap: 0;
  }

  meme-modal[data-meme-modal] .meme-modal__action-rail {
    position: absolute;
    bottom: 16px;
    right: 16px;
    z-index: 3;
    width: auto;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-end;
    padding: 0;
    /* padding-right: 100px; */
    transform: translateZ(0);
  }


  meme-modal[data-meme-modal] .meme-modal__action-rail .meme-modal__button,
  meme-modal[data-meme-modal] .meme-modal__action-rail .meme-modal__link,
  meme-modal[data-meme-modal] .meme-modal__action-rail .meme-modal__vote-slot {
    min-width: 0;
  }

  meme-modal[data-meme-modal] .meme-modal__action-rail .meme-modal__button,
  meme-modal[data-meme-modal] .meme-modal__action-rail .meme-modal__link {
    padding: 10px 12px;
  }

  meme-modal[data-meme-modal] .meme-modal__action-rail .meme-modal__vote-slot {
    display: flex;
  }

  meme-modal[data-meme-modal] .meme-modal__media-frame {
    padding: 0 !important;
  }

  meme-modal[data-meme-modal] {
    overflow-y: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  meme-modal[data-meme-modal]::-webkit-scrollbar {
    display: none;
  }
 
 
}

 meme-modal[data-meme-modal] .meme-card-tag {
    font-size: 16px !important;
  }


meme-modal[data-meme-modal] .meme-modal__media-frame {
  position: relative;
  height: min(82vh, calc(100vh - 112px));
  min-height: min(82vh, calc(100vh - 112px));
  max-height: min(82vh, calc(100vh - 112px));
  padding: clamp(12px, 2vw, 20px);
  box-sizing: border-box;
  background: var(--theme-surface-modal);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  user-select: none;
}

meme-modal[data-meme-modal] .meme-modal__media-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

meme-modal[data-meme-modal] .meme-modal__media {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--theme-surface-elevated);
}

meme-modal[data-meme-modal] .meme-modal__nav {
  position: absolute;
  top: calc(min(82vh, 100vh - 112px) / 2);
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: 1px solid var(--theme-white-24);
  border-radius: 999px;
  background: var(--theme-shadow-strong);
  color: var(--theme-text-primary);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  z-index: 2;
}

meme-modal[data-meme-modal] .meme-modal__nav[data-direction="previous"] {
  left: clamp(8px, 1.5vw, 18px);
}

meme-modal[data-meme-modal] .meme-modal__nav[data-direction="next"] {
  right: clamp(8px, 1.5vw, 18px);
}

meme-modal[data-meme-modal] .meme-modal__nav[disabled] {
  opacity: 0.35;
  cursor: not-allowed;
}

meme-modal[data-meme-modal] .meme-modal__info-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding: 8px clamp(18px, 4vw, 40px);
  background: var(--theme-overlay-heavy);
}

meme-modal[data-meme-modal] .meme-modal__caption {
  color: var(--theme-text-primary);
  font-size: clamp(18px, 2vw, 24px);
  line-height: 1.35;
  text-align: center;
  font-weight: 700;
  max-width: 36ch;
  margin: 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

meme-modal[data-meme-modal] .meme-modal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
}

meme-modal[data-meme-modal] .meme-modal__primary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

meme-modal[data-meme-modal] .meme-modal__button,
meme-modal[data-meme-modal] .meme-modal__link {
  align-self: flex-end;
  border: 0;
  border-radius: 999px;
  border: 1px solid var(--theme-border-strong);
  border-radius: 999px;
  background: var(--theme-surface-glass);
  overflow: hidden;
  backdrop-filter: blur(8px);
  color: var(--theme-text-primary);
  padding-top: 8px;
  padding-bottom: 8px;
  margin: 0px;
  padding-right: 0px;
  padding-left: 0px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: transform 160ms ease, background 160ms ease, color 160ms ease;
}

meme-modal[data-meme-modal] .meme-modal__button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

meme-modal[data-meme-modal] .meme-modal__link {
  text-decoration: none;
  align-items: center;
  display: none;
}

meme-modal[data-meme-modal][data-share-supported="false"][data-has-src="true"] .meme-modal__link[data-role="share-fallback"] {
  display: inline-flex;
}

meme-modal[data-meme-modal][data-share-supported="true"] .meme-modal__button[data-role="share"] {
  display: inline-flex;
}

meme-modal[data-meme-modal][data-share-supported="false"] .meme-modal__button[data-role="share"] {
  display: none;
}

/*
meme-modal[data-meme-modal] .meme-modal__vote-slot[data-visible="false"] {
  display: none;
}

meme-modal[data-meme-modal] .meme-modal__vote-slot[data-visible="true"] {
  display: inline-flex;
}
  */

meme-modal[data-meme-modal] .meme-modal__tags {
  flex: 1 1 auto;
  min-width: 0;
}

meme-modal[data-meme-modal] .meme-modal__fallback {
  max-width: min(80vw, 520px);
  padding: 32px 24px;
  color: var(--theme-text-primary-90);
  text-align: center;
  line-height: 1.5;
}
`;

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
  // console.log("Resolving meme src for:", meme);
  const directSrc = meme.src ?? meme.url ?? meme.assetUrl ?? meme.asset_url ?? meme.mediaUrl ?? meme.media_url;
  if (directSrc) return String(directSrc);
  if (!meme.filename) return "";
  return `${MEME_CONFIG.filesBaseUrl}/${String(meme.filename).replace(/^\/+/, "")}`;
}

class MemeModal extends HTMLElement {
  constructor() {
    super();
    this._styleSheet = null;
    this._content = null;
    this._photoCard = null;
    this._actionRail = null;
    this._media = null;
    this._mediaFrame = null;
    this._mediaContent = null;
    this._caption = null;
    this._shareButton = null;
    this._downloadButton = null;
    this._shareFallback = null;
    this._renderVoteButton = null;
    this._previousButton = null;
    this._nextButton = null;
    this._tagsRow = null;
    this._renderTagsRow = null;
    this._currentSrc = "";
    this._currentMeme = null;
    this._didRestoreFromLocation = false;
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._touchStartTime = 0;
    this._touchAxis = "";
    this._touchTracking = false;
    this._activePointerId = null;
    this._wheelDeltaY = 0;
    this._wheelStartTime = 0;
    this._wheelLastTime = 0;
    this._wheelLocked = false;
    this._wheelResetTimer = null;
    this._isNavigatingMeme = false;
    this._closeAnimationToken = 0;
    this._onKeyDown = event => {
      if (!this.#isOpen()) return;
      if (event.key === "Escape") {
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
    this._onWheelGesture = event => handleWheelGesture(this, event, {
      isOpen: () => this.#isOpen(),
      navigateMeme: direction => this.#navigateMeme(direction),
      canNavigate: direction => {
        const currentIndex = this.#getCurrentFeedIndex();
        const memes = currentIndex >= 0 ? this.#getFeedMemes() : [];
        return direction < 0
          ? currentIndex > 0
          : currentIndex >= 0 && currentIndex < memes.length - 1;
      }
    });
    this._mobileRailMediaQuery = window.matchMedia("(max-width: 767px)");
    this._onMobileRailChange = () => {
      this.#syncActionRailPlacement();
    };
  }

  connectedCallback() {
    if (!this._mediaFrame || !this._caption) {
      this.#render();
    }

    if (!this.isConnected) return;
    document.addEventListener("keydown", this._onKeyDown);
    document.addEventListener("wheel", this._onWheelGesture, { passive: false });
    window.addEventListener("popstate", this._onPopState);
    this._mobileRailMediaQuery.addEventListener("change", this._onMobileRailChange);
    this.#syncActionRailPlacement();
    if (!this._didRestoreFromLocation) {
      this._didRestoreFromLocation = true;
      void this.#syncWithLocation({ skipUrlSync: true });
    }
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKeyDown);
    document.removeEventListener("wheel", this._onWheelGesture);
    window.removeEventListener("popstate", this._onPopState);
    this._mobileRailMediaQuery.removeEventListener("change", this._onMobileRailChange);
  }

  open({ meme = null, src = "", caption = "" } = {}, { skipUrlSync = false } = {}) {
    if (!this._mediaFrame || !this._caption) {
      this.#render();
    }

    this._closeAnimationToken += 1;
    this.getAnimations?.().forEach(animation => animation.cancel());
    this.firstElementChild?.getAnimations?.().forEach(animation => animation.cancel());
    this.dataset.state = "open";

    const nextMeme = meme && typeof meme === "object"
      ? meme
      : src
        ? { src, title: caption, filename: caption || "meme" }
        : null;
    const nextSrc = resolveMemeSrc(nextMeme ?? {});
    // console.log("Opening meme modal with:", { nextMeme, nextSrc, caption });
    const nextCaption = nextMeme?.title ?? caption ?? "";

    this._currentMeme = nextMeme;
    this._currentSrc = nextSrc;
    this.#renderMedia(nextMeme, nextSrc);
    this._caption.textContent = nextCaption;
    this._caption.title = nextCaption;
    this._renderTagsRow?.(this.#getMemeTags(nextMeme));
    this._renderVoteButton?.(nextMeme);
    this.#syncActionState();
    //window.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
    //document.documentElement.scrollTop = 0;
    //document.body.scrollTop = 0;
    //this.scrollTop = 0;
    this.#syncNavigationState();
    if (!skipUrlSync) {
      this.#updateLocationForMeme(nextMeme);
    }
  }

  close({ skipUrlSync = false } = {}) {
    if (!this.#isOpen()) return;

    const animationToken = ++this._closeAnimationToken;
    const finalizeClose = () => {
      if (animationToken !== this._closeAnimationToken) return;
      this.dataset.state = "closed";
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
      this._renderVoteButton?.(null);
      this.#syncActionState();
      this.#syncNavigationState();
      if (!skipUrlSync) {
        this.#updateLocationForMeme(null);
      }
    };

    const closeAnimation = String(MEME_CONFIG.modalCloseAnimation ?? "slide-down").trim().toLowerCase();
    const slideOffset = closeAnimation === "slide-up" ? -72 : closeAnimation === "slide-down" ? 72 : 0;
    const frame = this.firstElementChild;

    if (!slideOffset || !this.animate || !frame?.animate) {
      finalizeClose();
      return;
    }

    this.dataset.state = "closing";
    const overlayAnimation = this.animate(
      [
        { opacity: 1 },
        { opacity: 0 }
      ],
      {
        duration: 111,
        easing: "ease-in",
        fill: "forwards"
      }
    );
    const frameAnimation = frame.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: `translateY(${slideOffset}px)`, opacity: 0.72 }
      ],
      {
        duration: 111,
        easing: "ease-in",
        fill: "forwards"
      }
    );

    Promise.allSettled([overlayAnimation.finished, frameAnimation.finished]).finally(finalizeClose);
  }

  #render() {
    this.replaceChildren();
    this.setAttribute("data-meme-modal", "true");
    this.dataset.state = "closed";
    this.dataset.hasSrc = "false";
    this.dataset.shareSupported = "false";

    this._styleSheet = document.createElement("style");
    this._styleSheet.setAttribute("data-meme-modal-styles", "true");
    this._styleSheet.textContent = MEME_MODAL_STYLES;

    const frame = document.createElement("div");
    frame.className = "meme-modal__frame";
    frame.setAttribute("data-element", "frame");

    const content = document.createElement("div");
    content.className = "meme-modal__content";
    content.setAttribute("data-element", "content");
    this._content = content;

    const photoCard = document.createElement("div");
    photoCard.className = "meme-modal__card";
    photoCard.setAttribute("data-element", "card");
    this._photoCard = photoCard;

    const actionRail = document.createElement("div");
    actionRail.className = "meme-modal__action-rail";
    actionRail.setAttribute("data-element", "action-rail");
    this._actionRail = actionRail;

    this._mediaFrame = document.createElement("div");
    this._mediaFrame.className = "meme-modal__media-frame";
    this._mediaFrame.setAttribute("data-element", "media-frame");

    this._mediaContent = document.createElement("div");
    this._mediaContent.className = "meme-modal__media-content";
    this._mediaContent.setAttribute("data-element", "media-content");
    const canNavigateMeme = direction => {
      const currentIndex = this.#getCurrentFeedIndex();
      const memes = currentIndex >= 0 ? this.#getFeedMemes() : [];
      return direction < 0
        ? currentIndex > 0
        : currentIndex >= 0 && currentIndex < memes.length - 1;
    };
    this._mediaFrame.addEventListener("touchstart", event => handleTouchStart(this, event, {
      isOpen: () => this.#isOpen()
    }), { passive: true });
    this._mediaFrame.addEventListener("touchmove", event => handleTouchMove(this, event, {
      canNavigate: canNavigateMeme
    }), { passive: true });
    this._mediaFrame.addEventListener("touchend", event => handleTouchEnd(this, event, {
      navigateMeme: direction => this.#navigateMeme(direction),
      canNavigate: canNavigateMeme
    }), { passive: true });
    this._mediaFrame.addEventListener("touchcancel", () => resetTouchGesture(this), { passive: true });
    this._mediaFrame.addEventListener("pointerdown", event => handlePointerDown(this, event, {
      isOpen: () => this.#isOpen()
    }));
    this._mediaFrame.addEventListener("pointermove", event => handlePointerMove(this, event, {
      canNavigate: canNavigateMeme
    }));
    this._mediaFrame.addEventListener("pointerup", event => handlePointerUp(this, event, {
      navigateMeme: direction => this.#navigateMeme(direction),
      canNavigate: canNavigateMeme
    }));
    this._mediaFrame.addEventListener("pointercancel", event => handlePointerCancel(this, event));
    this._mediaContent.addEventListener("click", event => handleMediaClick(this, event, {
      navigateMeme: direction => this.#navigateMeme(direction),
      canNavigate: canNavigateMeme
    }));
    const createNavButton = (label, direction) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.setAttribute("aria-label", direction < 0 ? "Previous meme" : "Next meme");
      button.className = "meme-modal__nav";
      button.setAttribute("data-role", "navigation");
      button.setAttribute("data-direction", direction < 0 ? "previous" : "next");
      button.addEventListener("click", event => {
        event.stopPropagation();
        this.#navigateMeme(direction);
      });
      return button;
    };

    /*
    this._previousButton = createNavButton("‹", -1);
    this._nextButton = createNavButton("›", 1);
    */
    // this._mediaFrame.appendChild(this._previousButton);
    this._mediaFrame.appendChild(this._mediaContent);
    // this._mediaFrame.appendChild(this._nextButton);

    const {
      infoPanel,
      caption,
      downloadButton,
      shareButton,
      shareFallback,
      closeButton,
      tagsRow,
      renderTags,
      renderVoteButton
    } = createMemeInfoPanel({
      onClose: () => this.close(),
      onRequestSearch: query => this.#requestSearch(query),
      onDownload: () => this.#downloadMeme(),
      onShare: () => this.#shareMeme()
    });
    this._caption = caption;
    this._downloadButton = downloadButton;
    this._shareButton = shareButton;
    this._shareFallback = shareFallback;
    this._tagsRow = tagsRow;
    this._renderTagsRow = renderTags;
    this._renderVoteButton = renderVoteButton;
    actionRail.append(infoPanel.querySelector(".meme-modal__vote-slot"), downloadButton, shareButton, shareFallback, closeButton);

    this.addEventListener("click", event => {
      if (event.target === this) {
        this.close();
      }
    });

    photoCard.appendChild(this._mediaFrame);
    photoCard.appendChild(infoPanel);
    content.append(photoCard, actionRail);
    frame.appendChild(content);
    this.append(this._styleSheet, frame);
    this.#syncActionRailPlacement();
    this.#syncActionState();
    this.#syncNavigationState();
  }

  #syncActionRailPlacement() {
    if (!this._actionRail || !this._mediaFrame || !this._content || !this._photoCard) return;

    if (this._mobileRailMediaQuery.matches) {
      if (this._actionRail.parentElement !== this._mediaFrame) {
        this._mediaFrame.appendChild(this._actionRail);
      }
      return;
    }

    if (this._actionRail.parentElement !== this._content) {
      this._content.insertBefore(this._actionRail, this._photoCard.nextSibling);
    }
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
    }
    nextMedia.className = "meme-modal__media";
    nextMedia.setAttribute("data-element", nextMedia.tagName === "VIDEO" ? "video" : "image");

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
            playPromise.catch(() => { });
          }
        });
      }
    }
  }

  #showUnavailableState(filename = "", message = "This meme is unavailable.") {
    if (!this._mediaContent || !this._caption) return;

    const fallback = document.createElement("div");
    fallback.className = "meme-modal__fallback";
    fallback.setAttribute("data-element", "fallback");
    fallback.textContent = message;

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
    this.dataset.state = "open";
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
      if (this.#isOpen()) {
        this.close({ skipUrlSync: true });
      }
      return;
    }

    if (this._currentMeme?.filename === filename && this.#isOpen()) {
      return;
    }

    // TODO: there seems to be a strange issue where the vote buttons don't show in the MemeModal when the modal is loaded from this code path. please invesigate and fix this issue, do your best not to write new code, use the existing code
    let meme = {
      filename,
      title: filename
    };
    // this.open({ meme }, { skipUrlSync: true });
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
    this.dataset.hasSrc = String(hasSrc);
    this.dataset.shareSupported = String(shareSupported);

    if (this._downloadButton) {
      this._downloadButton.disabled = !hasSrc;
    }

    if (this._shareButton) {
      this._shareButton.disabled = !hasSrc;
    }

    if (this._shareFallback) {
      this._shareFallback.href = hasSrc ? this._currentSrc : "#";
      this._shareFallback.download = hasSrc ? this.#getFilename() : "";
    }
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

  async #navigateMeme(direction = 0) {
    if (!direction) return;
    if (this._isNavigatingMeme) return;

    const memes = this.#getFeedMemes();
    const currentIndex = this.#getCurrentFeedIndex();
    if (currentIndex < 0) return;

    const nextMeme = memes[currentIndex + direction];
    if (!nextMeme) return;

    this._isNavigatingMeme = true;
    const outgoingMedia = this._mediaContent?.firstElementChild;
    const frameHeight = this._mediaFrame?.clientHeight ?? 0;
    const travelDistance = Math.max(96, Math.round(frameHeight * 0.12));
    const exitOffset = direction > 0 ? travelDistance : -travelDistance;
    const enterOffset = -exitOffset;
    try {
      if (outgoingMedia?.animate) {
        await outgoingMedia.animate(
          [
            { transform: "translateY(0)", opacity: 1 },
            { transform: `translateY(${exitOffset}px)`, opacity: 0.4 }
          ],
          {
            duration: 150,
            easing: "ease-out",
            fill: "forwards"
          }
        ).finished.catch(() => { });
      }

      this.open({ meme: nextMeme });

      const incomingMedia = this._mediaContent?.firstElementChild;
      if (incomingMedia?.animate) {
        incomingMedia.animate(
          [
            { transform: `translateY(${enterOffset}px)`, opacity: 0.4 },
            { transform: "translateY(0)", opacity: 1 }
          ],
          {
            duration: 180,
            easing: "ease-out"
          }
        );
      }
    } finally {
      this._isNavigatingMeme = false;
    }
  }

  #syncNavigationState() {
    const currentIndex = this.#getCurrentFeedIndex();
    const memes = currentIndex >= 0 ? this.#getFeedMemes() : [];
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < memes.length - 1;

    const syncButton = (button, enabled) => {
      if (!button) return;
      button.disabled = !enabled;
    };

    syncButton(this._previousButton, hasPrevious);
    syncButton(this._nextButton, hasNext);
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

  #isOpen() {
    return this.dataset.state === "open" || this.dataset.state === "closing";
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
