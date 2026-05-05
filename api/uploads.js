import { MEME_CONFIG } from "../lib/config.js";
import { apiRequest} from "./api.js";

const DEFAULT_UPLOADS_ENDPOINT = MEME_CONFIG.uploadsEndpoint;
const DEFAULT_API_ENDPOINT = MEME_CONFIG.apiUrl;
const DEFAULT_FILES_BASE_URL = MEME_CONFIG.filesBaseUrl;

const ignoredFiles = [
  ".DS_Store",
  ".git",
  ".gitignore",
  ".gitattributes",
  ".gitmodules",
  ".gitkeep",
  ".npmignore",
  ".npmrc",
  ".yarnignore",
  ".yarnrc",
  ".editorconfig",
  ".eslint"
];

const ignoredDirs = [".git", "node_modules"];

function noop() {}

function normalizeFilePath(file) {
  let filePath = file.filePath || file.webkitRelativePath || file.name || "";

  if (filePath.startsWith("/")) {
    filePath = filePath.substring(1);
  }

  return filePath;
}

function shouldIgnoreFile(filePath) {
  const parts = filePath.split("/").filter(Boolean);
  const fileName = parts[parts.length - 1];

  if (ignoredFiles.includes(fileName)) {
    return true;
  }

  return parts.some((part) => ignoredDirs.includes(part));
}

export default class Uploads {
  constructor({
    uploadsEndpoint = DEFAULT_UPLOADS_ENDPOINT,
    filesBaseUrl = DEFAULT_FILES_BASE_URL,
    qtokenid = "",
    me = ""
  } = {}) {
    this.uploadsEndpoint = uploadsEndpoint;
    this.filesBaseUrl = filesBaseUrl;
    this.qtokenid = qtokenid;
    this.me = me;
  }

  setAuth({ qtokenid = this.qtokenid, me = this.me } = {}) {
    this.qtokenid = qtokenid;
    this.me = me;
    return this;
  }

  async uploadFile(file, onProgress = noop) {
    const filePath = normalizeFilePath(file);

    if (!filePath || shouldIgnoreFile(filePath)) {
      return null;
    }

    const fileSize = file.size;
    const signedUrlParams = new URLSearchParams({
      v: "6",
      fileName: filePath,
      fileSize: String(fileSize),
      userFolder: this.me,
      qtokenid: this.qtokenid,
      me: this.me
    });
    console.log('signedUrlParams', signedUrlParams.toString());
    const signedUrlResponse = await fetch(
      `${this.uploadsEndpoint}/generate-signed-url?${signedUrlParams.toString()}`
    );

    if (!signedUrlResponse.ok) {
      throw new Error(`Failed to get signed URL: ${await signedUrlResponse.text()}`);
    }

    const { signedUrl, remoteFilePath } = await signedUrlResponse.json();
    console.log(`PUTTING Received signed URL for ${filePath}: ${signedUrl}`);
    console.log('remoteFilePath', remoteFilePath);
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream"
      },
      body: file
    });

    if (!uploadResponse.ok) {
      throw new Error(`HTTP error during file upload: ${await uploadResponse.text()}`);
    }

    await onProgress({ file, filePath, uploaded: fileSize, total: fileSize });
    console.log(`File uploaded successfully: ${filePath}`);
    // return `${this.filesBaseUrl}/${remoteFilePath}`;
    return remoteFilePath;
  }

  async uploadFiles(files, onProgress = noop) {
    if (!files?.length) {
      return [];
    }

    const uploadedFiles = [];

    for (const file of files) {
      const fileUrl = await this.uploadFile(file, onProgress);

      if (fileUrl) {
        uploadedFiles.push(fileUrl);
      }
    }

    return uploadedFiles;
  }

  async removeFile(fileName) {
    const deleteParams = new URLSearchParams({
      v: "6",
      filename: fileName,
      me: this.me,
      qtokenid: this.qtokenid,
      userFolder: this.me,
      depth: "6"
    });
    const url = `${DEFAULT_API_ENDPOINT}/remove?${deleteParams.toString()}`;

    console.log("fetching delete url", url);

    try {
      await apiRequest(url, "removeFile");

      return fileName;
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  }
}
