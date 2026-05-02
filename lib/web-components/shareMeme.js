import { MEME_CONFIG } from "../config.js";

function resolveMemeSrc(meme = {}) {
  const directSrc = meme.src ?? meme.url ?? meme.assetUrl ?? meme.asset_url ?? meme.mediaUrl ?? meme.media_url;
  if (directSrc) return String(directSrc);
  if (!meme.filename) return "";
  return `${MEME_CONFIG.filesBaseUrl}/${String(meme.filename).replace(/^\/+/, "")}`;
}

export async function shareMeme(meme = {}, { title = "Meme", text = "", url } = {}) {
  const src = resolveMemeSrc(meme);
  if (!src || typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return;
  }

  try {
    await navigator.share({
      title,
      text,
      url: url ?? window.location.href
    });
  } catch (error) {
    if (error?.name !== "AbortError") {
      window.open(src, "_blank", "noopener,noreferrer");
    }
  }
}
