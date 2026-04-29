class CommentsButton extends HTMLElement {
  constructor() {
    super();
    this._button = null;
    this._panel = null;
    this._count = 0;
    this._onClick = event => {
      event.stopPropagation();
      this.togglePanel();
    };
  }

  setup(commentsCount, panel = null) {
    if (typeof commentsCount === "object" && commentsCount !== null) {
      panel = commentsCount.panel ?? panel;
      commentsCount = commentsCount.commentsCount;
    }

    this._count = Number.isFinite(Number(commentsCount)) ? Number(commentsCount) : 0;
    this.attachPanel(panel);
    this._button?.removeEventListener("click", this._onClick);
    this.replaceChildren();
    this.setAttribute("aria-expanded", "false");
    Object.assign(this.style, {
      display: "inline-flex"
    });

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `💬 ${this._count}`;
    button.setAttribute("aria-expanded", "false");
    Object.assign(button.style, {
      border: "1px solid rgba(255, 255, 255, 0.18)",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.06)",
      color: "white",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "13px",
      lineHeight: "1"
    });

    this._button = button;
    button.addEventListener("click", this._onClick);
    this.appendChild(button);
    return this;
  }

  attachPanel(panel) {
    this._panel = panel ?? null;
    return this;
  }

  togglePanel(forceOpen) {
    if (!this._panel) return;

    const nextOpen = typeof forceOpen === "boolean"
      ? forceOpen
      : this.getAttribute("aria-expanded") !== "true";

    this.setAttribute("aria-expanded", String(nextOpen));
    this._panel.setOpen(nextOpen);
  }

  closePanel() {
    this.togglePanel(false);
  }

  setAttribute(name, value) {
    super.setAttribute(name, value);
    if (name !== "aria-expanded") return;
    this._button?.setAttribute(name, value);
  }
}

if (!customElements.get("comments-button")) {
  customElements.define("comments-button", CommentsButton);
}
