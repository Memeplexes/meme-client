class UploadButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.shadowRoot.children.length > 0) {
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
        }

        .upload-button {
          border: 1px solid rgba(30, 171, 85, 0.35);
          background: linear-gradient(180deg, rgba(30, 171, 85, 0.22), rgba(18, 18, 18, 0.96));
          color: #dffbe8;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 999px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
          transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
        }

        .upload-button:hover {
          border-color: rgba(30, 171, 85, 0.6);
          background: linear-gradient(180deg, rgba(30, 171, 85, 0.32), rgba(18, 18, 18, 0.98));
        }

        .upload-button:active {
          transform: translateY(1px);
        }

        @media (max-width: 767px) {
          .upload-button {
            padding: 10px 14px;
          }
        }
      </style>
      <button class="upload-button" id="upload-button" type="button">Upload</button>
      <input id="upload-input" type="file" accept="image/*" hidden />
    `;

    const uploadButton = this.shadowRoot.querySelector("#upload-button");
    const uploadInput = this.shadowRoot.querySelector("#upload-input");

    if (!uploadButton || !uploadInput) {
      return;
    }

    uploadButton.addEventListener("click", () => {
      const currentUsername = localStorage.getItem("memeplexes-username");
      if (!currentUsername) {
        window.location.href = this.authUrl;
        return;
      }

      uploadInput.click();
    });

    uploadInput.addEventListener("change", async () => {
      const [file] = uploadInput.files || [];
      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append("meme", file);

      try {
        console.info("Stub meme upload started", { fileName: file.name, size: file.size });
        await Promise.resolve(formData);
        console.info("Stub meme upload finished", { fileName: file.name });
      } finally {
        uploadInput.value = "";
      }
    });
  }

  get authUrl() {
    return this.getAttribute("auth-url") || "/api/meme/login";
  }
}

if (!customElements.get("upload-button")) {
  customElements.define("upload-button", UploadButton);
}
