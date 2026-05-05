import { updateMeme } from "../api/api.js";
import Uploads from "../api/uploads.js";

class MemeEditPanel extends HTMLElement {
  constructor() {
    super();
    this._meme = null;
    this._onSave = null;
    this._boundEsc = event => {
      if (event.key === "Escape" && this.hasAttribute("open")) {
        this.close();
      }
    };
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.render();
    document.addEventListener("keydown", this._boundEsc);
    this.addEventListener("click", event => {
      if (event.target === this) this.close();
    });
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._boundEsc);
  }

  setup({ meme, onSave } = {}) {
    this._meme = meme ?? null;
    this._onSave = typeof onSave === "function" ? onSave : null;
    if (this.dataset.initialized === "true") {
      this.render();
    }
    return this;
  }

  open() {
    this.setAttribute("open", "true");
    this.style.display = "flex";
    this.querySelector("[name='title']")?.focus();
  }

  close() {
    this.removeAttribute("open");
    this.style.display = "none";
    const status = this.querySelector("[data-status]");
    if (status) status.textContent = "";
  }

  render() {
    const meme = this._meme ?? {};
    const title = meme.title ?? "";
    const description = meme.description ?? "";
    const tags = Array.isArray(meme.tags) ? meme.tags.join(", ") : "";

    Object.assign(this.style, {
      position: "fixed",
      inset: "0",
      display: this.hasAttribute("open") ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "rgba(0, 0, 0, 0.7)",
      zIndex: "10000"
    });

    this.innerHTML = `
      <form data-form style="width:min(100%, 560px); display:flex; flex-direction:column; gap:14px; padding:20px; border:1px solid rgba(255,255,255,0.12); border-radius:20px; background:#171717; box-shadow:0 18px 44px rgba(0,0,0,0.38); color:white;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <strong style="font-size:18px;">Edit meme</strong>
          <button type="button" data-close style="border:1px solid rgba(255,255,255,0.18); border-radius:999px; background:rgba(255,255,255,0.06); color:white; padding:8px 12px; cursor:pointer;">Close</button>
        </div>
        <label style="display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:13px; color:rgba(255,255,255,0.76);">Title</span>
          <input name="title" value="${this.#escapeHtml(title)}" style="border:1px solid rgba(255,255,255,0.14); border-radius:12px; background:rgba(255,255,255,0.05); color:white; padding:10px 12px;" />
        </label>
        <label style="display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:13px; color:rgba(255,255,255,0.76);">Description</span>
          <textarea name="description" rows="4" style="border:1px solid rgba(255,255,255,0.14); border-radius:12px; background:rgba(255,255,255,0.05); color:white; padding:10px 12px; resize:vertical;">${this.#escapeHtml(description)}</textarea>
        </label>
        <label style="display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:13px; color:rgba(255,255,255,0.76);">Tags</span>
          <input name="tags" value="${this.#escapeHtml(tags)}" placeholder="tag-one, tag-two" style="border:1px solid rgba(255,255,255,0.14); border-radius:12px; background:rgba(255,255,255,0.05); color:white; padding:10px 12px;" />
        </label>
        <section style="display:flex; flex-direction:column; gap:10px; padding:14px; border:1px solid rgba(255,92,92,0.28); border-radius:16px; background:rgba(255,92,92,0.08);">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <strong style="font-size:14px; color:#ff8e8e;">Danger Zone</strong>
            <span style="font-size:13px; color:rgba(255,255,255,0.72);">Delete this meme permanently. Removing the file also removes the database record.</span>
          </div>
          <div>
            <button type="button" data-delete style="border:1px solid rgba(255,92,92,0.45); border-radius:999px; background:rgba(255,92,92,0.14); color:#ffd4d4; padding:10px 14px; cursor:pointer; font-weight:700;">Delete Meme</button>
          </div>
        </section>
        <div data-status style="min-height:18px; font-size:13px; color:rgba(255,255,255,0.72);"></div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" data-cancel style="border:1px solid rgba(255,255,255,0.18); border-radius:999px; background:rgba(255,255,255,0.06); color:white; padding:10px 14px; cursor:pointer;">Cancel</button>
          <button type="submit" data-submit style="border:1px solid rgba(255,255,255,0.18); border-radius:999px; background:white; color:black; padding:10px 14px; cursor:pointer; font-weight:700;">Save</button>
        </div>
      </form>
    `;

    this.querySelector("[data-close]")?.addEventListener("click", () => this.close());
    this.querySelector("[data-cancel]")?.addEventListener("click", () => this.close());
    this.querySelector("[data-form]")?.addEventListener("submit", event => this.#handleSubmit(event));
    this.querySelector("[data-delete]")?.addEventListener("click", () => this.#handleDelete());
  }

  async #handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector("[data-submit]");
    const status = form.querySelector("[data-status]");
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const tags = String(formData.get("tags") ?? "")
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean);

    submit.disabled = true;
    status.textContent = "Saving...";

    try {
      const updatedMeme = await updateMeme({
        checksum: this._meme?.checksum,
        filename: this._meme?.filename,
        title,
        description,
        tags
      });

      this._meme = {
        ...this._meme,
        ...updatedMeme,
        title,
        description,
        tags
      };

      this._onSave?.(this._meme);
      this.close();
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Unable to save changes.";
    } finally {
      submit.disabled = false;
    }
  }

  async #handleDelete() {
    const filename = String(this._meme?.filename ?? "").trim();
    const username = localStorage.getItem("memeplexes-username") || "";
    const qtokenid = localStorage.getItem("access_token") || "";
    const status = this.querySelector("[data-status]");
    const submit = this.querySelector("[data-submit]");
    const deleteButton = this.querySelector("[data-delete]");

    if (!filename) {
      if (status) status.textContent = "Unable to delete meme: missing filename.";
      return;
    }

    if (!window.confirm("Delete this meme permanently? This cannot be undone.")) {
      return;
    }

    if (submit) submit.disabled = true;
    if (deleteButton) deleteButton.disabled = true;
    if (status) status.textContent = "Deleting...";

    try {
      const uploads = new Uploads({ me: username, qtokenid });
      const deletedFile = await uploads.removeFile(filename);

      if (!deletedFile) {
        throw new Error("Unable to delete meme.");
      }

      this.dispatchEvent(new CustomEvent("meme-deleted", {
        bubbles: true,
        composed: true,
        detail: { meme: this._meme }
      }));
      this.close();
      this.closest("meme-card")?.remove();
    } catch (error) {
      if (status) {
        status.textContent = error instanceof Error ? error.message : "Unable to delete meme.";
      }
    } finally {
      if (submit) submit.disabled = false;
      if (deleteButton) deleteButton.disabled = false;
    }
  }
  #escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
}

if (!customElements.get("meme-edit-panel")) {
  customElements.define("meme-edit-panel", MemeEditPanel);
}
