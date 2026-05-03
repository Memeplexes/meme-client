class MemeCardFooter extends HTMLElement {
  constructor() {
    super();
    this._titleEl = null;
  }

  setup({ title, tagsRow, controlsRow }) {
    this.className = "meme-footer";
    Object.assign(this.style, {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      paddingLeft: "8px",
      paddingBottom: "8px",
      paddingRight: "8px",
      marginLeft: "8px",
      marginRight: "8px"
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
      cursor: "pointer",
      paddingBottom: "4px"
    });

    this.replaceChildren(titleEl, tagsRow, controlsRow);
    this._titleEl = titleEl;

    return this;
  }

  get titleElement() {
    return this._titleEl;
  }

  setTitle(title) {
    if (this._titleEl) {
      this._titleEl.textContent = title;
    }
  }
}

if (!customElements.get("meme-card-footer")) {
  customElements.define("meme-card-footer", MemeCardFooter);
}
