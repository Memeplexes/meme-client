import Uploads from "../../api/uploads.js";
import { updateMeme } from "../../api/api.js";

class UploadPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.selectedFiles = [];
    this.isUploading = false;
    this.progressValue = 0;
    this.statusText = "";
    this.isDragActive = false;

    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleEscape = this.handleEscape.bind(this);
    this.handleFilePickerClick = this.handleFilePickerClick.bind(this);
    this.handleFolderPickerClick = this.handleFolderPickerClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFolderInputChange = this.handleFolderInputChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  connectedCallback() {
    if (!this.hasAttribute("hidden")) {
      this.hidden = true;
    }

    if (this.shadowRoot.children.length === 0) {
      this.render();
    }
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.handleEscape);
  }

  open() {
    this.hidden = false;
    this.render();
    document.addEventListener("keydown", this.handleEscape);
  }

  close() {
    if (this.isUploading) {
      return;
    }

    this.hidden = true;
    this.isDragActive = false;
    document.removeEventListener("keydown", this.handleEscape);
    this.render();
  }

  render() {
    const dragClass = this.isDragActive ? "dropzone active" : "dropzone";
    const hasSelectedFiles = this.selectedFiles.length > 0;
    const fileName = hasSelectedFiles
      ? this.selectedFiles.length === 1
        ? this.selectedFiles[0].name
        : `${this.selectedFiles.length} files selected`
      : "Drop an image here or browse from your device.";
    const totalSizeInKb = this.selectedFiles.reduce((sum, file) => sum + Math.round(file.size / 1024), 0);
    const fileMeta = hasSelectedFiles
      ? `${totalSizeInKb} KB`
      : "PNG, JPG, GIF, WEBP";
    const progressLabel = this.isUploading ? `Uploading ${this.progressValue}%` : this.statusText || "Ready to upload";
    const buttonLabel = this.isUploading ? "Uploading..." : "Upload meme";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          inset: 0;
          z-index: 3000;
        }

        [hidden] {
          display: none !important;
        }

        .backdrop {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(7, 10, 8, 0.76);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .panel {
          width: min(100%, 520px);
          display: grid;
          gap: 18px;
          padding: 22px;
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(24, 27, 24, 0.98), rgba(12, 13, 12, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
          color: white;
        }

        .header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 16px;
        }

        .title {
          margin: 0;
          font-size: 22px;
          line-height: 1.1;
        }

        .subtitle {
          margin: 6px 0 0;
          color: rgba(255, 255, 255, 0.66);
          font-size: 14px;
          line-height: 1.5;
        }

        .close-button,
        .picker-button,
        .folder-button,
        .upload-button {
          border: 0;
          cursor: pointer;
          font: inherit;
        }

        .close-button {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
        }

        .dropzone {
          display: grid;
          gap: 14px;
          padding: 26px;
          border-radius: 20px;
          border: 1px dashed rgba(30, 171, 85, 0.4);
          background: rgba(30, 171, 85, 0.08);
          transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
        }

        .dropzone.active {
          border-color: rgba(30, 171, 85, 0.9);
          background: rgba(30, 171, 85, 0.16);
          transform: scale(1.01);
        }

        .dropzone-copy {
          display: grid;
          gap: 6px;
        }

        .dropzone-title {
          font-size: 16px;
          font-weight: 700;
        }

        .dropzone-meta {
          color: rgba(255, 255, 255, 0.66);
          font-size: 13px;
        }

        .picker-button,
        .folder-button,
        .upload-button {
          min-height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          font-weight: 700;
        }

        .picker-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .picker-button,
        .folder-button {
          justify-self: start;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .progress {
          display: grid;
          gap: 8px;
        }

        .progress-track {
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
        }

        .progress-bar {
          height: 10px;
          width: ${this.progressValue}%;
          background: linear-gradient(90deg, #1eab55, #75e59e);
          transition: width 160ms ease;
        }

        .progress-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
        }

        .actions {
          display: flex;
          justify-content: flex-end;
        }

        .upload-button {
          background: linear-gradient(180deg, rgba(30, 171, 85, 0.95), rgba(18, 120, 56, 1));
          color: #041109;
        }

        .upload-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 767px) {
          .panel {
            padding: 18px;
            border-radius: 20px;
          }

          .dropzone {
            padding: 20px;
          }

          .actions {
            justify-content: stretch;
          }

          .upload-button {
            width: 100%;
          }
        }
      </style>
      <div class="backdrop" ${this.hidden ? "hidden" : ""}>
        <section class="panel" role="dialog" aria-modal="true" aria-labelledby="upload-panel-title">
          <div class="header">
            <div>
              <h2 class="title" id="upload-panel-title">Upload a meme</h2>
              <p class="subtitle">Drag and drop an image, choose a file, or upload a folder.</p>
            </div>
            <button class="close-button" id="close-button" type="button" aria-label="Close upload panel">✕</button>
          </div>
          <div class="${dragClass}" id="dropzone">
            <div class="dropzone-copy">
              <div class="dropzone-title">${fileName}</div>
              <div class="dropzone-meta">${fileMeta}</div>
            </div>
            <div class="picker-actions">
              <button class="picker-button" id="picker-button" type="button">Choose file</button>
              <button class="folder-button" id="folder-button" type="button">Upload folder</button>
            </div>
            <input id="file-input" type="file" accept="image/*" hidden />
            <input id="folder-input" type="file" accept="image/*" webkitdirectory directory multiple hidden />
          </div>
          <div class="progress">
            <div class="progress-track" aria-hidden="true">
              <div class="progress-bar"></div>
            </div>
            <div class="progress-label" aria-live="polite">${progressLabel}</div>
          </div>
          <div class="actions">
            <button class="upload-button" id="upload-button" type="button" ${hasSelectedFiles ? "" : "disabled"}>
              ${buttonLabel}
            </button>
          </div>
        </section>
      </div>
    `;

    this.shadowRoot.querySelector(".backdrop")?.addEventListener("click", this.handleBackdropClick);
    this.shadowRoot.querySelector("#close-button")?.addEventListener("click", () => this.close());
    this.shadowRoot.querySelector("#picker-button")?.addEventListener("click", this.handleFilePickerClick);
    this.shadowRoot.querySelector("#folder-button")?.addEventListener("click", this.handleFolderPickerClick);
    this.shadowRoot.querySelector("#file-input")?.addEventListener("change", this.handleInputChange);
    this.shadowRoot.querySelector("#folder-input")?.addEventListener("change", this.handleFolderInputChange);
    this.shadowRoot.querySelector("#dropzone")?.addEventListener("drop", this.handleDrop);
    this.shadowRoot.querySelector("#dropzone")?.addEventListener("dragover", this.handleDragOver);
    this.shadowRoot.querySelector("#dropzone")?.addEventListener("dragenter", this.handleDragEnter);
    this.shadowRoot.querySelector("#dropzone")?.addEventListener("dragleave", this.handleDragLeave);
    this.shadowRoot.querySelector("#upload-button")?.addEventListener("click", this.handleUpload);
  }

  handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  handleEscape(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }

  handleFilePickerClick() {
    this.shadowRoot.querySelector("#file-input")?.click();
  }

  handleFolderPickerClick() {
    this.shadowRoot.querySelector("#folder-input")?.click();
  }

  handleInputChange(event) {
    const [file] = event.target.files || [];
    this.setSelectedFiles(file ? [file] : []);
  }

  handleFolderInputChange(event) {
    this.setSelectedFiles(Array.from(event.target.files || []));
  }

  handleDragEnter(event) {
    event.preventDefault();
    this.isDragActive = true;
    this.render();
  }

  handleDragOver(event) {
    event.preventDefault();
    if (!this.isDragActive) {
      this.isDragActive = true;
      this.render();
    }
  }

  handleDragLeave(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    this.isDragActive = false;
    this.render();
  }

  handleDrop(event) {
    event.preventDefault();
    this.isDragActive = false;
    const [file] = event.dataTransfer?.files || [];
    this.setSelectedFiles(file ? [file] : []);
  }

  setSelectedFiles(files) {
    this.selectedFiles = (files || []).filter((file) => file?.type?.startsWith("image/"));
    this.progressValue = 0;
    this.statusText = this.selectedFiles.length
      ? this.selectedFiles.length === 1
        ? "File selected"
        : "Folder selected"
      : "Please choose an image file.";
    this.render();
  }

  async handleUpload() {
    if (!this.selectedFiles.length || this.isUploading) {
      return;
    }

    this.isUploading = true;
    this.progressValue = 0;
    this.statusText = "Preparing upload...";
    this.render();

    try {
      const username = localStorage.getItem("memeplexes-username") || "";
      const qtokenid = localStorage.getItem("access_token") || "";
      const uploads = new Uploads({ me: username, qtokenid });
      const files = this.selectedFiles.map((file) => file);
      let uploadedCount = 0;
      const completedFilePaths = new Set();

      const normalizePathSegment = (value) => {
        const normalizedValue = String(value || "")
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9._-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^[-._]+|[-._]+$/g, "");

        return normalizedValue || "file";
      };

      const createUrlSafeFile = (file) => {
        const sourceName = file?.name || "file";
        const lastDotIndex = sourceName.lastIndexOf(".");
        const hasExtension = lastDotIndex > 0;
        const baseName = hasExtension ? sourceName.slice(0, lastDotIndex) : sourceName;
        const extension = hasExtension ? sourceName.slice(lastDotIndex + 1) : "";
        const normalizedBaseName = normalizePathSegment(baseName);
        const normalizedExtension = normalizePathSegment(extension).replace(/-/g, "");
        const safeName = normalizedExtension
          ? `${normalizedBaseName}.${normalizedExtension}`
          : normalizedBaseName;
        const webkitRelativePath = typeof file.webkitRelativePath === "string" ? file.webkitRelativePath : "";
        const safeRelativePath = webkitRelativePath
          ? webkitRelativePath
            .split("/")
            .filter(Boolean)
            .map((segment, index, parts) => {
              if (index === parts.length - 1) {
                return safeName;
              }

              return normalizePathSegment(segment);
            })
            .join("/")
          : "";

        const safeFile = new File([file], safeName, {
          type: file.type,
          lastModified: file.lastModified,
        });
        const safeFilePath = safeRelativePath || safeName;

        Object.defineProperty(safeFile, "filePath", {
          value: safeFilePath,
          configurable: true,
        });

        if (safeRelativePath) {
          Object.defineProperty(safeFile, "webkitRelativePath", {
            value: safeRelativePath,
            configurable: true,
          });
        }

        return safeFile;
      };

      const safeFiles = files.map((file) => createUrlSafeFile(file));
      console.log("Safe files prepared for upload:", safeFiles);

      // Remark: Uploading files will result in meme-server/queue.js handling the creation/updating of DB entries for memes based on the file paths and checksums.
      // Since there is a delay in uploading and processing, we need to immediately add new entries in the DB with some placeholder metadata in order for the memes to show up in the UI as soon as possible.
      const uploadedUrls = await uploads.uploadFiles(safeFiles, async ({ file, filePath = "", total = 0, uploaded = 0 }) => {
        const completedCurrentFile = uploaded >= total && total > 0;

        if (completedCurrentFile && filePath && !completedFilePaths.has(filePath)) {
          completedFilePaths.add(filePath);
          uploadedCount = completedFilePaths.size;
        }

        const fileProgress = total > 0 ? uploaded / total : 1;
        const completedProgress = completedCurrentFile
          ? uploadedCount / safeFiles.length
          : (uploadedCount + fileProgress) / safeFiles.length;
        const combinedProgress = completedProgress * 100;

        this.progressValue = Math.max(1, Math.min(99, Math.round(combinedProgress)));
        this.statusText = "Uploading...";
        this.render();
        if (completedCurrentFile && file && filePath) {
          const title = filePath.split("/").slice(1).join("/") || filePath;
          const buffer = await file.arrayBuffer();
          const digest = await crypto.subtle.digest("SHA-256", buffer);
          const checksum = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
          console.log(`File upload completed for ${filePath} with checksum ${checksum} and title: ${title}`);
          console.log('File', file)
          await updateMeme({
            checksum,
            filename: filePath,
            title,
            description: "",
            tags: []
          });



          console.log(`File upload progress for ${filePath}: ${this.progressValue}% (${uploaded} / ${total}) with title: ${title}`);
          
        }

      });
      console.log('uploadedUrls', uploadedUrls);
      uploadedCount = uploadedUrls.length;
      console.log("Uploaded URLs:", uploadedUrls);
      if (!uploadedUrls.length) {
        throw new Error("Upload failed");
      }

      this.progressValue = 100;
      this.statusText = "Upload complete";
      this.selectedFiles = [];
      this.render();

      const [firstUploadedPath] = uploadedUrls;
      if (firstUploadedPath && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("m", firstUploadedPath);
        window.history.replaceState(window.history.state, "", url);
        // now reload the page to show the newly uploaded meme in the feed (since the feed relies on the URL param to determine which memes to show)
        window.location.reload();
      }

      window.setTimeout(() => this.close(), 300);
    } finally {
      this.isUploading = false;
      const fileInput = this.shadowRoot.querySelector("#file-input");
      const folderInput = this.shadowRoot.querySelector("#folder-input");
      if (fileInput) {
        fileInput.value = "";
      }
      if (folderInput) {
        folderInput.value = "";
      }
      this.render();
    }
  }
}

if (!customElements.get("upload-panel")) {
  customElements.define("upload-panel", UploadPanel);
}
