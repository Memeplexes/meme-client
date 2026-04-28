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
    flex: "1",
    minHeight: "0",
    margin: "0 16px 16px",
    borderRadius: "18px",
    overflow: "hidden",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  let el;

  if (file.endsWith(".mp4") || file.endsWith(".webm") || file.endsWith(".mov")) {
    el = document.createElement("video");
    el.src = baseUrl + file;
    el.autoplay = true;
    el.loop = true;
    el.muted = true;
    el.playsInline = true;
    el.controls = true;
    el.preload = "metadata";
    Object.assign(el.style, {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      background: "#111"
    });
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

  const footer = container.querySelector(".meme-footer");
  if (footer) {
    container.insertBefore(wrapper, footer);
  } else {
    container.appendChild(wrapper);
  }

  state.loaded = true;
}
