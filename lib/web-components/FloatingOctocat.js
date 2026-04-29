class FloatingOctocat extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";
    this.classList.add("is-interactive");
    this.setAttribute("role", "link");
    this.setAttribute("tabindex", "0");
    this.setAttribute("aria-label", this.getAttribute("aria-label") || "Open meme-client on GitHub");

    if (!this.querySelector("img")) {
      const image = document.createElement("img");
      image.src = this.getAttribute("src") || "./assets/liberty-octocat-github-256.png";
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      this.appendChild(image);
    }

    this.addEventListener("mouseenter", this.#handleMouseEnter);
    this.addEventListener("mouseleave", this.#handleMouseLeave);
    this.addEventListener("click", this.#handleActivate);
    this.addEventListener("keydown", this.#handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener("mouseenter", this.#handleMouseEnter);
    this.removeEventListener("mouseleave", this.#handleMouseLeave);
    this.removeEventListener("click", this.#handleActivate);
    this.removeEventListener("keydown", this.#handleKeyDown);
  }

  #handleMouseEnter = () => {
    this.classList.add("is-hovered");
  };

  #handleMouseLeave = () => {
    this.classList.remove("is-hovered");
  };

  #handleActivate = () => {
    const href = this.getAttribute("href");
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  #handleKeyDown = event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.#handleActivate();
    }
  };
}

customElements.define("floating-octocat", FloatingOctocat);
