import "./lib/SearchBarTags.js";
import "./lib/MemeCard.js";
import { filterFiles } from "./lib/filterFiles.js";
import { ejectMedia } from "./lib/ejectMedia.js";
import { injectMedia } from "./lib/injectMedia.js";
import { initializeMemeFeed } from "./lib/initializeMemeFeed.js";
import { searchMemes, getRandomMemes, getTopMemes, castMemeVote } from "./lib/api.js";

const $feed = document.querySelector("#feed");
const sideMenu = document.querySelector("#side-menu");
const floatingOctocat = document.querySelector("#floating-octocat");
const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
const GITHUB_URL = "https://github.com/buddypond/meme-client";
const SIDEBAR_HIDDEN_CLASS = "sidebar-hidden";
const SIDEBAR_HIDDEN_STORAGE_KEY = "meme-feed-sidebar-hidden";
const SIDEBAR_FLAG_ENABLED =
  window.location.search.includes("immersive=1") ||
  window.location.search.includes("sidebar=hidden") ||
  window.MEME_CLIENT_HIDE_SIDEBAR === true;

const focusSearchInput = () => document.querySelector("#search-input")?.focus();
const openGitHubRepo = () => window.open(GITHUB_URL, "_blank", "noopener,noreferrer");
const isDesktopViewport = () => window.innerWidth >= 768;

const readStoredSidebarHidden = () => {
  try {
    return window.localStorage.getItem(SIDEBAR_HIDDEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const persistSidebarHidden = isHidden => {
  try {
    window.localStorage.setItem(SIDEBAR_HIDDEN_STORAGE_KEY, String(isHidden));
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }
};

const getInitialSidebarHiddenState = () => {
  const storedValue = readStoredSidebarHidden();
  if (storedValue !== null) {
    return storedValue === "true";
  }

  return SIDEBAR_FLAG_ENABLED;
};

(() => {
  if (!sideMenu) {
    return null;
  }

  const style = document.createElement("style");
  style.textContent = `
    @media (min-width: 768px) {
      side-menu {
        transition: transform 180ms ease, opacity 180ms ease;
      }

      body.${SIDEBAR_HIDDEN_CLASS} {
        padding-left: 0;
      }

      body.${SIDEBAR_HIDDEN_CLASS} .search-shell {
        left: 0;
      }

      body.${SIDEBAR_HIDDEN_CLASS} side-menu {
        transform: translateX(calc(var(--side-menu-width, 250px) * -1));
        opacity: 0;
        pointer-events: none;
      }

      .sidebar-visibility-toggle {
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 1002;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 999px;
        background: rgba(24, 24, 24, 0.94);
        color: white;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
    }

    @media (max-width: 767px) {
      .sidebar-visibility-toggle {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "sidebar-visibility-toggle";
  button.setAttribute("aria-controls", "side-menu");
  document.body.appendChild(button);

  const syncButton = isHidden => {
    button.textContent = isHidden ? "Show Menu" : "Hide Menu";
    button.setAttribute("aria-label", isHidden ? "Show sidebar" : "Hide sidebar");
    button.setAttribute("aria-pressed", String(!isHidden));
  };

  const setSidebarHidden = isHidden => {
    const shouldHide = isDesktopViewport() && isHidden;
    document.body.classList.toggle(SIDEBAR_HIDDEN_CLASS, shouldHide);
    if (shouldHide) {
      sideMenu.open = false;
      document.body.classList.remove("menu-open");
    }
    syncButton(shouldHide);
    persistSidebarHidden(isHidden);
  };

  button.addEventListener("click", () => {
    const nextHidden = !document.body.classList.contains(SIDEBAR_HIDDEN_CLASS);
    setSidebarHidden(nextHidden);
  });

  window.addEventListener("resize", () => {
    setSidebarHidden(getInitialSidebarHiddenState());
  });

  setSidebarHidden(getInitialSidebarHiddenState());
  return { setSidebarHidden };
})();

if (floatingOctocat) {
  floatingOctocat.classList.add("is-interactive");
  floatingOctocat.addEventListener("mouseenter", () => {
    floatingOctocat.classList.add("is-hovered");
  });
  floatingOctocat.addEventListener("mouseleave", () => {
    floatingOctocat.classList.remove("is-hovered");
  });
  floatingOctocat.addEventListener("click", openGitHubRepo);
  floatingOctocat.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openGitHubRepo();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", focusSearchInput, { once: true });
} else {
  focusSearchInput();
}

let searchInput = document.querySelector("search-bar-tags#search-input");
searchInput?.setAttribute("initial-query", initialQuery);

const SEARCH_PAGE_SIZE = 10;
const SEARCH_RESULTS_LIMIT = 100;
let searchOffset = SEARCH_PAGE_SIZE;
let activeQuery = initialQuery;
let isLoadingMore = false;
let hasMoreMemes = true;

const updateSearchQueryParam = query => {
  const url = new URL(window.location.href);
  const trimmedQuery = query.trim();

  if (trimmedQuery) {
    url.searchParams.set("q", trimmedQuery);
  } else {
    url.searchParams.delete("q");
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
};

const runSearch = query => {
  activeQuery = query.trim();
  searchOffset = SEARCH_RESULTS_LIMIT;
  hasMoreMemes = true;
  isLoadingMore = false;
  updateSearchQueryParam(activeQuery);
  searchInput?.dispatchEvent(new Event("input", { bubbles: true }));
};

searchInput?.addEventListener("change", event => {
  console.log("Search input changed:", event);
  if (event?.detail?.value !== undefined) {
    // get the current value of the search input and update the URL query parameter, this will allow users to share the URL with the current search query and also allows us to keep the search state in sync with the URL
    let currentValue = searchInput.value;
    console.log("Current search input value:", currentValue);
    runSearch(currentValue);
  //}
    //runSearch(event.detail.value);
  }
});

searchInput?.addEventListener("submit", event => {
  console.log("Search input submitted:", event);
  if (event?.detail?.value !== undefined) {
    runSearch(event.detail.value);
  }
});

// TODO: 
Promise.all([
  searchMemes({ query: initialQuery, limit: SEARCH_PAGE_SIZE, offset: 0 }),
  getTopMemes()
  //getRandomMemes()
])
  .then(([files, memes]) => {
    console.log("Initial search results:", files);
    console.log("Top memes:", memes);
    const votesByHash = new Map(memes.map(({ hash, votes }) => [hash, votes]));

    files.sort((a, b) => {
      const aVotes = votesByHash.get(a.checksum ?? a.filename);
      const bVotes = votesByHash.get(b.checksum ?? b.filename);

      if (aVotes === undefined) return bVotes === undefined ? 0 : 1;
      if (bVotes === undefined) return -1;
      return bVotes - aVotes;
    });

    // this will randomize the order of memes with the same vote count to make it more interesting for users and prevent the same memes from always being in the same order, we can optimize this later if needed but it should be fine for now since we don't have that many memes
    for (let start = 0; start < files.length;) {
      const voteCount = votesByHash.get(files[start].checksum ?? files[start].filename);
      let end = start + 1;

      while (end < files.length && votesByHash.get(files[end].checksum ?? files[end].filename) === voteCount) {
        end += 1;
      }

      for (let i = end - 1; i > start; i -= 1) {
        const j = start + Math.floor(Math.random() * (i - start + 1));
        const temp = files[i];
        files[i] = files[j];
        files[j] = temp;
      }

      start = end;
    }

    hasMoreMemes = files.length === SEARCH_PAGE_SIZE;
    console.log("Sorted and randomized search results:", files);
    const memeFeed = initializeMemeFeed({
      files,
      feed: $feed,
      initialQuery,
      searchMemes,
      castMemeVote,
      filterFiles,
      ejectMedia,
      injectMedia
    });

    const loadMoreMemes = async () => {
      if (isLoadingMore || !hasMoreMemes) return;

      isLoadingMore = true;

      try {
        const nextFiles = await searchMemes({
          query: activeQuery,
          limit: SEARCH_PAGE_SIZE,
          offset: searchOffset
        });

        const appendedCount = memeFeed?.appendFiles?.(nextFiles) ?? 0;
        searchOffset += appendedCount;
        hasMoreMemes = nextFiles.length === SEARCH_PAGE_SIZE;
      } finally {
        isLoadingMore = false;
      }
    };

    const attachInfiniteScrollObserver = () => {
      const sentinel = document.querySelector("#infinite-scroll-sentinel");
      if (!sentinel) {
        requestAnimationFrame(attachInfiniteScrollObserver);
        return;
      }

      const observer = new IntersectionObserver(entries => {
        if (entries[0]?.isIntersecting) {
          loadMoreMemes();
        }
      }, {
        rootMargin: "1000px 0px 1200px 0px",
        threshold: 0
      });

      observer.observe(sentinel);
    };

    attachInfiniteScrollObserver();
  });
