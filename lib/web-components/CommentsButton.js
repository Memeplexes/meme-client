class CommentsButton extends HTMLElement {
  setup(commentsCount) {
    this.replaceChildren();
    this.setAttribute("aria-expanded", "false");
    Object.assign(this.style, {
      display: "inline-flex"
    });

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `💬 ${commentsCount}`;
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

    this.appendChild(button);
    return this;
  }

  setAttribute(name, value) {
    super.setAttribute(name, value);
    if (name !== "aria-expanded") return;
    this.querySelector("button")?.setAttribute(name, value);
  }
}

if (!customElements.get("comments-button")) {
  customElements.define("comments-button", CommentsButton);
}
