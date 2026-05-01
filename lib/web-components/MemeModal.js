class MemeModal extends HTMLElement {
  constructor() {
    super();
    this._image = null;
    this._caption = null;
    this._onKeyDown = event => {
      if (event.key === "Escape" && this.style.display !== "none") {
        this.close();
      }
    };
  }

  connectedCallback() {
    if (!this._image || !this._caption) {
      this.#render();
    }

    if (!this.isConnected) return;
    document.addEventListener("keydown", this._onKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKeyDown);
  }

  open({ src, caption = "" } = {}) {
    if (!this._image || !this._caption) {
      this.#render();
    }

    if (src) {
      this._image.src = src;
    } else {
      this._image.removeAttribute("src");
    }

    this._caption.textContent = caption;
    this.style.display = "flex";
  }

  close() {
    this.style.display = "none";
    this._image?.removeAttribute("src");
    if (this._caption) {
      this._caption.textContent = "";
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
    Object.assign(closeButton.style, {
      alignSelf: "flex-end",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.1)",
      color: "#fff",
      padding: "8px 14px",
      cursor: "pointer"
    });

    this._image = document.createElement("img");
    Object.assign(this._image.style, {
      maxWidth: "100%",
      maxHeight: "calc(92vh - 56px)",
      borderRadius: "16px",
      objectFit: "contain",
      background: "#111"
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

    frame.appendChild(closeButton);
    frame.appendChild(this._image);
    frame.appendChild(this._caption);
    this.appendChild(frame);
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
