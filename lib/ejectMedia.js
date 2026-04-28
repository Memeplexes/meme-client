export function ejectMedia(container, state) {
  const wrapper = container.querySelector(".media-shell");
  if (!wrapper || wrapper.classList.contains("media-placeholder")) return;

  const video = wrapper.querySelector("video");
  if (video) {
    video.pause();
    video.src = "";
    video.load();
  } else {
    const img = wrapper.querySelector("img");
    if (img) img.src = "";
  }

  const currentHeight = wrapper.offsetHeight;

  wrapper.remove();
  state.loaded = false;

  const placeholder = document.createElement("div");
  placeholder.className = "media-shell media-placeholder";
  Object.assign(placeholder.style, {
    position: "relative",
    flex: "1",
    minHeight: "0",
    margin: "0 16px 16px",
    height: currentHeight > 0 ? `${currentHeight}px` : "200px",
    borderRadius: "18px",
    overflow: "hidden",
    background: "#1a1a1a"
  });

  const footer = container.querySelector(".meme-footer");
  if (footer) {
    container.insertBefore(placeholder, footer);
  } else {
    container.appendChild(placeholder);
  }
}
