import { MEME_CONFIG } from "../config.js";
import { getMemeByFilename } from "../api.js";
import { shareMeme } from "./shareMeme.js";

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
    this._caption = null;
    this._shareButton = null;
    this._downloadButton = null;
    this._shareFallback = null;
    this._currentSrc = "";
    this._currentMeme = null;
    this._didRestoreFromLocation = false;
    this._onKeyDown = event => {
      if (event.key === "Escape" && this.style.display !== "none") {
        this.close();
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
    this.#syncActionState();
    this.style.display = "flex";
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
    }
    this.#syncActionState();
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
    if (!this._mediaFrame || !this._caption) return;

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
    this._mediaFrame.replaceChildren(fallback);
    this._caption.textContent = filename
      ? `Unable to load meme: ${filename}`
      : "Unable to load meme.";
    this.#syncActionState();
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
