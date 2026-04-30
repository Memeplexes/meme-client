export function initializeMemeFeed({
  files,
  feed,
  initialQuery,
  onRequestSearch,
  castMemeVote,
  ejectMedia,
  injectMedia
}) {
  const search = document.querySelector("#search-input");
  let baseUrl = "http://localhost:8787/memes/";
  baseUrl = "https://m.marak.com/";

  const batchSize = 15;
  const AUTO_VOTE_MS = 3333;
  const LOAD_BUFFER_MARGIN = "600px";
  const MAX_DOM_ITEMS = 40;

  const normalizeFiles = inputFiles => inputFiles
    .map(file => {
      if (typeof file === "string") {
        const extensionIndex = file.lastIndexOf(".");
        return {
          filename: file,
          checksum: file,
          size: null,
          extension: extensionIndex >= 0 ? file.slice(extensionIndex) : "",
          votes: 0,
          creator: "Unknown",
          created_at: null,
          tags: []
        };
      }

      if (!file?.filename) return null;

      const extensionIndex = file.filename.lastIndexOf(".");
      return {
        filename: file.filename,
        checksum: file.checksum ?? file.filename,
        size: file.size ?? null,
        created_at: file.created_at ?? file.uploadedAt ?? file.uploaded_date ?? file.createdAt ?? file.date ?? null,
        creator: file.creator ?? "Unknown",
        tags: file.tags ?? [],
        extension: file.extension ?? (extensionIndex >= 0 ? file.filename.slice(extensionIndex) : ""),
        votes: file.votes ?? 0
      };
    })
    .filter(file => file?.filename);

  const allFiles = normalizeFiles(files);
  let filteredFiles = allFiles;
  let index = 0;
  let loading = false;
  const votedMemes = new Set();
  const viewState = new WeakMap();

  const scrollSentinelObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loading) {
      renderBatch();
    }
  }, { rootMargin: "200px", threshold: 0 });

  const mediaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const container = entry.target;
      const state = viewState.get(container);
      if (!state) return;

      if (entry.isIntersecting) {
        if (!state.loaded) {
          injectMedia(container, state, baseUrl);
        }
      } else if (state.loaded) {
        ejectMedia(container, state);
      }
    });
  }, { rootMargin: `${LOAD_BUFFER_MARGIN} 0px`, threshold: 0 });

  function stopViewTimer(state, now) {
    if (state.visibleSince === null) return;
    clearTimeout(state.timerId);
    state.timerId = null;
    state.remainingMs -= now - state.visibleSince;
    state.visibleSince = null;
  }

  function startViewTimer(state, now) {
    if (state.voted || state.visibleSince !== null) return;
    state.visibleSince = now;
    state.timerId = setTimeout(() => voteForMeme(state, true), Math.max(0, state.remainingMs));
  }

  function cleanupMemeState(container) {
    const state = viewState.get(container);
    if (!state) return;
    stopViewTimer(state, performance.now());

    autoVoteObserver.unobserve(container);
    mediaObserver.unobserve(container);

    const wrapper = container.querySelector(".media-shell");
    if (wrapper) {
      const video = wrapper.querySelector("video");
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
      wrapper.remove();
    }
    state.loaded = false;
  }
  window.cleanupMemeState = cleanupMemeState;

  const autoVoteObserver = new IntersectionObserver((entries) => {
    const now = performance.now();
    for (const entry of entries) {
      const state = viewState.get(entry.target);
      if (!state || state.voted) continue;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        startViewTimer(state, now);
      } else {
        stopViewTimer(state, now);
      }
    }
  }, { threshold: [0.6] });

  function triggerVoteAnimation(voteWrap, value) {
    if (!voteWrap) return;
    const voteDelta = document.createElement("span");
    voteDelta.textContent = value > 0 ? "+1" : "-1";
    Object.assign(voteDelta.style, {
      position: "absolute",
      left: "50%",
      bottom: "50%",
      transform: "translate(-50%, 0)",
      color: value > 0 ? "#7CFFB2" : "#FF9A9A",
      fontSize: "16px",
      fontWeight: "700",
      opacity: "1",
      pointerEvents: "none",
      transition: "transform 500ms ease, opacity 500ms ease"
    });
    voteWrap.appendChild(voteDelta);
    requestAnimationFrame(() => {
      voteDelta.style.transform = "translate(-50%, -24px)";
      voteDelta.style.opacity = "0";
    });
    voteDelta.addEventListener("transitionend", () => voteDelta.remove(), { once: true });
  }

  function voteForMeme(state, value = 1) {
    const voteKey = state.checksum ?? state.file;
    if (votedMemes.has(voteKey)) return false;
    state.voted = true;
    stopViewTimer(state, performance.now());
    autoVoteObserver.unobserve(state.container);
    votedMemes.add(voteKey);
    castMemeVote(state, value);

    if (state.upvoteButton) {
      state.upvoteButton.disabled = true;
      state.upvoteButton.style.opacity = "0";
      state.upvoteButton.style.transform = "scale(0.9)";
      state.upvoteButton.style.pointerEvents = "none";
    }

    if (state.downvoteButton) {
      state.downvoteButton.disabled = true;
      state.downvoteButton.style.opacity = "0";
      state.downvoteButton.style.transform = "scale(0.9)";
      state.downvoteButton.style.pointerEvents = "none";
    }

    triggerVoteAnimation(state.voteWrap, value);
    return true;
  }

  let sentinel = document.querySelector("#infinite-scroll-sentinel");
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = "infinite-scroll-sentinel";
    sentinel.style.height = "10px";
    sentinel.style.width = "100%";
    feed.insertAdjacentElement("afterend", sentinel);
  }
  scrollSentinelObserver.observe(sentinel);

  function createContainer(file, options) {
    const container = document.createElement("meme-card");
    // console.log('Creating container for file:', file);
    return container.setup(file, options);
  }

  function renderBatch() {
    if (loading || index >= filteredFiles.length) return;
    loading = true;

    const fragment = document.createDocumentFragment();
    const end = Math.min(index + batchSize, filteredFiles.length);

    for (; index < end; index++) {
      const file = filteredFiles[index];
      const container = createContainer(file, {
        searchInput: search,
        requestSearch: onRequestSearch,
        viewState,
        autoVoteMs: AUTO_VOTE_MS,
        voteForMeme,
        autoVoteObserver,
        mediaObserver
      });
      fragment.appendChild(container);
    }

    feed.appendChild(fragment);
    trimFeed();
    loading = false;
  }

  function trimFeed() {
    const children = feed.children;
    if (children.length <= MAX_DOM_ITEMS) return;

    const removeCount = children.length - MAX_DOM_ITEMS;

    for (let i = 0; i < removeCount; i++) {
      const el = children[0];
      if (typeof window.cleanupMemeState === "function") {
        window.cleanupMemeState(el);
      }
      el.remove();
    }
  }

  function resetFeed() {
    index = 0;
    loading = false;

    Array.from(feed.children).forEach(cleanupMemeState);
    feed.replaceChildren();
  }

  const onAuthorFilter = event => {
    const author = event.detail?.author;
    if (!author) return;
    onRequestSearch?.({ creator: author });
  };

  feed.addEventListener("meme-card:author-filter", onAuthorFilter);

  if (initialQuery) {
    search.value = initialQuery;
    renderBatch();
  } else {
    renderBatch();
  }

  return {
    appendFiles(nextFiles) {
      const normalizedFiles = normalizeFiles(nextFiles);
      if (!normalizedFiles.length) {
        return 0;
      }

      allFiles.push(...normalizedFiles);
      filteredFiles.push(...normalizedFiles);
      return normalizedFiles.length;
    },
    destroy() {
      feed.removeEventListener("meme-card:author-filter", onAuthorFilter);
    }
  };
}
