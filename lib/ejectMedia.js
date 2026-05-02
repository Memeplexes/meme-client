export function ejectMedia(container, state) {
  const mediaFrame = container.querySelector(".media-frame");
  if (!mediaFrame) return;

  const wrapper = mediaFrame.querySelector(".media-shell");
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
    width: "100%",
    minHeight: "100%",
    height: currentHeight > 0 ? `${currentHeight}px` : "200px",
    background: "#1a1a1a"
  });

  mediaFrame.prepend(placeholder);
}
