export function injectMedia(container, state, baseUrl) {
  const file = state.file;
  let wrapper = container.querySelector(".media-shell");

  if (wrapper && wrapper.classList.contains("media-placeholder")) {
    wrapper.remove();
    wrapper = null;
  }

  if (wrapper) return;

  wrapper = document.createElement("div");
  wrapper.className = "media-shell";
  Object.assign(wrapper.style, {
    position: "relative",
    // flex: "1",
    minHeight: "320px",
    borderRadius: "18px 18px 0 0",
    overflow: "hidden",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  let el;

  if (file.endsWith(".mp4") || file.endsWith(".webm") || file.endsWith(".mov")) {
    el = document.createElement("video");
    const videoUrl = baseUrl + file;
    const extension = file.split(".").pop()?.toLowerCase();

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
    if (extension === "mp4") el.setAttribute("type", "video/mp4");
    if (extension === "webm") el.setAttribute("type", "video/webm");
    if (extension === "mov") el.setAttribute("type", "video/quicktime");
    Object.assign(el.style, {
      maxWidth: "100%",
      maxHeight: "100%",
      width: "auto",
      height: "auto",
      background: "#111"
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
  } else {
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

  const footer = container.querySelector(".meme-footer");
  if (footer) {
    container.insertBefore(wrapper, footer);
  } else {
    container.appendChild(wrapper);
  }

  state.loaded = true;
}
