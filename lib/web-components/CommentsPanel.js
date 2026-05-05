import { MEME_CONFIG } from "../config.js";

const COMMENTS_API_URL = MEME_CONFIG.apiUrl;

function normalizeComments(payload) {
  const comments = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.comments)
      ? payload.comments
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return comments
    .map(comment => {
      if (typeof comment === "string") {
        return { author: "Anonymous", body: comment };
      }

      if (!comment || typeof comment !== "object") {
        return null;
      }

      const body = comment.body ?? comment.comment ?? comment.text ?? comment.content ?? comment.message;
      if (!body) return null;

      return {
        author: comment.author ?? comment.username ?? comment.user ?? comment.creator ?? comment.name ?? "Anonymous",
        body,
        createdAt: comment.createdAt ?? comment.created_at ?? comment.date ?? comment.timestamp
      };
    })
    .filter(Boolean);
}

async function fetchCommentsForMeme(meme) {
  const hash = meme?.checksum ?? meme?.hash;
  const filename = meme?.filename;
  const candidates = [];

  if (hash) {
    candidates.push(`${COMMENTS_API_URL}/comments?hash=${encodeURIComponent(hash)}`);
    candidates.push(`${COMMENTS_API_URL}/comments?checksum=${encodeURIComponent(hash)}`);
    candidates.push(`${COMMENTS_API_URL}/${encodeURIComponent(hash)}/comments`);
  }

  if (filename) {
    candidates.push(`${COMMENTS_API_URL}/comments?filename=${encodeURIComponent(filename)}`);
  }

  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const comments = normalizeComments(data);
      if (Array.isArray(comments)) {
        return comments;
      }
    } catch (_error) {
      // Ignore per-endpoint failures and keep trying fallbacks.
    }
  }

  return [];
}

class CommentsPanel extends HTMLElement {
  constructor() {
    super();
    this._meme = null;
    this._comments = [];
    this._detailsText = "";
    this._loaded = false;
    this._loadingPromise = null;
  }

  connectedCallback() {
    if (!this.childNodes.length) {
      this.#render();
    }
  }

  setup({ meme, comments = [], detailsText = "" } = {}) {
    this._meme = meme ?? null;
    this._comments = normalizeComments(comments);
    this._detailsText = detailsText;
    this.#render();
    return this;
  }

  setOpen(open) {
    this.style.opacity = open ? "1" : "0";
    this.style.transform = open ? "translateY(0)" : "translateY(6px)";
    this.style.pointerEvents = open ? "auto" : "none";

    if (open) {
      this.#ensureLoaded();
    }
  }

  async #ensureLoaded() {
    if (this._loaded || this._loadingPromise) return this._loadingPromise;

    if (this._comments.length > 0) {
      this._loaded = true;
      this.#render();
      return Promise.resolve(this._comments);
    }

    this.#render("Loading comments...");
    this._loadingPromise = fetchCommentsForMeme(this._meme)
      .then(comments => {
        this._comments = comments;
        this._loaded = true;
        this.#render();
        return comments;
      })
      .catch(() => {
        this._loaded = true;
        this.#render("Comments unavailable right now.");
        return [];
      })
      .finally(() => {
        this._loadingPromise = null;
      });

    return this._loadingPromise;
  }

  #render(statusText = "") {
    this.replaceChildren();
    Object.assign(this.style, {
      position: "absolute",
      right: "0",
      bottom: "48px",
      width: "280px",
      maxHeight: "280px",
      overflowY: "auto",
      padding: "12px",
      borderRadius: "14px",
      background: "var(--theme-surface-ink-96)",
      border: "1px solid var(--theme-border-soft)",
      color: "var(--theme-text-primary-82)",
      fontSize: "12px",
      lineHeight: "1.45",
      opacity: this.style.opacity || "0",
      transform: this.style.transform || "translateY(6px)",
      pointerEvents: this.style.pointerEvents || "none",
      transition: "opacity 160ms ease, transform 160ms ease"
    });

    if (this._detailsText) {
      const details = document.createElement("p");
      details.textContent = this._detailsText;
      Object.assign(details.style, {
        margin: "0 0 10px",
        color: "var(--theme-text-primary-68)"
      });
      this.appendChild(details);
    }

    /*
    if (statusText) {
      const status = document.createElement("p");
      status.textContent = statusText;
      status.setAttribute("aria-live", "polite");
      Object.assign(status.style, {
        margin: "0"
      });
      this.appendChild(status);
      return;
    }
      */

    /*
    if (!this._comments.length) {
      const empty = document.createElement("p");
      empty.textContent = "No comments yet.";
      Object.assign(empty.style, {
        margin: "0"
      });
      this.appendChild(empty);
      return;
    }
      */

    const list = document.createElement("div");
    Object.assign(list.style, {
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    });

    for (const comment of this._comments) {
      const item = document.createElement("article");
      Object.assign(item.style, {
        paddingTop: "10px",
        borderTop: "1px solid var(--theme-border-soft)"
      });

      const author = document.createElement("div");
      author.textContent = comment.author;
      Object.assign(author.style, {
        fontWeight: "600",
        color: "var(--theme-text-primary)",
        marginBottom: "4px"
      });

      const body = document.createElement("p");
      body.textContent = comment.body;
      Object.assign(body.style, {
        margin: "0"
      });

      item.appendChild(author);
      if (comment.createdAt) {
        const timestamp = document.createElement("div");
        timestamp.textContent = String(comment.createdAt);
        Object.assign(timestamp.style, {
          fontSize: "11px",
          color: "var(--theme-text-faint)",
          marginBottom: "4px"
        });
        item.appendChild(timestamp);
      }
      item.appendChild(body);
      list.appendChild(item);
    }

    this.appendChild(list);
  }
}

if (!customElements.get("comments-panel")) {
  customElements.define("comments-panel", CommentsPanel);
}
