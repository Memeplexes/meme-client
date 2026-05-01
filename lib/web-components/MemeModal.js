import { MEME_CONFIG } from "../config.js";

function getMemeExtension(meme = {}) {
  const extension = meme.extension ?? "";
  if (extension) return String(extension).toLowerCase();

  const filename = meme.filename ?? "";
  const extensionIndex = String(filename).lastIndexOf(".");
  return extensionIndex >= 0 ? String(filename).slice(extensionIndex).toLowerCase() : "";
}

function isVideoExtension(extension = "") {
  return [".mp4", ".webm", ".mov"].includes(extension);
}

function resolveMemeSrc(meme = {}) {
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
    this._caption = null;
    this._shareButton = null;
    this._downloadButton = null;
    this._shareFallback = null;
    this._currentSrc = "";
    this._currentMeme = null;
    this._onKeyDown = event => {
      if (event.key === "Escape" && this.style.display !== "none") {
        this.close();
      }
    };
  }

  connectedCallback() {
    if (!this._mediaFrame || !this._caption) {
      this.#render();
    }

    if (!this.isConnected) return;
    document.addEventListener("keydown", this._onKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKeyDown);
  }

  open({ meme = null, src = "", caption = "" } = {}) {
    if (!this._mediaFrame || !this._caption) {
      this.#render();
    }

    const nextMeme = meme && typeof meme === "object"
      ? meme
      : src
        ? { src, title: caption, filename: caption || "meme" }
        : null;
    const nextSrc = resolveMemeSrc(nextMeme ?? {});
    const nextCaption = nextMeme?.title ?? caption ?? "";

    this._currentMeme = nextMeme;
    this._currentSrc = nextSrc;
    this.#renderMedia(nextMeme, nextSrc);
    this._caption.textContent = nextCaption;
    this.#syncActionState();
    this.style.display = "flex";
  }

  close() {
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
    }
    this.#syncActionState();
  }

  #render() {
    this.replaceChildren();
    this.setAttribute("data-meme-modal", "true");
    Object.assign(this.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "rgba(0, 0, 0, 0.82)",
      zIndex: "9999"
    });

    const frame = document.createElement("div");
    Object.assign(frame.style, {
      position: "relative",
      maxWidth: "min(96vw, 1200px)",
      maxHeight: "92vh",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    });

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    const baseButtonStyles = {
      alignSelf: "flex-end",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.1)",
      color: "#fff",
      padding: "8px 14px",
      cursor: "pointer"
    };
    Object.assign(closeButton.style, baseButtonStyles);

    const actionRow = document.createElement("div");
    Object.assign(actionRow.style, {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      justifyContent: "flex-end"
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
      display: "none"
    });

    this._mediaFrame = document.createElement("div");
    Object.assign(this._mediaFrame.style, {
      maxWidth: "100%",
      maxHeight: "calc(92vh - 56px)",
      borderRadius: "16px",
      background: "#111",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });

    this._caption = document.createElement("div");
    this._caption.setAttribute("data-meme-modal-caption", "true");
    Object.assign(this._caption.style, {
      color: "rgba(255, 255, 255, 0.86)",
      fontSize: "14px",
      textAlign: "center"
    });

    closeButton.addEventListener("click", () => this.close());
    this.addEventListener("click", event => {
      if (event.target === this) {
        this.close();
      }
    });

    actionRow.appendChild(this._downloadButton);
    actionRow.appendChild(this._shareButton);
    actionRow.appendChild(this._shareFallback);
    actionRow.appendChild(closeButton);
    frame.appendChild(actionRow);
    frame.appendChild(this._mediaFrame);
    frame.appendChild(this._caption);
    this.appendChild(frame);
    this.#syncActionState();
  }

  #renderMedia(meme = null, src = "") {
    if (!this._mediaFrame) return;

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
        maxHeight: "calc(92vh - 56px)",
        width: "auto",
        height: "auto",
        background: "#111"
      });
    } else {
      Object.assign(nextMedia.style, {
        maxWidth: "100%",
        maxHeight: "calc(92vh - 56px)",
        borderRadius: "16px",
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
    this._mediaFrame.replaceChildren(nextMedia);

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
    if (!this._currentSrc || typeof navigator === "undefined" || typeof navigator.share !== "function") {
      return;
    }

    try {
      await navigator.share({
        title: this._caption?.textContent || "Meme",
        text: this._caption?.textContent || "",
        url: this._currentSrc
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        window.open(this._currentSrc, "_blank", "noopener,noreferrer");
      }
    }
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
