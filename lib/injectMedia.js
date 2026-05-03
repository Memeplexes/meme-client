const IMAGE_EXTENSIONS = new Set([
  ".apng", ".avif", ".bmp", ".gif", ".heic", ".heif", ".ico", ".jfif",
  ".jpeg", ".jpg", ".pjp", ".pjpeg", ".png", ".svg", ".tif", ".tiff", ".webp"
]);

const VIDEO_EXTENSIONS = new Set([
  ".3g2", ".3gp", ".avi", ".m2ts", ".m4v", ".mkv", ".mov", ".mp4", ".mpeg",
  ".mpg", ".mts", ".ogg", ".ogv", ".ts", ".webm", ".wmv"
]);

const VIDEO_MIME_TYPES = {
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".mkv": "video/x-matroska",
  ".ogg": "video/ogg",
  ".ogv": "video/ogg",
  ".webm": "video/webm"
};

function getMediaExtension(state = {}) {
  const explicitExtension = String(state.extension ?? "").trim().toLowerCase();
  if (explicitExtension) return explicitExtension;

  const normalizedFile = String(state.file ?? "").trim().toLowerCase().split("#")[0].split("?")[0];
  const extensionIndex = normalizedFile.lastIndexOf(".");
  return extensionIndex >= 0 ? normalizedFile.slice(extensionIndex) : "";
}

export function injectMedia(container, state, baseUrl) {
  const file = state.file;
  const extension = getMediaExtension(state);
  const mediaFrame = container.querySelector(".media-frame");
  if (!mediaFrame) return;

  let wrapper = mediaFrame.querySelector(".media-shell");

  if (wrapper && wrapper.classList.contains("media-placeholder")) {
    wrapper.remove();
    wrapper = null;
  }

  if (wrapper) return;

  wrapper = document.createElement("div");
  wrapper.className = "media-shell";
  Object.assign(wrapper.style, {
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: "320px",
    overflow: "hidden",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  let el;

  if (VIDEO_EXTENSIONS.has(extension)) {
    el = document.createElement("video");
    const videoUrl = baseUrl + file;

    el.src = videoUrl;
    el.autoplay = true;
    el.loop = true;
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.controls = true;
    el.preload = "metadata";
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    if (VIDEO_MIME_TYPES[extension]) {
      el.setAttribute("type", VIDEO_MIME_TYPES[extension]);
    }
    Object.assign(el.style, {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      background: "#111",
      alignSelf: "flex-start"
    });

    const attemptPlayback = () => {
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          el.controls = true;
        });
      }
    };

    el.addEventListener("loadedmetadata", attemptPlayback, { once: true });
    el.addEventListener("canplay", attemptPlayback, { once: true });
  } else if (IMAGE_EXTENSIONS.has(extension) || !extension) {
    const imageShell = document.createElement("div");
    imageShell.className = "image-shell";
    Object.assign(imageShell.style, {
      width: "100%",
      height: "100%"
    });

    el = document.createElement("img");
    el.src = baseUrl + file;
    Object.assign(el.style, {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      cursor: "zoom-in",
      display: "block"
    });

    const markLoaded = () => imageShell.classList.add("is-loaded");
    const markError = () => imageShell.classList.add("is-error");

    if (el.complete && el.naturalWidth > 0) {
      markLoaded();
    } else {
      el.addEventListener("load", markLoaded, { once: true });
      el.addEventListener("error", markError, { once: true });
    }
    imageShell.appendChild(el);
    wrapper.appendChild(imageShell);
  } else {
    el = document.createElement("img");
    el.src = baseUrl + file;
    Object.assign(el.style, {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      display: "block"
    });
  }

  if (!el.parentNode) wrapper.appendChild(el);

  if (el.tagName === "VIDEO") {
    requestAnimationFrame(() => {
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          el.controls = true;
        });
      }
    });
  }

  mediaFrame.prepend(wrapper);

  state.loaded = true;
}
