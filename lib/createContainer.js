// TODO: update layout such that image is on the top of the container as the first thing

function titleFromFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .split(/[._-]+/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatUploadDate(metadata) {
  const rawDate = metadata.uploadedAt ?? metadata.uploaded_date ?? metadata.createdAt ?? metadata.date;
  if (!rawDate) return "Unknown date";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return String(rawDate);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getModalElements() {
  let modal = document.querySelector("[data-meme-modal]");
  if (modal) {
    return {
      modal,
      image: modal.querySelector("img"),
      caption: modal.querySelector("[data-meme-modal-caption]")
    };
  }

  modal = document.createElement("div");
  modal.setAttribute("data-meme-modal", "true");
  Object.assign(modal.style, {
    position: "fixed",
    inset: "0",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "rgba(0, 0, 0, 0.82)",
    zIndex: "9999"
  });

  const frame = document.createElement("div");
  Object.assign(frame.style, {
    position: "relative",
    maxWidth: "min(96vw, 1200px)",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  });

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "Close";
  Object.assign(closeButton.style, {
    alignSelf: "flex-end",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    padding: "8px 14px",
    cursor: "pointer"
  });

  const image = document.createElement("img");
  Object.assign(image.style, {
    maxWidth: "100%",
    maxHeight: "calc(92vh - 56px)",
    borderRadius: "16px",
    objectFit: "contain",
    background: "#111"
  });

  const caption = document.createElement("div");
  caption.setAttribute("data-meme-modal-caption", "true");
  Object.assign(caption.style, {
    color: "rgba(255, 255, 255, 0.86)",
    fontSize: "14px",
    textAlign: "center"
  });

  const closeModal = () => {
    modal.style.display = "none";
    image.removeAttribute("src");
    caption.textContent = "";
  };

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.style.display !== "none") {
      closeModal();
    }
  });

  frame.appendChild(closeButton);
  frame.appendChild(image);
  frame.appendChild(caption);
  modal.appendChild(frame);
  document.body.appendChild(modal);

  return { modal, image, caption };
}

export function createContainer(file, options) {
  const {
    searchInput,
    applyFilter,
    viewState,
    autoVoteMs,
    voteForMeme,
    autoVoteObserver,
    mediaObserver
  } = options;
  const metadata = typeof file === "string" ? { filename: file, checksum: file } : file;
  const filename = metadata.filename;
  const tags = filename.replace(/\.[^.]+$/, "").split(/[._-]+/).map(tag => tag.trim()).filter(Boolean);
  const title = metadata.title ?? titleFromFilename(filename);
  const author = metadata.author ?? metadata.uploader ?? metadata.uploadedBy ?? "Unknown author";
  const uploadedDate = formatUploadDate(metadata);
  const commentsCount = metadata.commentsCount ?? metadata.commentCount ?? metadata.comments?.length ?? tags.length;
  const detailsText = metadata.description ?? `File: ${filename}`;

  const container = document.createElement("article");
  container.className = "meme";
  Object.assign(container.style, {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minHeight: "460px",
    height: "460px",
    overflow: "hidden",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "linear-gradient(180deg, rgba(35, 35, 35, 0.98), rgba(18, 18, 18, 0.98))",
    boxShadow: "0 18px 44px rgba(0, 0, 0, 0.28)"
  });


  const header = document.createElement("div");
  Object.assign(header.style, {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "16px 16px 12px"
  });

  const titleEl = document.createElement("div");
  titleEl.textContent = title;
  Object.assign(titleEl.style, {
    color: "#fff",
    fontSize: "17px",
    fontWeight: "700",
    lineHeight: "1.3",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  });

  const metaRow = document.createElement("div");
  Object.assign(metaRow.style, {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)"
  });

  const authorEl = document.createElement("span");
  authorEl.textContent = author;
  Object.assign(authorEl.style, {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  });

  const dateEl = document.createElement("span");
  dateEl.textContent = uploadedDate;

  metaRow.appendChild(authorEl);
  metaRow.appendChild(dateEl);

  const placeholder = document.createElement("div");
  placeholder.className = "media-shell media-placeholder";
  Object.assign(placeholder.style, {
    position: "relative",
    flex: "1",
    minHeight: "0",
    margin: "0 16px 16px",
    borderRadius: "18px",
    overflow: "hidden",
    background: "#1a1a1a"
  });
  container.appendChild(placeholder);
  container.appendChild(header);

  const hoverInfo = document.createElement("div");
  Object.assign(hoverInfo.style, {
    position: "absolute",
    left: "28px",
    right: "28px",
    bottom: "88px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(0, 0, 0, 0.72)",
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: "12px",
    lineHeight: "1.45",
    opacity: "0",
    transform: "translateY(8px)",
    transition: "opacity 160ms ease, transform 160ms ease",
    pointerEvents: "none",
    zIndex: "2"
  });
  hoverInfo.textContent = detailsText;
  container.appendChild(hoverInfo);

  const footer = document.createElement("div");
  footer.className = "meme-footer";
  Object.assign(footer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "0 16px 16px"
  });

  footer.appendChild(titleEl);
  footer.appendChild(metaRow);

  const tagsRow = document.createElement("div");
  Object.assign(tagsRow.style, {
    display: "flex",
    flexWrap: "nowrap",
    gap: "8px",
    overflowX: "auto",
    scrollbarWidth: "none"
  });

  for (const tag of tags) {
    const tagButton = document.createElement("button");
    tagButton.type = "button";
    tagButton.textContent = tag;
    Object.assign(tagButton.style, {
      border: "1px solid rgba(255, 255, 255, 0.16)",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.06)",
      color: "white",
      padding: "5px 10px",
      cursor: "pointer",
      fontSize: "12px",
      lineHeight: "1.2",
      flex: "0 0 auto"
    });
    tagButton.addEventListener("click", function() {
      const currentTags = searchInput.value.trim().split(/\s+/).filter(Boolean);
      if (!currentTags.includes(tag)) currentTags.push(tag);
      searchInput.value = currentTags.join(" ");
      applyFilter(currentTags.join(" "));
    });
    tagsRow.appendChild(tagButton);
  }

  const controlsRow = document.createElement("div");
  Object.assign(controlsRow.style, {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "12px"
  });

  const voteWrap = document.createElement("div");
  Object.assign(voteWrap.style, {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px"
  });

  const voteButtonStyle = {
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.06)",
    color: "white",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: "1",
    transition: "opacity 160ms ease, transform 160ms ease, background 160ms ease"
  };

  const downvoteButton = document.createElement("button");
  downvoteButton.type = "button";
  downvoteButton.textContent = "👎";
  downvoteButton.setAttribute("aria-label", `Downvote ${filename}`);
  Object.assign(downvoteButton.style, voteButtonStyle);

  const upvoteButton = document.createElement("button");
  upvoteButton.type = "button";
  upvoteButton.textContent = "👍";
  upvoteButton.setAttribute("aria-label", `Upvote ${filename}`);
  Object.assign(upvoteButton.style, voteButtonStyle);

  downvoteButton.addEventListener("click", () => {
    const state = viewState.get(container);
    if (state) voteForMeme(state, -1);
  });

  upvoteButton.addEventListener("click", () => {
    const state = viewState.get(container);
    if (state) voteForMeme(state, 1);
  });

  const infoWrap = document.createElement("div");
  Object.assign(infoWrap.style, {
    position: "relative",
    display: "flex",
    justifyContent: "flex-end"
  });

  const infoPanel = document.createElement("div");
  Object.assign(infoPanel.style, {
    position: "absolute",
    right: "0",
    bottom: "48px",
    width: "240px",
    padding: "12px",
    borderRadius: "14px",
    background: "rgba(18, 18, 18, 0.96)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: "12px",
    lineHeight: "1.45",
    opacity: "0",
    transform: "translateY(6px)",
    pointerEvents: "none",
    transition: "opacity 160ms ease, transform 160ms ease"
  });
  infoPanel.textContent = `${detailsText} • ${commentsCount} comments`;

  const commentsButton = document.createElement("button");
  commentsButton.type = "button";
  commentsButton.textContent = `💬 ${commentsCount}`;
  commentsButton.setAttribute("aria-expanded", "false");
  Object.assign(commentsButton.style, {
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.06)",
    color: "white",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "13px",
    lineHeight: "1"
  });

  const setInfoOpen = open => {
    commentsButton.setAttribute("aria-expanded", String(open));
    infoPanel.style.opacity = open ? "1" : "0";
    infoPanel.style.transform = open ? "translateY(0)" : "translateY(6px)";
    infoPanel.style.pointerEvents = open ? "auto" : "none";
  };

  commentsButton.addEventListener("click", event => {
    event.stopPropagation();
    setInfoOpen(commentsButton.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("click", event => {
    if (!container.contains(event.target)) {
      setInfoOpen(false);
    }
  });

  container.addEventListener("mouseenter", () => {
    hoverInfo.style.opacity = "1";
    hoverInfo.style.transform = "translateY(0)";
  });

  container.addEventListener("mouseleave", () => {
    hoverInfo.style.opacity = "0";
    hoverInfo.style.transform = "translateY(8px)";
  });

  container.addEventListener("click", event => {
    if (event.target.closest("button")) return;
    const image = container.querySelector(".media-shell img");
    if (!image?.src) return;
    const { modal, image: modalImage, caption } = getModalElements();
    modalImage.src = image.src;
    caption.textContent = title;
    modal.style.display = "flex";
  });

  voteWrap.appendChild(downvoteButton);
  voteWrap.appendChild(upvoteButton);
  infoWrap.appendChild(infoPanel);
  infoWrap.appendChild(commentsButton);
  controlsRow.appendChild(voteWrap);
  controlsRow.appendChild(infoWrap);
  footer.appendChild(tagsRow);
  footer.appendChild(controlsRow);
  container.appendChild(footer);

  const state = {
    ...metadata,
    container,
    file: filename,
    upvoteButton,
    downvoteButton,
    voteWrap,
    remainingMs: autoVoteMs,
    visibleSince: null,
    timerId: null,
    voted: false,
    loaded: false
  };

  viewState.set(container, state);

  // TODO: we can re-enable auto-voting, consider it more
  // autoVoteObserver.observe(container);
  mediaObserver.observe(container);

  return container;
}
