export function initializeMemeFeed({
  files,
  feed,
  initialQuery,
  onRequestSearch,
  onRequestMore,
  castMemeVote,
  ejectMedia,
  injectMedia
}) {
  const search = document.querySelector("#search-input");
  let baseUrl = "http://localhost:8787/memes/";
  baseUrl = "https://m.marak.com/";

  // TODO: batchSize and MAX_DOM_ITEMS needs to be dynamically derived on the value of the meme-card-size-slider, such that when the meme-card-size-slider is at it's lowest values the batch size is 32 with 64 max dom items, and when it's at it's highest values the batch size is 8 with 16 max dom items, we can do this by adding an event listener to the meme-card-size-slider that updates the batchSize and MAX_DOM_ITEMS variables based on the current value of the slider. This way we can ensure that we're not overwhelming the browser with too many large meme cards at once, while still providing a smooth scrolling experience for users who prefer smaller meme cards.
  // TODO: we will want to set hard-limits to ensure correct batch sizes for single column mobile ( to ensure performance )
  let batchSize = 32;
  const AUTO_VOTE_MS = 3333;
  const LOAD_BUFFER_MARGIN = "600px";
  let MAX_DOM_ITEMS = 64;

  const getNormalizedExtension = value => {
    const normalizedValue = String(value ?? "").trim().toLowerCase();
    if (!normalizedValue) return "";
    const sanitizedValue = normalizedValue.split("#")[0].split("?")[0];
    const extensionIndex = sanitizedValue.lastIndexOf(".");
    return extensionIndex >= 0 ? sanitizedValue.slice(extensionIndex) : "";
  };

  batchSize = 27;
  MAX_DOM_ITEMS = 27 * 2;

  const normalizeFiles = inputFiles => inputFiles
    .map(file => {
      if (typeof file === "string") {
        const extensionIndex = file.lastIndexOf(".");
        return {
          filename: file,
          checksum: file,
          size: null,
          extension: getNormalizedExtension(extensionIndex >= 0 ? file.slice(extensionIndex) : file),
          votes: 0,
          creator: "Unknown",
          created_at: null,
          title: "",
          tags: []
        };
      }

      if (!file?.filename) return null;

      let title = file.title || file.filename;
      const extensionIndex = file.filename.lastIndexOf(".");
      return {
        filename: file.filename,
        checksum: file.checksum ?? file.filename,
        size: file.size ?? null,
        created_at: file.created_at ?? file.uploadedAt ?? file.uploaded_date ?? file.createdAt ?? file.date ?? null,
        creator: file.creator ?? "Unknown",
        tags: file.tags ?? [],
        extension: getNormalizedExtension(file.extension ?? (extensionIndex >= 0 ? file.filename.slice(extensionIndex) : file.filename)),
        votes: file.votes ?? 0,
        title: title
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

  const onScrollLoadMore = () => {
    if (loading) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    // console.log("[meme-feed] scroll position:", scrollPosition, "page height:", pageHeight);
    // console.log('difference:', pageHeight - scrollPosition);
    if (pageHeight - scrollPosition <= 150) {
      // console.log('reached scroll threshold, loading more memes...');
      if (index < filteredFiles.length) {
        renderBatch();
      } else {
        onRequestMore?.();
      }
    }
  };

  window.addEventListener("scroll", onScrollLoadMore, { passive: true });

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

  if (initialQuery && search) {
    search.value = initialQuery;
    renderBatch();
  } else {
    renderBatch();
  }

  return {
    appendFiles(nextFiles) {
      const normalizedFiles = normalizeFiles(nextFiles);
      if (!normalizedFiles.length) {
        console.log("[meme-feed] appendFiles skipped empty batch");
        return 0;
      }

      const targetWasAliased = filteredFiles === allFiles;
      allFiles.push(...normalizedFiles);
      if (!targetWasAliased) {
        filteredFiles.push(...normalizedFiles);
      }

      console.log("[meme-feed] appendFiles appended batch", {
        receivedCount: nextFiles.length,
        normalizedCount: normalizedFiles.length,
        targetWasAliased,
        allFilesLength: allFiles.length,
        filteredFilesLength: filteredFiles.length
      });

      return normalizedFiles.length;
    },
    destroy() {
      feed.removeEventListener("meme-card:author-filter", onAuthorFilter);
      window.removeEventListener("scroll", onScrollLoadMore);
    }
  };
}
